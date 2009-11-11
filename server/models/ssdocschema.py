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

    def __init__(self, *args, **kwargs):
        # type is always specified by the class
        # cannot be set from the client
        if kwargs.get("type"):
            raise AttemptToSetTypeError("Error: Attempt to set document type.")
        super(Document, self).__init__(*args, **kwargs)

