from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core

from server.models.ssdocschema import SSDocument

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

    # ========================================
    # Database
    # ========================================

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
        from server.models.permschema import Permission
        from server.models.ssuserschema import SSUser

        userId = groupJson["createdBy"]

        # create the group metadata
        newGroup = Group(**groupJson)
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

    # ========================================
    # Instance Methods
    # ========================================

    def update(self, id):
        pass


    def delete(self):
        from server.models.permschema import Permission
        server = core.server()
        # delete the metadata
        db = core.connect()
        del db[self.id]
        # delete the group database
        del server[Group.db(self.id)]
        # delete all permissions
        [perm.delete() for perm in core.objects(Permission.by_group(core.connect(), key=self.id))]

    # ========================================
    # Group operations
    # ========================================

    def inviteUser(self, aUser, otherUser):
        from server.models.permschema import Permission
        Permission.create(aUser.id, self.id, otherUser.id, 0)


    def join(self, aUser):
        thePermission = Permission.readByUserAndGroup(aUser.id, group.id)
        if thePermission and thePermission.level == 0:
            db = core.connect()
            thePermission.level = 1
            thePermission.store(db)


    def setPrivilege(self, aUser, level):
        thePermission = Permission.readByUserAndGroup(aUser.id, self.id)
        if thePermission and level > 0:
            db = core.connect()
            thePermission.level = level
            thePermission.store(db)


    def addShift(self, aShift):
        from server.models.ssuserschema import SSUser
        if Group.isMember(shift.createdBy, groupId):
            grpdb = Group.db(groupId)
            shift.copyTo(core.connect(grpdb))
            # TODO: only replicate into user/x/feeds that are not peer - David
            [core.replicate(grpdb, SSUser.feedDb(id)) for id in Group.members(groupId)]
        else:
            db = core.connect()
            theUser = SSUser.read(shift.createdBy)
            theGroup = Group.load(db, groupId)
            raise NotAMemberError("%s is not a member of %s" % (theUser.userName, theGroup.longName))


    def updateShift(self, shift):
        from server.models.ssuserschema import SSUser
        author = SSUser.read(shift.createdBy)
        if author.isMember(self):
            from server.model.ssuserschema import SSUser
            grpdb = Group.db(self.id)
            shift.updateIn(grpdb)
            # TODO: only replicate into user_x/feeds that are not peer - David
            [core.replicate(grpdb, SSUser.feedDb(id)) for id in self.members()]
        else:
            db = core.connect()
            raise NotAMemberError("%s is not a member of %s" % (author.userName, self.longName))

    @classmethod
    def deleteShift(cls, userId, shift):
        pass

    @classmethod
    def members(cls, groupId):
        from server.models.permschema import Permission
        db = core.connect()
        return [row.value for row in Permission.all_members(db, key=groupId).rows]
