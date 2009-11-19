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

    # ========================================
    # Fields
    # ========================================

    type = TextField(default="comment")
    shiftId = TextField()
    text = TextField()

    # ========================================
    # Views
    # ========================================

    by_created = View(
        "comments",
        "function(doc) {               \
           if(doc.type == 'comment') { \
             emit(doc.created, doc);   \
           }                           \
         }"
        )

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
        return "comment/%s" % shiftId

    # ========================================
    # Class Methods
    # ========================================

    @classmethod
    def create(cls, userId, shiftId, text, subscribe=False):
        from server.models.ssuserschema import SSUser
        from server.models.shiftschema import Shift
        from server.models.messageschema import Message
        # first try the public feed
        theShift = Shift.load(core.connect("shiftspace/shared"), shiftId)
        shiftAuthor = SSUser.load(core.connect(), theShift.createdBy)
        theUser = SSUser.load(core.connect(), userId)
        server = core.server()
        # create the comment db if necessary
        dbexists = True
        if not theShift.hasThread():
            server.create(Comment.db(shiftId))
            dbexists = False
        # get the db
        db = core.connect(Comment.db(shiftId))
        # if db just created, sync the views and subscribe shift author
        if not dbexists:
            Comment.all_subscribed.sync(db)
            shiftAuthor.subscribe(theShift)
        # subscribe the user making the comment
        if not theUser.isSubscribed(theShift) and subscribe:
            theUser.subscribe(theShift)
        # create comment and comment stub
        json = {
            "createdBy": userId,
            "shiftId": shiftId,
            "text": text,
            }
        stub = {
            "type":"commentstub",
            "shiftId": shiftId,
            }
        newComment = Comment(**json)
        newComment.store(db)
        db = core.connect("shiftspace/shared")
        db["commentstub:%s" % newComment.id] = stub
        subscribers = theShift.subscribers()
        # make a private copy
        # TODO: need to think about the implications here - David
        newComment.copyTo(SSUser.privateDb(theUser))
        # send each subscriber a message
        if len(subscribers) > 0:
            # TODO: needs to be optimized with a fast join - David
            for subscriber in subscribers:
                if subscriber != userId:
                    astr = ((subscriber == theShift.createdBy) and "your") or ("%s's" % shiftAuthor.userName)
                    json = {
                        "fromId": "shiftspace",
                        "toId": subscriber,
                        "text": "%s just commented on %s shift!" % (theUser.userName, astr),
                        "meta": "comment"
                        }
                    Message.create(**json)

        return newComment


    @classmethod
    def read(cls, shiftId, id):
        """
        Read the contents of a single comment.
        """
        db = core.connect(Comment.db(shiftId))
        return Commment.load(db, id)

    # ========================================
    # Instance Methods
    # ========================================

    def delete(self):
        """
        Delete a single comment.
        """
        db = core.connect(Comment.db(self.shiftId))
        del db[self.id]
        db = core.connect("shiftspace/shared")
        del db["commentstub:%s" % self.id]



