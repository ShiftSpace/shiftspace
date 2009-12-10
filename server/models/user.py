from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from ssdoc import SSDocument

from server.utils.decorators import *
import server.utils.utils as utils
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
    gravatarLarge = TextField()
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

    all_by_joined = View(
        "users",
        "function(doc) {            \
           if(doc.type == 'user') { \
             emit(doc.created, doc);    \
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
    # Class Methods
    # ========================================

    @classmethod
    def users(cls, start=None, end=None, limit=25):
        results = User.all_by_joined(core.connect(), limit=25)
        if start and not end:
            return core.objects(results[start:])
        if not start and end:
            return core.objects(results[:end])
        if start and end:
            return core.objects(results[start:end])
        return core.objects(results[start:end])

    # ========================================
    # Validation
    # ========================================

    @classmethod
    def uniqueName(cls, name):
        return core.value(User.by_name(core.connect(), key=name)) == None


