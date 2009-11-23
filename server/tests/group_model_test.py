import unittest
import datetime
import server.models.core as core

from server.models.shift import Shift
from server.models.ssuser import SSUser
from server.models.group import Group


class BasicOperations(unittest.TestCase):

    def setUp(self):
        db = core.connect()
        self.fakemary = SSUser.create(fakemary).id
        self.root = SSUser.read("shiftspace").id

    def testGroupDb(self):
        json = groupJson()
        json["createdBy"] = self.fakemary
        newGroup = Group.create(json)
        self.assertEqual(Group.db(newGroup.id), "group/%s" % newGroup.id)
        newGroup.deleteInstance()

    def tearDown(self):
        db = core.connect()
        SSUser.delete(self.fakemary)


if __name__ == "__main__":
    unittest.main()
