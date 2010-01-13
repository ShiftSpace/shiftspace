from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from server.utils.decorators import *
import server.utils.utils as utils
import core

from ssdoc import SSDocument

# =============================================================================
# Follow Model
# =============================================================================

class Follow(SSDocument):
    
    # ========================================
    # Fields
    # ========================================

    type = TextField(default="follow")
    follower = TextField()
    followee = TextField()

    # ========================================
    # Views
    # ========================================
    
    following = View(
        "follow",
        "function(doc) {                       \
           if(doc.type == 'follow') {          \
             emit(doc.follower, doc.followee); \
           }                                   \
         }"
        )

    following_count = View(
        "follow",
        "function(doc) {              \
           if(doc.type == 'follow') { \
             emit(doc.follower, 1);   \
           }                          \
         }",
        "function(keys, values, rereduce) { \
           return sum(values);              \
        }"
        )

    following_by_created = View(
        "follow",
        "function(doc) {                                      \
           if(doc.type == 'follow') {                         \
             emit([doc.follower, doc.created], doc.followee); \
           }                                                  \
         }"
        )

    followers = View(
        "follow",
        "function(doc) {                      \
           if(doc.type == 'follow') {         \
             emit(doc.followee, doc.follower) \
           }                                  \
         }"
        )

    followers_count = View(
        "follow",
        "function(doc) {              \
           if(doc.type == 'follow') { \
             emit(doc.followee, 1)    \
           }                          \
         }",
        "function(keys, values, rereduce) { \
           return sum(values);              \
        }"
        )

    followers_by_created = View(
        "follow",
        "function(doc) {                                      \
           if(doc.type == 'follow') {                         \
             emit([doc.followee, doc.created], doc.follower); \
           }                                                  \
         }"                           
        )

    # ========================================
    # Class Methods
    # ========================================

    @classmethod
    def makeId(cls, followerId, followeeId):
        return "follow:%s:%s" % (followerId, followeeId)

    @classmethod
    def create(cls, follower, followee):
        from server.models.message import Message
        existing = Follow.read(follower, followee)
        if existing:
            return existing
        newFollow = Follow(
            follower = follower.id,
            followee = followee.id,
            )
        newFollow.id = Follow.makeId(follower.id, followee.id)
        newFollow.store(core.connect())
        json = {
            "fromId": "shiftspace",
            "toId": followee.id,
            "title": "%s has started following your shifts!" % (follower.userName),
            "text": "%s has started following your shifts!" % (follower.userName),
            "meta": "follow",
            "content": {
                "followerId": follower.id
                }
            }
        Message.create(**json)
        return newFollow

    @classmethod
    def read(cls, follower, followee):
        return Follow.load(core.connect(), Follow.makeId(follower.id, followee.id))

    # ========================================
    # Instance Methods
    # ========================================

    def delete(self):
        db = core.connect()
        del db[Follow.makeId(self.follower, self.followee)]
