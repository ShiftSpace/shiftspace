import unittest
import datetime
import server.models.core as core

from server.models.shiftschema import *
from server.models.ssuserschema import *
from server.models.favschema import *
from server.tests.dummy_data import *


class BasicOperations(unittest.TestCase):

    def setUp(self):
        db = core.connect()
        self.fakemary = SSUser.create(fakemary).id
        self.fakejohn = SSUser.create(fakejohn).id
        self.fakebob = SSUser.create(fakebob).id
        self.root = SSUser.read("shiftspace").id

    def testFavorite(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        Favorite.create(self.fakejohn, newShift.id)
        favorites = Favorite.forUser(self.fakejohn)
        # user should have 1 favorite
        self.assertEqual(len(favorites), 1)
        # favorite count for that shift should be 1
        count = Favorite.count(newShift.id)
        self.assertEqual(count, 1)

    def tearDown(self):
        db = core.connect()
        SSUser.delete(self.fakemary)
        SSUser.delete(self.fakejohn)
        SSUser.delete(self.fakebob)

if __name__ == "__main__":
    unittest.main()
