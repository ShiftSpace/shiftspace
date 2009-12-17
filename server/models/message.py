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

    count_by_user = View(
        "messages",
        "function(doc) {               \
           if(doc.type == 'message') { \
             emit(doc.toId, 1);        \
           }                           \
         }",
        "function(keys, values, rereduce) { \
           return sum(values);              \
         }"
        )

    system_count = View(
        "messages",
        "function(doc) {               \
           if(doc.type == 'message' && \
              doc.fromId == 'shiftspace' && \
              doc.meta == 'system') {  \
             emit(doc.fromId, 1);      \
           }                           \
         }",
        "function(keys, values, rereduce) { \
           return sum(values);              \
         }"
        )

    read_count_by_user = View(
        "messages",
        "function(doc) {                    \
           if(doc.type == 'message-read') { \
             emit(doc.toId, 1);             \
           }                                \
         }",
        "function(keys, values, rereduce) { \
           return sum(values);              \
         }"
        )

    # ========================================
    # Class Methods
    # ========================================
    
    @classmethod
    def joinData(cls, messages, userId=None):
        single = False
        if type(messages) != list:
            single = True
            messages = [messages]

        ids = [message["_id"] for message in messages]

        userIds = [message["fromId"] for message in messages]
        users = core.fetch(keys=userIds)

        if userId:
            readStatuses = core.fetch(db=core.connect("shiftspace/shared"),
                                      keys=[Message.makeReadId(id, userId) for id in ids])

        for i in range(len(messages)):
            if (userIds[i]):
                if (userIds[i] == 'shiftspace'):
                    messages[i]["gravatar"] = "images/default.png"
                    messages[i]["userName"] = 'ShiftSpace'
                else:
                    messages[i]["gravatar"] = (users[i]["gravatar"] or "images/default.png")
                    messages[i]["userName"] = users[i]["userName"]
            messages[i]["modifiedStr"] = utils.pretty_date(utils.futcstr(messages[i]["modified"]))
            if userId:
                messages[i]["read"] = (readStatuses[i] != None)

        if single:
            return messages[0]
        else:
            return messages

    @classmethod
    def create(cls, fromId, toId, title, text, meta="generic", content=None):
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
        core.replicate(SSUser.messagesDb(toId), "shiftspace/shared")
        return newMessage

    @classmethod
    def read(cls, id, userId=None):
        db = core.connect("shiftspace/shared")
        theMessage = Message.load(db, id)
        if theMessage == None and userId:
            db = core.connect(SSUser.messagesDb(userId))
            theMessage = Message.load(db, id)
        return Message.joinData(theMessage, userId)

    @classmethod
    def makeReadId(cls, msgId, userId):
        return "message:%s:%s" % (userId, msgId)
    
    # ========================================
    # Instance Methods
    # ========================================

    def markRead(self, value=True):
        from server.models.ssuser import SSUser
        db = core.connect(SSUser.messagesDb(self.toId))
        if value:
            if not self.isRead():
                db[Message.makeReadId(self.id, self.toId)] = {
                    "type": "message-read",
                    "msgId": self.id,
                    "toId": self.toId,
                    }
        else:
            del db[Message.makeReadId(self.id, self.toId)]
        core.replicate(SSUser.messagesDb(self.toId), "shiftspace/shared")
        return self


    def isRead(self):
        db = core.connect("shiftspace/shared")
        return db.get(Message.makeReadId(self.id, self.toId)) != None


    def delete(self, id):
        db = core.connect(SSUser.messagesDb(self.toId))
        del db[id]
