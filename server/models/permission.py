import server.utils.utils as utils
import core
import schema
import user
import stream
import event

class PermissionError(Exception): pass
class MissingCreatorError(PermissionError): pass
class MissingStreamError(PermissionError): pass
class CreateEventOnPublicStreamError(PermissionError): pass
class CreateEventPermissionError(PermissionError): pass
class PermissionAlreadyExistsError(PermissionError): pass

# ==============================================================================
# CRUD
# ==============================================================================

def create(data):
    """
    Create will fail if:
        1. No stream specified.
        2. No creator specified.
        3. Attempting to create an event on a public stream.
        4. Attempting to create a permission for a user on a stream if a permission
           for that user on that stream already exists.
        5. Attempting to create an event without proper permission. Must either be
           an amdin for that stream or running as admin for shiftserver.
    Parameters:
        data - dictionary containing the permission data.
    Returns:
        a dictionary of the new permission document values.
    """
    db = core.connect()
    streamId = data["streamId"]
    createdBy = data["createdBy"]
    if not streamId:
        raise MissingStreamError
    if not createdBy:
        raise MissingCreatorError
    if stream.isPublic(streamId):
        raise CreateEventOnPublicStreamError
    if permissionForUser(createdBy, streamId):
        raise PermissionAlreadyExistsError
    allowed = user.isAdmin(createdBy)
    if not allowed:
        allowed = stream.isOwner(streamId, createdBy)
    if not allowed:
        adminable = adminStreams(createdBy)
        allowed = streamId in adminable
    if not allowed:
        raise CreateEventPermissionError
    newPermission = schema.permission()
    newPermission.update(data)
    newPermission["type"] = "permission"
    id = db.create(newPermission)
    return db[id]

def read(id):
    """
    Read a permission document.
    Parameters:
        id - a permission id.
    Returns:
        a dictionary of the permission document data.
    """
    db = core.connect()
    return db[id]

def update(id, level):
    """
    Can only update the level after permission creation.
    Parameters:
        id - a permission id.
        level - the permission level to update to.
    Returns:
        a dictionary of the updated permission document values.
    """
    db = core.connect()
    perm = read(id)
    perm["level"] = level
    db[id] = perm
    return db[id]

def updateForUser(userId, streamId, level):
    """
    Update the permission document for a user and stream. Useful
    if you don't have the permission id handy.
    Parameters:
        userId - a user id.
        streamId - a stream id.
        level - the permission level to update to.
    Returns:
        a dictionary of the updated permission document values.
    """
    perm = permissionForUser(userId, streamId)
    return update(perm["_id"], level)

def delete(id):
    """
    Delete a permission document.
    Parameters:
        id - a permission id.
    """
    db = core.connect()
    del db[id]

# ==============================================================================
# Utilities
# ==============================================================================

def permissionForUser(userId, streamId):
    """
    Returns the permission for a particular stream.
    Parameters:
        userId - a user id.
        streamId - a stream id.
    Returns:
        A permission document.
    """
    return core.single(schema.permissionByUserAndStream, [userId, streamId])

def permissionsForUser(userId):
    """
    Returns all permission documents for a particular user.
    Parameters:
        userId - a user id.
    Returns:
        a list of permission documents.
    """
    db = core.connect()
    return core.query(schema.permissionByUser, userId)

def permissionsForStream(streamId):
    """
    Returns all permission documents a particular stream.
    Parameters:
        streamId - a stream id.
    Returns:
        a list of permission documents.
    """
    db = core.connect()
    return core.query(schema.permissionByStream, streamId)

def joinableStreams(userId):
    return [aperm["streamId"] for aperm in permissionsForUser(userId)
            if aperm["level"] == 0]

def readableStreams(userId):
    """
    Returns all the stream ids that the user is allowed to read.
    Parameters:
        userId - a user id.
    Returns:
        list of stream ids.
    """
    return [aperm["streamId"] for aperm in permissionsForUser(userId)
            if aperm["level"] >= 1]

def writeableStreams(userId):
    """
    Returns all the stream ids that the user is allowed to write to.
    Parameters:
        userId - a user id.
    Returns:
        list of stream ids.
    """
    return [aperm["streamId"] for aperm in permissionsForUser(userId)
            if aperm["level"] >= 2]

def adminStreams(userId):
    """
    Returns all the stream ids that the user is allowed admin.
    Parameters:
        userId - a user id.
    Returns:
        list of stream ids.
    """
    return [aperm["streamId"] for aperm in permissionsForUser(userId)
            if aperm["level"] >= 3]

def ownerStreams(userId):
    """
    Returns all the stream ids that the user created.
    Parameters:
        userId - a user id.
    Returns:
        list of stream ids.
    """
    return [aperm["streamId"] for aperm in permissionsForUser(userId)
            if aperm["level"] == 4]
