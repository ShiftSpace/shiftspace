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


class StreamController(ResourceController):
    def routes(self, d):
        d.connect(name="streamCreate", route="stream", controller=self, action="create",
                  conditions=dict(method="POST"))
        d.connect(name="streamRead", route="stream/:id", controller=self, action="read",
                  conditions=dict(method="GET"))
        d.connect(name="streamUpdate", route="stream/:id", controller=self, action="update",
                  conditions=dict(method="PUT"))
        d.connect(name="streamDelete", route="stream/:id", controller=self, action="delete",
                  conditions=dict(method="DELETE"))
        d.connect(name="streamSubscribe", route="stream/:id/subscribe", controller=self, action="subscribe",
                  conditions=dict(method="POST"))
        d.connect(name="streamUnsubscribe", route="stream/:id/unsubscribe", controller=self, action="unsubscribe",
                  conditions=dict(method="POST"))
        d.connect(name="streamSetPermission", route="stream/:id/permission", controller=self, action="setPermission",
                  conditions=dict(method="POST"))
        d.connect(name="streamPermissions", route="stream/:id/permissions", controller=self, action="permissions",
                  conditions=dict(method="GET"))
        d.connect(name="streamEvents", route="stream/:id/events", controller=self, action="events",
                  conditions=dict(method="GET"))
        d.connect(name="streamPost", route="stream/:id/post", controller=self, action="post",
                  conditions=dict(method="POST"))
        d.connect(name="streamAdd", route="stream/:id/add/:userName", controller=self, action="add",
                  conditions=dict(method="POST"))
        d.connect(name="streamRemove", route="stream/:id/remove/:userName", controller=self, action="remove",
                  conditions=dict(method="POST"))
        return d

    @jsonencode
    @loggedin
    def create(self):
        loggedInUser = helper.getLoggedInUser()
        jsonData = helper.getRequestBody()
        if jsonData != "":
            theData = json.loads(jsonData)
            theData['createdBy'] = loggedInUser.get("_id")
            return data(stream.create(theData))
        else:
            return error("No data for stream.", NoDataError)

    @jsonencode
    @exists
    @streamType
    def read(self, id):
        loggedInUser = helper.getLoggedInUser()
        if stream.canRead(id, loggedInUser["_id"]):
            return data(stream.read(id))
        else:
            return error("Operation not permitted. You don't have permission to view this stream.", PermissionError)

    @jsonencode
    @exists
    @streamType
    @loggedin
    def update(self, id):
        loggedInUser = helper.getLoggedInUser()
        if stream.canUpdate(id, loggedInUser["_id"]):
            data = helper.getRequestBody()
            return data(stream.update(data))
        else:
            return error("Operation not permitted. You don't have permission to update this stream", PermissionError)

    @jsonencode
    @exists
    @streamType
    @loggedin
    def delete(self, id):
        loggedInUser = helper.getLoggedInUser()
        if stream.canDelete(id, loggedInUser["_id"]):
            stream.delete(id)
            return ack
        else:
            return error("Operation not permitted. You don't have permission to delete this stream.", PermissionError)

    @jsonencode
    @exists
    @streamType
    @loggedin
    def subscribe(self, id):
        loggedInUser = helper.getLoggedInUser()
        if stream.canSubscribe(id, loggedInUser["_id"]):
            if user.isSubscribed(loggedInUser["_id"], id):
                return error("You are already subscribed to that stream.", AlreadySubscribedError)
            else:
                stream.subscribe(id, loggedInUser["_id"])
                return ack
        else:
            return error("Operation not permitted. You don't have permission to subscribe to this stream.", PermissionError)

    @jsonencode
    @exists
    @streamType
    @loggedin
    def unsubscribe(self, id):
        loggedInUser = helper.getLoggedInUser()
        if user.isSubscribed(id):
            stream.unsubscribe(id, loggedInUser["_id"])
            return ack
        else:
            return error("You are not subscribed to that stream.", NotSubscribedError)

    @jsonencode
    @exists
    @streamType
    @loggedin
    def add(self, id, userName):
        loggedInUser = helper.getLoggedInUser()
        if stream.canAdmin(id, loggedInUser["_id"]):
            otherId = user.idForName(userName)
            if user.isSubscribed(otherId, id):
                return error("User %s is already subscribed to that stream." % userName, AlreadySubscribedError)
            else:
                stream.invite(id, loggedInUser["_id"], otherId)
                return ack
        else:
            return error("Operation not permitted. You don't have permission to subscribe to this stream.", PermissionError)

    @jsonencode
    def remove(self, id, userName):
        return "remove %s from %s" % (userName, id)

    @jsonencode
    @exists
    @streamType
    @loggedin
    def post(self, id):
        loggedInUser = helper.getLoggedInUser()
        if stream.canPost(id, loggedInUser["_id"]):
            jsonData = helper.getRequestBody()
            if jsonData != "":
                theData = json.loads(jsonData)
                theData["streamId"] = id
                theData["createdBy"] = loggedInUser["_id"]
                if stream.canPost(id, loggedInUser["_id"]):
                    return data(event.create(theData))
            else:
                return error("No data for event.", NoDataError)
        else:
            return error("Operation not permitted. You don't have permission to post to this stream.", PermissionError)

    @jsonencode
    @exists
    @streamType
    @loggedin
    def events(self, id):
        loggedInUser = helper.getLoggedInUser()
        if stream.canRead(id, loggedInUser["_id"]):
            return data(event.eventsForStream(id))
        else:
            return error("Operation not permitted. You don't have permission to view events on this stream.", PermissionError)

    @jsonencode
    @exists
    @streamType
    @loggedin
    def permissions(self, id):
        loggedInUser = helper.getLoggedInUser()
        if stream.canAdmin(id, loggedInUser["_id"]):
            return data(permission.permissionsForStream(id))
        else:
            return error("Operation not permitted. You don't have permission to view permssions on this stream.", PermissionError)

    @jsonencode
    @exists
    @streamType
    @loggedin
    def setPermission(self, id, userName, level):
        loggedInUser = helper.getLoggedInUser()
        if stream.canAdmin(id, loggedInUser["_id"]):
            permission.updateForUser(user.idForName(userName), id, level)
            return ack
        else:
            return error("Operation not permitted. You don't have permission to view permssions on this stream.", PermissionError)
