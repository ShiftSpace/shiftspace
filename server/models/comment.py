from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from server.utils.decorators import *
import server.utils.utils as utils
import core

from ssdoc import SSDocument

# ==============================================================================
# Utilities
# ==============================================================================

@simple_decorator
def comment_join(func):
    def afn(*args, **kwargs):
        return Comment.joinData(func(*args, **kwargs))
    return afn

# ==============================================================================
# Comment Model
# ==============================================================================

class Comment(SSDocument):

    # ========================================
    # Fields
    # ========================================

    type = TextField(default="comment")
    shiftId = TextField()
    shiftAuthor = TextField()
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
    
    by_user_and_created = View(
        "comments",
        "function(doc) {               \
           if(doc.type == 'comment') { \
             emit([doc.createdBy, doc.created], doc); \
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
           if(doc.type == 'comment') { \
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
    def joinData(cls, comments):
        single = False
        if type(comments) != list:
            single = True
            comments = [comments]

        authorIds = [comment["shiftAuthor"] for comment in comments]
        shiftIds = [comment["shiftId"] for comment in comments]

        authors = core.fetch(keys=authorIds)
        shifts = core.fetch(core.connect("shiftspace/shared"), keys=shiftIds)

        for i in range(len(comments)):
            if (authors[i]):
                comments[i]["userName"] = authors[i]["userName"]
            comments[i]["createdStr"] = utils.pretty_date(utils.futcstr(comments[i]["created"]))
            comments[i]["space"] = shifts[i]["space"]
            comments[i]["href"] = shifts[i]["href"]
            comments[i]["domain"] = shifts[i]["domain"]

        if single:
            return comments[0]
        else:
            return comments

    @classmethod
    def create(cls, userId, shiftId, text, subscribe=False):
        from server.models.ssuser import SSUser
        from server.models.shift import Shift
        from server.models.message import Message
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
            Comment.by_created.sync(db)
            Comment.all_subscribed.sync(db)
            shiftAuthor.subscribe(theShift)
        # subscribe the user making the comment
        if not theUser.isSubscribed(theShift) and subscribe:
            theUser.subscribe(theShift)
        # create comment and comment stub
        json = {
            "createdBy": userId,
            "shiftId": shiftId,
            "shiftAuthor": theShift.createdBy,
            "text": text,
            }
        newComment = Comment(**utils.clean(json))
        newComment.store(db)
        subscribers = theShift.subscribers()
        # make a private copy
        # TODO: need to think about the implications of a private copy here - David
        newComment.copyTo(SSUser.privateDb(theUser.id))
        # send each subscriber a message
        if len(subscribers) > 0:
            # TODO: needs to be optimized with a fast join - David
            for subscriber in subscribers:
                if subscriber != userId:
                    astr = ((subscriber == theShift.createdBy) and "your") or ("%s's" % shiftAuthor.userName)
                    json = {
                        "fromId": userId,
                        "toId": subscriber,
                        "text": "%s just commented on %s shift!" % (theUser.userName, astr),
                        "meta": "comment"
                        }
                    Message.create(**utils.clean(json))
        # TODO: don't replicate if peer - David 11/21/09
        core.replicate(Comment.db(shiftId), "shiftspace/shared")
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
        from server.models.ssuser import SSUser
        db = core.connect(SSUser.privateDb(self.createdBy))
        try:
            del db[self.id]
        except:
            pass
        db = core.connect(Comment.db(self.shiftId))
        try:
            del db[self.id]
        except:
            pass
        core.replicate(Comment.db(self.shiftId), "shiftspace/shared")
