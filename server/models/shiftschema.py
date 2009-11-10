from couchdb.schema import *
from datetime import datetime

class Shift(Document):
    """
    The Shift document. A shift is a piece of JSON data used
    by spaces (applications) to recreate a user's modification
    to a page. Refer to the API specification for more detailed
    imformation about the usage of different fields.
    """
    # ========== fields
    type = TextField(default="shift")
    source = TextField()
    createdBy = TextField()
    userName = TextField()
    href = TextField()
    domain = TextField()
    space = DictField(Schema.build(
            name = TextField(),
            version = TextField()
            ))
    summary = TextField()
    created = DateTimeField(default=datetime.now())
    modified = DateTimeField(default=datetime.now())
    broken = BooleanField(default=False)
    commentStream = TextField()
    publishData = DictField(Schema.build(
            draft = BooleanField(default=True),
            private = BooleanField(default=True),
            publishTime = DateTimeField(),
            streams = ListField(TextField())
            ))
    content = DictField()
    
    # ========== views
    
            
