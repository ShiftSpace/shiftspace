import couchdb.client
import schema
import simplejson as json


class Lucene():
    def __init__(self):
        self.resource = couchdb.client.Resource(None, "http://localhost:5984/shiftspace/_fti/lucene")
  
    def search(self, view, debug=False, **params):
        if debug:
            return self.resource.get(view, **params)[1]
        else:
            return self.resource.get(view, **params)[1].get("rows")

_lucene = Lucene()

def server():
    return couchdb.client.Server("http://localhost:5984/")

def connect():
    server = couchdb.client.Server("http://localhost:5984/")
    return server["shiftspace"]

def lucene():
    return _lucene

def query(view, key=None):
    db = connect()

    rows = None
    options = None

    if key:
        options = {"key": key}
        rows = db.view(view, None, **options)
    else:
        rows = db.view(view)

    result = []
    for row in rows:
        result.append(row.value)
    return result

def single(view, key):
    db = connect()
    options = {"key": key}
    for row in db.view(view, None, **options):
        return row.value

def update(doc):
    db = connect()
    id = doc["_id"]
    old = db[id]
    new = old.update(doc)
    db[id] = new
    return db[id]

def validate(doc):
    theSchema = getattr(schema, doc["type"])()
    schemaKeys = theSchema.keys()
    docKeys = doc.keys()
    print schemaKeys
    print docKeys
    return set(docKeys).issubset(set(schemaKeys))
