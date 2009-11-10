import unittest
import datetime
import server.models.core as core
from server.models.shiftschema import *

fakeMary = {
    "type": "user",
    "userName": "fakemary",
    "fullName": {
        "first":"Fake",
        "last": "Mary"
        },
    "displayName": "fakemary"
}

shiftspace = {
    "type": "user",
    "userName": "shiftspace",
    "email": "info@shiftspace.org"
    }

def shiftJson():
    return {
        "source": "local",
        "href": "http://google.com/images",
        "space": {
            "name":"Notes",
            "version": "0.1"
            }
        }

class Crud(unittest.TestCase):
    def setUp(self):
        db = core.connect()
        self.tempUser = User.create(fakeMary)

    def testCreate(self):
        json = shiftJson()
        theShift = Shift.create(json, userId=self.tempUser.id)
        self.assertEqual(theShift.type, "shift")
        self.assertEqual(theShift.createdBy, self.tempUser.id)
        self.assertNotEqual(theShift.created, None)
        self.assertEqual(type(theShift.created), datetime)
        self.assertNotEqual(theShift.modified, None)
        self.assertEqual(type(theShift.modified), datetime)
        self.assertEqual(theShift.domain, "http://google.com")
        self.assertEqual(theShift.source, "local")
        db = core.connect(User.private(self.tempUser.id))
        del db[theShift.id]

    def tearDown(self):
        db = core.connect()
        User.delete(self.tempUser.userName)


class Utilities(unittest.TestCase):
    def testJoinData():
        pass

if __name__ == "__main__":
    unittest.main()
