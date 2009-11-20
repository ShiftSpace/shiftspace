import server.models.core as core
from server.tests.dummy_data import *
from server.models.ssuser import SSUser
from server.models.shift import Shift
from server.models.group import Group
from server.models.permission import Permission
from server.models.favorite import Favorite
from server.models.comment import Comment
from server.couchdb.lucene_design import LuceneDefinition

db = core.connect()
