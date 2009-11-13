import unittest
import datetime
import server.models.core as core

from server.models.shiftschema import *
from server.models.ssuserschema import *
from server.models.groupschema import *
from server.tests.dummy_data import *


class BasicOperations(unittest.TestCase):

    def setUp(self):
        db = core.connect()
        self.fakemary = SSUser.create(fakemary).id
        self.fakejohn = SSUser.create(fakejohn).id
        self.fakebob = SSUser.create(fakebob).id
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
        db = core.connect(SSUser.private(self.fakemary))
        del db[theShift.id]

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
        # should exist in user/public db
        theShift = Shift.load(core.connect(SSUser.public(self.fakemary)), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)
        # should exist in master db 
        theShift = Shift.load(core.connect(), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)
        # should exist in user/feed db
        theShift = Shift.load(core.connect(SSUser.feed(self.fakemary)), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)
        # should _not_ exist in user/private db
        theShift = Shift.load(core.connect(SSUser.private(self.fakemary)), newShift.id)
        self.assertEqual(theShift, None)

    def testPublishFollower(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        SSUser.follow(self.fakejohn, self.fakemary)
        fakejohn = SSUser.read(self.fakejohn)
        # should be in the list of people fakejohn is following
        self.assertTrue(self.fakemary in fakejohn.following)
        # should be in the list of fakemary's followers
        followers = SSUser.followers(self.fakemary)
        self.assertTrue(self.fakejohn in followers)
        Shift.publish(self.fakemary, newShift.id, {"private":False})
        # should exist in user/feed db
        theShift = Shift.load(core.connect(SSUser.feed(self.fakejohn)), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)

    def testPublishToUser(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        publishData = {
            "dbs": [SSUser.inbox(self.fakejohn)]
            }
        Shift.publish(self.fakemary, newShift.id, publishData)
        # should exist in user inbox
        theShift = Shift.load(core.connect(SSUser.inbox(self.fakejohn)), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)

    def testPublishToGroup(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        newGroup = Group.create(self.fakemary, groupJson())
        newPerm = Permission.create("shiftspace", newGroup.id, self.fakejohn, level=1)
        publishData = {
            "dbs": [Group.db(newGroup.id)]
            }
        Shift.publish(self.fakemary, newShift.id, publishData)
        # should exists in subscriber's feed
        db = core.connect(SSUser.feed(self.fakejohn))
        theShift = Shift.load(db, newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)
        newGroup.deleteInstance()

    def testPublishToGroupAndUser(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        newGroup = Group.create(self.fakemary, groupJson())
        newPerm = Permission.create("shiftspace", newGroup.id, self.fakejohn, level=1)
        publishData = {
            "dbs": [Group.db(newGroup.id), SSUser.inbox(self.fakebob)]
            }
        Shift.publish(self.fakemary, newShift.id, publishData)
        # should exist in subscriber's feed
        db = core.connect(SSUser.feed(self.fakejohn))
        theShift = Shift.load(db, newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)
        newGroup.deleteInstance()
        # should exist in user's inbox
        theShift = Shift.load(core.connect(SSUser.inbox(self.fakebob)), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)

    def tearDown(self):
        db = core.connect()
        SSUser.delete(self.fakemary)
        SSUser.delete(self.fakejohn)
        SSUser.delete(self.fakebob)


if __name__ == "__main__":
    unittest.main()
