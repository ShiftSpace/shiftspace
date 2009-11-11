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
class CreateEventOnPublicStreamError(PermissionError): pass
class CreateEventPermissionError(PermissionError): pass
class PermissionAlreadyExistsError(PermissionError): pass

# ==============================================================================
# Permission Model
# ==============================================================================

class Permission(SSDocument):
    
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
            data - dictionary containing the permission data.
        Returns:
            a dictionary of the new permission document values.
        """
        db = core.connect()
        if no streamId:
            raise
        pass

    @classmethod
    def writeableStreams(cls, userId):
        return []

