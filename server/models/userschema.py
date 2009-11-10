from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from ssdocschema import SSDocument

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core

# ==============================================================================
# Uesr Model
# ==============================================================================

class User(SSDocument):
    """
    The User document.
    """

    # ========================================
    # Fields
    # ========================================

    type = TextField(default="user")
    userName = TextField()
    displayName = TextField()
    fullName = DictField(Schema.build(
            first = TextField(),
            last = TextField()
            ))
    email = TextField()
    bio = TextField()
    url = TextField()
    gravatar = TextField()
    password = TextField()
    joined = DateTimeField(default=datetime.now())
    lastSeen = DateTimeField(default=datetime.now())
    streams = ListField(TextField())
    preferences = DictField()

    # ========================================
    # Views
    # ========================================

    by_name = View(
        "users",
        "function(doc) {              \
           if(doc.type == 'user') {   \
             emit(doc.userName, doc); \
           }                          \
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
        newUser = User(**userJson)
        newUser.store(db)
        # user's public shifts, will be replicated to shiftspace
        server.create(User.public(newUser.id))
        # all of the user's shifts as well as subscribed content
        server.create(User.private(newUser.id))
        # all of the user's messages
        server.create(User.inbox(newUser.id))
        return newUser

    @classmethod
    def read(cls, userName):
        db = core.connect()
        return list(User.by_name(db, key=userName))[0]

    @classmethod
    def update(cls, userName, fields):
        db = core.connect()
        theUser = User.read(userName)
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
        theUser = User.read(userName)
        del server[User.public(theUser.id)]
        del server[User.private(theUser.id)]
        del server[User.inbox(theUser.id)]

    # ========================================
    # Instance methods
    # ========================================

    def __init__(self, **kwargs):
        super(SSDocument, self).__init__(**kwargs)

