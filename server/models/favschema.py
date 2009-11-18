from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core

from ssdocschema import SSDocument

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
        if not Favorite.isFavorite(userId, shiftId):
            db = core.connect("shiftspace/shared")
            newFavorite = Favorite(
                userId = userId,
                shiftId = shiftId,
                )
            newFavorite.id = Favorite.makeId(userId, shiftId)
            newFavorite.store(db)
            return newFavorite

    @classmethod
    def makeId(cls, userId, shiftId):
        return "user:%s:%s" % (userId, shiftId)

    @classmethod
    def isFavorite(userId, shiftId):
        db = core.connect("shiftspace/shared")
        return db.get(Favorite.makeId(self.id, aShift.id))

    # ========================================
    # Instance Methods
    # ========================================

    def delete(self):
        """
        Delete a favorite.
        """
        db = core.connect("shiftspace/shared")
        del db[Favorite.makeId(self.userId, self.shiftId)]

        
