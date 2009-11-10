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
    # CRUD
    # ========================================
    
    @classmethod
    def create(cls, **userJson):
        server = core.server()
        db = core.connect()
        newUser = User(**userJson)
        newUser.store(db)
        # user's public shifts, will be replicated to shiftspace
        server.create("user_%s/public" % newUser.id)
        # all of the user's shifts as well as subscribed content
        server.create("user_%s/private" % newUser.id)
        # all of the user's messages
        server.create("user_%s/inbox" % newUser.id) 
        return newUser

    # ========================================
    # Instance methods
    # ========================================

    def __init__(self, **kwargs):
        super(SSDocument, self).__init__(**kwargs)

