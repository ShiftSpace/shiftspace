from server.utils.utils import *
from server.utils.errors import *
from server.utils.decorators import *
from server.utils.returnTypes import *
from server.models import user
from server.models import shift
from server.models import stream
from server.models import event
from server.models import permission
from resource import *


class ShiftController(ResourceController):
    def routes(self, d):
        d.connect(name="shiftCreate", route="shift", controller=self, action="create",
                  conditions=dict(method="POST"))
        d.connect(name="shiftRead", route="shift/:id", controller=self, action="read",
                  conditions=dict(method="GET"))
        d.connect(name="shiftUpdate", route="shift/:id", controller=self, action="update",
                  conditions=dict(method="PUT"))
        d.connect(name="shiftDelete", route="shift/:id", controller=self, action="delete",
                  conditions=dict(method="DELETE"))
        d.connect(name="shiftPublish", route="shift/:id/publish", controller=self, action="publish",
                  conditions=dict(method="POST"))
        d.connect(name="shiftUnpublish", route="shift/:id/unpublish", controller=self, action="unpublish",
                  conditions=dict(method="POST"))
        d.connect(name="shiftFavorite", route="shift/:id/favorite", controller=self, action="favorite",
                  conditions=dict(method="POST"))
        d.connect(name="shiftUnfavorite", route="shift/:id/unfavorite", controller=self, action="unfavorite",
                  conditions=dict(method="POST"))
        d.connect(name="shiftComments", route="shift/:id/comments", controller=self, action="comments",
                  conditions=dict(method="GET"))
        d.connect(name="shiftComment", route="shift/:id/comment", controller=self, action="comment",
                  conditions=dict(method="POST"))
        d.connect(name="shiftNotify", route="shift/:id/notify", controller=self, action="notify",
                  conditions=dict(method="POST"))
        d.connect(name="shiftUnnotify", route="shift/:id/unnotify", controller=self, action="unnotify",
                  conditions=dict(method="POST"))
        d.connect(name="shifts", route="shifts", controller=self, action="shifts",
                  conditions=dict(method="GET"))
        d.connect(name="shiftsCount", route="shifts/count", controller=self, action="count",
                  conditions=dict(method="GET"))
        return d

    def count(self, byHref, byDomain=None, byFollowing=False, byGroups=False):
        return self.shifts(byHref=byHref, 
                           byDomain=byDomain, 
                           byFollowing=byFollowing, 
                           byGroups=byGroups, 
                           count=True)

    @jsonencode
    def shifts(self, byHref, byDomain=None, byFollowing=False, byGroups=False, start=0, limit=25, count=False):
        loggedInUser = helper.getLoggedInUser()
        userId = None
        if loggedInUser:
            userId = loggedInUser.get("_id")
        allShifts = shift.shifts(byHref=byHref,
                                 userId=userId,
                                 byFollowing=byFollowing,
                                 byGroups=byGroups,
                                 start=start,
                                 limit=limit)
        if count:
          return data(len(allShifts))
        else:
          return data(allShifts)

    @jsonencode
    @loggedin
    def create(self):
        loggedInUser = helper.getLoggedInUser()
        jsonData = helper.getRequestBody()
        if jsonData != "":
            theData = json.loads(jsonData)
            id = loggedInUser.get("_id")
            theData['createdBy'] = id
            theData['userName'] = user.nameForId(id)
            return data(shift.create(theData))
        else:
            return error("No data for shift.", NoDataError)

    @jsonencode
    @exists
    @shiftType
    def read(self, id):
        allowed = shift.isPublic(id)
        if not allowed:
            loggedInUser = helper.getLoggedInUser()
            if loggedInUser and shift.canRead(id, loggedInUser.get("_id")):
                return data(shift.read(id))
            else:
                return error("Operation not permitted. You don't have permission to view this shift.", PermissionError)
        else:
            return data(shift.read(id))

    @jsonencode
    @exists
    @shiftType
    @loggedin
    def update(self, id):
        loggedInUser = helper.getLoggedInUser()
        jsonData = helper.getRequestBody()
        if jsonData != "":
            shiftData = json.loads(jsonData)
            if shift.canUpdate(id, loggedInUser['_id']):
                return data(shift.update(id, shiftData))
            else:
                return error("Operation not permitted. You don't have permission to update this shift.", PermissionError)
        else:
            return error("No data for shift.", NoDataError)

    @jsonencode
    @exists
    @shiftType
    @loggedin
    def delete(self, id):
        loggedInUser = helper.getLoggedInUser()
        theShift = shift.read(id)
        if loggedInUser and shift.canDelete(id, loggedInUser['_id']):
            shift.delete(id)
            return ack
        else:
            return error("Operation not permitted. You don't have permission to delete this shift.", PermissionError)

    @jsonencode
    @exists
    @shiftType
    @loggedin
    def publish(self, id):
        # NOTE: should maybe take publishData url parameter - David 9/5/2009
        loggedInUser = helper.getLoggedInUser()
        publishData = json.loads(helper.getRequestBody())
        theShift = shift.read(id)
        if loggedInUser and shift.canPublish(id, loggedInUser['_id']):
            return data(shift.publish(id, publishData))
        else:
            return error("Operation not permitted. You don't have permission to publish this shift.", PermissionError)

    @jsonencode
    @exists
    @shiftType
    @loggedin
    def unpublish(self, id):
        loggedInUser = helper.getLoggedInUser()
        theShift = shift.read(id)
        if loggedInUser and shift.canUnpublish(id, loggedInUser['_id']):
            return data(shift.unpublish(id))
        else:
            return error("Operation not permitted. You don't have permission to publish this shift.", PermissionError)


    @jsonencode
    @exists
    @shiftType
    def favorite(self, id):
        loggedInUser = helper.getLoggedInUser()
        loggedInId = loggedInUser["_id"]
        if shift.isPublic(id) or (shift.canRead(id, loggedInId)):
            return data(shift.favorite(id, loggedInId))
        else:
            return error("Operation not permitted. You don't have permission to favorite this shift.", PermissionError)

    @jsonencode
    @exists
    @shiftType
    def unfavorite(self, id):
        loggedInUser = helper.getLoggedInUser()
        loggedInId = loggedInUser["_id"]
        if shift.isPublic(id) or (shift.canRead(id, loggedInId)):
            return data(shift.unfavorite(id, loggedInId))
        else:
            return error("Operation not permitted. You don't have permission to unfavorite this shift.", PermissionError)

    @jsonencode
    @exists
    @shiftType
    def comments(self, id):
        loggedInUser = helper.getLoggedInUser()
        if shift.isPublic(id) or (shift.canRead(id, loggedInUser["_id"])):
            return data(event.eventsForStream(shift.commentStream(id)))
        else:
            return error("Operation not permitted. You don't have permission to view comments on this shift.", PermissionError)

    @jsonencode
    @exists
    @shiftType
    @loggedin
    def comment(self, id):
        loggedInUser = helper.getLoggedInUser()
        jsonData = helper.getRequestBody()
        if jsonData != "":
            theData = json.loads(jsonData)
            if shift.canComment(id, loggedInUser["_id"]):
                theUser = user.readById(loggedInUser["_id"])
                theShift = shift.read(id)
                event.create({
                        "meta": "comment",
                        "objectRef": "shift:%s" % id,
                        "streamId": shift.commentStream(id),
                        "displayString": "%s just commented on your %s on %s" % (theUser["userName"], theShift["space"]["name"], theShift["href"]),
                        "createdBy": loggedInUser["_id"],
                        "content": {
                            "href": theShift["href"],
                            "domain": theShift["domain"],
                            "text": theData["text"]
                            }
                        })
                return ack
            else:
                return error("Operation not permitted. You don't have permission to comment on this shift.", PermissionError)
        else:
            return error("No data for comment.", NoDataError)

    @jsonencode
    @exists
    @shiftType
    @loggedin
    def notify(self, id):
        loggedInUser = helper.getLoggedInUser()
        userId = loggedInUser["_id"]
        if shift.canRead(id, userId):
            if (not shift.commentStream(id) in user.readById(userId)["notify"]):
                user.addNotification(userId, shift.commentStream(id))
                return ack
            else:
                return error("You are already getting notification from this stream", AlreadyBeingNotifiedError)
        else:
            return error("Operation not permitted. You don't have permission to be notified of events on this stream.", PermissionError)

    @jsonencode
    @exists
    @shiftType
    @loggedin
    def unnotify(self, id):
        loggedInUser = helper.getLoggedInUser()
        userId = loggedInUser["_id"]
        if shift.commentStream(id) in user.readById(userId)["notify"]:
            user.removeNotification(userId, id)
            return ack
        else:
            return error("You are not getting notification from this stream.", NotBeingNotifiedError)
