from server.utils.utils import *
from server.utils.errors import *
from server.utils.decorators import *
from server.utils.returnTypes import *
from resource import *


class GroupsController(ResourceController):
    def routes(self, d):
        d.connect(name="groupCreate", route="group", controller=self, action="create",
                  conditions=dict(method="POST"))
        d.connect(name="groupRead", route="group/:id", controller=self, action="read",
                  conditions=dict(method="GET"))
        return d

    @jsonencode
    @loggedin
    def create(self):
        from server.models.group import Group
        loggedInUser = helper.getLoggedInUser()
        jsonData = helper.getRequestBody()
        if jsonData != "":
            theData = json.loads(jsonData)
            theData['createdBy'] = loggedInUser
            return data(Group.create(theData).toDict())
        else:
            return error("No data for group.", NoDataError)
        pass

    @jsonencode
    def read(self, id):
        # return only public groups
        return data(groups.inGroup(int(id)))

    @jsonencode
    def update(self, id):
        pass
