import unittest
import datetime
import server.models.core as core

from server.models.shiftschema import *
from server.models.ssuserschema import *
from server.tests.dummy_data import *

fakemary = {
    "userName": "fakemary",
    "fullName": {
        "first":"Fake",
        "last": "Mary"
        },
    "email": "info@shiftspace.org",
    "displayName": "fakemary"
}

fakejohn = {
    "userName": "fakejohn",
    "fullName": {
        "first":"Fake",
        "last": "John"
        },
    "email": "info@shiftspace.org",
    "displayName": "fakejohn"
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
        self.fakemary = SSUser.create(fakemary).id
        self.fakejohn = SSUser.create(fakejohn).id
        self.root = SSUser.read("shiftspace").id

    def testCreate(self):
        json = shiftJson()
        theShift = Shift.create(self.fakemary, json)
        self.assertEqual(theShift.type, "shift")
        self.assertEqual(theShift.createdBy, self.fakemary)
        self.assertNotEqual(theShift.created, None)
        self.assertEqual(type(theShift.created), datetime)
        self.assertNotEqual(theShift.modified, None)
        self.assertEqual(type(theShift.modified), datetime)
        self.assertEqual(theShift.domain, "http://google.com")
        db = core.connect(SSUser.private(self.fakemary))
        del db[theShift.id]

    def testRead(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        theShift = Shift.read(self.fakemary, newShift.id)
        self.assertEqual(theShift.source.server, newShift.source.server)
        self.assertEqual(theShift.source.database, newShift.source.database)
        self.assertEqual(theShift.createdBy, self.fakemary)
        db = core.connect(SSUser.private(self.fakemary))
        del db[theShift.id]

    def testUpdate(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        Shift.update(self.fakemary, newShift.id, {"summary":"changed!"})
        theShift = Shift.read(self.fakemary, newShift.id)
        self.assertEqual(theShift.summary, "changed!")

    def testDelete(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        self.assertNotEqual(newShift, None)
        Shift.delete(self.fakemary, newShift.id)
        theShift = Shift.read(self.fakemary, newShift.id)
        self.assertEqual(theShift, None)
        newShift = Shift.create(self.fakemary, json)
        self.assertNotEqual(newShift, None)
        newShift.deleteInstance()
        theShift = Shift.read(self.fakemary, newShift.id)
        self.assertEqual(theShift, None)

    def testJoinData(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        self.assertNotEqual(newShift["gravatar"], None)

    def testCanModify(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        self.assertTrue(Shift.canModify(self.fakemary, newShift.id))
        self.assertTrue(not Shift.canModify(self.fakejohn, newShift.id))
        self.assertTrue(Shift.canModify(self.root, newShift.id))

    def testBasicPublish(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        Shift.publish(self.fakemary, newShift.id, {"private":False})
        theShift = Shift.load(core.connect(SSUser.public(self.fakemary)), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)
        theShift = Shift.load(core.connect(), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)
        theShift = Shift.load(core.connect(SSUser.private(self.fakemary)), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)

    def testPublishToUser(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        publishData = {
            "streams": [SSUser.inbox(self.fakejohn)]
            }
        Shift.publish(self.fakemary, newShift.id, publishData)
        theShift = Shift.load(core.connect(SSUser.inbox(self.fakejohn)), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)

    def testPublishToGroup(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        newGroup = Group.create(self.fakemary, groupJson())
        newPerm = Permission.create("shiftspace", newGroup.id, self.fakejohn, level=1)
        publishData = {
            "streams": [Group.db(newGroup.id)]
            }
        Shift.publish(self.fakemary, newShift.id, publishData)
        newGroup.deleteInstance()

    def tearDown(self):
        db = core.connect()
        SSUser.delete(self.fakemary)
        SSUser.delete(self.fakejohn)


if __name__ == "__main__":
    unittest.main()
