import server.utils.utils as utils
import server.models.core as core
from server.tests.dummy_data import *
from server.models.ssuser import SSUser
from server.models.shift import Shift
from server.models.group import Group
from server.models.permission import Permission
from server.models.favorite import Favorite
from server.models.comment import Comment
from server.models.follow import Follow
from server.models.message import Message
from server.couchdb.lucene_design import LuceneDefinition

def reload_models():
    import server
    for m in [server.models.core,
              server.models.ssuser, 
              server.models.shift, 
              server.models.group, 
              server.models.permission, 
              server.models.favorite, 
              server.models.comment,
              server.models.message,
              server.couchdb.lucene_design]:
        reload(m)

db = core.connect()
