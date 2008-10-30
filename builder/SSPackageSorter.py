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

# Exceptions ============================== 

class SSPackageSorterError(Exception): pass
class CircularReferenceError(SSPackageSorterError): pass
class DelegateDoesNotImplementDependenciesForFile(SSPackageSorterError): pass

# SSPackageSorter =========================

class SSPackageSorter():
  def __init__(self, packageDelegate):
    self.__delegate = packageDelegate

  def setDelegate(self, delegate):
    self.__delegate = delegate

  def delegate(self):
    return self.__delegate

def depthScore(fileA):
  # should memo-ize the files
  val = 0
  if len(fileA['deps']) == 0:
    return 0
  else:
    for f in fileA['deps']:
      val = max(val, 1+depthScore(f))
  return val


def depthScoresForPackage(package):
  return [depthScore(f) for f in package]


def applyDepthsScoreToPackage(package):
  wrappedPackage = [{'object':f} for f in package]
  depthMap = depthScoresForPackage(package)
  for i in range(0, len(package)):
    wrappedPackage[i]['depth'] = depthMap[i]
  return wrappedPackage


def depthSort(fileA, fileB):
  return cmp(fileA['depth'], fileB['depth'])


def checkForCircularReference(fileA, fileB):
  return isInDependencyTree(fileA, fileB) and isInDependencyTree(fileB, fileA)


# f1, f8 infinite loop
dependencyStack = []
def isInDependencyTree(fileA, fileB, orig=None):
  # add the file to dependency stack
  global dependencyStack

  try:
    index = dependencyStack.index(fileA)
    raise CircularReferenceError
  except ValueError:
    dependencyStack.append(fileA)

  if fileA == orig:
    raise CircularReferenceError

  try:
    idx = fileA['deps'].index(fileB)
    return True
  except ValueError:
    pass

  for f in fileA['deps']:
    if isInDependencyTree(f, fileB, orig):
      return True

  return False


def sortPackage(package):
  wrappedPackage = applyDepthsScoreToPackage(package)
  wrappedPackage.sort(depthSort)
  return [f['object'] for f in wrappedPackage]

