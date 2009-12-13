import server.utils.utils as utils
from server.utils.errors import *
from server.utils.decorators import *
from server.utils.returnTypes import *
from resource import *

from server.models.message import Message


class MessageController(ResourceController):
    def routes(self, id):
        d.connect(name="messageCreate", route="message", controller=self, action="create",
                  conditions=dict(method="POST"))
        d.connect(name="messageRead", route="message/:id/read", controller=self, action="markRead",
                  conditions=dict(method="POST"))
        d.connect(name="messageRead", route="message/:id/unread", controller=self, action="markUnread",
                  conditions=dict(method="POST"))

    @jsonencode
    @loggedin
    def create(self):
        pass

    @jsonencode
    @loggedin
    def delete(self):
        pass

    @jsonencode
    @exists
    @loggedin
    def markRead(self, id):
        pass

    @jsonencode
    @exists
    @loggedin
    def markUnread(self, id):
        pass
