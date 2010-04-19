import os
from couchdb.design import ViewDefinition

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
    os.system("scripts/clear_sessions.sh")
    server = core.sharedServer()
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


def installSpace(space):
    from models import core
    import simplejson as json
    fh = open(os.path.join("spaces", space, "attrs.json"))
    data = json.loads(fh.read())
    data["type"] = "space"
    db = core.connect()
    if db.get(space):
        del db[space]
    db[space] = data


DEFAULT_SPACES = (
    "Notes",
    "Highlights",
    "SourceShift",
    "ImageSwap",
    )


def installDefaultSpaces():
    for space in DEFAULT_SPACES:
        installSpace(space)

# ==============================================================================
# Views
# =============================================================================

AutocompleteByUser = ViewDefinition('autocomplete', 'by_user', '''
        function(doc) {
          if(doc.type == "user") {
             emit(doc.userName, doc);
          }
        }
    ''')
AutocompleteByGroup = ViewDefinition('autocomplete', 'by_group', '''
        function(doc) {
          if(doc.type == "group") {
             emit(doc.shortName, doc);
          }
        }
    ''')
AutocompleteByTag = ViewDefinition('autocomplete', 'by_tag', '''
        function(doc) {
          if(doc.type == "tag") {
             emit(doc.string, doc);
          }
        }
    ''')
Spaces = ViewDefinition('spaces', 'by_name', '''
        function(doc) {             
          if(doc.type == "space") { 
            emit(doc.name, doc);    
          }                         
        }''')
SpaceStats = ViewDefinition('stats', 'public_shifts_by_space', '''
       function(doc) {
         if(doc.type == "shift") {
            emit(doc.space.name, 1);
         }
       }
    ''', '''
       function(keys, values, rereduce) {
         return sum(values);
       }
    ''')
SpaceByUserStats = ViewDefinition('stats', 'public_shifts_by_space_and_user', '''
       function(doc) {
         if(doc.type == "shift" && !doc.publishData.private) {
            emit([doc.space.name, doc.createdBy], 1);
         }
       }
    ''', '''
       function(keys, values, rereduce) {
         return sum(values);
       }
    ''')

def sync(createAdmin=True):
    import models.core as core
    from models.ssuser import SSUser
    from models.shift import Shift
    from models.group import Group
    from models.permission import Permission
    from models.comment import Comment
    from models.favorite import Favorite
    from models.follow import Follow
    from models.message import Message
    Lucene = core.lucene()

    # master ---------------------------------
    master = core.connect("shiftspace/master")
    
    if createAdmin and not master.get("admins"):
        master["admins"] = adminDoc
        master["shiftspace"] = adminUser

    installDefaultSpaces()

    AutocompleteByUser.sync(master)
    AutocompleteByGroup.sync(master)
    AutocompleteByTag.sync(master)
    Spaces.sync(master)

    SSUser.all.sync(master)
    SSUser.all_by_joined.sync(master)
    SSUser.by_name.sync(master)

    Follow.following_by_created.sync(master)
    Follow.following_count.sync(master)
    Follow.followers_by_created.sync(master)
    Follow.followers_count.sync(master)

    Group.all.sync(master)
    Group.by_short_name.sync(master)
    Group.by_long_name.sync(master)
    Group.by_visible_and_created.sync(master)

    Permission.all_members.sync(master)
    Permission.member_count.sync(master)
    Permission.admins.sync(master)
    Permission.admin_count.sync(master)
    Permission.by_user.sync(master)
    Permission.by_group.sync(master)
    Permission.is_member.sync(master)
    Permission.by_user_and_group.sync(master)
    Permission.readable_by_user_and_created.sync(master)
    Permission.by_joinable.sync(master)
    Permission.by_readable.sync(master)
    Permission.by_writeable.sync(master)
    Permission.by_adminable.sync(master)

    Lucene.users.sync(master)
    
    # shared ---------------------------------
    shared = core.connect("shiftspace/shared")
    SpaceStats.sync(shared)
    SpaceByUserStats.sync(shared)

    Message.count_by_user.sync(shared)
    Message.system_count.sync(shared)
    Message.read_count_by_user.sync(shared)
    
    Shift.all.sync(shared)
    Shift.by_user_and_created.sync(shared)
    Shift.count_by_user_and_published.sync(shared)
    Shift.count_by_domain.sync(shared)

    Group.shift_count.sync(shared)
    
    Comment.count_by_shift.sync(shared)
    Comment.by_user_and_created.sync(shared)
    
    Favorite.by_user_and_created.sync(shared)
    Favorite.count_by_shift.sync(shared)
    
    Lucene.shifts.sync(shared)
    Lucene.groups.sync(shared)
    Lucene.messages.sync(shared)
    Lucene.comments.sync(shared)
    
    print "Databases sync'ed"


if __name__ == "__main__":
  init()
