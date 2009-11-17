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
    #========================================

    @classmethod
    def private(cls, userId):
        return "user/%s/private" % userId

    @classmethod
    def public(cls, userId):
        return "user/%s/public" % userId

    @classmethod
    def inbox(cls, userId):
        return "user/%s/inbox" % userId

    @classmethod
    def feed(cls, userId):
        return "user/%s/feed" % userId

    @classmethod
    def messages(cls, userId):
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
        server.create(SSUser.public(newUser.id))
        # all of the user's shifts as well as subscribed content
        server.create(SSUser.private(newUser.id))
        # all of the user's messages
        server.create(SSUser.messages(newUser.id))
        # the user's feed, merged from user/public and user/feed
        server.create(SSUser.feed(newUser.id))
        # the user's inbox of direct shifts
        server.create(SSUser.inbox(newUser.id))

        # sync views
        Shift.by_user_and_created.sync(server[SSUser.feed(newUser.id)])
        Shift.by_href_and_created.sync(server[SSUser.feed(newUser.id)])
        Shift.by_domain_and_created.sync(server[SSUser.feed(newUser.id)])
        Shift.by_group_and_created.sync(server[SSUser.feed(newUser.id)])
        Shift.by_follow_and_created.sync(server[SSUser.feed(newUser.id)])
        Message.by_created.sync(server[SSUser.messages(newUser.id)])

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
            del server[SSUser.public(self.id)]
            del server[SSUser.private(self.id)]
            del server[SSUser.inbox(self.id)]
            del server[SSUser.feed(self.id)]
            del server[SSUser.messages(self.id)]
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

    def isAdmin(self):
        if not self.id:
            return False
        db = core.connect()
        admins = db["admins"]
        return self.id in admins["ids"]

    def canReadFull(self, other):
        return (self.id == other.id) or self.isAdmin()

    def canModify(self, other):
        return (self.id == other.id) or self.isAdmin()

    # ========================================
    # Data
    # ========================================

    def messages(self, start=None, end=None, limit=25):
        pass

    def shifts(self, start=None, end=None, limit=25):
        pass

    def favorites(self, start=None, end=None, limit=25):
        pass

    def comments(self, start=None, end=None, limit=25):
        pass

    # ========================================
    # Follow
    # ========================================

    def followers(self):
        return core.values(SSUser.all_followers(core.connect(), key=self.id))

    def follow(self, other):
        db = core.connect()
        if not (other.id in self.following):
            self.following.append(otherId)
        self.store(db)

    def unfollow(cls, other):
        db = core.connect()
        self.following.remove(other.id)
        self.store(db)


