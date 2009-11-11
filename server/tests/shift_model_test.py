import unittest
import datetime
import server.models.core as core
from server.models.shiftschema import *
from server.models.ssuserschema import *


fakeMary = {
    "userName": "fakemary",
    "fullName": {
        "first":"Fake",
        "last": "Mary"
        },
    "email": "info@shiftspace.org",
    "displayName": "fakemary"
}


def shiftJson():
    return {
        "source": {
            "server":"http://localhost:5984/",
            "database":"shiftspace"
            },
        "href": "http://google.com/images",
        "space": {
            "name":"Notes",
            "version": "0.1"
            }
        }

class BasicOperations(unittest.TestCase):
    def setUp(self):
        db = core.connect()
        self.tempUser = SSUser.create(fakeMary)

    def testCreate(self):
        json = shiftJson()
        theShift = Shift.create(self.tempUser.id, json)
        self.assertEqual(theShift.type, "shift")
        self.assertEqual(theShift.createdBy, self.tempUser.id)
        self.assertNotEqual(theShift.created, None)
        self.assertEqual(type(theShift.created), datetime)
        self.assertNotEqual(theShift.modified, None)
        self.assertEqual(type(theShift.modified), datetime)
        self.assertEqual(theShift.domain, "http://google.com")
        db = core.connect(SSUser.private(self.tempUser.id))
        del db[theShift.id]

    def testRead(self):
        json = shiftJson()
        newShift = Shift.create(self.tempUser.id, json)
        theShift = Shift.read(self.tempUser.id, newShift.id)
        self.assertEqual(theShift.source.server, newShift.source.server)
        self.assertEqual(theShift.source.database, newShift.source.database)
        self.assertEqual(theShift.createdBy, self.tempUser.id)
        db = core.connect(SSUser.private(self.tempUser.id))
        del db[theShift.id]

    def testUpdate(self):
        json = shiftJson()
        newShift = Shift.create(self.tempUser.id, json)
        Shift.update(self.tempUser.id, newShift.id, {"summary":"changed!"})
        theShift = Shift.read(self.tempUser.id, newShift.id)
        self.assertEqual(theShift.summary, "changed!")

    def testDelete(self):
        json = shiftJson()
        newShift = Shift.create(self.tempUser.id, json)
        Shift.delete(self.tempUser.id, newShift.id)
        theShift = Shift.read(self.tempUser.id, newShift.id)
        self.assertEqual(theShift, None)

    def testJoinData(self):
        json = shiftJson()
        newShift = Shift.create(self.tempUser.id, json)
        self.assertNotEqual(newShift["gravatar"], None)

    def tearDown(self):
        db = core.connect()
        SSUser.delete(self.tempUser.userName)


if __name__ == "__main__":
    unittest.main()
