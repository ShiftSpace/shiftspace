from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from ssdocschema import SSDocument

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core
from ssuserschema import *


class Group(SSDocument):

    source = DictField(Schema.build(
            server = TextField(),
            database = TextField()
            ))

    # ========================================
    # Views
    # ========================================

    by_short_name = View(
        "groups",
        "function(doc) {               \
           if(doc.type == 'group') {   \
             emit(doc.shortName, doc); \
           }                           \
         }")

    by_long_name = View(
        "groups",
        "function(doc) {               \
           if(doc.type == 'group') {   \
             emit(doc.longName, doc);  \
           }                           \
         }")

    # ========================================
    # Database
    # ========================================

    @classmethod
    def byShortName(cls, shortName):
        result = list(Group.by_shortName(core.connect(), key=shortName))
        if result and len(result) > 0:
            return "group_%s" % result[0]
 
    @classmethod
    def byLongName(cls, longName):
        result = list(Group.by_longName(core.connect(), key=longName))
        if result and len(result) > 0:
            return "group_%s" % result[0]

    # ========================================
    # Crud
    # ========================================

    @classmethod
    def create(cls, json):
        pass

    @classmethod
    def read(cls, json):
        pass

    @classmethod
    def update(cls, json):
        pass

    @classmethod
    def addShift(cls, userId, shift):
        # replicate to all subscribers
        pass

    @classmethod
    def updateShift(cls, userId, shift):
        # replicate to all subscribers
        pass

