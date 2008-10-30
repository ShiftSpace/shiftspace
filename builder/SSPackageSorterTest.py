import unittest
import SSPackageSorter

# Test data!

f1 = {'name':'f1'}
f2 = {'name':'f2'}
f3 = {'name':'f3'}
f4 = {'name':'f4'}
f5 = {'name':'f5'}
f6 = {'name':'f6'}
f7 = {'name':'f7'}
f8 = {'name':'f8'}

f1['deps'] = [f8]
f2['deps'] = []
f3['deps'] = []
f4['deps'] = [f8]
f5['deps'] = []
f6['deps'] = [f4]
f7['deps'] = [f3]
f8['deps'] = [f2]

pkg = [f1, f2, f3, f4, f5, f6, f7, f8]

class PackageSorterTestBrokenDelegate:
  pass

class PackageSorterTestDelegate:
  def dependenciesFor(self, obj):
    return obj['deps']

class TestPackageSorter(unittest.TestCase):

  def testSetDelegate(self):
    """
    SSPackageSorter.setDelegate should fail if delegate does not implement dependenciesFor.
    """
    delegate = PackageSorterTestDelegate()
    sorter = SSPackageSorter.SSPackageSorter(delegate)
    brokenDelegate = PackageSorterTestBrokenDelegate()
    self.assertRaises(SSPackageSorter.SSInvalidPackageSorterDelegate, sorter.setDelegate, brokenDelegate)

  def testDepthscore(self):
    delegate = PackageSorterTestDelegate()
    sorter = SSPackageSorter.SSPackageSorter(delegate)

    result = sorter.depthScore(f7)
    self.assertEqual(resuilt, 1)

    result = sorter.depthScore(f1)
    self.assertEqual(result, 3)

if __name__ == "__main__":
  unittest.main()

