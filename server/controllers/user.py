from server.utils.utils import *
from server.utils.errors import *
from server.utils.decorators import *
from server.utils.returnTypes import *
from server.models import user
from server.models import shift
from server.models import stream
from server.models import event
from server.models import permission
from server.models.ssuserschema import SSUser
from resource import *


class UserController(ResourceController):
    def routes(self, d):
        d.connect(name="userLogin", route="login", controller=self, action="login",
                  conditions=dict(method="POST"))
        d.connect(name="userLogout", route="logout", controller=self, action="logout",
                  conditions=dict(method="POST"))
        d.connect(name="userQuery", route="query", controller=self, action="query",
                  conditions=dict(method="GET"))
        d.connect(name="userJoin", route="join", controller=self, action="join",
                  conditions=dict(method="POST"))
        d.connect(name="userRead", route="user/:userName", controller=self, action="read",
                  conditions=dict(method="GET"))
        d.connect(name="userUpdate", route="user/:userName", controller=self, action="update",
                  conditions=dict(method="PUT"))
        d.connect(name="userDelete", route="user/:userName", controller=self, action="delete",
                  conditions=dict(method="DELETE"))
        d.connect(name="userMessages", route="user/:userName/messages", controller=self, action="messages",
                  conditions=dict(method="GET"))
        d.connect(name="userFeeds", route="user/:userName/feeds", controller=self, action="feeds",
                  conditions=dict(method="GET"))
        d.connect(name="userShifts", route="user/:userName/shifts", controller=self, action="shifts",
                  conditions=dict(method="GET"))
        d.connect(name="userFavorites", route="user/:userName/favorites", controller=self, action="favorites",
                  conditions=dict(method="GET"))
        d.connect(name="userComments", route="user/:userName/comments", controller=self, action="comments",
                  conditions=dict(method="GET"))
        d.connect(name="userFollow", route="follow/:userName", controller=self, action="follow",
                  conditions=dict(method="POST"))
        d.connect(name="userUnfollow", route="unfollow/:userName", controller=self, action="unfollow",
                  conditions=dict(method="POST"))
        return d

    def primaryKey(self):
        return "userName"

    def resolveResource(self, userName):
        theUser = SSUser.readByName(userName)
        return (theUser and theUser.id)

    def resourceDoesNotExistString(self, userName):
        return "User %s does not exist" % userName
    
    def resourceDoesNotExistType(self):
        return UserDoesNotExistError

    def isValid(self, data):
        if not data.get("email"):
            return (False, "Please specify your email address.", NoEmailError)
        userName = data.get("userName")
        if not userName:
            return (False, "Please enter a user name.", MissingUserNameError)
        if len(userName) < 6:
            return (False, "Your user name should be at least 6 characters long.", ShortUserNameError)
        if not SSUser.uniqueName(userName):
            return (False, "That user name is taken, please choose another.", UserNameAlreadyExistsError)
        if not data.get("password"):
            return (False, "Please supply a password.", MissingPasswordError)
        if not data.get("passwordVerify"):
            return (False, "Please enter your password twice.", MissingPasswordVerifyError)
        if data.get("password") != data.get("passwordVerify"):
            return (False, "Passwords do not match.", PasswordMatchError)
        return (True, data, None)

    @jsonencode
    def join(self):
        loggedInUser = SSUser.read(helper.getLoggedInUser())
        if loggedInUser:
            return error("You are logged in. You cannot create an account.", AlreadyLoggedInError)
        theData = json.loads(helper.getRequestBody())
        valid, msg, errType = self.isValid(theData)
        result = None
        if valid:
            theUser = SSUser.create(theData)
            helper.setLoggedInUser(theUser.id)
            return data(theUser.toDict())
        else:
            return error(msg, errType)

    @jsonencode
    @exists
    def read(self, userName):
        theUser = SSUser.readByName(userName):
        if not theUser:
            return error("User %s does not exist" % userName, UserDoesNotExistError)
        loggedInUser = SSUser.read(helper.getLoggedInUser())
        canReadFull = loggedInUser.canReadFull(theUser)
        return data(theUser.toDict((loggedInUser and canReadFull)))

    @jsonencode
    @exists
    @loggedin
    def update(self, userName):
        theUser = SSUser.readByName(userName)
        if not theUser:
            return error("User %s does not exist" % userName, UserDoesNotExistError)
        loggedInUser = SSUser.read(helper.getLoggedInUser())
        if loggedInUser and loggedInUser.canModify(theUser):
            theData = json.loads(helper.getRequestBody())
            return data(theUser.update(theData).toDict())
        else:
            return error("Operation not permitted. You don't have permission to update this account.")

    @jsonencode
    @exists
    @loggedin
    def delete(self, userName):
        theUser = SSUser.readByName(userName)
        if not theUser
            return error("User %s does not exist" % userName, UserDoesNotExistError)
        loggedInUser = SSUser.read(helper.getLoggedInUser())
        if loggedInUser and loggedInUser.canModify(theUser):
            if theUser.id == loggedInUser.id:
                helper.setLoggedInUser(None)
            theUser.delete()
            return ack
        else:
            return error("Operation not permitted. You don't have permission to delete this account.")

    @jsonencode
    def query(self):
        loggedInUser = helper.getLoggedInUser()
        if loggedInUser:
            return data(SSLoad.read(loggedInUser).toDict())
        else:
            return message("No logged in user.")

    @jsonencode
    def login(self, userName, password):
        loggedInUser = helper.getLoggedInUser()
        if not loggedInUser:
            theUser = SSUser.readByName(userName)
            if not theUser:
                return error("Invalid user name.", InvalidUserNameError)
            if theUser and (theUser.password == md5hash(password)):
                helper.setLoggedInUser(theUser.id)
                theUser.updateLastSeen()
                return data(theUser.toDict())
            else:
                return error("Incorrect password.", IncorrectPasswordError)
        else:
            return error("Already logged in.", AlreadyLoggedInError)

    @jsonencode
    def logout(self):
        loggedInUser = helper.getLoggedInUser()
        if loggedInUser:
            theUser = SSUser.read(loggedInUser)
            theUser.updateLastSeen()
            helper.setLoggedInUser(None)
            return ack
        else:
            return error("No user logged in.", AlreadyLoggedOutError)

    @jsonencode
    @exists
    def resetPassword(self, userName):
        loggedInUser = helper.getLoggedInUser()
        if loggedInUser:
            # TODO: generate random 8 character password update user and email
            return ack
        else:
            return error("No user logged in.", UserNotLoggedInError)

    @jsonencode
    @exists
    @loggedin
    def follow(self, userName):
        theUser = SSUser.read(helper.getLoggedInUser())
        followed = SSUser.readByName(userName)
        if theUser.id == followed.id:
            return error("You cannot follow yourself.", FollowError)
        else:
            theUser.follow(followed)
            return ack

    @jsonencode
    @exists
    @loggedin
    def unfollow(self, userName):
        theUser = SSUser.read(helper.getLoggedInUser())
        followed = user.idForName(userName)
        if theUser.id == followed.id:
            return error("You cannot unfollow yourself.", FollowError)
        else:
            theUser.unfollow(followed)
            return ack

    @jsonencode
    @exists
    @loggedin
    def messages(self, userName, start=None, end=None, limit=25):
        loggedInUser = SSUser.read(helper.getLoggedInUser())
        theUser = SSUser.readByName(userName)
        if loggedInUser.id == theUser.id or loggedInUser.isAdmin():
            return data(theUser.messages(start=start, end=end, limit=limit))
        else:
            return error("You do not have permission to view this user's messages.", PermissionError)

    @jsonencode
    @exists
    @loggedin
    def shifts(self, userName, start=None, end=None, limit=25):
        loggedInUser = helper.getLoggedInUser()
        theUser = SSUser.readByName(userName)
        if loggedInUser.id == theUser.id or loggedInUser.isAdmin():
            return data(theUser.shifts(start=start, end=end, limit=limit))
        else:
            return error("You don't have permission to view this user's shifts.", PermissionError)

    @jsonencode
    @exists
    @loggedin
    def favorites(self, userName, start=None, end=None, limit=25):
        loggedInUser = helper.getLoggedInUser()
        theUser = SSUser.readByName(userName)
        if loggedInUser.id == theUser.id or loggedInUser.isAdmin():
            return data(theUser.favorites(start=start, end=end, limit=limit))
        else:
            return error("You don't have permission to view this user's favorite shifts.", PermissionError)

    @jsonencode
    @exists
    @loggedin
    def comments(self, userName, start=None, end=None, limit=25):
        loggedInUser = helper.getLoggedInUser()
        theUser = SSUser.readByName(userName)
        if loggedInUser.id == theUser.id or loggedInUser.isAdmin()
            return data(theUser.comments(userId, start=start, end=end, limit=limit))
        else:
            return error("You don't have permission to view this user's comments.", PermissionError)
