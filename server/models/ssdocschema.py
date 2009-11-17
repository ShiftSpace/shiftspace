from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View


class SSDocumentError(Exception): pass
class AttemptToSetTypeError(SSDocumentError): pass


class SSDocument(Document):
    """
    Base document for ShiftSpace.
    """

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
        super(Document, self).__init__(**kwargs)

    # ========================================
    # Instance Methods
    # ========================================

    def delete(self, db=None):
        """
        Delete the instance.
        """
        db = db or core.connect()
        del db[self.id]

    def copyTo(self, db):
        """
        Create a copy of this shift in another database.
        Stop gap until we can replicate single documents
        either via special API or filtered replication.
        Parameters:
          db - the name of a database to copy to
        """
        copy = self.toDict()
        del copy["_rev"]
        db.create(copy)

    def updateIn(self, db):
        """
        Update this the instance of this document in
        another db. Stop gap until we can replicate
        single documents either via special API or filtered
        replication.
        Parameters:
          db - the name of a database to copy to
        """
        old = db[self.id]
        copy = self.toDict()
        copy["_rev"] = old["_rev"]
        db[self.id] = copy

    def toDict(self):
        """
        Convenience for turning Document into a dictionary.
        """
        return dict(self.items())



