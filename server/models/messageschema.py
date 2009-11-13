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
    from = TextField()
    to = TextField()
    text = TextField()
    read = BooleanField(default=False)

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
    def create(cls, from, to, text):
        """
        Create a message from a user to another. The message
        can come from "shiftspace" which represents a system message.
        System messages are store in the messages database. Local
        inboxes are merges of messages and user_x/messages.
        """
        db = core.connect(SSUser.messages(to))
        json = {
            "from": from,
            "to": to,
            "text": text,
            }
        newMessage = Message(**json)

    @classmethod
    def markRead(cls, userId, id, value=True):
        """
        Mark a message as read.
        """
        db = core.connect(SSUser.messages(userId))
        theMessage = Message.load(db, id)
        theMessage.read = value
        theMessage.store(db)
        return theMessage

    @classmethod
    def delete(cls, userId, id):
        """
        Delete a message.
        """
        db = core.connect(SSUser.messages(userId))
        del db[id]

    # ========================================
    # Utilities
    # ========================================

    @classmethod
    def forUser(cls, userId, start=None, end=None, limit=25):
        db = core.connect(SSUser.messages(userId))
        return core.objects(Message.by_created(db, limit=limit))
