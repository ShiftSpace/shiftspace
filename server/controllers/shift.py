from server.utils.utils import *
from server.utils.errors import *
from server.utils.decorators import *
from server.utils.returnTypes import *
from server.models.shift import Shift
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

    @db_session
    @jsonencode
    def shifts(self, byHref=None, byDomain=None, byFollowing=False, byGroups=False, start=0, limit=25, count=False, filter=False, query=None):
        from server.models.ssuser import SSUser
        loggedInUser = helper.getLoggedInUser()
        if loggedInUser:
            theUser = SSUser.read(loggedInUser)
        else:
            theUser = None
        if query != None:
            query = json.loads(query)
        allShifts = Shift.shifts(user=theUser,
                                 byHref=byHref,
                                 byDomain=byDomain,
                                 byFollowing=byFollowing,
                                 byGroups=byGroups,
                                 start=start,
                                 limit=limit,
                                 filter=filter,
                                 query=query)
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
            id = loggedInUser
            theData['createdBy'] = id
            return data(Shift.create(theData))
        else:
            return error("No data for shift.", NoDataError)

    @jsonencode
    def read(self, id):
        from server.models.ssuser import SSUser
        loggedInUser = helper.getLoggedInUser()
        theUser = SSUser.read(loggedInUser)
        theShift = Shift.read(id, loggedInUser)
        if theShift and theUser.canRead(theShift):
            return data(theShift)
        else:
            if not theShift:
                return error("Resource does not exist.", ResourceDoesNotExistError)
            else:
                return error("Operation not permitted. You don't have permission to view this shift. %s" % theShift, PermissionError)

    @jsonencode
    @loggedin
    def update(self, id):
        from server.models.ssuser import SSUser
        loggedInUser = helper.getLoggedInUser()
        jsonData = helper.getRequestBody()
        if jsonData != "":
            theShift = Shift.read(id, loggedInUser)
            if not theShift:
                return error("Resource does not exist.", ResourceDoesNotExistError)
            if theShift.type != "shift":
                return error("Resource is not of type shift", ResourceTypeError)
            from server.models.ssuser import SSUser
            shiftData = json.loads(jsonData)
            theUser = SSUser.read(loggedInUser)
            if theUser.canModify(theShift):
                return data(theShift.update(shiftData))
            else:
                return error("Operation not permitted. You don't have permission to update this shift.", PermissionError)
        else:
            return error("No data for shift.", NoDataError)

    @jsonencode
    @loggedin
    def delete(self, id):
        from server.models.ssuser import SSUser
        loggedInUser = helper.getLoggedInUser()
        theShift = Shift.read(id, loggedInUser)
        if not theShift:
            return error("Resource does not exist.", ResourceDoesNotExistError)
        if theShift.type != "shift":
            return error("Resource is not of type shift", ResourceTypeError)
        from server.models.ssuser import SSUser
        theUser = SSUser.read(loggedInUser)
        if theUser.canModify(theShift):
            theShift.delete()
            return ack
        else:
            return error("Operation not permitted. You don't have permission to delete this shift.", PermissionError)

    @jsonencode
    @loggedin
    def publish(self, id):
        # NOTE: should maybe take publishData url parameter - David 9/5/2009
        loggedInUser = helper.getLoggedInUser()
        theShift = Shift.read(id, loggedInUser)
        if not theShift:
            return error("Resource does not exist.", ResourceDoesNotExistError)
        if theShift.type != "shift":
            return error("Resource is not of type shift", ResourceTypeError)
        publishData = json.loads(helper.getRequestBody())
        # convert targets to actual database references
        if publishData.get("targets"):
            from server.models.group import Group
            from server.models.ssuser import SSUser
            theUser = SSUser.read(loggedInUser)
            targets = publishData["targets"]
            # convert short names to group ids
            shortNames = [target[1:] for target in targets if target[0] == "&"]
            groupIds = Group.shortNamesToIds(shortNames)
            # convert user name to user ids
            userNames = [target[1:] for target in targets if target[0] == "@"]
            userIds = SSUser.namesToIds(userNames)
            # create list of dbs being published to
            dbs = [Group.db(groupId) for groupId in groupIds]
            # validate groups
            writeable = theUser.writeable()
            if not set(dbs).issubset(set(writeable)):
                return error("Operation not permitted. You don't have permission to publish to some of these groups", PermissionError)
            # TODO: validate against blocked users - David 2/15/10
            dbs.extend([SSUser.db(userId) for userId in userIds])
            publishData["dbs"] = dbs
        return data(theShift.publish(publishData))

    @jsonencode
    @loggedin
    def unpublish(self, id):
        loggedInUser = helper.getLoggedInUser()
        theShift = Shift.read(id, loggedInUser)
        if not theShift:
            return error("Resource does not exist.", ResourceDoesNotExistError)
        if theShift.type != "shift":
            return error("Resource is not of type shift", ResourceTypeError)
        return data(theShift.unpublish())

    @jsonencode
    @loggedin
    def favorite(self, id):
        loggedInUser = helper.getLoggedInUser()
        theShift = Shift.read(id)
        if not theShift:
            return error("Resource does not exist.", ResourceDoesNotExistError)
        if theShift.type != "shift":
            return error("Resource is not of type shift", ResourceTypeError)
        from server.models.ssuser import SSUser
        theUser = SSUser.read(loggedInUser)
        if theUser.canRead(theShift):
            return data(theUser.favorite(theShift))
        else:
            return error("Operation not permitted. You don't have permission to favorite this shift.", PermissionError)

    @jsonencode
    @loggedin
    def unfavorite(self, id):
        loggedInUser = helper.getLoggedInUser()
        theShift = Shift.read(id)
        if not theShift:
            return error("Resource does not exist.", ResourceDoesNotExistError)
        if theShift.type != "shift":
            return error("Resource is not of type shift", ResourceTypeError)
        from server.models.ssuser import SSUser
        theUser = SSUser.read(loggedInUser)
        if theUser.canRead(theShift):
            return data(theUser.unfavorite(theShift))
        else:
            return error("Operation not permitted. You don't have permission to unfavorite this shift.", PermissionError)

    @jsonencode
    def comments(self, id, start=None, end=None, limit=25):
        loggedInUser = helper.getLoggedInUser()
        theShift = Shift.read(id, userId=loggedInUser)
        if not theShift:
            return error("Resource does not exist.", ResourceDoesNotExistError)
        if theShift.type != "shift":
            return error("Resource is not of type shift", ResourceTypeError)
        from server.models.ssuser import SSUser
        theUser = SSUser.read(loggedInUser)
        if theShift.isPublic() or theUser.canRead(theShift):
            return data(theShift.comments(start=start, end=end, limit=limit))
        else:
            return error("Operation not permitted. You don't have permission to view comments on this shift.", PermissionError)

    @jsonencode
    @loggedin
    def comment(self, id):
        loggedInUser = helper.getLoggedInUser()
        jsonData = helper.getRequestBody()
        if jsonData != "":
            theShift = Shift.read(id, userId=loggedInUser)
            if not theShift:
                return error("Shift does not exist.", ResourceDoesNotExistError)
            if theShift.type != "shift":
                return error("Resource is not of type shift", ResourceTypeError)
            from server.models.ssuser import SSUser
            theUser = SSUser.read(loggedInUser)
            theData = json.loads(jsonData)
            if theUser.canRead(theShift):
                from server.models.comment import Comment
                Comment.create(theUser.id, theShift.id, theData["text"], theData.get("subscribe") or False)
                return data(Shift.read(theShift.id, theUser.id))
            else:
                return error("Operation not permitted. You don't have permission to comment on this shift.", PermissionError)
        else:
            return error("No data for comment.", NoDataError)

    @jsonencode
    @loggedin
    def notify(self, id):
        loggedInUser = helper.getLoggedInUser()
        theShift = Shift.read(id)
        if not theShift:
            return error("Resource does not exist.", ResourceDoesNotExistError)
        if theShift.type != "shift":
            return error("Resource is not of type shift", ResourceTypeError)
        from server.models.ssuser import SSUser
        theUser = SSUser.read(loggedInUser)
        if theUser.canRead(theShift):
            if not theUser.isSubscribed(theShift):
                theUser.subscribe(theShift)
                return ack
            else:
                return error("You are already getting notifications for this comment thread.", AlreadyBeingNotifiedError)
        else:
            return error("Operation not permitted. You don't have permission to be notified of events on this stream.", PermissionError)

    @jsonencode
    @loggedin
    def unnotify(self, id):
        loggedInUser = helper.getLoggedInUser()
        theShift = Shift.read(id)
        if not theShift:
            return error("Resource does not exist.", ResourceDoesNotExistError)
        if theShift.type != "shift":
            return error("Resource is not of type shift", ResourceTypeError)
        from server.models.ssuser import SSUser
        theUser = SSUser.read(loggedInUser)
        if theUser.canRead(theShift):
            if theUser.isSubscribed(theShift):
                theUser.unsubscribe(theShift)
                return ack
            else:
                return error("You are not getting notification from this comment thread.", NotBeingNotifiedError)
        else:
            return error("Operation not permitted. You don't have permission to be notified of events on this stream.", PermissionError)
