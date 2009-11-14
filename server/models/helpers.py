import core
import schema
import user
import shift
import stream
import event
import permission


def deleteAllUsers():
    pass

def deleteAllShifts():
    shiftIds = [ashift["_id"] for ashift in core.query(schema.allShifts)]
    [permission.delete(shiftId) for shiftId in shiftIds]

def deleteAllPermissions():
    permIds = [aperm["_id"] for aperm in core.query(schema.allPermissions)]
    [permission.delete(permId) for permId in permIds]

def deleteAllStreams():
    streamIds = [astream["_id"] for astream in core.query(schema.allStreams)]
    [stream.delete(streamId) for streamId in streamIds]

def deleteAllEvents():
    eventIds = [aevent["_id"] for aevent in core.query(schema.allEvents)]
    [event.delete(eventId) for eventId in eventIds]

def deleteDocs():
    deleteAllStreams()
    deleteAllPermissions()
    deleteAllShifts()
    deleteAllEvents()
