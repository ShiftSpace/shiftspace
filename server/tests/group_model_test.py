import unittest
import datetime
import server.models.core as core
from server.models.shiftschema import *
from server.models.ssuserschema import *
from server.models.groupschema import *


fakemary = {
    "userName": "fakemary",
    "fullName": {
        "first":"Fake",
        "last": "Mary"
        },
    "email": "info@shiftspace.org",
    "displayName": "fakemary",
}

def groupJson():
    return {
        "longName": "FooBar Fans",
        "shortName": "fbf",
        "tagLine": "A really cool group for fans of foo!",
        "url": "http://foobar.org",
        }


class BasicOperations(unittest.TestCase):

    def setUp(self):
        db = core.connect()
        self.fakemary = SSUser.create(fakemary).id
        self.root = SSUser.read("shiftspace").id

    def testGroupDb(self):
        json = groupJson()
        json["createdBy"] = self.fakemary
        newGroup = Group.create(json)
        self.assertEqual(Group.db(newGroup.id), "group_%s" % newGroup.id)
        newGroup.deleteInstance()

    def tearDown(self):
        db = core.connect()
        SSUser.delete(self.fakemary)


if __name__ == "__main__":
    unittest.main()
