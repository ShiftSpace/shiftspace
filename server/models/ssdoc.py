from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View
from server.models import core
import server.utils.utils as utils 


class SSDocumentError(Exception): pass
class AttemptToSetTypeError(SSDocumentError): pass


class SSDocument(Document):

    # ========================================
    # Fields
    # ========================================

    createdBy = TextField()    
    source = DictField(Schema.build(
            server = TextField(),
            database = TextField()
            ))
    created = DateTimeField(default=datetime.now())
    modified = DateTimeField(default=datetime.now())

    # ========================================
    # Initializer
    # ========================================

    def __init__(self, **kwargs):
        # type is always specified by the class
        # cannot be set from the client
        if kwargs.get("type"):
            raise AttemptToSetTypeError("Error: Attempt to set document type.")
        super(Document, self).__init__(**utils.clean(kwargs))

    # ========================================
    # Instance Methods
    # ========================================

    def delete(self, db=None):
        db = db or core.connect()
        del db[self.id]

    def copyTo(self, dbname):
        db = core.connect(dbname)
        copy = self.toDict()
        del copy["_rev"]
        db.create(copy)

    def updateIn(self, dbname):
        db = core.connect(dbname)
        old = db[self.id]
        copy = self.toDict()
        copy["_rev"] = old["_rev"]
        db[self.id] = copy

    def toDict(self):
        return dict(self.items())



