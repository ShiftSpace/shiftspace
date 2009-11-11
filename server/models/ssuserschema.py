from couchdb.schema import View

from userschema import User

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core

class SSUser(User):
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
        server = core.server()
        db = core.connect()
        if userJson.get("passwordVerify"):
            del userJson["passwordVerify"]
        if userJson.get("email"):
            userJson["gravatar"] = "http://www.gravatar.com/avatar/%s?s=32" % utils.md5hash(userJson["email"])
        newUser = SSUser(**userJson)
        newUser.store(db)
        # user's public shifts, will be replicated to shiftspace
        server.create(SSUser.public(newUser.id))
        # all of the user's shifts as well as subscribed content
        server.create(SSUser.private(newUser.id))
        # all of the user's messages
        server.create(SSUser.inbox(newUser.id))
        return newUser

    @classmethod
    def read(cls, userName):
        db = core.connect()
        return list(SSUser.by_name(db, key=userName))[0]

    @classmethod
    def update(cls, userName, fields):
        db = core.connect()
        theUser = SSUser.read(userName)
        if fields.get("bio"):
            theUser.bio = fields.get("bio")
        if fields.get("url"):
            theUser.bio = fields.get("bio")
        if fields.get("displayName"):
            theUser.displayName = fields.get("displayName")
        theUser.store(db)
        return tehUser

    @classmethod
    def delete(cls, userName):
        server = core.server()
        theUser = SSUser.read(userName)
        # delete the user's db
        del server[SSUser.public(theUser.id)]
        del server[SSUser.private(theUser.id)]
        del server[SSUser.inbox(theUser.id)]
        # delete the user doc
        db = core.connect()
        del db[theUser.id]


