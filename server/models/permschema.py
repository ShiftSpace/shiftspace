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

class PermissionError(Exception): pass
class MissingCreatorError(PermissionError): pass
class MissingGroupError(PermissionError): pass
class CreateEventPermissionError(PermissionError): pass
class PermissionAlreadyExistsError(PermissionError): pass

# ==============================================================================
# Permission Model
# ==============================================================================

class Permission(SSDocument):

    # ========================================
    # Fields
    # ========================================

    type = TextField(default="permission")
    groupId = TextField()
    userId = TextField()
    level = IntegerField()

    # ========================================
    # Views
    # ========================================

    all = View(
        "permissions",
        "function(doc) {                  \
           if(doc.type == 'permission') { \
             emit(doc._id, doc);          \
           }                              \
         }")

    by_user = View(
        "permissions",
        "function (doc) {                 \
           if(doc.type == 'permission') { \
             emit(doc.userId, doc);       \
           }                              \
         }")

    by_group = View(
        "permissions",
        "function (doc) {                 \
           if(doc.type == 'permission') { \
             emit(doc.groupId, doc);      \
           }                              \
         }")

    by_user_and_group = View(
        "permissions",
        "function (doc) {                           \
           if(doc.type == 'permission') {           \
             emit([doc.userId, doc.groupId], doc);  \
           }                                        \
         }")

    by_user_group_level = View(
        "permissions",
        "function (doc) {                                      \
           if(doc.type == 'permission') {                      \
              emit([doc.userId, doc.groupId, doc.level], doc); \
           }                                                   \
         }"
        )

    by_joinable = View(
        "permissions",
        "function (doc) {                                   \
           if(doc.type == 'permission' && doc.level == 0) { \
              emit(doc.userId, doc.groupId);                \
           }                                                \
         }"
        )

    by_readable = View(
        "permissions",
        "function (doc) {                                  \
           if(doc.type == 'permission' && doc.level > 0) { \
              emit(doc.userId, doc.groupId);               \
           }                                               \
         }"
        )

    by_writeable = View(
        "permissions",
        "function (doc) {                                  \
           if(doc.type == 'permission' && doc.level > 1) { \
              emit(doc.userId, doc.groupId);               \
           }                                               \
         }"
        )

    by_adminable = View(
        "permissions",
        "function (doc) {                                  \
           if(doc.type == 'permission' && doc.level >=3) { \
              emit(doc.userId, doc.groupId);               \
           }                                               \
         }"
        )
    
    # ========================================
    # CRUD
    # ========================================
    
    @classmethod
    def create(cls, userId, groupId, level):
        """
        Create will fail if:
            1. No userId specified.
            2. No groupId specified.
            3. Attempting to create a permission for a user on a group if a permission
               for that user on that group already exists.
        Parameters:
            userId - id of the user creating the permission.
            groupId - a group id.
            json - dictionary containing the permission data.
        Returns:
            the new Permission document.
        """
        from server.models.ssuserschema import SSUser
        from server.models.groupschema import Group

        # Multimethods would be really nice right now - David
        if type(userId) == SSUser:
            userId = userId.id
        if type(userId) == dict:
            userId = userId["_id"]

        db = core.connect()
        if not groupId:
            raise MissingGroupError
        if not userId:
            raise MissingCreatorError
        if Permission.permissionForUser(userId, groupId):
            raise PermissionAlreadyExistsError
        allowed = SSUser.isAdmin(userId)
        if not allowed:
            allowed = Group.isOwner(userId, groupId)
        if not allowed:
            adminable = [row.value for row in Permission.by_adminable(db, key=userId).rows]
            allowed = groupId in adminable
        if not allowed:
            raise CreateEventPermissionError
        json = {
            "userId": userId,
            "groupId": groupId,
            "level": level
            }
        newPermission = Permission(**json)
        newPermission.store(db)
        return newPermission

    @classmethod
    def read(cls, id):
        return Permission.load(core.connect(), id)

    @classmethod
    def update(cls, id, level):
        db = core.connect()
        perm = Permission.load(db, id)
        perm.level = level
        perm.store(db)
        return perm

    @classmethod
    def updateForUser(cls, userId, groupId, level):
        db = core.connect()
        perm = list(Permission.by_user_and_group(db, key=[userId, groupId]))[0]
        perm.level = level
        perm.store(db)
        return perm

    @classmethod
    def delete(cls, id):
        db = core.connect()
        del db[id]

    # ========================================
    # Utilities
    # ========================================

    @classmethod
    def permissionForUser(cls, userId, groupId):
        """
        Returns the permission for a particular group.
        Parameters:
            userId - a user id.
            groupId - a group id.
        Returns:
            A permission document.
        """
        db = core.connect()
        return core.value(Permission.by_user_and_group(db, key=[userId, groupId]))

    @classmethod
    def writeableGroups(cls, userId):
        return []
