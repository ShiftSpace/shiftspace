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
        self.fakemary = SSUser.create(fakemary)
        self.fakejohn = SSUser.create(fakejohn)
        self.fakebob = SSUser.create(fakebob)
        self.root = SSUser.read("shiftspace")

    """
    def testCreate(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        theShift = Shift.create(json)
        self.assertEqual(theShift.type, "shift")
        self.assertEqual(theShift.createdBy, self.fakemary.id)
        self.assertNotEqual(theShift.created, None)
        self.assertEqual(type(theShift.created), datetime)
        self.assertNotEqual(theShift.modified, None)
        self.assertEqual(type(theShift.modified), datetime)
        self.assertEqual(theShift.domain, "http://google.com")
        db = core.connect(SSUser.privateDb(self.fakemary.id))
        del db[theShift.id]

    def testRead(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        newShift = Shift.create(json)
        theShift = Shift.read(newShift.id, self.fakemary.id)
        self.assertEqual(theShift.source.server, newShift.source.server)
        self.assertEqual(theShift.source.database, newShift.source.database)
        self.assertEqual(theShift.createdBy, self.fakemary.id)
        db = core.connect(SSUser.privateDb(self.fakemary.id))
        del db[theShift.id]

    def testUpdate(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        newShift = Shift.create(json)
        newShift.update({"summary":"changed!"})
        theShift = Shift.read(newShift.id, self.fakemary.id)
        self.assertEqual(theShift.summary, "changed!")
        db = core.connect(SSUser.privateDb(self.fakemary.id))
        del db[theShift.id]

    def testDelete(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        newShift = Shift.create(json)
        self.assertNotEqual(newShift, None)
        newShift.delete()
        theShift = Shift.read(newShift.id, self.fakemary.id)
        self.assertEqual(theShift, None)

    def testJoinData(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        newShift = Shift.create(json)
        # gravatar not a real property, added via Shift.joinData
        self.assertNotEqual(newShift["gravatar"], None)


    def testCanModify(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        newShift = Shift.create(json)
        self.assertTrue(self.fakemary.canModify(newShift))
        self.assertTrue(not self.fakejohn.canModify(newShift))
        self.assertTrue(self.root.canModify(newShift))


    def testBasicPublish(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        newShift = Shift.create(json)
        newShift.publish({"private":False})
        # should exist in user/public db
        theShift = Shift.load(core.connect(SSUser.publicDb(self.fakemary.id)), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)
        # should exist in master/public db 
        theShift = Shift.load(core.connect("shiftspace/public"), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)
        # should exist in user/feed db
        theShift = Shift.load(core.connect(SSUser.feedDb(self.fakemary.id)), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)
        # should _not_ exist in user/private db
        theShift = Shift.load(core.connect(SSUser.privateDb(self.fakemary.id)), newShift.id)
        self.assertEqual(theShift, None)
    """

    def testPublishToFollowers(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        newShift = Shift.create(json)
        self.fakejohn.follow(self.fakemary)
        fakejohn = SSUser.read(self.fakejohn.id)
        # should be in the list of people fakejohn is following
        self.assertTrue(self.fakemary.id in fakejohn.following)
        # should be in the list of fakemary's followers
        followers = self.fakemary.followers()
        self.assertTrue(self.fakejohn.id in followers)
        newShift.publish({"private":False})
        # should exist in user/feed db
        theShift = Shift.load(core.connect(SSUser.feedDb(self.fakejohn.id)), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)

    """
    def testPublishToUser(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        publishData = {
            "dbs": [SSUser.inboxDb(self.fakejohn)]
            }
        Shift.publish(self.fakemary, newShift.id, publishData)
        # should exist in user inbox
        theShift = Shift.load(core.connect(SSUser.inboxDb(self.fakejohn)), newShift.id)
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
        db = core.connect(SSUser.feedDb(self.fakejohn))
        theShift = Shift.load(db, newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)
        newGroup.deleteInstance()

    def testPublishToGroupAndUser(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        newGroup = Group.create(self.fakemary, groupJson())
        newPerm = Permission.create("shiftspace", newGroup.id, self.fakejohn, level=1)
        publishData = {
            "dbs": [Group.db(newGroup.id), SSUser.inboxDb(self.fakebob)]
            }
        Shift.publish(self.fakemary, newShift.id, publishData)
        # should exist in subscriber's feed
        db = core.connect(SSUser.feedDb(self.fakejohn))
        theShift = Shift.load(db, newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)
        newGroup.deleteInstance()
        # should exist in user's inbox
        theShift = Shift.load(core.connect(SSUser.inboxDb(self.fakebob)), newShift.id)
        self.assertEqual(theShift.summary, newShift.summary)

    def tearDown(self):
        db = core.connect()
        self.fakemary.delete()
        self.fakejohn.delete()
        self.fakebob.delete()
    """

if __name__ == "__main__":
    unittest.main()
