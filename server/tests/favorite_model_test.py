import unittest
import datetime
import server.models.core as core

from server.models.shift import Shift
from server.models.ssuser import SSUser
from server.models.favorite import Favorite
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

    def testUnfavorite(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        newShift = Shift.create(json)
        newFavorite = Favorite.create(self.fakejohn.id, newShift.id)
        favorites = self.fakejohn.favorites()
        # user should have 1 favorite
        self.assertEqual(len(favorites), 1)
        # favorite count for that shift should be 1
        count = newShift.favoriteCount()
        self.assertEqual(count, 1)
        newFavorite.delete()
        # user should have 0 favorites
        favorites = self.fakejohn.favorites()
        self.assertEqual(len(favorites), 0)
        # favorite count for that shift should be 0
        count = newShift.favoriteCount()
        self.assertEqual(count, 0)

    def testPagingFeatures(self):
        json = shiftJson()
        json["createdBy"] = self.fakemary.id
        newShift1 = Shift.create(json)
        newShift2 = Shift.create(json)
        newShift3 = Shift.create(json)
        fav1 = Favorite.create(self.fakejohn.id, newShift1.id)
        fav2 = Favorite.create(self.fakejohn.id, newShift2.id)
        fav3 = Favorite.create(self.fakejohn.id, newShift3.id)
        favorites = self.fakejohn.favorites(limit=2)
        self.assertEqual(len(favorites), 2)
        fav1.delete()
        fav2.delete()
        fav3.delete()

    def tearDown(self):
        db = core.connect()
        SSUser.delete(self.fakemary)
        SSUser.delete(self.fakejohn)
        SSUser.delete(self.fakebob)

if __name__ == "__main__":
    unittest.main()
