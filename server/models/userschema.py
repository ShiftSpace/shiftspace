from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from ssdocschema import SSDocument

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core

# ==============================================================================
# User Model
# ==============================================================================

class User(SSDocument):
    """
    The User document.
    """

    # ========================================
    # Fields
    # ========================================

    type = TextField(default="user")
    peer = BooleanField(default=False)
    userName = TextField()
    displayName = TextField()
    fullName = DictField(Schema.build(
            first = TextField(),
            last = TextField()
            ))
    lastSeen = DateTimeField(default=datetime.now())
    email = TextField()
    bio = TextField()
    url = TextField()
    gravatar = TextField()
    password = TextField()
    streams = ListField(TextField())
    preferences = DictField()

    # ========================================
    # Views
    # ========================================

    all = View(
        "users",
        "function(doc) {            \
           if(doc.type == 'user') { \
             emit(doc._id, doc);    \
           }                        \
         }")

    by_name = View(
        "users",
        "function(doc) {              \
           if(doc.type == 'user') {   \
             emit(doc.userName, doc); \
           }                          \
         }")

    # ========================================
    # Validation
    # ========================================

    @classmethod
    def uniqueName(cls, name):
        return core.value(SSUser.by_name(core.connect(), key=name)) == None


