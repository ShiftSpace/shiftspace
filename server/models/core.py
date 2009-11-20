import couchdb.client
from couchdb.design import ViewDefinition
import simplejson as json

_local = False
_local_id = None

_store_yes = json.dumps({"store":"no"})
_store_no = json.dumps({"store":"yes"})

_users = {
    "defaults": _store_yes,
    "index": "function(doc) {                                      \
                if(doc.type == 'user') {                           \
                  var ret = new Document();                        \
                  ret.add(doc.userName, {field:'userName'});       \
                  ret.add(doc.displayName, {field:'displayName'}); \
                  return ret;                                      \
                }                                                  \
                return null;                                       \
              }"
    }

_shifts = {
    "defaults": _store_yes,
    "index": "function(doc) {                                                    \
                if(doc.type == 'shift') {                                        \
                  var ret = new Document();                                      \
                  ret.add(doc.createdBy, {field:'createdBy'});                   \
                  ret.add(doc.summary, {field:'summary'});                       \
                  ret.add(doc.href, {field:'href'});                             \
                  ret.add(doc.domain, {field:'domain'});                         \
                  ret.add(doc.publishData.streams.join(' '), {field:'streams'}); \
                  ret.add(doc.publishData['private'], {field:'private'});        \
                  ret.add(doc.publishData.draft, {field:'draft'});               \
                  ret.add(Date.parse(doc.created), {field:'created'});           \
                  ret.add(Date.parse(doc.modified), {field:'modified'});         \
                  return ret;                                                    \
                }                                                                \
                return null;                                                     \
              }"
    }

_groups = {
    "defaults": _store_yes,
    "index": "function(doc) {                                      \
                if(doc.type == 'stream' && doc.meta == 'group') {  \
                  var ret = new Document();                        \
                  ret.add(doc.displayName, {field:'displayName'}); \
                  ret.add(doc.shortName, {field:'shortName'});     \
                  ret.add(doc.description, {field:'description'}); \
                  return ret;                                      \
                }                                                  \
                return null;                                       \
              }"
    }

_lucene_design = {
    "language": "javascript",
    "fulltext": {
        "users": _users,
        "shifts": _shifts,
        "groups": _groups,
        }
}


class Lucene():

    def search(self, view, debug=False, dbname="shiftspace/master", **params):
        """
        Runs a full text search on the db.
        """
        import urllib
        uri = 'http://localhost:5984/%s/_fti/lucene' % urllib.quote_plus(dbname)
        resource = couchdb.client.Resource(None, uri)
        if debug:
            return resource.get(view, **params)[1]
        else:
            return resource.get(view, **params)[1].get("rows")


_lucene = Lucene()


def serverName():
    """
    Return the servername. Used to assign source fields in documents.
    This way clients can resolve the location of the source to replicate
    to and from.
    """
    return ""


def server():
    """
    Returns a CouchDB server.
    """
    return couchdb.client.Server("http://localhost:5984/")


def connect(dbname="shiftspace/master"):
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


def value(results):
    """
    Shortcut for getting a single raw result.
    """
    if results.rows and len(results.rows) > 0:
        return results.rows[0].value


def values(results):
    """
    Shortcut for getting only the values of the results.
    """
    if results.rows and len(results.rows) > 0:
        return [row.value for row in results.rows]
    else:
        return []


def object(results):
    """
    Shortcut for getting a single object.
    """
    if results.rows and len(results.rows) > 0:
        return list(results)[0]


def objects(results):
    """
    Shortcut for getting rows as objects.
    """
    if results.rows and len(results.rows) > 0:
        return list(results)
    else:
        return []


def single(view, key):
    """
    Convenience functions for accessing a single key.
    """
    db = connect()
    options = {"key": key}
    for row in db.view(view, None, **options):
        return row.value


def toDict(kvs):
    result = {}
    for kv in kvs:
        result[kv['key']] = {"value":kv['value']}
    return result


def fetch(db=None, view=None, keys=None):
    """
    Fetch multiple documents from the database. Useful when
    joins are necessary and making multiple requests to the db
    is an undesirable performance hit.

    Paramters:
        db - defaults to 'shiftspace'
        view - defaults to  '_all_docs'
    """
    import urllib
    if db == None:
        db = connect()

    reduce = False
    if isinstance(view, ViewDefinition):
        viewpath = "/".join(["_design", view.design, "_view", view.name])
        reduce = (view.reduce_fun != None)
    else:
        viewpath = "_all_docs"

    uri = 'http://localhost:5984/%s/%s' % (urllib.quote_plus(db.name), viewpath)
    resource = couchdb.client.Resource(None, uri)

    params = None
    if reduce != True:
        params = {"include_docs":True}
    else:
        params = {"group":True}

    content = json.dumps({"keys":keys})
    headers = {"Content-Type":"application/json"}

    resp, data = resource.post(headers=headers, content=content, **params)
    rows = data["rows"]

    if viewpath == "_all_docs":
        result = []
        for row in rows:
            if row.get('value'):
                result.append(row['doc'])
            else:
                result.append(None)
        return result
    else:
        kvs = toDict(rows)
        return [((kvs.get(key) and kvs.get(key)["value"]) or None) for key in keys]


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


def replicate(source, target="shiftspace/master"):
    resource = couchdb.client.Resource(None, 'http://localhost:5984/_replicate')
    content = json.dumps({"source":source, "target":target})
    headers = {"Content-Type":"application/json"}
    resource.post(headers=headers, content=content)

