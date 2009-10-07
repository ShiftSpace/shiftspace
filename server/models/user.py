import server.utils.utils as utils
import core
import schema
import shift
import stream
import event
import permission

ref = utils.genrefn("user")

# ==============================================================================
# CRUD
# ==============================================================================

def create(data, createStreams=True):
    """
    Create a new user.
    Parameters:
        data - a dictionary containing the new user's data.
        createStreams - defaults to True. If True, will generate
             the user's public, private, and message streams.
    """
    db = core.connect()
    data["joined"] = utils.utctime()
    newUser = schema.user()
    newUser.update(data)
    newUser["type"] = "user"
    userId = db.create(newUser)
    userRef = ref(userId)
    # create public stream for user
    # for when the user publishes her/his own content
    publicStream = stream.create({
        "objectRef": userRef, 
        "uniqueName": ref(userId,"public"),
        "private": False,
        "meta": "public",
        "createdBy": userId
        }, False)
    # private stream for when shifts are sent directly to a user
    privateStream = stream.create({
        "objectRef": userRef, 
        "uniqueName": ref(userId,"private"),
        "private": True,
        "meta": "private",
        "createdBy": userId
        }, False)
    # create the message stream for the user
    messageStream = stream.create({
        "objectRef": userRef, 
        "uniqueName": ref(userId, "messages"), 
        "private": True, 
        "meta": "message",
        "createdBy": userId
        }, False)
    theUser = db[userId]
    theUser.update({
        "messageStream": messageStream["_id"],
        "publicStream": publicStream["_id"],
        "privateStream": privateStream["_id"]
        })
    db[userId] = theUser
    return db[userId]

def read(userName):
    """
    Returns the public data for a user.
    Parameters:
        userName - a user name.
    Returns:
        a dictionary containing the public data for a user.
    """
    theUser = readFull(userName)
    if theUser:
        del theUser["email"]
        del theUser["streams"]
        del theUser["password"]
    return theUser

def readFull(userName, deleteType=True):
    """
    Return the full data for a user.
    Parameters:
        userName - the user name.
        deleteType - delete the type field from the dictionary
            to be returned.
    Returns:
        a dictionary containing all the data for a user.
    """
    theUser = core.single(schema.userByName, userName)
    if theUser and deleteType:
        del theUser["type"]
    return theUser

def readById(id):
    """
    Return the user by id.
    Parameters:
        id - a user id.
    Returns:
        a dictionary containing all the data for a user.
    """
    db = core.connect()
    return db[id]

def update(data):
    """
    Update a user document.
    Parameters:
        data - a dictionary containing the fields to update. Should not
            attempt to update _id, _rev, type, joined, lastSeen.
    """
    data["modified"] = utils.utctime()
    return core.update(data)

def delete(userName):
    """
    Delete a user.
    """
    db = core.connect()
    id = idForName(userName)
    # delete all the user's events
    userEvents = utils.ids(event.eventsForUser(id))
    for eventId in userEvents:
        del db[eventId]
    # delete the user's public and message streams
    userStreams = utils.ids(stream.streamsForObjectRef(ref(id)))
    for streamId in userStreams:
        del db[streamId]
    # delete all of the remaining user's streams which have no events
    streamIds = utils.ids(stream.streamsByCreator(id))
    [stream.delete(streamId) for streamId in streamIds
     if len(event.eventsForStream(streamId)) == 0]
    # delete all the user's shifts
    deleteShifts(id)
    # delete all the user's permission
    userPerms = utils.ids(permission.permissionsForUser(id))
    for permId in userPerms:
        del db[permId]
    # delete the user
    del db[id]

def deleteShifts(id):
    db = core.connect()
    userShifts = utils.ids(shift.byUser(id))
    for shiftId in userShifts:
        del db[shiftId]    

# ==============================================================================
# Validation
# ==============================================================================

def canReadFull(id, userId):
    """
    Check whether a user has permission to read a user.
    Parameters:
        id - a user id
        userId - the user attempting the read action.
    Returns:
        bool
    """
    return (id == userId) or isAdmin(userId)

def canUpdate(id, userId):
    """
    Check whether a user has permission to updtae a user.
    Parameters:
        id - a user id
        userId - the user attempting the update action.
    Returns:
        bool
    """
    return (id == userId) or isAdmin(userId)

def canDelete(id, userId):
    """
    Check whether a user has permission to delete a user.
    Parameters:
        id - a user id
        userId - the user attempting the deletion action.
    Returns:
        bool
    """
    return (id == userId) or isAdmin(userId)

def isAdmin(id):
    """
    Check if the user is in the admin list.
    Parameters:
        id - a user id.
    Returns:
        bool
    """
    db = core.connect()
    admins = db["admins"]
    return id in admins["ids"]

def nameIsUnique(userName):
    """
    Returns True or False depending on if the name is taken.
    Parameters:
        userName - a user name.
    Returns:
        bool
    """
    # FIXME: cannot protect unless it's the document id - David Nolen 7/6/09
    return read(userName) == None

# ==============================================================================
# Streams
# ==============================================================================

def publicStream(id):
    """
    Return public stream id for a user.
    Parameters:
        id - a user id.
    Returns:
        a public stream id (string).
    """
    return readFull(nameForId(id))["publicStream"]

def privateStream(id):
    """
    Return the private stream id for a user.
    Parameters:
        id - a user id.
    Returns: 
        a private stream id (string).
    """
    return readFull(nameForId(id))["privateStream"]

def messageStream(id):
    """
    Return the message stream id for a user.
    Parameters:
        id - a user id.
    Returns:
        a message stream id (string).
    """
    return readFull(nameForId(id))["messageStream"]

def follow(follower, followed):
    """
    Subscribe a user to another user's public stream. A user's public
    stream is only for shifts at the moment. Both arguments should
    be the userNames.
    Parameters:
        follower - a user id.
        followed - a user id.
    """
    stream.subscribe(publicStream(followed), follower)

def unfollow(follower, followed):
    """
    Unsubscribe a user from another user's public stream. Both arguments
    should be userNames.
    Parameters:
        follower - a user id.
        followed - a user id.
    """
    stream.unsubscribe(publicStream(followed), follower)

def feeds(id, page=0, count=25):
    """
    Return all events for all streams that a user is subscribed to.
    Parameters:
        id - a user id.
        page - an integer representing the starting page.
        count - how many results to return.
    """
    db = core.connect()
    theUser = db[id]
    streams = theUser["streams"]
    allEvents = []
    for astream in streams:
        allEvents.extend(event.eventsForStream(astream))
    return allEvents

def feed(id, streamId):
    """
    Return all events for a single feed.
    Parameters:
        id - a user id.
        streamId - a stream id.
    """
    pass

# ==============================================================================
# Utilties
# ==============================================================================

# NOTE: Will probably be slow, two joins - David
# should look into grabbing multiple keys
def favorites(id):
    """
    Get all of a user's favorites.
    Parameters:
        id - a user id.
    Returns:
        A list of favorites.
    """
    db = core.connect()
    shiftIds = core.query(schema.favoritesByUser, id)
    shifts = [db[id] for id in shiftIds]
    return shift.joinData(shifts, id)

def comments(id):
    """
    Get all the comments posted by a user.
    Parameters:
        id - a user id
    Returns:
        A list of comments.
    """ 
    db = core.connect()
    return joinCommentData(core.query(schema.commentsByUser, id))

def joinCommentData(comments):
    def join(comment):
        content = comment["content"]
        shiftId = comment["objectRef"].split(":")[1]
        theShift = shift.read(shiftId)
        theUser = readById(theShift["createdBy"])
        content["shift"] = theShift
        content["user"] = theUser
        return comment
    return [join(comment) for comment in comments]

def getById(id):
    """
    Get a user by id.
    Parameters:
        id - a user id.
    """
    db = core.connect()
    return db[id]

def idForName(userName):
    """
    Get the id for a user from the userName.
    Parameters:
        userName - a user name.
    Returns:
        The a id a user (string).
    """
    theUser = readFull(userName)
    if theUser:
        return theUser["_id"]

def nameForId(id):
     """
     Return the user name for a given user id.
     Parameters:
         id - a user id.
     Returns:
         The string userName field.
     """
     db = core.connect()
     return db[id]["userName"]

def updateLastSeen(userName):
    """
    Update the last seen field of the specified user. Stores the current time.
    Parameters:
         userName - the user name.
    """
    db = core.connect()
    theUser = readFull(userName, False)
    theUser["lastSeen"] = utils.utctime()
    db[theUser["_id"]] = theUser

def addStream(id, streamId):
    """
    Add a stream id to the list of the user's subscribed streams. Checks
    whether a user has permissions to add that stream.
    Parameters:
        id - a user id.
        streamId - a stream id.
    """
    db = core.connect()
    theUser = db[id]
    if stream.canSubscribe(streamId, id) and (not streamId in theUser["streams"]):
        theUser["streams"].append(streamId)
        db[id] = theUser

def isSubscribed(id, streamId):
    """
    Check whether a user is subscribed to a particular stream.
    Parameters:
        id - a user id.
        streamId - a stream id.
    Returns:
        boolean.
    """
    db = core.connect()
    theUser = db[id]
    return streamId in theUser["streams"]

def addNotification(id, streamId):
    """
    Add a user to be notified when comments are added to a shift comment stream.
    Parameters:
        id - a user id.
        shiftId - a shift id.
    """
    db = core.connect()
    theUser = db[id]
    if not streamId in theUser["notify"]:
        theUser["notify"].append(streamId)
    db[id] = theUser

def removeNotification(id, shiftId):
    """
    Remove a notfications for a shift comment stream.
    Parameters:
        id - a user id.
        shiftId - a shift id.
    """
    db = core.connect()
    theUser = db[id]
    commentStream = shift.commentStream(shiftId)
    if commentStream in theUser["notify"]:
        theUser["notify"].remove(commentStream)
    db[id] = theUser

def followStreams(id):
    """
    Return all the user public stream ids the user is subscribed to.
    Parameters:
        id - a user id.
    Returns:
        A list of user public stream ids.
    """
    db = core.connect()
    theUser = db[id]
    streamIds = theUser["streams"]
    return [streamId for streamId in streamIds if db[streamId]["meta"] == "public"]

def groupStreams(id):
    """
    Return all the group stream ids the user is subscribed to.
    Parameters:
        id - a user id.
    Returns:
        A list of group stream ids.
    """
    db = core.connect()
    theUser = db[id]
    streamIds = theUser["streams"]
    return [streamId for streamId in streamIds if db[streamId]["meta"] == "group"]
