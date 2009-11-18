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

    all_members = View(
        "permissions",
        "function (doc) {                                  \
           if(doc.type == 'permission' && doc.level > 0) { \
             emit(doc.groupId, doc.userId);                \
           }                                               \
         }"
        )

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
        "function (doc) {                                   \
           if(doc.type == 'permission' && doc.level >= 3) { \
              emit(doc.userId, doc.groupId);                \
           }                                                \
         }"
        )
    # ========================================
    # CRUD
    # ========================================
    
    @classmethod
    def create(cls, userId, groupId, otherId, level):
        from server.models.ssuserschema import SSUser
        from server.models.groupschema import Group

        db = core.connect()
        if not groupId:
            raise MissingGroupError
        if not userId:
            raise MissingCreatorError
        if Permission.readByUserAndGroup(otherId, groupId):
            raise PermissionAlreadyExistsError

        adminable = [row.value for row in Permission.by_adminable(db, key=userId).rows]
        allowed = groupId in adminable
        if not allowed:
            theUser = SSUser.read(userId)
            allowed = theUser.isAdmin()
        if not allowed:
            theGroup = Group.read(groupId)
            allowed = theUser.isOwnerOf(theGroup)
        if not allowed:
            raise CreateEventPermissionError

        json = {
            "createdBy": userId,
            "userId": otherId,
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
    def readByUserAndGroup(cls, userId, groupId):
        db = core.connect()
        return core.object(Permission.by_user_and_group(db, key=[userId, groupId]))

    @classmethod
    def updateForUser(cls, userId, groupId, level):
        db = core.connect()
        perm = core.value(Permission.by_user_and_group(db, key=[userId, groupId]))
        perm.level = level
        perm.store(db)
        return perm

    # ========================================
    # Instance Methods
    # ========================================

    def update(self, id, level):
        self.level = level
        self.store(core.connect())
        return self


    def delete(self):
        db = core.connect()
        del db[self.id]

    # ========================================
    # Utilities
    # ========================================

    @classmethod
    def joinable(cls, userId):
        from server.models.groupschema import Group
        db = core.connect()
        return [Group.db(id) for id in core.values(Permission.by_joinable(db, key=userId))]

    @classmethod
    def readable(cls, userId):
        from server.models.groupschema import Group
        db = core.connect()
        return [Group.db(id) for id in core.values(Permission.by_readable(db, key=userId))]

    @classmethod
    def writeable(cls, userId):
        from server.models.groupschema import Group
        db = core.connect()
        return [Group.db(id) for id in core.values(Permission.by_writeable(db, key=userId))]

    @classmethod
    def adminable(cls, userId):
        from server.models.groupschema import Group
        db = core.connect()
        return [Group.db(id) for id in core.values(Permission.by_adminable(db, key=userId))]

