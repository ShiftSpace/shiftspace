from datetime import datetime
from couchdb.schema import *
from couchdb.schema import View

from ssdocschema import SSDocument

from server.utils.decorators import *
import server.utils.utils as utils
import core


class ShiftError(Exception): pass
class NoAuthorError(ShiftError): pass


@simple_decorator
def joindecorator(func):
    def afn(*args, **kwargs):
        return Shift.joinData(func(*args, **kwargs), userId=kwargs.get("userId"))
    return afn


class Shift(SSDocument):
    """
    The Shift document. A shift is a piece of JSON data used
    by spaces (applications) to recreate a user's modification
    to a page. Refer to the API specification for more detailed
    imformation about the usage of different fields.
    """

    # ========================================
    # Fields
    # ========================================

    type = TextField(default="shift")
    source = TextField()
    createdBy = TextField()
    userName = TextField()
    href = TextField()
    domain = TextField()
    space = DictField(Schema.build(
            name = TextField(),
            version = TextField()
            ))
    summary = TextField()
    created = DateTimeField(default=datetime.now())
    modified = DateTimeField(default=datetime.now())
    broken = BooleanField(default=False)
    commentStream = TextField()
    publishData = DictField(Schema.build(
            draft = BooleanField(default=True),
            private = BooleanField(default=True),
            publishTime = DateTimeField(),
            streams = ListField(TextField())
            ))
    content = DictField()    
            
    # ========================================
    # Views
    # ========================================

    all = View("shifts",
               "function (doc) {            \
                  if(doc.type == 'shift') { \
                    emit(doc._id, doc);     \
                  }                         \
                }")

    by_domain = View("shifts",
                     "function (doc) {             \
                        if(doc.type == 'shift') {  \
                          emit(doc.domain, doc);   \
                        }                          \
                      }")

    by_href = View("shifts",
                   "function(doc) {                \
                      if(doc.type == 'shift') {    \
                        emit(doc.href, doc);       \
                      }                            \
                    }")

    # ========================================
    # CRUD
    # ========================================

    @classmethod
    def joinData(cls, shifts, userId=None):
        """
        Relatively quick data join function. Makes use
        of multidocument fetch.
        
        Parameters:
          shifts - a single shift or a list of shifts.
          userId - a user id.
        """
        print "%s %s %s" % (cls, shifts, userId)
        single = False
        if type(shifts) != list:
            single = True
            shifts = [shifts]
        ids = [shift['_id'] for shift in shifts]
        favIds = ["favorite:%s:%s" % (userId, shiftId) for shiftId in ids]

        isFavorited = [(favorite and True) for favorite in core.fetch(keys=favIds)]

        favd = toDict(core.fetch(view=schema.favoritesByShift, keys=ids, reduce=True))
        favCounts = [(favd.get(aid) or 0) for aid in ids]

        ccd = toDict(core.fetch(view=schema.countByShift, keys=ids, reduce=True))
        commentCounts = [(ccd.get(aid) or 0) for aid in ids]

        userIds = [shift['createdBy'] for shift in shifts]
        gravatars = [user["gravatar"] for user in core.fetch(view=schema.allUsers, keys=userIds)]

        for i in range(len(shifts)):
            shifts[i]["favorite"] = isFavorited[i]
            shifts[i]["favoriteCount"] = favCounts[i]
            shifts[i]["commentCount"] = commentCounts[i]
            shifts[i]["gravatar"] = gravatars[i]

        if single:
            return shifts[0]
        else:
            return shifts

    @classmethod
    def create(cls, shiftJson):
        """
        Create a shift in the database.
        Parameters:
            shiftJson - the new data for the shift.
        Returns:
            The id of the new shift (string).
        """
        db = core.connect()
        newShift = Shift(**shiftJson)
        newShift.domain = utils.domain(shiftJson["href"])
        newShift.store(db)
        return Shift.joinData(newShift, newShift.createdBy)

    @classmethod
    def read(cls, id):
        """
        Get a specific shift.
        Parameters:
            id - a shift id.
        Returns:
            a dictionary of the shift's data.
        """
        db = core.connect()
        theShift = Shift.load(db, id)
        return Shift.joinData(theShift, theShift.createdBy)

    @classmethod
    def update(cls, id, fields):
        """
        Class method for updating a shift.
        
        Parameters:
          id - the id of the shift
          fields - the fields to update. Allowed fields are
            summary, broken, and content.
        """
        db = core.connect()
        theShift = Shift.load(db, id)
        if newdoc.get("summary"):
            theShift.summary = theShift.content["summary"] = newdoc.get("summary")
        if newdoc.get("broken"):
            theShift.broken = newdoc.get("broken")
        if newdoc.get("content"):
            theShift.content = newdoc.get("content")
        theShift.modified = datetime.now()
        theShift.store(db)
        return Shift.joinData(theShift, newShift.createdBy)

    @classmethod
    def delete(cls, id):
        """
        Delete a shift from the database.
        Parameters:
            id - a shift id.
        """
        db = core.connect()
        del db[id]

    # ========================================
    # Instance Methods
    # ========================================

    def toDict(self):
        """
        Convenience for turning Document into a dictionary.
        """
        dict(self.items())

    # ========================================
    # Validation
    # ========================================

    @classmethod
    def canUpdate(cls, id, userId):
        """
        Check if a user can read a shift. The user must have
        either:
            1. Created the shift
            2. The shift must be published and public
            3. If the user is subscribed to a stream the shift is on.
            4. If the shift is published to the user's private stream.
        Parameters:
            id - a shift id.
        Returns:
            bool.
        """
        db = core.connect()
        theShift = Shift.load(id)
        if User.isAdmin(userId):
            return True
        if theShift.createdBy == userId:
            return True
        if theShift.publishData.draft:
            return False
        theUser = User.load(userId)
        if not theShift.publishData.private:
            return True
        if theUser.privateStream in theShift.publishData.streams:
            return True
        shiftStreams = theShift.publishData.streams
        readableStreams = Permission.readableStreams(userId)
        allowed = set(shiftStreams).intersection(readableStreams)
        return len(allowed) > 0

    @classmethod
    def canDelete(cls, id, userId):
        """
        Check where a user can update a shift.
        Parameters:
            id - a shift id.
            userId - a user id.
        Returns:
            bool.
        """
        db = core.connect()
        theShift = db[id]
        return User.isAdmin(userId) or (userId == theShift.createdBy)

    @classmethod
    def canPublish(cls, id, userId):
        pass

    @classmethod
    def canUnpublish(cls, id, userId):
        pass

    @classmethod
    def canComment(cls, id, userId):
        pass

    @classmethod
    def isPublic(cls, id):
        pass

    @classmethod
    def isPrivate(cls, id):
        pass

    # ========================================
    # Publishing
    # ========================================

    
    # ========================================
    # Comments
    # ========================================

    
    # ========================================
    # Favoriting
    # ========================================

    
    # ========================================
    # Lists & Filtering
    # ========================================
