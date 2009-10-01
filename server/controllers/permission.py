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


class PermissionController(ResourceController):
    def routes(self, d):
        d.connect(name="permissionCreate", route="permission", controller=self, action="create",
                  conditions=dict(method="POST"))
        d.connect(name="permissionRead", route="permission/:id", controller=self, action="read",
                  conditions=dict(method="GET"))
        d.connect(name="permissionUpdate", route="permission/:id", controller=self, action="update",
                  conditions=dict(method="PUT"))
        d.connect(name="permissionDelete", route="permission/:id", controller=self, action="read",
                  conditions=dict(method="DELETE"))
        return d

    @jsonencode
    @loggedin
    def create(self):
        loggedInUser = helper.getLoggedInUser()
        jsonData = helper.getRequestBody()
        if jsonData != "":
            theData = json.loads(jsonData)
            streamId = theData["streamId"]
            if not streamId:
                return error("You did not specify a stream to create a permission for", CreatePermissionError)
            if stream.canAdmin(streamId, loggedInUser["_id"]):
                return data(permission.create(theData))
        else:
            return error("No data for permission.", NoDataError)

    @jsonencode
    @exists
    @permissionType
    @loggedin    
    def read(self, id):
        loggedInUser = helper.getLoggedInUser()
        if permission.canRead(id, loggedInUser["_id"]):
            return data(permission.read(id))
        else:
            return error("Operation not permitted. You don't have permission to view this permission.", PermissionError)

    @jsonencode
    @exists
    @permissionType
    @loggedin
    def update(self, id):
        loggedInUser = helper.getLoggedInUser()
        if loggedInUser and permission.canUpdate(id, loggedInUser["_id"]):
            data = helper.getRequestBody()
            return data(permission.update(data))
        else:
            return error("Operation not permitted. You don't have permission to update this permission.", PermissionError)

    @jsonencode
    @exists
    @permissionType
    @loggedin
    def delete(self, id):
        loggedInUser = helper.getLoggedInUser()
        if loggedInUser and permission.canDelete(id, loggedInUser["_id"]):
            permission.delete(id)
            return ack
        else:
            return error("Operation not permitted. You don't have permission to delete this permission.", PermissionError)
