import unittest
import datetime
import server.models.core as core

from server.models.shift import Shift
from server.models.ssuser import SSUser
from server.models.comment import Comment
from server.models.message import Message
from server.tests.dummy_data import *


class BasicOperations(unittest.TestCase):

    def setUp(self):
        db = core.connect()
        self.fakemary = SSUser.create(fakemary)
        self.fakejohn = SSUser.create(fakejohn)
        self.fakebob = SSUser.create(fakebob)
        self.root = SSUser.read("shiftspace")

    def testCreate(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        newShift = Shift.create(json)
        newShift.publish({"private":False})
        # create new comment
        newComment = Comment.create(self.fakejohn.id, newShift.id, "1st comment!")
        # shift comment db should now exist
        self.assertNotEqual(core.connect(Comment.db(newShift.id)), None)
        # shift should have thread
        self.assertTrue(newShift.hasThread())
        # should be a comment count of 1 for shift
        count = newShift.commentCount()
        self.assertEqual(count, 1)
        # should be one message in fakemary's inbox from fakejohn
        messages = self.fakemary.messages()
        self.assertEqual(len(messages), 1)
        # delete the comment
        # TODO: separate fixture - David
        newComment.delete()
        # delete the thread
        newShift.deleteThread()

    def testSubscribe(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        newShift = Shift.create(json)
        newShift.publish({"private":False})
        # make a comment
        newComment = Comment.create(
            self.fakejohn.id,
            newShift.id,
            "1st comment!",
            subscribe=True
            )
        # check that shift author is subscribed
        subscribers = newShift.subscribers()
        self.assertTrue(self.fakemary.id in subscribers)
        # check that commenter is subscribed
        self.assertTrue(self.fakejohn.id in subscribers)
        # check that there is a message in shift author message db
        messages = self.fakemary.messages()
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0].text, "fakejohn just commented on your shift!")
        # check that there is _not_ a message in commenters message db
        messages = self.fakejohn.messages()
        self.assertEqual(len(messages), 0)
        newShift.deleteThread()

    def testUnsubscribe(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        newShift = Shift.create(json)
        newShift.publish({"private":False})
        # another user makes a comment
        newComment = Comment.create(
            self.fakebob.id,
            newShift.id,
            "1st comment!",
            subscribe=True
            )
        # subscribe fakejohn
        self.fakejohn.subscribe(newShift)
        # another user makes another comment
        newComment = Comment.create(
            self.fakebob.id,
            newShift.id,
            "2nd comment!"
            )
        # check that fakejohn has one message
        messages = self.fakejohn.messages()
        self.assertEqual(len(messages), 1)
        self.assertEqual(messages[0].text, "fakebob just commented on fakemary's shift!")
        # unsubscribe fakejohn
        self.fakejohn.unsubscribe(newShift)
        newComment = Comment.create(
            self.fakebob.id,
            newShift.id,
            "3rd comment!"
            )
        # check that fakejohn still only has one message
        messages = self.fakejohn.messages()
        self.assertEqual(len(messages), 1)
        # check that fakemary has two messages
        messages = self.fakemary.messages()
        self.assertEqual(len(messages), 3)
        # check that fakebob has no messages
        messages = self.fakebob.messages()
        self.assertEqual(len(messages), 0)
        newShift.deleteThread()

    def tearDown(self):
        db = core.connect()
        SSUser.delete(self.fakemary)
        SSUser.delete(self.fakejohn)
        SSUser.delete(self.fakebob)

if __name__ == "__main__":
    unittest.main()
