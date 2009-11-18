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

    # ========================================
    # Fields
    # ========================================

    type = TextField(default="message")
    fromId = TextField()
    toId = TextField()
    text = TextField()
    read = BooleanField(default=False)
    meta = TextField()

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
    # Class Methods
    # ========================================

    @classmethod
    def create(cls, fromId, toId, text, meta="generic"):
        """
        Create a message from a user to another. The message
        can come from "shiftspace" which represents a system message.
        System messages are store in the messages database. Local
        inboxes are merges of messages and user_x/messages.
        """
        from server.models.ssuserschema import SSUser

        db = core.connect(SSUser.messagesDb(toId))
        json = {
            "fromId": fromId,
            "toId": toId,
            "text": text,
            "meta": meta,
            }
        newMessage = Message(**json)
        newMessage.store(db)
        return newMessage

    # ========================================
    # Instance Methods
    # ========================================

    def markRead(self, value=True):
        """
        Mark a message as read.
        """
        db = core.connect(SSUser.messagesDb(self.toId))
        self.read = value
        self.store(db)
        return self


    def delete(self, id):
        """
        Delete a message.
        """
        db = core.connect(SSUser.messagesDb(self.toId))
        del db[id]



