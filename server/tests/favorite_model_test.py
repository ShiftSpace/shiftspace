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
        self.fakemary = SSUser.create(fakemary)
        self.fakejohn = SSUser.create(fakejohn)
        self.fakebob = SSUser.create(fakebob)
        self.root = SSUser.read("shiftspace")

    def testFavorite(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        newShift = Shift.create(json)
        Favorite.create(self.fakejohn.id, newShift.id)
        favorites = self.fakejohn.favorites()
        # user should have 1 favorite
        self.assertEqual(len(favorites), 1)
        # favorite count for that shift should be 1
        count = newShift.favoriteCount()
        self.assertEqual(count, 1)
        newFavorite = Favorite.create(self.fakejohn.id, newShift.id)
        favorites = self.fakejohn.favorites()
        # user should have 1 favorite
        self.assertEqual(len(favorites), 1)
        # favorite count for that shift should be 1
        count = newShift.favoriteCount()
        self.assertEqual(count, 1)
        newFavorite.delete()
    """
    def testUnfavorite(self):
        json = shiftJson()
        newShift = Shift.create(self.fakemary, json)
        Favorite.create(self.fakejohn, newShift.id)
        favorites = Favorite.forUser(self.fakejohn)
        # user should have 1 favorite
        self.assertEqual(len(favorites), 1)
        # favorite count for that shift should be 1
        count = Favorite.count(newShift.id)
        self.assertEqual(count, 1)
        Favorite.delete(self.fakejohn, newShift.id)
        # user should have 0 favorites
        favorites = Favorite.forUser(self.fakejohn)
        self.assertEqual(len(favorites), 0)
        # favorite count for that shift should be 0
        count = Favorite.count(newShift.id)
        self.assertEqual(count, 0)

    def testPagingFeatures(self):
        json = shiftJson()
        newShift1 = Shift.create(self.fakemary, json)
        newShift2 = Shift.create(self.fakemary, json)
        newShift3 = Shift.create(self.fakemary, json)
        Favorite.create(self.fakejohn, newShift1.id)
        Favorite.create(self.fakejohn, newShift2.id)
        Favorite.create(self.fakejohn, newShift3.id)
        # limit
        favorites = Favorite.forUser(self.fakejohn, limit=2)
        self.assertEqual(len(favorites), 2)
        Favorite.delete(self.fakejohn, newShift1.id)
        Favorite.delete(self.fakejohn, newShift2.id)
        Favorite.delete(self.fakejohn, newShift3.id)
    """
    def tearDown(self):
        db = core.connect()
        SSUser.delete(self.fakemary)
        SSUser.delete(self.fakejohn)
        SSUser.delete(self.fakebob)

if __name__ == "__main__":
    unittest.main()
