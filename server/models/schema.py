# ==============================================================================
# Views
# ==============================================================================

allPermissions = "_design/permissions/_view/all"
permissionByUser = "_design/permissions/_view/by_user"
permissionByStream = "_design/permissions/_view/by_stream"
permissionByUserAndStream = "_design/permissions/_view/by_user_and_stream"

allStreams = "_design/streams/_view/all"
streamByObjectRef = "_design/streams/_view/by_object_ref"
streamByUniqueName = "_design/streams/_view/by_unique_name"
streamByCreator = "_design/streams/_view/by_creator"
streamBySubscribers = "_design/streams/_view/subscribers"
commentStreams = "_design/streams/_view/comments"

allUsers = "_design/users/_view/all"
userByName = "_design/users/_view/by_name"
notify = "_design/users/_view/notify"

allEvents = "_design/events/_view/all"
eventByStream = "_design/events/_view/by_stream"
eventByUser= "_design/events/_view/by_user"

allShifts = "_design/shifts/_view/all"
shiftByHref = "_design/shifts/_view/by_href"
shiftByUser = "_design/shifts/_view/by_user"
shiftCountByDomain = "_design/shifts/_view/count_by_domain"

allFavorites = "_design/favorites/_view/all"
favoritesByShift = "_design/favorites/_view/by_shift"
favoritesByUser = "_design/favorites/_view/by_user"

allGroups = "_design/groups/_view/all"
groupByShortName = "_design/groups/_view/by_short_name"

commentsByUser = "_design/comments/_view/by_user"
countByShift = "_design/comments/_view/count_by_shift"

statsCount = "_design/stats/_view/count"


# ==============================================================================
# Schemas
# ==============================================================================

"""
Schema for user-

publicStream: stream of the user's shifts. Can be subscribed to by anyone.
privateStream: stream of shifts that have been directed towards this user.
messageStream: stream of events from various people.
"""
def user():
    return {
        "type": "user",
        "userName": None,
        "displayName": None,
        "email": None,
        "bio": None,
        "url": None,
        "gravatar": None,
        "password": None,
        "joined": None,
        "lastSeen": None,
        "publicStream": None,
        "privateStream": None,
        "messageStream": None,
        "notify": [],
        "streams": [],
        "preferences": {}
        }

"""
Schema for shift-

publishData:
  draft: The shift is not visible to anyone.
  publishTime: The time that the shift was published.
  private: The shift only visible to the specified streams.
  streams: Streams which the shift is visible on (user or group). Has no effect
    if the stream is not private.
"""
def shift():
    return {
        "type": "shift",
        "createdBy": None,
        "userName": None,
        "href": None,
        "domain": None,
        "space": {
            "name": None,
            "version": None,
            },
        "summary": None,
        "created": None,
        "modified": None,
        "broken": False,
        "commentStream": None,
        "publishData": {
            "draft": True,
            "publishTime": None,
            "private": True,
            "streams": []
            },
          "content": {}
        }

"""
Schema for stream-

  meta: free field for categorizing streams.
  private: Whether the stream is viewable by anyone or only people with the proper
    permissions.
  objectRef: the object this stream refers to. For example a shift.
"""
def stream():
    return {
        "type": "stream",
        "meta": None,
        "createdBy": None,
        "displayName": None,
        "uniqueName": None,
        "created": None,
        "modified": None,
        "private": True,
        "objectRef": None
        }

def event(): 
    return {
        "type": "event",
        "meta": None,
        "createdBy": None,
        "streamId": None,
        "objectRef": None,
        "uniqueName": None,
        "displayString": None,
        "created": None,
        "modified": None,
        "content": {}
        }

"""
Schema for permission-

  createdBy: the user that granted the permission.
  userId: the user who was given the permission.
  level: 0 - joinable  (can subscribe to the stream)
         1 - readable  (can read the stream)
         2 - writeable (can post to the stream)
         3 - adminable (can invite others to the stream)
         4 - owner     (can update properties of the stream 
                        as well as well delete the stream if 
                        there's no one else's content on it)
"""
def permission():
    return {
        "type": "permission",
        "created": None,
        "modified": None,
        "createdBy": None,
        "streamId": None,
        "userId": None,
        "level": 0
        }

def group():
    temp = stream()
    temp.update({
            "shortName": None,
            "description": None
            })
    return temp
