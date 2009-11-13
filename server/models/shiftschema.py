from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core

from server.models.ssdocschema import *
from server.models.ssuserschema import *
from server.models.permschema import *

# ==============================================================================
# Errors
# =============================================================================

class ShiftError(Exception): pass
class NoAuthorError(ShiftError): pass
class NoSpaceError(ShiftError): pass
class NoHrefError(ShiftError): pass
class NoContentError(ShiftError): pass

# ==============================================================================
# Utilities
# ==============================================================================

def toDict(kvs):
    result = {}
    for kv in kvs:
        result[kv['key']] = kv['value']
    return result


@simple_decorator
def joindecorator(func):
    def afn(*args, **kwargs):
        return Shift.joinData(func(*args, **kwargs), userId=kwargs.get("userId"))
    return afn

# ==============================================================================
# Shift Model
# ==============================================================================

class Shift(SSDocument):
    """
    The Shift document. A shift is a piece of JSON data used
    by spaces (applications) to recreate a user's modification
    to a page. Refer to the API specification for more detailed
    imformation about the usage of different fields.
    """

    # ========================================
    # Fields
    # ========================================

    type = TextField(default="shift")
    userName = TextField()
    href = TextField()
    domain = TextField()
    space = DictField(Schema.build(
            name = TextField(),
            version = TextField()
            ))
    summary = TextField()
    broken = BooleanField(default=False)
    commentStream = TextField()
    publishData = DictField(Schema.build(
            draft = BooleanField(default=True),
            private = BooleanField(default=True),
            publishTime = DateTimeField(),
            dbs = ListField(TextField())
            ))
    content = DictField()    
            
    # ========================================
    # CouchDB Views
    # ========================================

    all = View(
        "shifts",
        "function (doc) {            \
           if(doc.type == 'shift') { \
             emit(doc._id, doc);     \
           }                         \
         }")

    by_created = View(
        "shifts",
        "function (doc) {                        \
           if(doc.type == 'shift') {             \
             emit(doc.created, doc);             \
           }                                     \
         }")

    by_domain_and_created = View(
        "shifts",
        "function (doc) {                                      \
           if(doc.type == 'shift') {                           \
             emit([doc.domain, doc.created], doc);             \
           }                                                   \
         }")

    by_href_and_created = View(
        "shifts",
        "function(doc) {                                     \
           if(doc.type == 'shift') {                         \
             emit([doc.href, doc.created], doc);             \
           }                                                 \
         }")

    by_group_and_created = View(
        "shifts",
        "function(doc) {                                      \
           if(doc.type == 'shift') {                          \
             var dbs = doc.publishData.dbs;                   \
             for(var i = 0, len = dbs.length; i < len; i++) { \
                var db = dbs[i], typeAndId = db.split('_');   \
                if(typeAndId[0] == 'group') {                 \
                  emit([doc.created, db], doc);               \
                }                                             \
             }                                                \
           }                                                  \
         }")

    by_follow_and_created = View(
        "shifts",
        "function(doc) {                                      \
           if(doc.type == 'shift') {                          \
             var dbs = doc.publishData.dbs;                   \
             for(var i = 0, len = dbs.length; i < len; i++) { \
                var db = dbs[i], typeAndId = db.split('_');   \
                if(typeAndId[0] == 'user') {                  \
                  emit([doc.created, db], doc);               \
                }                                             \
             }                                                \
           }                                                  \
         }")

    by_user = View(
        "shifts",
        "function(doc) {               \
           if(doc.type == 'shift') {   \
             emit(doc.createdBy, doc); \
           }                           \
        }")

    count_by_domain = View(
        "shifts",
        "function(doc) {             \
           if(doc.type == 'shift') { \
             emit(doc.domain, 1);    \
           }                         \
         }",
        "function(keys, values, rereduce) { \
           return sum(values);              \
         }")

    # ========================================
    # CRUD
    # ========================================

    @classmethod
    def joinData(cls, shifts, userId=None):
        """
        Relatively quick data join function. Makes use
        of multidocument fetch.
        
        Parameters:
          shifts - a single shift or a list of shifts.
          userId - a user id.
        """
        single = False
        if type(shifts) != list:
            single = True
            shifts = [shifts]
        ids = [shift['_id'] for shift in shifts]
        favIds = [Shift.favoriteId(userId, shiftId) for shiftId in ids]

        isFavorited = [(favorite and True) for favorite in core.fetch(keys=favIds)]

        favd = toDict(core.fetch(view=schema.favoritesByShift, keys=ids, reduce=True))
        favCounts = [(favd.get(aid) or 0) for aid in ids]

        ccd = toDict(core.fetch(view=schema.countByShift, keys=ids, reduce=True))
        commentCounts = [(ccd.get(aid) or 0) for aid in ids]

        userIds = [shift['createdBy'] for shift in shifts]
        gravatars = [((user and user.get("gravatar")) or "images/default_user.png")
                     for user in core.fetch(keys=userIds)]

        for i in range(len(shifts)):
            shifts[i]["favorite"] = isFavorited[i]
            shifts[i]["favoriteCount"] = favCounts[i]
            shifts[i]["commentCount"] = commentCounts[i]
            shifts[i]["gravatar"] = gravatars[i]

        if single:
            return shifts[0]
        else:
            return shifts

    @classmethod
    def create(cls, userId, shiftJson):
        """
        Create a shift in the database.
        Parameters:
            shiftJson - the new data for the shift.
        Returns:
            The id of the new shift (string).
        """
        db = core.connect(SSUser.private(userId))
        if not shiftJson.get("createdBy"):
            shiftJson["createdBy"] = userId
        newShift = Shift(**shiftJson)
        newShift.domain = utils.domain(shiftJson["href"])
        newShift.store(db)
        # replicate to the user's feed
        core.replicate(SSUser.private(userId), SSUser.feed(userId))
        return Shift.joinData(newShift, newShift.createdBy)

    @classmethod
    def read(cls, userId, id):
        """
        Get a specific shift. First tries the master database
        then tries the user's private database.
        Parameters:
            id - a shift id.
            userId - a userId. If not supplied tries to read shift from master database.
        Returns:
            a dictionary of the shift's data.
        """
        db = core.connect()
        theShift = Shift.load(db, id)
        if not theShift and userId:
            db = core.connect(SSUser.private(userId))
            theShift = Shift.load(db, id)
        if not theShift:
            return
        return Shift.joinData(theShift, theShift.createdBy)

    @classmethod
    def update(cls, userId, id, fields):
        """
        Class method for updating a shift.
        
        Parameters:
          id - the id of the shift
          fields - the fields to update. Allowed fields are
            summary, broken, and content.
          userId - a userId.
        """
        publicShift = False

        # check user/public and user/private for the shift
        db = core.connect(SSUser.private(userId))
        theShift = Shift.load(db, id)
        if not theShift:
            db = core.connect(SSUser.public(userId))
            theShift = Shift.load(db, id)
            if theShift:
                publicShift = True

        if fields.get("summary"):
            theShift.summary = theShift.content["summary"] = fields.get("summary")
        if fields.get("broken"):
            theShift.broken = fields.get("broken")
        if fields.get("content"):
            theShift.content = fields.get("content")
        theShift.modified = datetime.now()

        # update the correct db
        theShift.store(db)
        # replicate back to the feed
        if publicShift:
            core.replicate(SSUser.public(userId), SSUser.feed(userId))
        else:
            core.replicate(SSUser.private(userId), SSUser.feed(userId))

        # update groups & users that shift is published to
        for db in theShift.publishData.dbs:
            dbtype, dbid = db.split("_")
            if dbtype == "user":
                inbox = core.connect(SSUser.inbox(dbid))
                theShift.store(inbox)
            elif dbtype == "group":
                Group.updateShift(dbid, theShift)

        return Shift.joinData(theShift, theShift.createdBy)

    @classmethod
    def delete(cls, userId, id):
        """
        Delete a shift from the user/private database.
        Parameters:
            id - a shift id.
        """
        db = core.connect(SSUser.private(userId))
        del db[id]

    # ========================================
    # Instance Methods
    # ========================================

    def deleteInstance(self):
        """
        Convenience for deleting Shift instances.
        """
        if self.id:
            Shift.delete(self.createdBy, self.id)

    # ========================================
    # Validation
    # ========================================
    
    @classmethod
    def canModify(cls, userId, id):
        """
        Check where a user can modify a shift. This includes
        updating, deleting, publishing, and unpublishing.
        Parameters:
            userId - a user id, used to look up the shift.
            id - a shift id.
        Returns:
            bool.
        """
        if SSUser.isAdmin(userId):
            return True
        db = core.connect(SSUser.private(userId))
        theShift = Shift.load(db, id)
        return theShift and (theShift.createdBy == userId)

    @classmethod
    def canComment(cls, userId, id):
        """
        Check if the user can comment on a shift. Allowed if:
            1. Shift is public.
            2. If the shift was published to a stream that the user has permissions on.
            3. Running as admin.
        Parameters:
            userId - a user id.
            id - a shift id.
        """
        if SSUser.isAdmin(userId):
            return True
        db = core.connect(SSUser.private(userId))
        theShift = Shift.load(db, id)
        if not theShift.publishData.private:
            return True
        # ignore private dbs
        shiftStreams = [astream for astream in theShift.publishData.streams
                        if not Stream.isUserPrivateStream(astream)]
        writeable = Permission.writeableStreams(userId)
        allowed = set(shiftStreams).intersection(writeable)
        return len(allowed) > 0

    @classmethod
    def isPublic(cls, id):
        """
        Check where a shift is public.
        Parameters:
            id - a shift id.
        Returns:
            bool.
        """
        return Shift.load(core.connect(), id) != None

    @classmethod
    def isPrivate(cls, id):
        """
        Check whether a shift is private.
        Parameters:
            id - a shift id.
        Returns:
            bool.
        """
        return not Shift.isPublic(id)

    # ========================================
    # Publishing
    # ========================================

    @classmethod
    def publish(cls, userId, id, publishData=None, server="http://www.shiftspace.org/api/"):
        """
        Set draft status of a shift to false. Sync publishData field.
        If the shift is private only publish to the dbs that
        the user has access. If the shift is publich publish it to
        any of the public non-user dbs. Creates the comment db
        if it doesn't already exist.
        
        Parameters:
            id - a shift id.
            publishData - a dictionary holding the publish options.
        """
        db = core.connect(SSUser.private(userId))
        theShift = Shift.load(db, id)
        oldPublishData = dict(theShift.items())["publishData"]
        allowed = []

        isPrivate = True
        if publishData and publishData.get("private") != None:
            isPrivate = publishData.get("private")
        else:
            isPrivate = Shift.isPrivate(id)

        publishDbs = (publishData and publishData.get("dbs")) or []

        if (publishData and isPrivate and len(publishDbs) > 0):
            allowedGroups = Permission.writeable(userId)
            allowed = list(set(allowedGroups).intersection(set(publishDbs)))
        # create the shift comment dbx
        """
        if not Shift.commentStream(id):
            streamId = Shift.createCommentStream(id=id)
            SSUser.addNotification(userId, streamId)
        """
        theShift.publishData.private = isPrivate
        theShift.publishData.draft = False
        
        # publish or update a copy of the shift to all user-x/private, user-y/private ...
        newUserDbs = []
        if publishData.get("dbs"):
            newUserDbs = [s for s in publishData.get("dbs") if s.split("_")[0] == "user"]
        oldUserDbs = [s for s in oldPublishData.get("dbs") if s.split("_")[0] == "user"]
        newUserDbs = list(set(newUserDbs).difference(set(oldUserDbs)))

        # update target user inboxes
        for db in oldUserDbs:
            theShift.updateIn(core.connect(db))
        for db in newUserDbs:
            theShift.copyTo(core.connect(db))

        # publish or update a copy to group/x, group/y, ...
        newGroupDbs = []
        if publishData.get("dbs"):
            newGroupDbs = [s for s in publishData.get("dbs") if s.split("_")[0] == "group"]
        oldGroupDbs = [s for s in oldPublishData.get("dbs") if s.split("_")[0] == "group"]
        newGroupDbs = list(set(newGroupDbs).difference(set(oldGroupDbs)))
        
        # update group dbs
        for db in oldGroupDbs:
            from server.models.groupschema import Group
            dbtype, dbid = db.split("_")
            Group.updateShift(dbid, theShift)
        for db in newGroupDbs:
            from server.models.groupschema import Group
            # NOTE - do we need to delete from user/private? - David 11/12/09
            dbtype, dbid = db.split("_")
            Group.addShift(dbid, theShift)

        # create in user/public, delete from user/private
        # replicate to user/feed and to user/shiftspace
        if not isPrivate:
            publicdb = core.connect(SSUser.public(userId))
            if Shift.load(publicdb, theShift.id):
                theShift.updateIn(publicdb)
            else:
                theShift.copyTo(publicdb)
                privatedb = core.connect(SSUser.private(userId))
                del privatedb[theShift.id]
            core.replicate(SSUser.public(userId), SSUser.feed(userId))
            core.replicate(SSUser.public(userId))

        return Shift.joinData(theShift, userId)
    
    # ========================================
    # Comments
    # ========================================

    @classmethod
    def commentStream(cls, id):
        """
        Return the comment stream id for the specified shift.
        Parameters:
            id - a shift id.
        """
        result = list(Stream.commentStream(key=id))
        if result and len(result) > 0:
            return result[0].id
        else:
            return None
    
    @classmethod
    def createCommentStream(cls, id, streamId):
        """
        Create a comment stream for a shift if it doesn't already exist.
        Parameters:
            id - a shift id.
        """
        db = core.connect(Stream.group(streamId))
        theShift = Shift.load(db, id)
        commentStream = Stream.create(db, {
                "meta": "comments",
                "objectRef": ref(id),
                "createdBy": theShift.createdBy
                })
        return commentStream["_id"]

    # ========================================
    # Favoriting
    # ========================================

    @classmethod
    def favoriteId(cls, id, userId):
        """
        Return the favorite id for a shift and user.
        """
        return "favorite:%s:%s" % (userId, id)

    @classmethod
    def isFavorited(cls, id, userId=None):
        db = core.connect()
        favId = Shift.favoriteId(id, userId)
        return db.get(favId) != None
    
    @classmethod
    def favorite(cls, id, userId):
        db = core.connect()
        if (not Shift.canRead(id, userId)) or Shift.isFavorited(id, userId):
            return
        fav = {
            "created": utils.utctime(),
            "createdBy": userId,
            "type": "favorite"
            }
        db[favoriteId(id, userId)] = fav
        db = core.connect(SSUser.private(userId))
        return Shift.joinData(Shift.load(db, id), userId)
    
    @classmethod
    def unfavorite(cls, id, userId):
        db = core.connect()
        if (not Shift.canRead(id, userId)) or (not Shift.isFavorited(id, userId)):
            return
        del db[Shift.favoriteId(id, userId)]
        return Shift.joinData(db[id], userId)
    
    @classmethod
    def favoriteCount(cls, id):
        db = core.connect()
        return core.value(Favorite.by_shift(db, key=id, group=True)) or 0
    
    # ========================================
    # List & Filtering Support
    # ========================================

    @classmethod
    def byUserName(cls, userName, userId=None, start=None, end=None, limit=25):
        """
        Return the list of shifts a user has created.
        Parameters:
            userName - a user name.
            userId - id of the user requesting the data (for joins).
            start - the start index or key.
            end - the end index or key.
            limit - number of results to return.
        Returns:
            A list of the user's shifts.
        """
        id = SSUser.read(userName).id
        db = core.connect(SSUser.private(userId))
        return Shift.by_user(db, id, limit=limit)

    @joindecorator
    def shifts(cls, byHref, userId=None, byFollowing=False, byGroups=False, start=0, limit=25):
        """
        Returns a list of shifts based on whether
            1. href
            3. By public streams specified user is following. 
            4. By groups streams specified user is following.
        Parameters:
            byHref - a url
            byDomain - a url string
            byFollowing - a user id
            byGroups - a user id
        Returns:
            A list of shifts that match the specifications.
        """
        db = core.connect()
        # NOTE: to prevent errors on a newly created DB - David 9/11/09
        if core.single(Stats.count, "shift") == None:
            return []
        lucene = core.lucene()
        # TODO: validate byHref - David
        queryString = "href:\"%s\" AND ((draft:false AND private:false)" % byHref
        if userId:
            queryString = queryString + " OR createdBy:%s" % userId
            streams = ""
            if byFollowing:
                following = User.followStreams(userId)
                streams = streams + " ".join(following)
            if byGroups:
                groups = User.groupStreams(userId)
                streams = streams + " ".join(groups)
            # TODO: make sure streams cannot be manipulated from client - David
            queryString = queryString + ((" OR (draft:false%s)" % ((len(streams) > 0 and (" AND streams:%s" % streams)) or "")))
        queryString = queryString + ")"
        rows = lucene.search("shifts", q=queryString, sort="\modified", skip=start, limit=limit)
        shifts = [db[row["id"]] for row in rows]
        return shifts
