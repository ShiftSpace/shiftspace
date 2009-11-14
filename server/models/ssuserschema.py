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
    # Database
    #========================================

    @classmethod
    def private(cls, userId):
        return "user_%s/private" % userId

    @classmethod
    def public(cls, userId):
        return "user_%s/public" % userId

    @classmethod
    def inbox(cls, userId):
        return "user_%s/inbox" % userId

    @classmethod
    def feed(cls, userId):
        return "user_%s/feed" % userId

    @classmethod
    def messages(cls, userId):
        return "user_%s/messages" % userId

    # ========================================
    # CRUD
    # ========================================
    
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
        Shift.by_href_and_created.sync(server[SSUser.feed(newUser.id)])
        Shift.by_domain_and_created.sync(server[SSUser.feed(newUser.id)])
        Shift.by_group_and_created.sync(server[SSUser.feed(newUser.id)])
        Shift.by_follow_and_created.sync(server[SSUser.feed(newUser.id)])
        Message.by_created.sync(server[SSUser.messages(newUser.id)])

        # put the lucene full text search into the user's feed
        # FIXME: will need to change this later - David
        db = core.connect(SSUser.feed(newUser.id))
        db["_design/lucene"] = core._lucene_design

        return newUser

    @classmethod
    def read(cls, id):
        return cls.load(core.connect(), id)

    @classmethod
    def readByName(cls, userName):
        return core.object(SSUser.by_name(core.connect(), key=userName))

    @classmethod
    def update(cls, id, fields):
        db = core.connect()
        theUser = SSUser.read(id)
        if fields.get("bio"):
            theUser.bio = fields.get("bio")
        if fields.get("url"):
            theUser.bio = fields.get("bio")
        if fields.get("displayName"):
            theUser.displayName = fields.get("displayName")
        theUser.store(db)
        return theUser

    @classmethod
    def delete(cls, id):
        server = core.server()
        theUser = SSUser.read(id)
        # delete the user's dbs
        del server[SSUser.public(id)]
        del server[SSUser.private(id)]
        del server[SSUser.inbox(id)]
        del server[SSUser.feed(id)]
        del server[SSUser.messages(id)]
        # delete the user doc
        db = core.connect()
        del db[id]

    # ========================================
    # Validation
    # ========================================

    @classmethod
    def isAdmin(cls, id):
        if not id:
            return False
        db = core.connect()
        admins = db["admins"]
        return id in admins["ids"]

    # ========================================
    # Follow
    # ========================================

    @classmethod
    def followers(cls, id):
        return core.values(SSUser.all_followers(core.connect(), key=id))

    @classmethod
    def follow(cls, id, otherId):
        db = core.connect()
        theUser = SSUser.load(db, id)
        if not (otherId in theUser.following):
            theUser.following.append(otherId)
        theUser.store(db)

    @classmethod
    def unfollow(cls, id, otherId):
        db = core.connect()
        theUser = SSUser.load(db, id)
        theUser.following.remove(otherId)
        theUser.store(db)


