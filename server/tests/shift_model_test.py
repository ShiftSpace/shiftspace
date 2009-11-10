import unittest
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
        self.tempUser = db.create(fakeMary)

    def testCreate(self):
        json = shiftJson()
        json["createdBy"] = self.tempUser
        theShift = Shift.create(**json)
        self.assertEqual(theShift.type, "shift")
        self.assertEqual(theShift.createdBy, self.tempUser)
        self.assertNotEqual(theShift.created, None)
        self.assertNotEqual(type(theShift.created), datetime.datetime)
        self.assertNotEqual(theShift.modified, None)
        self.assertEqual(type(theShift.modified), datetime.datetime)

    def testUpdate(self):
        pass

    def testDelete(self):
        pass

    def tearDown(self):
        db = core.connect()
        del db[self.tempUser]


if __name__ == "main":
    unittest.main()
