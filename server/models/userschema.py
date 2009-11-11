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
