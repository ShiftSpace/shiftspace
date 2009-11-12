from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from ssdocschema import SSDocument

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core
from ssuserschema import *

# ==============================================================================
# Errors
# ==============================================================================

class PermissionError(Exception): pass
class MissingCreatorError(PermissionError): pass
class MissingStreamError(PermissionError): pass
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
    streamId = TextField()
    userId = TextField()
    level = IntegerField()

    # ========================================
    # Views
    # ========================================

    all = View(
        "permissions",
        "function(doc) { \
         }")

    by_user = View(
        "permissions",
        "function (doc) { \
         }")

    by_group = View(
        "permissions",
        "function (doc) { \
         }")

    by_user_and_stream = View(
        "permissions",
        "function (doc) { \
         }")
    
    # ========================================
    # CRUD
    # ========================================
    
    @classmethod
    def create(cls, userId, streamId, json):
        """
        Create will fail if:
            1. No userId specified.
            2. No streamId specified.
            3. Attempting to create a permission for a user on a stream if a permission
               for that user on that stream already exists.
        Parameters:
            userId - id of the user creating the permission.
            streamId - a stream id.
            json - dictionary containing the permission data.
        Returns:
            the new Permission document.
        """
        db = core.connect()
        if not streamId:
            raise MissingStreamError
        if not userId:
            raise MissingCreatorError
        if Persmision.permissionForUser(userId, streamId):
            raise PermissionAlreadyExistsError
        allowed = User.isAdmin(userId)
        if not allowed:
            allowed = Group.isOwner(streamId, userId)
        if not allowed:
            adminable = Permission.adminStreams(userId)
            allowed = streamId in adminable
        if not allowed:
            raise CreateEventPermissionError
        newPermission = Permission(**json)
        newPermission["type"] = "permission"
        id = db.create(newPermission)
        return db[id]

    @classmethod
    def writeableStreams(cls, userId):
        return []

