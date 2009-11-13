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
    # CRUD
    # ========================================

    @classmethod
    def create(cls, userId, shiftId):
        """
        Favorite a shift.
        """
        if not Favorite.isFavorited(userId, shiftId):
            db = core.connect()
            json = {
                "userId": userId,
                "shiftId": shiftId,
                }
            newFavorite = Favorite(id=Favorite.makeId(userId, shiftId), **json)
            newFavorite.store(db)
            return newFavorite

    @classmethod
    def delete(cls, userId, shiftId):
        """
        Delete a favorite.
        """
        db = core.connect()
        del db[Favorite.makeId(userId, shiftId)]

    # ========================================
    # Utilities
    # ========================================

    @classmethod
    def isFavorited(cls, userId, shiftId):
        db = core.connect()
        return db.get(Favorite.makeId(userId, shiftId))
        
    @classmethod
    def makeId(cls, userId, shiftId):
        return "user:%s:%s" % (userId, shiftId)

    @classmethod
    def count(cls, shiftId):
        db = core.connect()
        return core.value(Favorite.count_by_shift(db, key=shiftId))

    @classmethod
    def forUser(cls, userId, start=None, end=None, descending=True, limit=25):
        if not start:
            start = [userId]
            end = [userId, {}]
        options = {
            "startKey": start
            }
        if end:
            options["endKey"] = end
        else:
            options["limit"] = limit
        options["descending"] = descending
        return core.objects(Favorite.by_user_and_created(core.connect(), **options))
