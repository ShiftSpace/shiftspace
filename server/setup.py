import os
try:
    # Python 2.5+
    from hashlib import md5
except ImportError:
    from md5 import new as md5
import models.core as core


def isJsFile(path):
    """
    Check if a path is a directory or a Javascript file.
    Parameters:
        path - a file path.
    Returns:
        bool
    """
    return os.path.splitext(path)[1] == '.js'


def walk(dir, op=None):
    """
    Parse a directory for view files.
    Parameters:
        dir - the directory to walk
        op - the function to use on each file node.
    """
    files = os.listdir(dir)
    for afile in files:
        path = os.path.join(dir, afile)
        if os.path.isdir(path):
            walk(path, op)
        elif os.path.isfile(path) and isJsFile(path):
            if op:
                op(path)
            else:
                print "dir: %s, file: %s" % (dir, path)


def collectDesignDocs(viewDir="server/views"):
    """
    Load all CouchDB design documents, their views, validation,
    and lucene documents into an array.
    Parameters:
        viewDir - the directory to walk.
    Returns:
        a dictionary of design documents.
    """
    designDocs = {}
    def collect(path):
        dir, file = os.path.split(path)
        dir, view = os.path.split(dir)
        root, design = os.path.split(dir) 
        if view == "validation":
            design = "validation"
        designDocName = "_design/%s" % design
        designDoc = designDocs.get(designDocName)
        if not designDoc:
            designDoc = {"_id": designDocName, "language":"javascript"}
        if design != "validation":
            key = (design == "lucene" and "fulltext") or "views"
            if not designDoc.get(key):
              designDoc[key] = {}
            if not designDoc[key].get(view):
              designDoc[key][view] = {}
            fn = os.path.splitext(file)[0]
            designDoc[key][view][fn] = open(path).read()
        else:
            view = os.path.splitext(file)[0]
            designDoc[view] = open(path).read()
        designDocs[designDocName] = designDoc
    walk(viewDir, collect)
    return designDocs


def md5hash(str):
    m = md5()
    m.update(str)
    return m.hexdigest()


adminUser = {
    "type": "user",
    "userName": "shiftspace",
    "password": md5hash("shiftspace")
    }


adminDoc = {
    "type": "system",
    "ids": ["shiftspace"]
    }


def loadDocs(dbname="shiftspace", createAdmin=True):
    """
    Load all of the initial documents for the database.
    Optional create admin user for debugging. Not recommended
    for deployment.
    Parameters:
        db - the database to load the design documents into.
        createAdmin - flag to create superuser. Defaults to True.
    """
    db = core.connect(dbname)
    docs = collectDesignDocs()
    if createAdmin:
        docs["admins"] = adminDoc
        docs["shiftspace"] = adminUser
    for k, v in docs.items():
        print "Loading %s" % k
        old = db[k]
        v["_rev"] = old["_rev"]
        db[k] = v
    print "Design documents loaded."


def init(dbname="shiftspace"):
    """
    Initialize the shiftspace database. Defaults to
    shiftspace for the database name.
    Parameters:
        dbname - the name of the database to use.
    """
    server = core.server()
    if not server.__contains__(dbname):
        print "Creating database %s." % dbname
        server.create(dbname)
    else:
        print "%s database already exists." % dbname
    db = server[dbname]
    loadDocs(dbname)


if __name__ == "__main__":
  init()
