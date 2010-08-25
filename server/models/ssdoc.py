from datetime import datetime
from couchdb.mapping import *
from server.models import core
import server.utils.utils as utils 


class SSDocumentError(Exception): pass
class AttemptToSetTypeError(SSDocumentError): pass


class SSDocument(Document):

    # ========================================
    # Fields
    # ========================================

    createdBy = TextField()
    source = DictField(Mapping.build(
            server = TextField(),
            database = TextField()
            ))
    created = DateTimeField()
    modified = DateTimeField()

    # ========================================
    # Initializer
    # ========================================

    def __init__(self, **kwargs):
        Document.__init__(self, **kwargs)

    def store(self, db):
        now = datetime.now()
        if not self.id:
            self.created = now
            self.modified = now
        else:
            self.modified = now
        Document.store(self, db)
        
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
        theId = copy["_id"]
        del copy["_id"]
        db[theId] = copy

    def updateIn(self, dbname):
        db = core.connect(dbname)
        old = db[self.id]
        copy = self.toDict()
        copy["_rev"] = old["_rev"]
        db[self.id] = copy

    def toDict(self):
        return dict(self.items())



