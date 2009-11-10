from couchdb.schema import *
from couchdb.schema import View

class SSDocumentError(Exception): pass
class AttemptToSetTypeError(SSDocumentError): pass

class SSDocument(Document):
    def __init__(self, *args, **kwargs):
        # type is always specified by the class
        # cannot be set from the client
        if kwargs.get("type"):
            raise Exception("Error: Attempt to set document type.")
        super(Document, self).__init__(*args, **kwargs)

