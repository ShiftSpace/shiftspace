import unittest
import datetime
import server.models.core as core
from server.models.shiftschema import *
from server.models.ssuserschema import *


fakemary = {
    "userName": "fakemary",
    "fullName": {
        "first":"Fake",
        "last": "Mary"
        },
    "email": "info@shiftspace.org",
    "displayName": "fakemary"
}

foogroup = {
    longName: "FooBar Fans"
    shortName: "fbf"
}


class BasicOperations(unittest.TestCase):

    def setUp(self):
        db = core.connect()
        self.fakemary = SSUser.create(fakemary).id
        self.root = SSUser.read("shiftspace").id

    def testCreate(self):
        

    def tearDown(self):
        db = core.connect()
        SSUser.delete(self.fakemary)


if __name__ == "__main__":
    unittest.main()
