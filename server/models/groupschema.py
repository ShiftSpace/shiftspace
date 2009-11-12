from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core

from server.models.ssdocschema import SSDocument

# ==============================================================================
# Group Model
# ==============================================================================

class Group(SSDocument):
    
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
        return "group_%s" % groupId

    @classmethod
    def byShortName(cls, shortName, absolute=False):
        result = list(Group.by_shortName(core.connect(), key=shortName))
        if result and len(result) > 0:
            return "%s/group_%s" % ((result[0].source.server or ''), result[0].id)
 
    @classmethod
    def byLongName(cls, longName, absolute=False):
        result = list(Group.by_longName(core.connect(), key=longName))
        if result and len(result) > 0:
            return "%s/group_%s" % ((result[0].source.server or ''), result[0].id)

    # ========================================
    # CRUD
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

        # Multimethods would be really nice right now - David
        if type(userId) == SSUser:
            userId = userId.id

        groupJson["createdBy"] = userId
        # create the group metadata
        newGroup = Group(**groupJson)
        newGroup.source.server = core.serverName()
        newGroup.source.database =  Group.db(newGroup.id)
        # save the group metadata to the master db
        newGroup.store(core.connect())
        # create the root permission for this group
        Permission.create(userId, newGroup.id, level=4)
        # create the group db
        server = core.server()
        server.create(Group.db(newGroup.id))
        # copy the group metadata to the db
        newGroup.copyTo(core.connect(Group.db(newGroup.id)))
        return newGroup
        
    @classmethod
    def read(cls, id):
        pass

    @classmethod
    def update(cls, id):
        pass

    @classmethod
    def delete(cls, id):
        """
        Delete the group.
        Parameters:
            id - a group id.
        """
        server = core.server()
        del server[Group.db(id)]

    # ========================================
    # Validation
    # ========================================

    @classmethod
    def isOwner(cls, userId, groupId):
        theGroup = Group.load(core.connect(), groupId)
        return userId == theGroup.createdBy

    @classmethod
    def isAdmin(cls, userId, groupId):
        return len(Permission.by_user_group_level(core.connect(), key=[userId, groupId, 3])) > 0

    # ========================================
    # Group operations
    # ========================================

    @classmethod
    def addShift(cls, userId, shift):
        """
        Add a shift to a group. Triggers replication to all
        user/private of all non-peer members. Peers will get
        the changes at synchronization time.
        Parameters:
            userId - a user id.
            shift - a Shift Document.
        """
        # replicate to all subscribers
        pass

    @classmethod
    def updateShift(cls, userId, shift):
        # replicate to all subscribers
        pass

    @classmethod
    def deleteShift(cls, userId, shift):
        pass

    # ========================================
    # Instance Methods
    # ========================================

    def deleteInstance(self):
        server = core.server()
        del server[Group.db(self.id)]

