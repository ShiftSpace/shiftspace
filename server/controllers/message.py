import server.utils.utils as utils
from server.utils.errors import *
from server.utils.decorators import *
from server.utils.returnTypes import *
from resource import *

from server.models.message import Message


class MessageController(ResourceController):
    def routes(self, d):
        d.connect(name="messageCreate", route="message", controller=self, action="create",
                  conditions=dict(method="POST"))
        d.connect(name="messageRead", route="message/:id", controller=self, action="read",
                  conditions=dict(method="GET"))
        d.connect(name="messageMarkRead", route="message/:id/read", controller=self, action="markRead",
                  conditions=dict(method="POST"))
        d.connect(name="messageMarkUnread", route="message/:id/unread", controller=self, action="markUnread",
                  conditions=dict(method="POST"))

    @db_session
    @jsonencode
    @loggedin
    def create(self):
        pass

    @db_session
    @jsonencode
    @loggedin
    def read(self, id):
        from server.models.ssuser import SSUser
        theMessage = Message.read(id, loggedInUser)
        if theMessage and theMessage.toId == loggedInUser:
            return data(theMessage)
        else:
            return error("Operation not permitted. You don't have permission to read this message.", PermissionError)

    @db_session
    @jsonencode
    @loggedin
    def delete(self):
        pass

    @db_session
    @jsonencode
    @loggedin
    def markRead(self, id):
        loggedInUser = helper.getLoggedInUser()
        theMessage = Message.read(id, userId=loggedInUser)
        if theMessage != None:
            theMessage.markRead(True)
            return data(Message.read(id, loggedInUser))
        else:
            return error("Operation not permitted. You don't have permission to mark that message", PermissionError)

    @db_session
    @jsonencode
    @loggedin
    def markUnread(self, id):
        loggedInUser = helper.getLoggedInUser()
        theMessage = Message.read(id, userId=loggedInUser)
        if theMessage != None:
            theMessage.markRead(False)
            return data(Message.read(id, loggedInUser))
        else:
            return error("Operation not permitted. You don't have permission to mark that message", PermissionError)
