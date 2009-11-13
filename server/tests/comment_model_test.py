import unittest
import datetime
import server.models.core as core

from server.models.shiftschema import *
from server.models.ssuserschema import *
from server.models.groupschema import *
from server.models.commentschema import *
from server.models.messageschema import *
from server.tests.dummy_data import *


class BasicOperations(unittest.TestCase):

    def setUp(self):
        db = core.connect()
        self.fakemary = SSUser.create(fakemary).id
        self.fakejohn = SSUser.create(fakejohn).id
        self.root = SSUser.read("shiftspace").id

    """
    def testCreate(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        Shift.publish(self.fakemary, newShift.id, {"private":False})

        newComment = Comment.create(self.fakejohn, newShift.id, "1st comment!")

        # shift comment db should now exist
        self.assertNotEqual(core.connect(Comment.db(newShift.id)), None)
        # shift should have thread
        self.assertTrue(Comment.hasThread(newShift.id))
        # should be a comment count of 1 for shift
        count = Comment.count(newShift.id)
        self.assertEqual(count, 1)
        # should be one message in fakemary's inbox from fakejohn
        messages = Message.forUser(self.fakemary)
        self.assertEqual(len(messages), 1)
        newComment.deleteInstance(newShift.id, newComment.id)
    """


    def testSubscribe(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        Shift.publish(self.fakemary, newShift.id, {"private":False})

        newComment = Comment.create(self.fakejohn, newShift.id, "1st comment!")


    def tearDown(self):
        db = core.connect()
        SSUser.delete(self.fakemary)
        SSUser.delete(self.fakejohn)


if __name__ == "__main__":
    unittest.main()
