import server.utils.utils as utils
import core
import stream
import schema
import user
import permission

# ==============================================================================
# CRUD
# ==============================================================================

def create(data, notifData=None):
    """
    Create an event document.
    Parameters:
        data - a dictionary of the event data.
        notifData - a dictionary of data to be sent in the notifications.
    Returns:
        an event document.
    """
    db = core.connect()
    theTime = utils.utctime()
    data["created"] = theTime
    data["modified"] = theTime
    # create notification events
    notifications = stream.notifications(data["streamId"])
    for userId in notifications:
        create({
                "createdBy": data.get("createdBy"),
                "displayString": data.get("displayString"),
                "streamId": user.messageStream(userId),
                "unread": True,
                "content": data.get("content")
                })
    newEvent = schema.event()
    newEvent.update(data)
    newEvent["type"] = "event"
    return db.create(newEvent)

def read(id):
    """
    Read the event document.
    Parameters:
        id - an event id.
    Returns:
        an event document.
    """
    db = core.connect()
    return db[id]

def update(data):
    """
    Update an event document.
    Parameters:
        data - dictionary of key-values to update.
    Returns:
        an event document.
    """
    db = core.connect()
    id = data["id"]
    doc = db[id]
    doc.update(data)
    doc["modified"] = utils.utctime()
    if core.validate(doc):
        db[id] = doc
        return db[id]
    else:
        # TODO: throw an exception - David 7/9/09
        return None

def delete(id):
    """
    Delete a event document.
    Parameters:
        id - an event id.
    """
    db = core.connect()
    del db[id]

# ==============================================================================
# Validation
# ==============================================================================

def canCreate(data, userId):
    """
    Check if a user can create an event. Allowed under the following conditions:
        1. user is admin.
        2. the stream is public.
        3. the stream is writeable by the user.
    Parameters:
        data - the event data.
        userId - a user id.
    Returns:
        bool.
    """
    if user.isAdmin(userId):
        return True
    streamId = data["streamId"]
    theStream = stream.read(userId)
    if not theStream["private"]:
        return True
    writeable = permission.writeableStreams(userId)
    return (streamId in writeable)

def canRead(id, userId):
    """
    Check if a user can read an event. Allowed under the following conditions:
        1. the user is admin.
        2. the stream is public.
        3. the stream is readable by the user.
    Parameters:
        id - an event id.
        userId - a user id.
    Returns:
        bool.
    """
    if user.isAdmin(userId):
        return True
    streamId = data["streamId"]
    theStream = stream.read(userId)
    if not theStream["private"]:
        return True
    readable = permission.readableStreams(userId)
    return (streamId in readable)

def canUpdate(id, userId):
    """
    Check if a user can update an event. Allowed under the following conditions:
        1. the user is admin.
        2. the user created the event.
    Parameters:
        id - an event id.
        userId - a user id.
    Returns:
        bool.
    """
    if user.isAdmin(userId):
        return True
    theEvent = read(id)
    return theEvent["createdBy"] == userId

def canDelete(id, userId):
    """
    Check if a user can delete an event. Allowed under the following conditions:
        1. the user is admin.
        2. the user created the event.
    Parameters:
        id - an event id.
        userId - a user id.
    Returns:
        bool.
    """
    if user.isAdmin(userId):
        return True
    theEvent = read(id)
    return theEvent["createdBy"] == userId

# ==============================================================================
# Utilities
# ==============================================================================

def eventsForStream(streamId):
    """
    Return all the events on a stream.
    Parameters:
        streamId - a stream id.
    Returns:
        a list of event documents.
    """
    return core.query(schema.eventByStream, streamId)

def eventsForUser(userId):
    """
    Return all the user's events.
    Parameters:
        userId - a user id.
    Returns:
        a list of event documents.
    """
    return core.query(schema.eventByUser, userId)

def markRead(id):
    db = core.connect()
    event = db[id]
    event["unread"] = False
    db[id] = event
    return db[id]

def markUnread(id):
    db = core.connect()
    event = db[id]
    event["unread"] = True
    db[id] = event
    return db[id]

def joinData(events):
    for event in events:
        creator = user.readById(event["createdBy"])
        gravatar = creator.get("gravatar")
        if gravatar != None:
            event["gravatar"] = gravatar
        event["userName"] = creator["userName"]
    return events
