from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core

from ssdocschema import SSDocument

# ==============================================================================
# Comment Model
# ==============================================================================

class Comment(SSDocument):

    type = TextField(default="comment")
    shiftId = TextField()
    text = TextField()
    replyTo = TextField() # if we decide to implement threading

    # ========================================
    # Views
    # ========================================

    all_subscribed = View(
        "comments",
        "function(doc) {                    \
           if(doc.type == 'subscription') { \
             emit(doc.shiftId, doc.userId); \
           }                                \
         }"
        )

    count_by_shift = View(
        "comments",
        "function(doc) {                    \
           if(doc.type == 'comment-stub') { \
             emit(doc.shiftId, 1);          \
           }                                \
         }",
        "function(keys, values, rereduce) { \
           return sum(values);              \
         }"                                 
        )

    # ========================================
    # Database
    # ========================================
    
    @classmethod
    def db(cls, shiftId):
        return "comment_%s" % shiftId

    # ========================================
    # CRUD
    # ========================================

    @classmethod
    def create(cls, userId, shiftId, text, replyTo=None):
        """
        Creates a comment on a shift. If the comment database
        for the shift does not exist it will be created. Will
        also generate a stub for each comment in the master
        database so accurate comment counts can be generated.
        In addition a comment will trigger a message to all
        subscribed users, this will be sent to user_x/messages.
        """
        server = core.server()
        if not Comment.hasThread(shiftId):
            server.create(Comment.db(shiftId))
        db = core.connect(Comment.db(shiftId))
        json = {
            "createdBy": userId,
            "shiftId": shiftId,
            "text": text,
            "replyTo": replyTo,
            }
        stub = {
            "type":"comment-stub",
            "shiftId": shiftId,
            }
        newComment = Comment(**json)
        db = core.connect()
        db.create(stub) 

        subscribers = Comment.subscribers(shiftId)
        # send each subscriber a message

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

    @classmethod
    def hasThread(cls, shiftId):
        return core.server().get(Comment.db(shiftId))

    @classmethod
    def subscribers(cls, shiftId):
        db = core.connect(Comment.db(shiftId))
        return core.values(Comment.all_subscribed(db))

    # ========================================
    # Subscribe / Unsubscribe
    # ========================================

    @classmethod
    def isSubscribed(cls, userId, shiftId):
        db = core.connect(Comment.db(shiftId))
        return db.get("user:%s" % userId) != None

    @classmethod
    def subscribe(cls, userId, shiftId):
        db = core.connect(Comment.db(shiftId))
        if not Comment.isSubscribed(userId, shiftId):
            db.create(
                "_id": "user:%s" % userId,
                "type": "subscription",
                "userId": userId,
                )

    @classmethod
    def unsubscribe(cls, shiftId):
        db = core.connect(Comment.db(shiftId))
        if Comment.isSubscribed(userId, shiftId):
            del db["user:%s" % userId]
