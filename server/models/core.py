import couchdb.client
import couchdb.http as http
from couchdb.design import ViewDefinition
from server.lucene.lucene_design import LuceneDefinition
import simplejson as json


_local = False
_local_id = None

_store_yes = json.dumps({"store":"no"})
_store_no = json.dumps({"store":"yes"})

# ==============================================================================
# Lucene
# ==============================================================================

class Lucene():

    users = LuceneDefinition("lucene", "users", index_fun = "          \
                  function(doc) {                                      \
                    if(doc.type == 'user') {                           \
                      var ret = new Document();                        \
                      ret.add(doc.userName, {field:'userName'});       \
                      ret.add(doc.email, {field:'email'});             \
                      if (doc.displayName) ret.add(doc.displayName, {field:'displayname'}); \
                      return ret;                                      \
                    }                                                  \
                    return null;                                       \
                  }"
                             )


    shifts = LuceneDefinition("lucene", "shifts", index_fun = "               \
                  function(doc) {                                             \
                    if(doc.type == 'shift') {                                 \
                      var ret = new Document();                               \
                      ret.add(doc.createdBy, {field:'createdBy'});            \
                      ret.add(doc.space.name, {field:'spaceName'});           \
                      if (doc.summary) ret.add(doc.summary, {field:'summary'}); \
                      ret.add(doc.href, {field:'href'});                      \
                      ret.add(doc.href+'_HREF_EXACT', {field:'hrefExact'});   \
                      ret.add(doc.domain, {field:'domain'});                  \
                      ret.add(doc.publishData.dbs.join(' '), {field:'dbs'});  \
                      ret.add(doc.publishData['private'], {field:'private'}); \
                      ret.add(doc.publishData.draft, {field:'draft'});        \
                      var dt = doc.created.substr(0, doc.created.length-1).split('T'); \
                      var d = dt[0].split('-'); \
                      var t = dt[1].split(':'); \
                      ret.add(Date.UTC.apply(null, d.concat(t)), {field:'created'}); \
                      dt = doc.modified.substr(0, doc.modified.length-1).split('T'); \
                      d = dt[0].split('-'); \
                      t = dt[1].split(':'); \
                      ret.add(Date.UTC.apply(null, d.concat(t)), {field:'modified'}); \
                      return ret;                                             \
                    }                                                         \
                    return null;                                              \
                  }"
                              )

    groups = LuceneDefinition("lucene", "groups", index_fun = "        \
                  function(doc) {                                      \
                    if(doc.type == 'group') {                          \
                      var ret = new Document();                        \
                      ret.add(doc.displayName, {field:'displayName'}); \
                      ret.add(doc.shortName, {field:'shortName'});     \
                      ret.add(doc.description, {field:'description'}); \
                      return ret;                                      \
                    }                                                  \
                    return null;                                       \
                  }"
        )

    messages = LuceneDefinition("lucene", "messages", index_fun = "   \
                  function(doc) {                                     \
                    if(doc.type == 'message') {                       \
                      var ret = new Document();                       \
                      ret.add(doc.fromId, {field:'from'});            \
                      ret.add(doc.toId, {field:'to'});                \
                      ret.add(doc.title, {field:'title'});            \
                      ret.add(doc.text, {field:'text'});              \
                      ret.add(doc.meta, {field:'meta'});              \
                      return ret;                                     \
                    }                                                 \
                    return null;                                      \
                  }"
        )

    comments = LuceneDefinition("lucene", "comments", index_fun = "   \
                  function(doc) {                                     \
                    if(doc.type == 'comment') {                       \
                      var ret = new Document();                       \
                      ret.add(doc.shiftAuthor, {field:'shiftAuthor'});\
                      ret.add(doc.text, {field:'text'});              \
                      return ret;                                     \
                    }                                                 \
                    return null;                                      \
                  }"
        )

    def search(self, db, view, **params):
        """
        Runs a full text search on the db.
        """
        import urllib
        if db == None:
            db = connect("shiftspace/master")
        uri = 'http://localhost:5984/%s/_fti/_design/lucene' % urllib.quote_plus(db.name)
        resource = http.Resource(uri, None)
        status, msg, response = resource.get_json(path=view, **params)
        return response.get("rows")

_lucene = Lucene()

# ==============================================================================
# Functions
# ==============================================================================

def serverName():
    """
    Return the servername. Used to assign source fields in documents.
    This way clients can resolve the location of the source to replicate
    to and from.
    """
    return ""


__server = None
def sharedServer(url="http://localhost:5984/"):
    """
    Returns a CouchDB server.
    """
    global __server
    if __server == None:
        __server = couchdb.client.Server(url)
    return __server


def test():
    try:
        theServer = sharedServer()
        theServer.version
        return True
    except:
        return False


def connect(dbname="shiftspace/master"):
    """
    Connects to the database. Defaults to "shiftspace".
    """
    server = sharedServer("http://localhost:5984/")
    return server[dbname]


def lucene():
    """
    Return the Lucene instance.
    """
    return _lucene


def dictToQuery(d):
    return " AND ".join(['%s:%s*' % (k, v) for k, v in d.items()])


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


def toStr(v):
    if isinstance(v, basestring):
        return v
    else:
        return json.dumps(v)


def toDict(kvs):
    result = {}
    for kv in kvs:
        result[toStr(kv['key'])] = {"value":kv['value']}
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
    resource = http.Resource(uri, None)

    params = None
    if reduce != True:
        params = {"include_docs":True}
    else:
        params = {"group":True}

    status, message, response = resource.post_json(body={"keys":keys}, **params)

    rows = response["rows"]

    if viewpath == "_all_docs":
        result = []
        for row in rows:
            value = row.get('value')
            if value and not value.get("deleted"):
                result.append(row['doc'])
            else:
                result.append(None)
        return result
    else:
        kvs = toDict(rows)
        result = []
        for key in keys:
            key = toStr(key)
            result.append((kvs.get(key) and kvs.get(key)["value"]) or None)
        return result


def replicate(source, target="shiftspace/master"):
    sharedServer().replicate(source, target)
