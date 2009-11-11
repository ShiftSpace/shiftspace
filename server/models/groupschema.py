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

    def db(cls, groupId):
        return "group_%s" % groupId

    @classmethod
    def byShortName(cls, shortName, absolute=False):
        result = list(Group.by_shortName(core.connect(), key=shortName))
        if result and len(result) > 0:
            return "%s/group_%s" % ((result[0].source.server or ''), result[0].id)
 
    @classmethod
    def byLongName(cls, longName, absolute=False):
        result = list(Group.by_longName(core.connect(), key=longName))
        if result and len(result) > 0:
            return "%s/group_%s" % ((result[0].source.server or ''), result[0].id)

    # ========================================
    # Crud
    # ========================================

    @classmethod
    def create(cls, userId, groupJson):
        # create the group metadata
        newGroup = Group(**groupJson)
        newGroup.source.server = core.serverName()
        newGroup.source.database = Group.db(newGroup.id)
        # create the root permission for this group
        # create the group db
        server = core.server()
        server.create(Group.db(newGroup.id))
        # copy the group metadata to the db
        
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

