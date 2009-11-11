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

    # ========================================
    # Database
    # ========================================

    @classmethod
    def shortName(cls, shortName):
        pass

    @classmethod
    def longName(cls, longName):
        pass

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

