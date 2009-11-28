from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from server.utils.decorators import *
import server.utils.utils as utils
import core

from server.models.ssdoc import SSDocument

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

@simple_decorator
def shift_join(func):
    def afn(*args, **kwargs):
        return Shift.joinData(func(*args, **kwargs), userId=kwargs.get("userId"))
    return afn

# ==============================================================================
# Shift Model
# ==============================================================================

class Shift(SSDocument):

    # ========================================
    # Fields
    # ========================================

    type = TextField(default="shift")
    href = TextField()
    domain = TextField()
    space = DictField(Schema.build(
            name = TextField(),
            version = TextField()
            ))
    summary = TextField()
    broken = BooleanField(default=False)
    publishData = DictField(Schema.build(
            draft = BooleanField(default=True),
            private = BooleanField(default=True),
            publishTime = DateTimeField(),
            dbs = ListField(TextField())            # take the form of user/id or group/id
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
                var db = dbs[i], typeAndId = db.split('/');   \
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
                var db = dbs[i], typeAndId = db.split('/');   \
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
        from server.models.favorite import Favorite
        from server.models.comment import Comment
        
        if core._local:
            db = core.conect("user/%s" % core._local_id)
        else:
            db = core.connect("shiftspace/shared")
            
        single = False
        if type(shifts) != list:
            single = True
            shifts = [shifts]
        ids = [shift['_id'] for shift in shifts]

        favIds = [Favorite.makeId(userId, shiftId) for shiftId in ids]
        isFavorited = core.fetch(db, keys=favIds)
        favCounts = core.fetch(db, view=Favorite.count_by_shift, keys=ids)
        commentCounts = core.fetch(db, view=Comment.count_by_shift, keys=ids)
        userIds = [shift["createdBy"] for shift in shifts]
        users = core.fetch(keys=userIds)

        for i in range(len(shifts)):
            shifts[i]["favorite"] = (isFavorited[i] != None)
            shifts[i]["favoriteCount"] = favCounts[i]
            shifts[i]["commentCount"] = commentCounts[i]
            shifts[i]["gravatar"] = (users[i]["gravatar"] or "images/default.png")
            shifts[i]["userName"] = users[i]["userName"]
            shifts[i]["createdStr"] = utils.pretty_date(utils.futcstr(shifts[i]["created"]))
            shifts[i]["modifiedStr"] = utils.pretty_date(utils.futcstr(shifts[i]["modified"]))

        if single:
            return shifts[0]
        else:
            return shifts

    @classmethod
    def create(cls, shiftJson):
        from server.models.ssuser import SSUser
        newShift = Shift(**utils.clean(shiftJson))
        createdBy = newShift.createdBy
        db = core.connect(SSUser.privateDb(createdBy))
        newShift.domain = utils.domain(newShift.href)
        newShift.store(db)
        core.replicate(SSUser.privateDb(createdBy), "shiftspace/shared")
        return Shift.joinData(newShift, newShift.createdBy)

    @classmethod
    def read(cls, id, userId=None):
        from server.models.ssuser import SSUser
        theShift = None
        # first try to load from shared timeline
        theShift = Shift.load(core.connect("shiftspace/shared"), id)
        if not theShift and userId:
            # then try the user public
            db = core.connect(SSUser.publicDb(userId))
            theShift = Shift.load(db, id)
            if not theShift:
                # then user private
                db = core.connect(SSUser.privateDb(userId))
                theShift = Shift.load(db, id)
        if theShift:
            return Shift.joinData(theShift, theShift.createdBy)

    # ========================================
    # Instance methods
    # ========================================

    def update(self, fields, updateDbs=True):
        from server.models.ssuser import SSUser
        
        if fields.get("content"):
            self.content = fields.get("content")
        if fields.get("summary"):
            self.summary = self.content["summary"] = fields.get("summary")
        if fields.get("broken"):
            self.broken = fields.get("broken")
        if fields.get("dbs"):
            self.dbs = list(set(self.dbs.extend(fields.get("dbs"))))
        self.modified = datetime.now()
        
        # update the correct user db
        if self.publishData.private:
            db = SSUser.privateDb(self.createdBy)
        else:
            db = SSUser.publicDb(self.createdBy)
        
        self.store(core.connect(db))
        core.replicate(db, "shiftspace/shared")
        
        # update followers and groups
        if updateDbs:
            for db in self.publishData.dbs:
                dbtype, dbid = db.split("/")
                if dbtype == "group":
                    from server.models.group import Group
                    Group.read(dbid).updateShift(self)

        return Shift.joinData(self, self.createdBy)


    def delete(self):
        from server.models.ssuser import SSUser
        db = core.connect(SSUser.privateDb(self.createdBy))
        if db.get(self.id):
            del db[self.id]
        else:
            db = core.connect(SSUser.publicDb(self.createdBy))
            if db.get(self.id):
                del db[self.id]
        core.replicate(db.name, "shiftspace/shared")


    def publishIds(self):
        return [db.split("/")[1].split("/")[0] for db in self.publishData.dbs]

    # ========================================
    # Validation
    # ========================================
    
    def isPublic(self):
        return not self.publishData.private


    def isPrivate(self):
        return self.publishData.private

    # ========================================
    # Publishing
    # ========================================

    def publish(self, publishData=None, server="http://www.shiftspace.org/api/"):
        from server.models.ssuser import SSUser
        
        if publishData == None:
            return self
        
        db = core.connect(SSUser.privateDb(self.createdBy))
        dbs = []
        author = SSUser.read(self.createdBy)
        oldPublishData = dict(self.items())["publishData"]
        allowed = []
        
        # get the private status
        isPrivate = True
        if publishData and publishData.get("private") != None:
            isPrivate = publishData.get("private")
        else:
            isPrivate = self.isPrivate()
        
        # get the dbs being published to
        publishDbs = (publishData and publishData.get("dbs")) or []
        
        # get the list of dbs the user is actually allowed to publish to
        allowed = []
        if (publishData and isPrivate and len(publishDbs) > 0):
            from server.models.group import Group
            allowedGroups = author.writeable()
            allowed = list(set(allowedGroups).intersection(set(publishDbs)))
        
        # upate the private setting, the shift is no longer draft
        self.publishData.private = isPrivate
        self.publishData.draft = False
        
        # publish or update a copy to group/x, group/y, ...
        newGroupDbs = [s for s in allowed if s.split("/")[0] == "group"]
        oldGroupDbs = [s for s in oldPublishData.get("dbs") if s.split("/")[0] == "group"]
        newGroupDbs = list(set(newGroupDbs).difference(set(oldGroupDbs)))
        if newGroupDbs and len(newGroupDbs) > 0:
            dbs.extend(list(set(newGroupDbs)))
        
        self.publishData.dbs = dbs
        
        # update/add to group dbs
        self.updateInGroups(oldGroupDbs)
        self.addToGroups(newGroupDbs)
        
        # create in user/public, delete from user/private
        # replicate to user/feed and to shiftspace/public
        # replicate shiftspace/public to shiftspace/shared
        if not isPrivate:
            publicdb = SSUser.publicDb(self.createdBy)
            if Shift.load(core.connect(publicdb), self.id):
                self.updateIn(publicdb)
            else:
                self.copyTo(publicdb)
                privatedb = core.connect(SSUser.privateDb(self.createdBy))
                del privatedb[self.id]
            core.replicate(SSUser.publicDb(self.createdBy), "shiftspace/public")
            core.replicate("shiftspace/public", "shiftspace/shared")
        else:
            privatedb = SSUser.privateDb(self.createdBy)
            self.store(core.connect(privatedb))
            core.replicate(privatedb, "shiftspace/shared")
        
        return Shift.joinData(self, self.createdBy)
        

    def unpublish(self):
        # TODO: need to figure out if we want to support this - David 11/18/09
        pass


    def copyOrUpdateTo(self, dbname):
        db = core.connect(dbname)
        if not db.get(self.id):
            self.copyTo(dbname)
        else:
            self.updateIn(dbname)


    def addToGroups(self, groupDbs):
        from server.models.group import Group
        # NOTE - do we need to delete from user/private? - David 11/12/09
        for db in groupDbs:
            dbtype, dbid = db.split("/")
            theGroup = Group.read(dbid)
            theGroup.addShift(self)

    
    def updateInGroups(self, groupDbs):
        from server.models.group import Group
        for db in groupDbs:
            dbtype, dbid = db.split("/")
            theGroup = Group.read(dbid)
            theGroup.updateShift(self)

    # ========================================
    # Comments
    # ========================================

    def commentCount(self):
        from server.models.comment import Comment
        db = core.connect("shiftspace/shared")
        return core.value(Comment.count_by_shift(db, key=self.id))


    def comments(self, start=None, end=None, limit=25):
        from server.models.comment import Comment
        if not self.hasThread():
            return []
        db = core.connect(Comment.db(self.id))
        return core.objects(Comment.by_created(db, limit=limit))


    def hasThread(self):
        from server.models.comment import Comment
        try:
            server = core.server()
            thread = server[Comment.db(self.id)]
            return thread != None
        except Exception:
            return False


    def deleteThread(self):
        from server.models.comment import Comment
        server = core.server()
        # TODO - use bulk API to delete all comment stubs - David
        del server[Comment.db(self.id)]


    def subscribers(self):
        from server.models.comment import Comment
        db = core.connect(Comment.db(self.id))
        return core.values(Comment.all_subscribed(db))


    def favoriteCount(self):
        from server.models.favorite import Favorite
        db = core.connect("shiftspace/shared")
        return core.value(Favorite.count_by_shift(db, key=self.id)) or 0
    
    # ========================================
    # List & Filtering Support
    # ========================================

    @classmethod
    def shifts(cls, user, byHref=None, byFollowing=False, byGroups=False, start=0, limit=25):
        from server.models.ssuser import SSUser
        db = core.connect("shiftspace/shared")
        lucene = core.lucene()
        if byHref:
            queryString = "href:\"%s\" AND ((draft:false AND private:false)" % byHref
            if user:
                queryString = queryString + " OR createdBy:%s" % user.id
                dbs = user.readable()
                dbs.append(SSUser.db(user.id))
                dbsStr = " ".join(dbs)
                queryString = queryString + ((" OR (draft:false%s)" % ((len(dbs) > 0 and (" AND dbs:%s" % dbsStr)) or "")))
            queryString = queryString + ")"
            try:
                rows = lucene.search(db, "shifts", q=queryString, include_docs=True, sort="\modified", skip=start, limit=limit)
            except:
                return []
        elif byFollowing:
            queryString = "(draft:false AND private:false AND createdBy:%s) OR dbs:%s" % (" ".join(user.following), SSUser.db(user.id))
            print queryString
            try:
                rows = lucene.search(db, "shifts", q=queryString, include_docs=True, sort="\modified", skip=start, limit=limit)
            except:
                return []
        shifts = [row["doc"] for row in rows]
        return Shift.joinData(shifts, ((user and user.id) or None))
