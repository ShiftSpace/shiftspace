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

    type = TextField(default="favorite")
    userId = TextField()
    shiftId = TextField()

    # ========================================
    # Views
    # ========================================

    by_user_and_created = View(
        "favorites",
        "function(doc) {                                   \
           if(doc.type == 'favorite') {                    \
             emit([doc.userId, doc.created], doc.shiftId); \
           }                                               \
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
    # CRUD
    # ========================================

    @classmethod
    def create(cls, userId, shiftId):
        """
        Favorite a shift.
        """
        db = core.connect()
        favId = Favrotie.id(userId, shiftId)
        if not db.get(favId):
            db.create({
                    "_id": Favorite.id(userId, shiftId),
                    "type": "favorite"
                    })

    @classmethod
    def delete(cls, userId, shiftId):
        """
        Delete a favorite.
        """
        db = core.connect()
        del db[Favorite.id(userId, shiftId)]

    # ========================================
    # Utilities
    # ========================================
        
    @classmethod
    def id(cls, userId, shiftId):
        return "user:%s:%s" % (userId, shiftId)
        
