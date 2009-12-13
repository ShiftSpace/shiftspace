from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from server.utils.decorators import *
import server.utils.utils as utils
import core

from ssdoc import SSDocument

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
    title = TextField()
    text = TextField()
    read = BooleanField(default=False)
    meta = TextField()
    content = DictField()

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
    def joinData(cls, messages):
        single = False
        if type(messages) != list:
            single = True
            messages = [messages]
        ids = [message['_id'] for message in messages]

        userIds = [message["fromId"] for message in messages]
        users = core.fetch(keys=userIds)

        for i in range(len(messages)):
            if (userIds[i]):
                if (userIds[i] == 'shiftspace'):
                    messages[i]["gravatar"] = "images/default.png"
                    messages[i]["userName"] = 'ShiftSpace'
                else:
                    messages[i]["gravatar"] = (users[i]["gravatar"] or "images/default.png")
                    messages[i]["userName"] = users[i]["userName"]
            messages[i]["modifiedStr"] = utils.pretty_date(utils.futcstr(messages[i]["modified"]))

        if single:
            return messages[0]
        else:
            return messages

    @classmethod
    def create(cls, fromId, toId, title, text, meta="generic", content=None):
        """
        Create a message from a user to another. The message
        can come from "shiftspace" which represents a system message.
        System messages are store in the messages database. Local
        inboxes are merges of messages and user_x/messages.
        """
        from server.models.ssuser import SSUser

        db = core.connect(SSUser.messagesDb(toId))
        json = {
            "fromId": fromId,
            "toId": toId,
            "title": text,
            "text": text,
            "meta": meta,
            "content": content or {}
            }
        newMessage = Message(**utils.clean(json))
        newMessage.store(db)
        # replicate the message to shiftspace/shared
        # so that we can get user messages and system
        # messages
        return newMessage

    @classmethod
    def read(cls, id, userId=None):
        pass

    # ========================================
    # Instance Methods
    # ========================================

    def markRead(self, value=True):
        """
        Mark a message as read.
        """
        db = core.connect(SSUser.messagesDb(self.toId))
        # TODO: all messages are unread, if a message is read we create document signifying that
        self.read = value
        self.store(db)
        return self


    def isRead(self):
        pass


    def delete(self, id):
        """
        Delete a message.
        """
        db = core.connect(SSUser.messagesDb(self.toId))
        del db[id]
