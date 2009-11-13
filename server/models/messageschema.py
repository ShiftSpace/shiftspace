from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core

from ssdocschema import SSDocument

# ==============================================================================
# Message Model
# ==============================================================================

class Message(SSDocument):

    type = TextField(default="message")
    text = TextField()

    # ========================================
    # Views
    # ========================================

    by_created = View(
        "messages",
        "function(doc) {               \
           if(doc.type == 'message') { \
             emit(doc.created, doc);   \
           }                           \
         }"
        )

    # ========================================
    # CRUD
    # ========================================

    @classmethod
    def create(cls, fromUserId, toUserId, text):
        """
        Create a message from a user to another the. The message
        can come from "shiftspace" which represents a system message.
        System messages are store in the messages database. Local
        inboxes are merges of messages and user_x/messages.
        """
        pass

    @classmethod
    def read(cls, id):
        pass

    @classmethod
    def update(cls, id):
        pass

    @classmethod
    def delete(cls, id):
        pass

    # ========================================
    # Utilities
    # ========================================
