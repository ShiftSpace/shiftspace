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
    
    shortName = TextField()
    longName = TextField()
    tagLine = TextField()
    url = TextField()
    visible = BooleanField(default=True)

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
        """
        Create a group.
        Parameters:
            userId - a user id.
            groupJson - a group json document.
        """
        # create the group metadata
        groupJson["source"] = {
            "server": core.serverName(),
            "database": Group.db(newGroup.id),
            }
        newGroup = Group(**groupJson)
        # create the root permission for this group
        # create the group db
        server = core.server()
        server.create(Group.db(newGroup.id))
        # copy the group metadata to the db
        groupdb = core.connect(Group.db(newGroup.id))
        groupdb.create(groupJson)
        
    @classmethod
    def read(cls, id):
        pass

    @classmethod
    def update(cls, id):
        pass

    @classmethod
    def delete(cls, id):
        """
        Delete the group.
        Parameters:
            id - a group id.
        """
        server = core.server()
        del server[Group.db(id)]

    @classmethod
    def addShift(cls, userId, shift):
        # replicate to all subscribers
        pass

    @classmethod
    def updateShift(cls, userId, shift):
        # replicate to all subscribers
        pass

