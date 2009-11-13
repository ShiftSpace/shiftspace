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

    by_shift = View(
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
        """
        pass

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
