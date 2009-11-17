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
        "function (doc) {                          \
           if(doc.type == 'shift') {               \
             emit([doc.domain, doc.created], doc); \
           }                                       \
         }")

    by_href_and_created = View(
        "shifts",
        "function(doc) {                         \
           if(doc.type == 'shift') {             \
             emit([doc.href, doc.created], doc); \
           }                                     \
         }")

    by_user_and_created = View(
        "shifts",
        "function(doc) {                             \
           if(doc.type == 'shift') {                 \
             emit([doc.createdBy, doc.created], doc); \
           }                                         \
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
    # Class Methods
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
        from server.models.favschema import Favorite

        single = False
        if type(shifts) != list:
            single = True
            shifts = [shifts]
        ids = [shift['_id'] for shift in shifts]
        favIds = [Favorite.makeId(userId, shiftId) for shiftId in ids]

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
    def create(cls, shiftJson):
        """
        Create a shift in the database.
        Parameters:
            shiftJson - the new data for the shift.
        Returns:
            The id of the new shift (string).
        """
        newShift = Shift(**shiftJson)
        createdBy = newShift.createdBy
        db = core.connect(SSUser.private(createdBy))
        newShift.domain = utils.domain(newShift.href)
        newShift.store(db)
        core.replicate(SSUser.private(createdBy), SSUser.feed(createdBy))
        return Shift.joinData(newShift, newShift.createdBy)

    @classmethod
    def read(cls, id, userId):
        """
        Get a specific shift. First tries the master database
        then tries the user's private database.
        Parameters:
            id - a shift id.
            userId - a userId. If not supplied tries to read shift from master database.
        Returns:
            a dictionary of the shift's data.
        """
        db = core.connect(SSUser.public(userId))
        theShift = Shift.load(db, id)
        if not theShift and userId:
            db = core.connect(SSUser.private(userId))
            theShift = Shift.load(db, id)
        if not theShift:
            return
        return Shift.joinData(theShift, theShift.createdBy)

    # ========================================
    # Instance methods
    # ========================================

    def update(self, fields):
        """
        Class method for updating a shift. Attempts to read
        first from user/private and then user/public. Updates
        the shift there, then replicates back into user/feed.
        Also updates any user_x/inbox and group_x that the
        shift has been published to.
        
        Parameters:
          id - the id of the shift
          fields - the fields to update. Allowed fields are
            summary, broken, and content.
          userId - a userId.
        """
        if fields.get("content"):
            self.content = fields.get("content")
        if fields.get("summary"):
            self.summary = self.content["summary"] = fields.get("summary")
        if fields.get("broken"):
            self.broken = fields.get("broken")
        self.modified = datetime.now()

        if self.publishData.private:
            db = core.connect(SSUser.private(self.createdBy))
        else:
            db = core.connect(SSUser.public(self.createdBy))
        self.store(db)

        if publicShift:
            core.replicate(SSUser.public(userId), SSUser.feed(userId))
        else:
            core.replicate(SSUser.private(userId), SSUser.feed(userId))

        for db in theShift.publishData.dbs:
            dbtype, dbid = db.split("/")
            if dbtype == "user":
                inbox = core.connect(SSUser.inbox(dbid))
                self.store(inbox)
            elif dbtype == "group":
                from server.models.groupschema import Group
                Group.read(dbid).updateShift(self)

        return Shift.joinData(self, theShift.createdBy)


    def delete(self):
        """
        Delete a shift from the user/private database.
        Parameters:
            id - a shift id.
        """
        db = core.connect(SSUser.private(self.createdBy))
        if db.get(id):
            del db[id]
            return
        db = core.connect(SSUser.public(self.createdBy))
        if db.get(id):
            del db[id]
            return


    def publishIds(self):
        """
        Return the list of ids the shift was published to.
        """
        return [db.split("/")[1].split("/")[0] for db in self.publishData.dbs]

    # ========================================
    # Validation
    # ========================================
    
    def isPublic(self):
        """
        Check where a shift is public.
        Parameters:
            id - a shift id.
        Returns:
            bool.
        """
        return not self.publishData.private


    def isPrivate(self, id):
        """
        Check whether a shift is private.
        Parameters:
            id - a shift id.
        Returns:
            bool.
        """
        return self.publishData.private

    # ========================================
    # Publishing
    # ========================================

    def publish(self, publishData=None, server="http://www.shiftspace.org/api/"):
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
        db = core.connect(SSUser.private(self.createdBy))
        author = SSUser.read(self.createdBy)
        oldPublishData = dict(self.items())["publishData"]
        allowed = []

        isPrivate = True
        if publishData and publishData.get("private") != None:
            isPrivate = publishData.get("private")
        else:
            isPrivate = self.isPrivate()

        publishDbs = (publishData and publishData.get("dbs")) or []

        if (publishData and isPrivate and len(publishDbs) > 0):
            allowedGroups = author.writeable()
            allowed = list(set(allowedGroups).intersection(set(publishDbs)))

        # upate the private setting, the shift is no longer draft
        theShift.publishData.private = isPrivate
        theShift.publishData.draft = False
        
        # publish or update a copy of the shift to all user-x/private, user-y/private ...
        newUserDbs = []
        if publishData and publishData.get("dbs"):
            newUserDbs = [s for s in publishData.get("dbs") if s.split("/")[0] == "user"]
        oldUserDbs = [s for s in oldPublishData.get("dbs") if s.split("/")[0] == "user"]
        newUserDbs = list(set(newUserDbs).difference(set(oldUserDbs)))

        # update target user inboxes
        for db in oldUserDbs:
            self.updateIn(core.connect(db))
        for db in newUserDbs:
            self.copyTo(core.connect(db))

        # publish or update a copy to group/x, group/y, ...
        newGroupDbs = []
        if publishData and publishData.get("dbs"):
            newGroupDbs = [s for s in publishData.get("dbs") if s.split("/")[0] == "group"]
        oldGroupDbs = [s for s in oldPublishData.get("dbs") if s.split("/")[0] == "group"]
        newGroupDbs = list(set(newGroupDbs).difference(set(oldGroupDbs)))
        
        # update group dbs
        for db in oldGroupDbs:
            from server.models.groupschema import Group
            dbtype, dbid = db.split("/")
            theGroup = Group.read(dbid)
            theGroup.updateShift(theShift)
        for db in newGroupDbs:
            from server.models.groupschema import Group
            # NOTE - do we need to delete from user/private? - David 11/12/09
            dbtype, dbid = db.split("/")
            theGroup = Group.read(dbid)
            theGroup.addShift(theShift)

        # create in user/public, delete from user/private
        # replicate to user/feed and to user/shiftspace
        if not isPrivate:
            publicdb = core.connect(SSUser.public(self.createdBy))
            if Shift.load(publicdb, self.id):
                self.updateIn(publicdb)
            else:
                self.copyTo(publicdb)
                privatedb = core.connect(SSUser.private(self.createdBy))
                del privatedb[theShift.id]
            core.replicate(SSUser.public(self.createdBy), SSUser.feed(self.createdBy))
            core.replicate(SSUser.public(self.createdBy))

        # TODO: don't replicate to follower user_x/feeds that are not peers - David
        followers = author.followers()
        [core.replicate(SSUser.public(userId), SSUser.feed(follower)) for follower in followers]
        
        # if draft false, copy to master database, we need it there
        # for general queries about what's available on pages - David
        db = core.connect()
        if not db.get(self.id):
            self.copyTo(db)
        else:
            self.updateIn(db)

        return Shift.joinData(self, userId)
    
    # ========================================
    # List & Filtering Support
    # ========================================

    #@joindecorator
    @classmethod
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
        print "Connect to db"
        db = core.connect()
        # NOTE: to prevent errors on a newly created DB - David 9/11/09
        """
        if core.single(Stats.count, "shift") == None:
            return []
        """
        print "Connect to lucene"
        lucene = core.lucene()
        # TODO: validate byHref - David
        queryString = "href:\"%s\" AND ((draft:false AND private:false)" % byHref
        if userId:
            queryString = queryString + " OR createdBy:%s" % userId
            streams = ""
            #Need to fix this, a lot has changed
            """
            if byFollowing:
                following = User.followStreams(userId)
                streams = streams + " ".join(following)
            if byGroups:
                groups = User.groupStrems(userId)
                streams = streams + " ".join(groups)
            """
            # TODO: make sure streams cannot be manipulated from client - David
            queryString = queryString + ((" OR (draft:false%s)" % ((len(streams) > 0 and (" AND streams:%s" % streams)) or "")))
        queryString = queryString + ")"
        rows = lucene.search("shifts", q=queryString, sort="\modified", skip=start, limit=limit)
        print "WTF!"
        # super slow, multidoc fetch instead
        shifts = [db[row["id"]] for row in rows]
        return shifts
