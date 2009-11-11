import couchdb.client
import schema
import simplejson as json


class Lucene():
    def __init__(self):
        self.resource = couchdb.client.Resource(None, "http://localhost:5984/shiftspace/_fti/lucene")
  
    def search(self, view, debug=False, **params):
        """
        Runs a full text search on the db.
        """
        if debug:
            return self.resource.get(view, **params)[1]
        else:
            return self.resource.get(view, **params)[1].get("rows")


_lucene = Lucene()


def server():
    """
    Returns a CouchDB server.
    """
    return couchdb.client.Server("http://localhost:5984/")


def connect(dbname="shiftspace"):
    """
    Connects to the database. Defaults to "shiftspace".
    """
    server = couchdb.client.Server("http://localhost:5984/")
    return server[dbname]


def lucene():
    """
    Return the Lucene instance.
    """
    return _lucene


def query(view, key=None, keys=None):
    """
    Query the database. Can access a single key or an
    array of keys.
    """
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
    """
    Convenience functions for accessing a single key.
    """
    db = connect()
    options = {"key": key}
    for row in db.view(view, None, **options):
        return row.value


def fetch(db="shiftspace", view="_all_docs", keys=None, reduce=False):
    """
    Fetch multiple documents from the database. Useful when
    joins are necessary and making multiple requests to the db
    is an undesirable performance hit.
    
    Paramters:
        db - defaults to 'shiftspace'
        view - defaults to  '_all_docs'
    """
    uri = 'http://localhost:5984/%s/%s' % (db, view)
    resource = couchdb.client.Resource(None, uri)
    params = None
    if reduce != True:
        params = {"include_docs":True}
    else:
        params = {"group":True}
    content = json.dumps({"keys":keys})
    headers = {"Content-Type":"application/json"}
    rows = resource.post(headers=headers, content=content, **params)[1]['rows']
    result = []
    for row in rows:
        if row.get('value'):
            if not reduce and row.get('doc'):
                result.append(row['doc'])
            else:
                result.append(row)
        else:
            result.append(None)
    return result


def update(doc):
    """
    Convenience function for updating a document. Takes the new
    document, attempts to update and returns the new value.
    """
    db = connect()
    id = doc["_id"]
    old = db[id]
    new = old.update(doc)
    db[id] = new
    return db[id]


def validate(doc):
    """
    Validate a document. Might get deprecated.
    """
    theSchema = getattr(schema, doc["type"])()
    schemaKeys = theSchema.keys()
    docKeys = doc.keys()
    print schemaKeys
    print docKeys
    return set(docKeys).issubset(set(schemaKeys))
