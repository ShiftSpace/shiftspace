from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from server.utils.decorators import *
import server.utils.utils as utils
import core

from server.models.ssdoc import SSDocument

# ==============================================================================
# Errors
# ==============================================================================

class GroupError(Exception): pass
class NotAMemberError(GroupError): pass

# ==============================================================================
# Group Model
# ==============================================================================

class Group(SSDocument):
    
    # ========================================
    # Fields
    # ========================================

    type = TextField(default="group")
    shortName = TextField()
    longName = TextField()
    tagLine = TextField()
    url = TextField()
    visible = BooleanField(default=True)

    # ========================================
    # Views
    # ========================================

    all = View(
        "groups",
        "function(doc) {               \
           if(doc.type == 'group') {   \
             emit(doc._id, doc);       \
           }                           \
         }")

    by_visible_and_created = View(
        "groups",
        "function(doc) {               \
           if(doc.type == 'group' && doc.visible) {   \
             emit(doc.created, doc);       \
           }                           \
         }")

    by_short_name = View(
        "groups",
        "function(doc) {               \
           if(doc.type == 'group') {   \
             emit(doc.shortName, doc); \
           }                           \
         }")

    by_long_name = View(
        "groups",
        "function(doc) {               \
           if(doc.type == 'group') {   \
             emit(doc.longName, doc);  \
           }                           \
         }")

    shift_count = View(
        "groups",
        "function(doc) {                                      \
           if(doc.type == 'shift') {                          \
             var dbs = doc.publishData.dbs;                   \
             for(var i = 0, len = dbs.length; i < len; i++) { \
                var db = dbs[i], typeAndId = db.split('/');   \
                if(typeAndId[0] == 'group') {                 \
                  emit(typeAndId[1], 1);                      \
                }                                             \
             }                                                \
           }                                                  \
        }",
        "function(keys, values, rereduce) {                   \
           return sum(values);                                \
        }")

    # ========================================
    # Database
    # ========================================

    @classmethod
    def joinData(cls, groups, userId=None):
        from server.models.permission import Permission
        db = core.connect()
        keys = [[userId, group.id] for group in groups]
        perms = core.fetch(db, view=Permission.by_user_and_group, keys=keys)
        for i in range(len(groups)):
            if perms[i]:
                groups[i]["level"] = perms[i]["level"]
        return groups

    @classmethod
    def db(cls, groupId):
        return "group/%s" % groupId

    @classmethod
    def dbShortName(cls, shortName, absolute=False):
        result = core.object(Group.by_short_name(core.connect(), key=shortName))
        if result:
            return "%s/group/%s" % ((result.source.server or ''), result.id)
 
    @classmethod
    def dbLongName(cls, longName, absolute=False):
        result = core.object(Group.by_long_name(core.connect(), key=longName))
        if result:
            return "%s/group/%s" % ((result.source.server or ''), result.id)

    # ========================================
    # Class Methods
    # ========================================

    @classmethod
    def create(cls, groupJson):
        from server.models.permission import Permission
        from server.models.ssuser import SSUser

        userId = groupJson["createdBy"]

        # create the group metadata
        newGroup = Group(**utils.clean(groupJson))
        newGroup.source.server = core.serverName()
        newGroup.source.database =  Group.db(newGroup.id)
        # save the group metadata to the master db
        newGroup.store(core.connect())
        # create the root permission for this group
        Permission.create(userId, newGroup.id, userId, level=4)
        # create the group db
        server = core.server()
        server.create(Group.db(newGroup.id))
        # copy the group metadata to the db
        newGroup.copyTo(Group.db(newGroup.id))
        return newGroup
        
    @classmethod
    def read(cls, id):
        return Group.load(core.connect(), id)

    @classmethod
    def readByShortName(cls, shortName):
        db = core.connect()
        return core.object(Group.by_short_name(db, key=shortName))

    @classmethod
    def readByLongName(cls, longName):
        db = core.connect()
        return core.object(Group.by_long_name(db, key=longName))

    @classmethod
    def shortNamesToIds(cls, shortNames):
        return [group["_id"] for group in core.fetch(view=Group.by_short_name, keys=shortNames)]

    @classmethod
    def groups(cls, start=None, end=None, limit=25, userId=None):
        results = Group.by_visible_and_created(core.connect(), limit=25)
        if start and not end:
            return Group.joinData(core.objects(results[start:]), userId)
        if not start and end:
            return Group.joinData(core.objects(results[:end]), userId)
        if start and end:
            return Group.joinData(core.objects(results[start:end]), userId)
        return Group.joinData(core.objects(results), userId)

    # ========================================
    # Instance Methods
    # ========================================

    def update(self, fields):
        if fields.get("longName"):
            self.longName = fields.get("longName")
        if fields.get("shortName"):
            self.shortName = fields.get("shortName")
        if fields.get("tagLine"):
            self.tagLine = fields.get("tagLine")
        if fields.get("url"):
            self.url = fields.get("url")
        self.modified = datetime.now()
        self.store(core.connect())
        return self


    def delete(self):
        from server.models.permission import Permission
        server = core.server()
        # delete the metadata
        db = core.connect()
        del db[self.id]
        # delete the group database
        del server[Group.db(self.id)]
        # delete all permissions
        [perm.delete() for perm in core.objects(Permission.by_group(core.connect(), key=self.id))]


    def inviteUser(self, aUser, otherUser):
        from server.models.permission import Permission
        from server.models.message import Message
        Permission.create(aUser.id, self.id, otherUser.id, 0)
        json = {
            "fromId": aUser.id,
            "toId": otherUser.id,
            "title": "%s invited you to join the group %s!" % (aUser.userName, self.longName),
            "text": "%s invited you to join the group %s!" % (aUser.userName, self.longName),
            "meta": "invite",
            "content": {
                "_id": self.id
                }
            }
        Message.create(**json)


    def join(self, aUser):
        from server.models.permission import Permission
        thePermission = Permission.readByUserAndGroup(aUser.id, self.id)
        if thePermission and thePermission.level == 0:
            db = core.connect()
            thePermission.level = 2
            thePermission.store(db)


    def setPrivilege(self, aUser, level):
        thePermission = Permission.readByUserAndGroup(aUser.id, self.id)
        if thePermission and level > 0:
            db = core.connect()
            thePermission.level = level
            thePermission.store(db)


    def addShift(self, aShift):
        from server.models.ssuser import SSUser
        author = SSUser.read(aShift.createdBy)
        if author.isMemberOf(self):
            grpdb = Group.db(self.id)
            aShift.copyTo(grpdb)
        else:
            db = core.connect()
            raise NotAMemberError("%s is not a member of %s" % (author.userName, self.longName))


    def updateShift(self, aShift):
        from server.models.ssuser import SSUser
        author = SSUser.read(aShift.createdBy)
        if author.isMemberOf(self):
            grpdb = Group.db(self.id)
            aShift.updateIn(grpdb)
        else:
            db = core.connect()
            raise NotAMemberError("%s is not a member of %s" % (author.userName, self.longName))


    def deleteShift(self, aShift):
        db = core.connect(Group.db(self.id))
        del db[aShift.id]


    def members(self):
        from server.models.permission import Permission
        db = core.connect()
        return core.fetch(core.connect(), keys=[row.value for row in Permission.all_members(db, key=self.id).rows])


    def memberCount(self):
        from server.models.permission import Permission
        db = core.connect()
        return core.value(Permission.member_count(db, key=self.id))


    def admins(self):
        from server.models.permission import Permission
        db = core.connect()
        return [row.value for row in Permission.admins(db, key=self.id).rows]


    def adminCount(self):
        from server.models.permission import Permission
        db = core.connect()
        return core.value(Permission.admin_count(db, key=self.id))


    def shiftCount(self):
        db = core.connect("shiftspace/shared")
        return core.value(Group.shift_count(db, key=self.id)) or 0
