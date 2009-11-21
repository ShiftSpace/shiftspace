import os
try:
    # Python 2.5+
    from hashlib import md5
except ImportError:
    from md5 import new as md5


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


def init(dbname="shiftspace/master"):
    """
    Initialize the shiftspace database. Defaults to
    shiftspace for the database name.
    Parameters:
        dbname - the name of the database to use.
    """
    import models.core as core
    server = core.server()
    if not server.__contains__(dbname):
        print "Creating databases."
        server.create(dbname)
        server.create("shiftspace/public")
        server.create("shiftspace/shared")
        server.create("shiftspace/messages")
    else:
        print "%s database already exists." % dbname
    db = server[dbname]
    sync()


def sync():
    import models.core as core
    from models.ssuser import SSUser
    from models.shift import Shift
    from models.group import Group
    from models.permission import Permission
    from models.comment import Comment
    from models.favorite import Favorite
    Lucene = core.lucene()
    # master
    master = core.connect("shiftspace/master")
    SSUser.all.sync(master)
    SSUser.by_name.sync(master)
    SSUser.all_followers.sync(master)
    Permission.by_user.sync(master)
    Permission.by_joinable.sync(master)
    Permission.by_readable.sync(master)
    Permission.by_writeable.sync(master)
    Permission.by_adminable.sync(master)
    Lucene.users.sync(master)
    #Lucene.groups.sync(master)
    # shared
    shared = core.connect("shiftspace/shared")
    Shift.all.sync(shared)
    Shift.by_user_and_created.sync(shared)
    Shift.count_by_domain.sync(shared)
    Comment.count_by_shift.sync(shared)
    Comment.by_user_and_created.sync(shared)
    Favorite.by_user_and_created.sync(shared)
    Favorite.count_by_shift.sync(shared)
    Lucene.shifts.sync(shared)

    print "Databases sync'ed"
    

if __name__ == "__main__":
  init()
