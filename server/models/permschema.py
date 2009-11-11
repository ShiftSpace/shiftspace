from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from ssdocschema import SSDocument

from server.utils.decorators import *
import server.utils.utils as utils
import schema
import core
from ssuserschema import *


class Permission(SSDocument):
    @classmethod
    def writeableStreams(cls, userId):
        return []
