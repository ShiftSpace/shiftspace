from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from ssdocschema import SSDocument

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core
from ssuserschema import *
from groupschema import *

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

    by_writeable = View(
        "permissions",
        "function (doc) {                             \
           if(doc.type == 'permission') {             \
              emit([doc.userId, doc.level > 1], doc); \
           }                                          \
         }"
        )

    by_readable = View(
        "permissions",
        "function (doc) {                             \
           if(doc.type == 'permission') {             \
              emit([doc.userId, doc.level > 0], doc); \
           }                                          \
         }"
        )
    
    # ========================================
    # CRUD
    # ========================================
    
    @classmethod
    def create(cls, userId, groupId, json):
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
        db = core.connect()
        if not groupId:
            raise MissingGroupError
        if not userId:
            raise MissingCreatorError
        if Permission.permissionForUser(userId, groupId):
            raise PermissionAlreadyExistsError
        allowed = User.isAdmin(userId)
        if not allowed:
            allowed = Group.isOwner(groupId, userId)
        if not allowed:
            adminable = Permission.adminGroups(userId)
            allowed = groupId in adminable
        if not allowed:
            raise CreateEventPermissionError
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
        return list(Permission.by_user_and_group(db, key=[userId, groupId]))[0]

    @classmethod
    def writeableGroups(cls, userId):
        return []
