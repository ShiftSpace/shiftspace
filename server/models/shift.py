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
            dbs = ListField(TextField()),           # take the form of user/id or group/id
            targets = ListField(TextField()),       # human readable version of dbs
            ))
    # TODO: figure out how we are going to handle this 11/28/09
    #tags = ListField(TextField())
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

    count_by_user_and_published = View(
        "shifts",
        "function(doc) {             \
           if(doc.type == 'shift' && \
              (doc.publishData.dbs.length > 0 || \
               doc.publishData.private == false)) { \
             emit(doc.createdBy, 1); \
           }                         \
         }",
        "function(keys, values, rereduce) { \
           return sum(values);              \
         }"
        )

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
    def read(cls, id, userId=None, proxy=False):
        from server.models.ssuser import SSUser
        theShift = None
        # then try the user public
        if userId:
            db = core.connect(SSUser.publicDb(userId))
            theShift = Shift.load(db, id)
            if not theShift:
                # then user private
                db = core.connect(SSUser.privateDb(userId))
                theShift = Shift.load(db, id)
        else:
            db = core.connect("shiftspace/public")
            theShift = Shift.load(db, id)
        if userId and not theShift:
            theUser = SSUser.read(userId)
            aShift = Shift.load(core.connect("shiftspace/shared"), id)
            if theUser.canRead(aShift):
                theShift = aShift
        if proxy:
            theShift = Shift.load(core.connect("shiftspace/shared"), id)
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

    def shareWith(self, userIds):
        from server.models.message import Message
        from server.models.ssuser import SSUser
        users = core.fetch(keys=userIds)
        userName = SSUser.read(self.createdBy).userName
        for user in users:
            json = {
                "fromId": self.createdBy,
                "toId": user["_id"],
                "title": "%s has shared a shift with you!" % userName,
                "text": "%s has shared a shift titled '%s' with you!" % (userName, self.summary),
                "meta": "share",
                "content": {
                    "type": "shift",
                    "_id": self.id,
                    "href": self.href,
                    "summary": self.summary
                    }
            }
            Message.create(**json)


    def publish(self, publishData=None):
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

        # publish to any user we haven't published to before
        newUserDbs = [s for s in publishDbs if s.split("/")[0] == "user"]
        if newUserDbs and len(newUserDbs) > 0:
            userDbs = list(set(newUserDbs))
            dbs.extend(userDbs)
            self.shareWith([s.split("/")[1] for s in userDbs])

        self.publishData.dbs = dbs
        # store the human readable version
        targets = publishData.get("targets")
        if targets:
            self.publishData.targets = targets

        # update/add to group dbs
        self.updateInGroups(oldGroupDbs)
        self.addToGroups(newGroupDbs)
        
        # if public shift
        # create in user/public, delete from user/private
        # replicate shiftspace/public to shiftspace/shared
        if not isPrivate:
            publicdb = SSUser.publicDb(self.createdBy)
            if Shift.load(core.connect(publicdb), self.id):
                self.updateIn(publicdb)
            else:
                # TODO: copyTo should probably just be store - David
                self.copyTo(publicdb)
                privatedb = core.connect(SSUser.privateDb(self.createdBy))
                del privatedb[self.id]
                # we need to delete the private copy out of shiftspace/shared
                shared = core.connect("shiftspace/shared")
                del shared[self.id]
            # TODO: check that we have to force it in order to have it ready for replication - David
            db = core.connect(publicdb)
            core.replicate(publicdb, "shiftspace/public")
            core.replicate(publicdb, "shiftspace/shared")
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
        return Comment.joinData(core.objects(Comment.by_created(db, limit=limit)))


    def hasThread(self):
        from server.models.comment import Comment
        try:
            server = core.sharedServer()
            thread = server[Comment.db(self.id)]
            return thread != None
        except Exception:
            return False


    def deleteThread(self):
        from server.models.comment import Comment
        server = core.sharedServer()
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
    def shifts(cls, user, byHref=None, byDomain=None, byFollowing=False, byGroups=False, start=0, limit=25, filter=False, query=None):
        from server.models.ssuser import SSUser
        db = core.connect("shiftspace/shared")
        lucene = core.lucene()
        queryString = ""
        # TODO: validate all fields - David
        
        if byHref or byDomain:
            if byHref:
                queryString = "hrefExact:\"%s_HREF_EXACT\"" % byHref
            elif byDomain:
                queryString = "domain:\"%s\""% byDomain
            queryString = queryString + " AND ((draft:false AND private:false)"
            if user:
                queryString = queryString + " OR createdBy:%s" % user.id
                dbs = user.readable()
                dbs.append(SSUser.db(user.id))
                dbsStr = " ".join(dbs)
                queryString = queryString + ((" OR (draft:false%s)" % ((len(dbs) > 0 and (" AND dbs:(%s)" % dbsStr)) or "")))
            queryString = queryString + ")"
        elif byFollowing:
            from server.models.follow import Follow
            # FIXME: impossible to make this scale in a simple way for many followers w/o p2p - David 12/2/09
            # when p2p we can tag the shift as a follow shift when we get it
            results = Follow.following_by_created(core.connect())
            following = " ".join(core.values(results[[user.id]:[user.id, {}]]))
            queryString = "(draft:false AND private:false AND createdBy:(%s)) OR dbs:(%s)" % (following, SSUser.db(user.id))
        elif byGroups:
            from server.models.group import Group
            queryString = "dbs:(%s)" % " ".join(user.readable())
        if filter:
            queryString = queryString + " AND " + core.dictToQuery(query)

        print queryString
        try:
            rows = lucene.search(db, "shifts", q=queryString, include_docs=True, sort="\modified", skip=start, limit=limit)
        except Exception, err:
            print err
            return []

        shifts = [row["doc"] for row in rows]
        return Shift.joinData(shifts, ((user and user.id) or None))
