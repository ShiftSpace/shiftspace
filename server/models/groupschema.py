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
    def create(cls, userId, groupJson):
        """
        Create a group.
        Parameters:
            userId - a user id.
            groupJson - a group json document.
        """
        from server.models.permschema import Permission
        from server.models.ssuserschema import SSUser

        # Multimethods would be really nice right now - David
        if type(userId) == SSUser:
            userId = userId.id
        if type(userId) == dict:
            userId = userId["_id"]

        groupJson["createdBy"] = userId
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
        newGroup.copyTo(core.connect(Group.db(newGroup.id)))
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
        """
        Delete the group. Will probably not allow this
        once there's other peoples content in a gruop,
        but useful for debugging.
        Parameters:
            id - a group id.
        """
        from server.models.permschema import Permission
        server = core.server()
        # delete the metadata
        db = core.connect()
        del db[self.id]
        # delete the group database
        del server[Group.db(self.id)]
        # delete all permissions
        [perm.deleteInstance() for perm in core.objects(Permission.by_group(core.connect(), key=self.id))]

    # ========================================
    # Group operations
    # ========================================

    def inviteUser(self, aUser, otherUser):
        """
        Add a user to a group. Creates a permission for that user.
        """
        from server.models.permschema import Permission
        Permission.create(aUser, self.id, otherUser, 0)


    def join(self, aUser):
        """
        If the user can join the group, update their status
        to allow reads.
        """
        thePermission = Permission.readByUserAndGroup(aUser.id, group.id)
        if thePermission and thePermission.level == 0:
            db = core.connect()
            thePermission.level = 1
            thePermission.store(db)


    def setPrivilege(self, aUser, level):
        """
        Set the privilege of a group member. Can only be
        set if the user has joined the group.
        """
        thePermission = Permission.readByUserAndGroup(aUser.id, self.id)
        if thePermission and level > 0:
            db = core.connect()
            thePermission.level = level
            thePermission.store(db)


    def addShift(self, aShift):
        """
        Add a shift to a group. Triggers replication to all
        user/private of all non-peer members. Peers will get
        the changes at synchronization time.
        Parameters:
            userId - a user id.
            shift - a Shift Document.
        """
        from server.models.ssuserschema import SSUser
        if Group.isMember(shift.createdBy, groupId):
            grpdb = Group.db(groupId)
            shift.copyTo(core.connect(grpdb))
            # TODO: only replicate into user/x/feeds that are not peer - David
            [core.replicate(grpdb, SSUser.feed(id)) for id in Group.members(groupId)]
        else:
            db = core.connect()
            theUser = SSUser.read(shift.createdBy)
            theGroup = Group.load(db, groupId)
            raise NotAMemberError("%s is not a member of %s" % (theUser.userName, theGroup.longName))

    @classmethod
    def updateShift(cls, userId, shift):
        """
        Update a shift in a group. Trigger replication
        to all user/private of all non-peer members. Peers
        will get the changes at synchronization time.
        Parameters:
            userId - a user id.
            shift - a Shift Document.
        """
        from server.models.ssuserschema import SSUser
        if Group.isMember(shift.createdBy, groupId):
            from server.model.ssuserschema import SSUser
            grpdb = Group.db(groupId)
            shift.updateIn(core.connect(grpdb))
            # TODO: only replicate into user_x/feeds that are not peer - David
            [core.replicate(grpdb, SSUser.feed(id)) for id in Group.members(groupId)]
        else:
            db = core.connect()
            theUser = SSUser.read(shift.createdBy)
            theGroup = Group.load(db, groupId)
            raise NotAMemberError("%s is not a member of %s" % (theUser.userName, theGroup.longName))

    @classmethod
    def deleteShift(cls, userId, shift):
        pass

    @classmethod
    def members(cls, groupId):
        from server.models.permschema import Permission
        db = core.connect()
        return [row.value for row in Permission.all_members(db, key=groupId).rows]
