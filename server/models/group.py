import server.utils.utils as utils
import core
import schema
import stream

# ==============================================================================
# CRUD
# ==============================================================================

def create(data):
    data["meta"] = "group"
    newGroup = schema.group()
    newGroup.update(data)
    return stream.create(newGroup)

# ==============================================================================
# Utilities
# ==============================================================================

def byShortName(shortName):
    return core.single(schema.groupByShortName, shortName)

def inGroup(id):
    """
    Returns all users in a particular group.
    """
    db = core.connect()
    return core.query(schema.allGroups, id)
