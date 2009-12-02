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
    def makeId(cls, follower, followee):
        return "follow:%s:%s" % (follower, followee)

    @classmethod
    def create(cls, follower, followee):
        existing = Follow.read(follower, followee)
        if existing:
            return existing
        newFollow = Follow(
            follower = follower,
            followee = followee,
            )
        newFollow.id = Follow.makeId(follower, followee)
        newFollow.store(core.connect())
        return newFollow

    @classmethod
    def read(cls, follower, followee):
        return Follow.load(core.connect(), Follow.makeId(follower, followee))

    # ========================================
    # Instance Methods
    # ========================================

    def delete(self):
        del db[Follow.makeId(self.follower, self.followee)]
        

                    
        

    
        
        
