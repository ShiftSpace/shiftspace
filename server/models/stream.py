import server.utils.utils as utils
import core
import schema
import user
import shift
import event
import permission

class StreamError(Exception): pass
class MissingCreatorError(StreamError): pass

# ==============================================================================
# CRUD
# ==============================================================================

def create(data, add=True):
    """
    Create a stream. Will fail if:
        1. createdBy field missing.
    Parameters:
        data - the data for the new stream.
        add - whether this should be added to the user's list of stream. Defaults
            to True.
    Returns:
        The id of the newly created stream.
    """
    db = core.connect()
    data["created"] = utils.utctime()
    newStream = schema.stream()
    newStream.update(data)
    userId = newStream["createdBy"]
    if not userId:
        raise MissingCreatorError
    newStream["type"] = "stream"
    id = db.create(newStream)
    if add:
        user.addStream(userId, id)
    return db[id]

def read(id):
    """
    Read a stream.
    Parameters:
        id - a stream id.
    Returns:
        A dictionary of the streams data.
    """
    db = core.connect()
    return db[id]

def update(data):
    """
    Update a stream.
    Parameters:
        data - a dictionary of fields to update. This dictionary should contain
            an _id field as well as a _rev field.
    """
    return core.update(data)

def delete(id):
    """
    Delete a stream. Deletes all permission documents associated with the stream
    as well.
    Parameters:
        id - a stream id.
    """
    db = core.connect()
    permIds = [perm["_id"] for perm in permission.permissionsForStream(id)]
    [permission.delete(permId) for permId in permIds]
    del db[id]

# ==============================================================================
# Validation
# ==============================================================================

def canCreate(id, userId):
    if user.isAdmin(userId):
        return True
    return True

def canRead(id, userId):
    """
    Returns true if:
        1. User is admin.
        2. The stream is public.
        3. The user created the stream.
        4. The user has read permission for the stream.
    Parameters:
        id - a stream id.
        userId - a user id.
    Returns:
        bool.
    """
    if user.isAdmin(userId):
        return True
    theStream = read(id)
    if theStream["createdBy"] == userId:
        return True
    if not theStream["private"]:
        return True
    readableStreams = permission.readableStreams(userId)
    return (id in readableStreams)

def canUpdate(id, userId):
    """
    Returns true if:
        1. User is admin.
        2. User created the stream.
    Parameters:
        id - a stream id.
        userId - a user id.
    Returns:
        bool.
    """
    if user.isAdmin(userId):
        return True
    theStream = read(id)
    if theStream["createdBy"] == userId:
        return True
    return False

def canDelete(id, userId):
    """
    Returns true if:
        1. User is admin.
        2. User created the stream.
    Parameters:
        id - a stream id.
        userId - a user id.
    Returns:
        bool.
    """
    if user.isAdmin(userId):
        return True
    theStream = read(id)
    if theStream["createdBy"] == userId:
        return True
    return False

def canSubscribe(id, userId):
    """
    Return true if:
        1. User is admin.
        2. User created the stream.
        3. The stream is public.
        4. User has join permissions.
    Parameters:
        id - a stream id.
        userId - a user id.
    Returns:
        bool.
    """
    if user.isAdmin(userId):
        return True
    theStream = read(id)
    if theStream["createdBy"] == userId:
        return True
    if not theStream["private"]:
        return True
    joinable = permission.joinableStreams(userId)
    return id in joinable

def canPost(id, userId):
    """
    Return true if:
        1. User is admin.
        2. User created the stream.
        3. User can write to the stream.
    Parameters:
        id - a stream id.
        userId - a user id.
    Returns:
        bool.
    """
    if user.isAdmin(userId):
        return True
    theStream = read(id)
    if theStream["createdBy"] == userId:
        return True
    writeable = permission.writeableStreams(userId)
    return id in writeable

def canAdmin(id, userId):
    """
    Return true if:
        1. User is admin.
        2. User created the stream.
        3. User can admin the stream.
    Parameters:
        id - a stream id.
        userId - a user id.
    Returns:
        bool.
    """
    if user.isAdmin(userId):
        return True
    theStream = read(id)
    if theStream["createdBy"] == userId:
        return True
    adminable = permission.adminStreams(userId)
    return id in adminable

def isOwner(id, userId):
    """
    Check whether a stream was created by a user.
    Parameters:
        id - a stream id.
        userId - a user id.
    Returns:
        bool.
    """
    db = core.connect()
    return db[id]["createdBy"] == userId

def isPublic(id):
    """
    Checks if the stream is public.
    Parameters:
        id - a stream id.
    Returns:
        bool.
    """
    db = core.connect()
    return not db[id]["private"]

def isPublicUserStream(id):
    """
    Check if the stream is a user's public stream.
    Parameters:
        id - a stream id.
    Returns:
        bool.
    """
    db = core.connect()
    return (not db[id]["meta"] == "public")

# ==============================================================================
# Subscribe/Unsubscribe/Invite
# ==============================================================================

def subscribe(id, userId):
    """
    Subscribe a user to a stream.
    Parameters:
        id - a stream id.
        userId - a user id.
    """
    db = core.connect()
    theUser = db[userId]
    theStream = db[id]
    allowed = not theStream["private"]
    if not allowed:
        perms = permission.joinableStreams(userId);
        allowed = id in perms
    if allowed and (not id in theUser["streams"]):
        theUser["streams"].append(id)
        db[userId] = theUser
        if theStream["private"]:
            perm = permission.permissionForUser(userId, id)
            permission.update(perm["_id"], 1)

def unsubscribe(id, userId):
    """
    Unsubscribe a user to a stream.
    Parameters:
        id - a stream id.
        userId - a user id.
    """
    db = core.connect()
    theUser = db[userId]
    if id in theUser["streams"]:
        theUser["streams"].remove(id)
        db[userId] = theUser

def invite(id, adminId, userId):
    """
    Give a user join permission.
    Parameters:
        id - a stream id.
        adminId - a user id, this user should be a stream admin.
        userId - a user id.
    """
    db = core.connect();
    permission.create({
        "streamId": id,
        "createdBy": adminId,
        "userId": userId,
        "level": 0
        })
    event.create({
        "createdBy": userId,
        "streamId": user.messageStream(userId),
        "displayString": "%s has invited you to the %s %s" % (user.nameForId(adminId), meta(id), displayName(id)),
        "unread": True
        })

# ==============================================================================
# Utilities
# ==============================================================================

def displayName(id):
    """
    Return the display name for a stream.
    Parameters:
        id - a stream id.
    Returns:
        a string.
    """
    db = core.connect()
    return db[id]["displayName"]

def meta(id):
    """
    Returns the meta field of a stream.
    Parameters:
       id - a stream id.
    Returns:
       The meta field of a stream documetn (string).
    """
    db = core.connect()
    return db[id]["meta"]  

def subscribers(id):
    """
    Returns the list of users subscribed to a stream.
    Parameters:
        id - a stream id.
    Returns:
        a list of stream documents.
    """
    return core.query(schema.streamBySubscribers, id)

def streamsForObjectRef(objectRef):
    """
    All streams for a objectRef, where objectRef is "type:id".
    Parameters:
        objectRef - a object reference. Always "type:id".
    Returns:
        a list of stream documents.
    """
    return core.query(schema.streamByObjectRef, objectRef)

def streamsByCreator(userId):
    """
    All streams created by a particular user.
    Parameters:
        userId - a user id.
    Returns:
        a list of stream documents.
    """
    return core.query(schema.streamByCreator, userId)

def byUniqueName(uniqueName):
    """
    Return the stream with a unique name. Used mainly when using streams
    to support tagging.
    Parameters:
        uniqueName - the unique name for that stream.
    Returns:
        A stream id (string).
    """
    return core.single(schema.streamByUniqueName, uniqueName)

def notifications(id):
    """
    Return a list of all users who should be notified of an event on a stream.
    Parameters:
        id - a stream id.
    Returns:
        A list of stream user ids who are currently being notified of events on a stream.
    """
    return core.query(schema.notify, id)
