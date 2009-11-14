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
        """
        Returns the string for a comment database.
        Parameters:
           shiftId - a shift id.
        """
        return "comment_%s" % shiftId

    # ========================================
    # CRUD
    # ========================================

    @classmethod
    def create(cls, userId, shiftId, text, subscribe=False):
        """
        Creates a comment on a shift. If the comment database
        for the shift does not exist it will be created. Will
        also generate a stub for each comment in the master
        database so accurate comment counts can be generated.
        In addition a comment will trigger a message to all
        subscribed users, this will be sent to user_x/messages.
        Parameters:
            userId - a user id.
            shiftId - a shift id.
            text - the textual content of the comment.
        """
        from server.models.ssuserschema import SSUser
        from server.models.shiftschema import Shift
        from server.models.messageschema import Message

        # first try the public feed
        theShift = Shift.load(core.connect(), shiftId)

        # then try the user's feed
        if not theShift:
            theShift = Shift.load(core.connect(SSUser.feed(userId)), shiftId)

        shiftAuthor = SSUser.load(core.connect(), theShift.createdBy)

        server = core.server()

        # create the comment db if necessary        
        dbexists = True
        if not Comment.hasThread(shiftId):
            server.create(Comment.db(shiftId))
            dbexists = False

        # get the db
        db = core.connect(Comment.db(shiftId))

        # if db just created, sync the views and subscribe shift author
        if not dbexists:
            Comment.all_subscribed.sync(db)
            Comment.subscribe(theShift.createdBy, shiftId)

        # subscribe the user making the comment
        if not Comment.isSubscribed(userId, shiftId) and subscribe:
            Comment.subscribe(userId, shiftId)

        # create comment and comment stub
        json = {
            "createdBy": userId,
            "shiftId": shiftId,
            "text": text,
            }

        stub = {
            "type":"comment-stub",
            "shiftId": shiftId,
            }

        newComment = Comment(**json)
        newComment.store(db)
        db = core.connect()
        db.create(stub) 

        subscribers = Comment.subscribers(shiftId)

        # send each subscriber a message
        if len(subscribers) > 0:
            # TODO: needs to be optimized with a fast join - David
            theUser = SSUser.load(db, userId)
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

    @classmethod
    def delete(cls, shiftId, id):
        """
        Delete a single comment.
        """
        db = core.connect(Comment.db(shiftId))
        del db[id]

    @classmethod
    def deleteThread(cls, shiftId):
        """
        Deletes the entire thread.
        """
        server = core.server()
        # TODO - use bulk API to delete all comment stubs - David
        del server[Comment.db(shiftId)]

    # ========================================
    # Instance Methods
    # ========================================

    def deleteInstance(self, shiftId, id):
        Comment.delete(shiftId, id)

    # ========================================
    # Validation
    # ========================================

    @classmethod
    def canComment(cls, userId, shiftId):
        """
        Returns whether the user can comment on the shift.
        Take careful note that the second parameter is NOT
        a shift id. Rather it is a Shift Document. This is
        because we cannot know where the shift might be living.
        We assume that the user was able to somehow access
        the shift.
        """
        from server.models.permschema import Permission
        theShift = Shift.load(core.connect(SSUser.feed(userId)), shiftId)
        ids = theShift.publishIds()
        if userId in ids:
            return True
        readable = Permission.readable(userId)
        allowed = set(readable).intersection(set(ids))
        return len(allowed) > 0

    # ========================================
    # Utilities
    # ========================================
    
    @classmethod
    def count(cls, shiftId):
        db = core.connect()
        return core.value(Comment.count_by_shift(db, key=shiftId))

    @classmethod
    def forShift(cls, shiftId, start=None, end=None, limit=25):
        db = core.connect(Comment.db(shiftId))
        return core.objects(Comment.by_created(db, limit=limit))

    @classmethod
    def hasThread(cls, shiftId):
        try:
            core.server()[Comment.db(shiftId)]
            return True
        except Exception:
            return False

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
            db.create({
                "_id": "user:%s" % userId,
                "shiftId": shiftId,
                "type": "subscription",
                "userId": userId,
                })

    @classmethod
    def unsubscribe(cls, userId, shiftId):
        db = core.connect(Comment.db(shiftId))
        if Comment.isSubscribed(userId, shiftId):
            del db["user:%s" % userId]
