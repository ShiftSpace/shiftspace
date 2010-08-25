from datetime import datetime
from couchdb.mapping import *

from ssdoc import SSDocument

from server.utils.decorators import *
import server.utils.utils as utils
import core

# ==============================================================================
# User Model
# ==============================================================================

class User(SSDocument):
    """
    The User document.
    """

    # ========================================
    # Fields
    # ========================================

    type = TextField(default="user")
    peer = BooleanField(default=False)
    userName = TextField()
    displayName = TextField()
    fullName = DictField(Mapping.build(
            first = TextField(),
            last = TextField()
            ))
    lastSeen = DateTimeField(default=datetime.now())
    email = TextField()
    bio = TextField()
    url = TextField()
    gravatar = TextField()
    gravatarLarge = TextField()
    password = TextField()
    streams = ListField(TextField())
    preferences = DictField()

    # ========================================
    # Views
    # ========================================

    all = ViewField(
        "users",
        "function(doc) {            \
           if(doc.type == 'user') { \
             emit(doc._id, doc);    \
           }                        \
         }")

    all_by_joined = ViewField(
        "users",
        "function(doc) {            \
           if(doc.type == 'user') { \
             emit(doc.created, doc);    \
           }                        \
         }")

    by_name = ViewField(
        "users",
        "function(doc) {              \
           if(doc.type == 'user') {   \
             emit(doc.userName, doc); \
           }                          \
         }")

    # ========================================
    # Class Methods
    # ========================================

    @classmethod
    def users(cls, start=None, end=None, limit=25, groupId=None):
        results = User.all_by_joined(core.connect(), limit=25)
        if start and not end:
            users = core.objects(results[start:])
        elif not start and end:
            users = core.objects(results[:end])
        elif start and end:
            users = core.objects(results[start:end])
        else:
            users = core.objects(results)
        if groupId:
            from server.models.permission import Permission
            keys = [[user.id, groupId] for user in users]
            isMembers = core.fetch(
                core.connect(),
                view=Permission.is_member,
                keys=keys
                )
            for i in range(len(users)):
                if isMembers[i]:
                    users[i]["member"] = True
                else:
                    users[i]["member"] = False
        return users

    # ========================================
    # Validation
    # ========================================

    @classmethod
    def uniqueName(cls, name):
        return core.value(User.by_name(core.connect(), key=name)) == None


