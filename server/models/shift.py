import server.utils.utils as utils
from server.utils.decorators import *
import core
import schema
import user
import stream
import event
import permission

def ShiftError(Exception): pass
def ShiftSchemaConflictError(ShiftError): pass

def ref(id): 
    return "shift:"+id

# ==============================================================================
# CRUD
# ==============================================================================

def create(data):
    """
    Create a shift in the database.
    Parameters:
        data - the new data for the shift.
    Returns:
        The id of the new shift (string).
    """
    db = core.connect()
    theTime = utils.utctime()
    data["created"] = theTime
    data["modified"] = theTime
    data["domain"] = utils.domain(data["href"])
    newShift = schema.shift()
    newShift.update(data)
    newShift["type"] = "shift"
    id = db.create(newShift)
    newShift = db[id]
    return joinData(newShift, newShift["createdBy"])

def read(id):
    """
    Get a specific shift.
    Parameters:
        id - a shift id.
    Returns:
        a dictionary of the shift's data.
    """
    db = core.connect()
    return db[id]

def update(id, data):
    """
    Update a shift in the database.
    Parameters:
        id - a shift id.
        data - a dictinary of shift fields to update.
    Returns:
        a dictionary representing the updated shift document.
    """
    db = core.connect()
    theShift = db[id]
    theShift.update(data)
    theShift["modified"] = utils.utctime()
    db[id] = theShift
    return db[id]

def delete(id):
    """
    Delete a shift from the database.
    Parameters:
        id - a shift id.
    """
    db = core.connect()
    # FIXME: What happens to orphaned comments? - David 7/6/09
    del db[id]

# ==============================================================================
# Validation
# ==============================================================================

def canRead(id, userId):
    """
    Check if a user can read a shift. The user must have
    either:
        1. Created the shift
        2. The shift must be published and public
        3. If the user is subscribed to a stream the shift is on.
        4. If the shift is published to the user's private stream.
    Parameters:
        id - a shift id.
    Returns:
        bool.
    """
    db = core.connect()
    theShift = db[id]
    if user.isAdmin(userId):
        return True
    if theShift["createdBy"] == userId:
        return True
    if theShift["publishData"]["draft"]:
        return False
    theUser = db[userId]
    if not theShift["publishData"]["private"]:
        return True
    if theUser["privateStream"] in theShift["publishData"]["streams"]:
        return True
    shiftStreams = theShift["publishData"]["streams"]
    readableStreams = permission.readableStreams(userId)
    allowed = set(shiftStreams).intersection(readableStreams)
    return len(allowed) > 0

def canUpdate(id, userId):
    """
    Check where a user can update a shift.
    Parameters:
        id - a shift id.
        userId - a user id.
    Returns:
        bool.
    """
    db = core.connect()
    theShift = db[id]
    return user.isAdmin(userId) or (userId == theShift['createdBy'])

def canDelete(id, userId):
    """
    Check where a user can delete a shift.
    Parameters:
        id - a shift id.
        userId - a user id.
    Returns:
        bool.
    """
    db = core.connect()
    theShift = db[id]
    return user.isAdmin(userId) or (userId == theShift['createdBy'])

def canPublish(id, userId):
    """
    Check where a user can publish a shift.
    Parameters:
        id - a shift id.
        userId - a user id.
    Returns:
        bool.
    """
    db = core.connect()
    theShift = db[id]
    return user.isAdmin(userId) or (userId == theShift['createdBy'])

def canUnpublish(id, userId):
    """
    Check where a user can unpublish a shift.
    Parameters:
        id - a shift id.
        userId - a user id.
    Returns:
        bool.
    """
    db = core.connect()
    theShift = db[id]
    return user.isAdmin(userId) or (userId == theShift['createdBy'])

def canComment(id, userId):
    """
    Check if the user can comment on a shift. Allowed if:
        1. Shift is public.
        2. If the shift was published to a stream that the user has permissions on.
    """
    db = core.connect()
    theShift = db[id]
    if not theShift["publishData"]["private"]:
      return True
    # ignore private streams
    shiftStreams = [astream for astream in theShift["publishData"]["streams"]
                    if not stream.isUserPrivateStream(astream)]
    writeable = permission.writeableStreams(userId)
    allowed = set(shiftStreams).intersection(writeable)
    return len(allowed) > 0

def isPublic(id):
    """
    Check where a shift is public.
    Parameters:
        id - a shift id.
    Returns:
        bool.
    """
    db = core.connect()
    theShift = db[id]
    publishData = theShift["publishData"]
    return (not publishData["draft"]) and (not publishData["private"])

def isPrivate(id):
    """
    Check whether a shift is private.
    Parameters:
        id - a shift id.
    Returns:
        bool.
    """
    db = core.connect()
    theShift = db[id]
    publishData = theShift["publishData"]
    return publishData["private"]

# ==============================================================================
# Publishing
# ==============================================================================

def publish(id, publishData):
    """
    Set draft status of a shift to false. Sync publishData field.
    If the shift is private only publish to the streams that
    the user has access. If the shift is publich publish it to
    any of the public non-user streams. Creates the comment stream
    if it doesn't already exist.
    Parameters:
        id - a shift id.
        publishData - a dictionary holding the publish options.
    """
    db = core.connect()
    theShift = db[id]
    theUser = db[theShift["createdBy"]]
    userId = theUser["_id"]
    allowed = []
    publishStreams = publishData.get("streams") or []
    if (publishData.get("private") == True) or (publishData.get("private") == None and isPrivate(id)):
        allowedStreams = permission.writeableStreams(userId)
        allowed = list(set(allowedStreams).intersection(set(publishStreams)))
        # add any private user streams this shift is directed to
        if publishData.get("users"):
            allowed.extend([user.privateStream(user.idForName(userName)) 
                            for userName in publishData["users"]
                            if user.read(userName)])
            del publishData["users"]
        # add streams this user can post to
        allowed.extend([astream for astream in publishStreams
                        if stream.canPost(astream, userId)])
    else:
        allowed.append(user.publicStream(userId))
    # TODO: commentStreams should use the permission of the streams the shift has been published to. -David 7/14/09
    if not commentStream(id):
        streamId = createCommentStream(id)
        user.addNotification(userId, streamId)
        
    # remove duplicates
    publishData["streams"] = list(set(allowed))
    newData = theShift["publishData"]
    newData.update(publishData)
    theShift["publishData"] = newData
    theShift["publishData"]["draft"] = False
    db[id] = theShift

def unpublish(id):
    """
    Set the draft status of a shift back to True"
    Parameters:
        id - a shift id.
    """
    db = core.connect()
    theShift = db[id]
    theShift["publishData"]["draft"] = True
    db[id] = theShift

# ==============================================================================
# Comments
# ==============================================================================

def commentStream(id):
    """
    Return the comment stream id for the specified shift.
    Parameters:
        id - a shift id.
    """
    stream = core.single(schema.commentStreams, id)
    if stream:
        return stream["_id"]
    else:
        return None

def createCommentStream(id):
    """
    Create a comment stream for a shift if it doesn't already exist.
    Parameters:
        id - a shift id.
    """
    db = core.connect()
    theShift = db[id]
    commentStream = stream.create({
            "meta": "comments",
            "objectRef": ref(id),
            "createdBy": theShift["createdBy"]
            })
    return commentStream["_id"]

# ==============================================================================
# Favoriting
# ==============================================================================

def favoriteId(id, userId):
    return "favorite:%s:%s" % (userId, id)

def isFavorited(id, userId):
    db = core.connect()
    favId = favoriteId(id, userId)
    return db.get(favId) != None

def favorite(id, userId):
    db = core.connect()
    if (not canRead(id, userId)) or isFavorited(id, userId):
        return
    fav = {
        "created": utils.utctime(),
        "createdBy": userId,
        "type": "favorite"
        }
    db[favoriteId(id, userId)] = fav
    return joinData(db[id], userId)

def unfavorite(id, userId):
    db = core.connect()
    if (not canRead(id, userId)) or (not isFavorited(id, userId)):
        return
    del db[favoriteId(id, userId)]
    return joinData(db[id], userId)

def favoriteCount(id):
    return core.single(schema.favoritesByShift, id) or 0

# ==============================================================================
# Utilities
# ==============================================================================

def joinData(data, userId=None):
    def join(shift):
        id = shift["_id"]
        if userId:
            shift["favorite"] = isFavorited(id, userId)
        shift["favoriteCount"] = favoriteCount(id)
        streamId = commentStream(id)
        if streamId:
            shift["commentCount"] = len(event.eventsForStream(streamId))
        creator = user.readById(shift["createdBy"])
        gravatar = creator.get("gravatar")
        if gravatar != None:
            shift["gravatar"] = gravatar
        return shift
    if type(data) == list:
        data = [join(item) for item in data]
    else:
        data = join(data)
    return data

@simple_decorator
def joindecorator(func):
    def afn(*args, **kwargs):
        return joinData(func(*args, **kwargs), userId=kwargs.get("userId"))
    return afn

@joindecorator
def byUser(id, userId=None):
    return core.query(schema.shiftByUser, id)

@joindecorator
def byUserName(userName, userId=None):
    """
    Return the list of shifts a user has created.
    Parameters:
        userName - a user name.
    Returns:
        A list of the user's shifts.
    """
    id = user.idForName(userName)
    return core.query(schema.shiftByUser, id)

@joindecorator
def byHref(href, userId=None):
    """
    Return the list of shifts at a particular url.
    Parameters:
        href - a url.
    Returns:
        A list of public shift's on the specified url.
    """
    shifts = core.query(schema.shiftByHref, href)
    return shifts

@joindecorator
def shifts(byHref, userId=None, byFollowing=False, byGroups=False, start=0, perPage=25):
    """
    Returns a list of shifts based on whether
        1. href
        3. By public streams specified user is following. 
        4. By groups streams specified user is following.
    Parameters:
        byHref - a url
        byDomain - a url string
        byFollowing - a user id
        byGroups - a user id
    Returns:
        A list of shifts that match the specifications.
    """
    db = core.connect()
    # NOTE: to prevent errors on a newly created DB - David 9/11/09
    if core.single(schema.statsCount, "shift") == None:
        return []
    lucene = core.lucene()
    # TODO: validate byHref - David
    queryString = "(href:\"%s\" AND draft:false AND private:false)" % byHref
    if userId:
        queryString = queryString + " OR createdBy:%s" % userId
        streams = ""
        if byFollowing:
            following = user.followStreams(userId)
            streams = streams + " ".join(following)
        if byGroups:
            groups = user.groupStreams(userId)
            streams = streams + " ".join(groups)
        # TODO: make sure streams cannot be manipulated from client - David
        queryString = queryString + ((" OR (draft:false%s)" % ((len(streams) > 0 and (" AND streams:%s" % streams)) or "")))
    rows = lucene.search("shifts", q=queryString, sort="\modified", skip=start, limit=perPage)
    shifts = [db[row["id"]] for row in rows]
    return shifts
