from couchdb.schema import *
from couchdb.schema import View

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core

from server.models.userschema import User

# ==============================================================================
# SSUser Model
# ==============================================================================

class SSUser(User):

    # ========================================
    # Fields
    # ========================================

    following = ListField(TextField())

    # ========================================
    # Views
    # ========================================

    all_followers = View(
        "users",
        "function(doc) {                                             \
           if(doc.type == 'user') {                                  \
              var following = doc.following;                         \
              for(var i = 0, len = following.length; i < len; i++) { \
                emit(following[i], doc._id);                         \
              }                                                      \
           }                                                         \
        }")

    # ========================================
    # Class Methods
    # ========================================

    @classmethod
    def privateDb(cls, userId):
        return "user/%s/private" % userId

    @classmethod
    def publicDb(cls, userId):
        return "user/%s/public" % userId

    @classmethod
    def inboxDb(cls, userId):
        return "user/%s/inbox" % userId

    @classmethod
    def feedDb(cls, userId):
        return "user/%s/feed" % userId

    @classmethod
    def messagesDb(cls, userId):
        return "user/%s/messages" % userId

    @classmethod
    def create(cls, userJson):
        """
        Create a new user document. Also creates the three
        databases (user/public, user/private, user/inbox)
        to allow for peer-to-peer distribution.
        Parameters:
            userJson - a dictionary of fields and their values.
        """
        from server.models.shiftschema import Shift
        from server.models.messageschema import Message

        server = core.server()
        db = core.connect()
        if userJson.get("passwordVerify"):
            del userJson["passwordVerify"]
        if userJson.get("email"):
            userJson["gravatar"] = "http://www.gravatar.com/avatar/%s?s=32" % utils.md5hash(userJson["email"])
        newUser = SSUser(**userJson)
        newUser.store(db)

        # user's public shifts, will be replicated to shiftspace and user/feed
        server.create(SSUser.publicDb(newUser.id))
        # all of the user's shifts as well as subscribed content
        server.create(SSUser.privateDb(newUser.id))
        # all of the user's messages
        server.create(SSUser.messagesDb(newUser.id))
        # the user's feed, merged from user/public and user/feed
        server.create(SSUser.feedDb(newUser.id))
        # the user's inbox of direct shifts
        server.create(SSUser.inboxDb(newUser.id))

        # sync views
        Shift.by_user_and_created.sync(server[SSUser.feedDb(newUser.id)])
        Shift.by_href_and_created.sync(server[SSUser.feedDb(newUser.id)])
        Shift.by_domain_and_created.sync(server[SSUser.feedDb(newUser.id)])
        Shift.by_group_and_created.sync(server[SSUser.feedDb(newUser.id)])
        Shift.by_follow_and_created.sync(server[SSUser.feedDb(newUser.id)])
        Message.by_created.sync(server[SSUser.messagesDb(newUser.id)])

        return newUser

    @classmethod
    def read(cls, id):
        return cls.load(core.connect(), id)

    @classmethod
    def readByName(cls, userName):
        return core.object(SSUser.by_name(core.connect(), key=userName))

    # ========================================
    # Instance Methods
    # ========================================

    def update(self, fields):
        db = core.connect()
        if fields.get("bio"):
            self.bio = fields.get("bio")
        if fields.get("url"):
            self.bio = fields.get("bio")
        if fields.get("displayName"):
            self.displayName = fields.get("displayName")
        self.store(db)
        return self


    def updateLastSeen(self):
        from datetime import datetime
        self.lastSeen = datetime.now()
        self.store(core.connect())
        return self


    def delete(self):
        if self.id == "shiftspace":
            return
        server = core.server()
        # delete the user's dbs (won't work with old style users)
        try:
            del server[SSUser.publicDb(self.id)]
            del server[SSUser.privateDb(self.id)]
            del server[SSUser.inboxDb(self.id)]
            del server[SSUser.feedDb(self.id)]
            del server[SSUser.messagesDb(self.id)]
        except Exception:
            pass
        # delete the user doc
        db = core.connect()
        del db[self.id]


    def toDict(self, full=False):
        userDict = super(SSUser, self).toDict()
        if not full:
            del userDict["password"]
            del userDict["email"]
            del userDict["fullName"]
            del userDict["streams"]
            del userDict["preferences"]
        return userDict

    # ========================================
    # Validation
    # ========================================

    def canReadFull(self, other):
        return (self.id == other.id) or self.isAdmin()


    def canModify(self, other):
        from server.models.shiftschema import Shift
        if isinstance(other, SSUser): 
            return (self.id == other.id) or self.isAdmin()
        elif isinstance(other, Shift):
            return other.createdBy == self.id or self.isAdmin()


    def canComment(self, theShift):
        if self.isAdmin():
            return True
        if not theShift.isPublic():
            return False
        shiftDbs = [db for db in theShift.publishData.dbs if not SSUser.isUserPrivate(db)]
        writeable = self.writeable()
        allowed = set(shiftDbs).intersection(writeable)
        return len(allowed) > 0


    def isAdmin(self):
        if not self.id:
            return False
        db = core.connect()
        admins = db["admins"]
        return self.id in admins["ids"]


    def isOwnerOf(self, aGroup):
        return self.id == aGroup.createdBy


    def isAdminOf(self, aGroup):
        from server.models.permschema import Permission
        thePermission = Permission.readByUserAndGroup(self.id, aGroup.id)
        return thePermission and thePermission.level >= 3


    def isMemberOf(self, aGroup):
        from server.models.permschema import Permission
        thePermission = Permission.readByUserAndGroup(self.id, aGroup.id)
        return thePermission and Permission.level > 0

    # ========================================
    # DBs
    # ========================================

    def joinable(self):
        from server.models.permschema import Permission
        return Permission.joinable(self.id)


    def readable(self):
        from server.models.permschema import Permission
        return Permission.readable(self.id)


    def writeable(self):
        from server.models.permschema import Permission
        return Permission.writeable(self.id)


    def adminable(self):
        from server.models.permschema import Permission
        return Permission.adminable(self.id)

    # ========================================
    # Data
    # ========================================

    def isFavorite(self, aShift):
        db = core.connect("shiftspace/shared")
        return db.get(Favorite.makeId(self.id, aShift.id))


    def messages(self, start=None, end=None, limit=25):
        from server.models.messageschema import Message
        return core.objects(Message.by_created(core.connect(SSUser.messagesDb(self.id)), limit=25))


    def shifts(self, start=None, end=None, limit=25):
        pass


    def feed(self, start=None, end=None, limit=25):
        pass


    def favorites(self, start=None, end=None, limit=25):
        from server.models.favschema import Favorite
        if not start:
            start = [self.id]
        if not end:
            end = [self.id, {}]
        results = Favorite.by_user_and_created(core.connect("shiftspace/shared"), limit=limit)
        return core.objects(results[start:end])


    def comments(self, start=None, end=None, limit=25):
        pass

    # ========================================
    # Follow
    # ========================================

    def followers(self, start=None, end=None, limit=25):
        return core.values(SSUser.all_followers(core.connect(), key=self.id))


    def follow(self, other):
        db = core.connect()
        if not (other.id in self.following):
            self.following.append(other.id)
        self.store(db)
        return self


    def unfollow(self, other):
        db = core.connect()
        self.following.remove(other.id)
        self.store(db)
        return self

    # ========================================
    # Comment Subscription
    # ========================================

    def isSubscribed(self, aShift):
        from server.models.commentschema import Comment
        db = core.connect(Comment.db(aShift.id))
        return db.get("user:%s" % self.id) != None


    def subscribe(self, aShift):
        from server.models.commentschema import Comment
        db = core.connect(Comment.db(aShift.id))
        if not self.isSubscribed(aShift):
            db.create({
                "_id": "user:%s" % self.id,
                "shiftId": aShift.id,
                "type": "subscription",
                "userId": self.id,
                })


    def unsubscribe(self, aShift):
        from server.models.commentschema import Comment
        db = core.connect(Comment.db(aShift.id))
        if self.isSubscribed(aShift):
            del db["user:%s" % self.id]



