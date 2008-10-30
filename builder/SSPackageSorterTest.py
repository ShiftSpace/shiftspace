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
f9 = {'name':'f9'}
f10 = {'name':'f10'}

f1['deps'] = [f8]
f2['deps'] = []
f3['deps'] = []
f4['deps'] = [f8]
f5['deps'] = []
f6['deps'] = [f4]
f7['deps'] = [f3]
f8['deps'] = [f2]

f9['deps'] = [f10]
f10['deps'] = [f9]

pkg = [f1, f2, f3, f4, f5, f6, f7, f8]
badPkg = [f9, 10]

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
    self.assertRaises(SSPackageSorter.InvalidDelegate, sorter.setDelegate, brokenDelegate)


  def testDepthscore(self):
    """
    SSPackageSorter.depthScore should return a valid result.
    """
    delegate = PackageSorterTestDelegate()
    sorter = SSPackageSorter.SSPackageSorter(delegate)

    result = sorter.depthScore(f7)
    self.assertEqual(result, 1)

    result = sorter.depthScore(f1)
    self.assertEqual(result, 2)


  def testDepthScoresForPackage(self):
    """
    Test that the mapping of depth values is correct.
    """
    depthMap = [2, 0, 0, 2, 0, 3, 1, 1]
    delegate = PackageSorterTestDelegate()
    sorter = SSPackageSorter.SSPackageSorter(delegate)
    
    result = sorter.depthScoresForPackage(pkg)
    self.assertEqual(result, depthMap)


  def testDependencyStack(self):
    """
    Test to make sure that the dependency stack gets cleared out.
    """
    pass
    

  def testCheckForCircularReferences(self):
    """
    SSPackageSorter should not sort circular references.
    """
    delegate = PackageSorterTestDelegate()
    sorter = SSPackageSorter.SSPackageSorter(delegate)
    
    self.assertRaises(SSPackageSorter.CircularReferenceError, sorter.depthScore, f9)
    self.assertRaises(SSPackageSorter.CircularReferenceError, sorter.checkForCircularReferences, f9, f10)


  def testSortPackage(self):
    """
    Test that SSPakageSorter returns the right sorting for the package.
    """
    presorted = [f2, f3, f5, f7, f8, f1, f4, f6]

    delegate = PackageSorterTestDelegate()
    sorter = SSPackageSorter.SSPackageSorter(delegate)

    self.assertEqual(presorted, sorter.sortPackage(pkg))


if __name__ == "__main__":
  unittest.main()

