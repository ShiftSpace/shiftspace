from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from server.utils.decorators import *
import server.utils.utils as utils
import core

from ssdoc import SSDocument

# ==============================================================================
# Favorite Model
# ==============================================================================

class Favorite(SSDocument):

    # ========================================
    # Fields
    # ========================================

    type = TextField(default="favorite")
    userId = TextField()
    shiftId = TextField()

    # ========================================
    # Views
    # ========================================

    by_user_and_created = View(
        "favorites",
        "function(doc) {                           \
           if(doc.type == 'favorite') {            \
             emit([doc.userId, doc.created], doc); \
           }                                       \
         }"
        )

    count_by_shift = View(
        "favorites",
        "function(doc) {                \
           if(doc.type == 'favorite') { \
             emit(doc.shiftId, 1);      \
           }                            \
         }",
        "function(keys, values, rereduce) { \
           return sum(values);              \
         }"
        )

    # ========================================
    # Class Methods
    # ========================================

    @classmethod
    def create(cls, userId, shiftId):
        """
        Favorite a shift.
        """
        fav = Favorite.readByUserAndShift(userId, shiftId)
        if fav == None:
            db = core.connect("shiftspace/shared")
            newFavorite = Favorite(
                userId = userId,
                shiftId = shiftId,
                )
            newFavorite.id = Favorite.makeId(userId, shiftId)
            newFavorite.store(db)
            return newFavorite
        return fav

    @classmethod
    def readByUserAndShift(cls, userId, shiftId):
        db = core.connect("shiftspace/shared")
        return Favorite.load(db, Favorite.makeId(userId, shiftId))

    @classmethod
    def makeId(cls, userId, shiftId):
        return "user:%s:%s" % (userId, shiftId)

    @classmethod
    def isFavorite(cls, userId, shiftId):
        db = core.connect("shiftspace/shared")
        return db.get(Favorite.makeId(userId, shiftId)) != None

    # ========================================
    # Instance Methods
    # ========================================

    def delete(self):
        """
        Delete a favorite.
        """
        db = core.connect("shiftspace/shared")
        del db[Favorite.makeId(self.userId, self.shiftId)]

        
