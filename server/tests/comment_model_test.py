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
        self.fakebob = SSUser.create(fakebob).id
        self.root = SSUser.read("shiftspace").id

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
        # delete the comment
        newComment.deleteInstance(newShift.id, newComment.id)
        # delete the thread
        Comment.deleteThread(newShift.id)

    def testSubscribe(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        Shift.publish(self.fakemary, newShift.id, {"private":False})
        # make a comment
        newComment = Comment.create(
            self.fakejohn,
            newShift.id,
            "1st comment!",
            subscribe=True
            )
        # check that shift author is subscribed
        subscribers = Comment.subscribers(newShift.id)
        self.assertTrue(self.fakemary in subscribers)
        # check that commenter is subscribed
        self.assertTrue(self.fakejohn in subscribers)
        # check that there is a message in shift author message db
        messages = Message.forUser(self.fakemary)
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0].text, "fakejohn just commented on your shift!")
        # check that there is _not_ a message in commenters message db
        messages = Message.forUser(self.fakejohn)
        self.assertEqual(len(messages), 0)
        Comment.deleteThread(newShift.id)

    def testUnsubscribe(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        Shift.publish(self.fakemary, newShift.id, {"private":False})
        # another user makes a comment
        newComment = Comment.create(
            self.fakebob,
            newShift.id,
            "1st comment!",
            subscribe=True
            )
        # subscribe fakejohn
        Comment.subscribe(self.fakejohn, newShift.id)
        # another user makes another comment
        newComment = Comment.create(
            self.fakebob,
            newShift.id,
            "2nd comment!"
            )
        # check that fakejohn has one message
        messages = Message.forUser(self.fakejohn)
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0].text, "fakebob just commented on fakemary's shift!")
        # unsubscribe fakejohn
        Comment.unsubscribe(self.fakejohn, newShift.id)
        newComment = Comment.create(
            self.fakebob,
            newShift.id,
            "3rd comment!"
            )
        # check that fakejohn still only has one message
        messages = Message.forUser(self.fakejohn)
        self.assertEqual(len(messages), 1)
        # check that fakemary has two messages
        messages = Message.forUser(self.fakemary)
        self.assertEqual(len(messages), 3)
        # check that fakebob has no messages
        messages = Message.forUser(self.fakebob)
        self.assertEqual(len(messages), 0)
        Comment.deleteThread(newShift.id)

    def tearDown(self):
        db = core.connect()
        SSUser.delete(self.fakemary)
        SSUser.delete(self.fakejohn)
        SSUser.delete(self.fakebob)

if __name__ == "__main__":
    unittest.main()
