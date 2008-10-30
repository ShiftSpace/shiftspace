
# Exceptions ============================== 

class SSPackageSorterError(Exception): pass
class CircularReferenceError(SSPackageSorterError): pass
class InvalidDelegate(SSPackageSorterError): pass
class NoDelegateSet(SSPackageSorterError): pass

# SSPackageSorter =========================

class SSPackageSorter():
  """
  Generic class for sorting packages. It takes a packageDelegate
  which should provide a method called dependenciesFor that returns
  an array of dependencies for an object.
  """

  def __init__(self, packageDelegate=None):
    if packageDelegate != None:
      self.setDelegate(packageDelegate)
    self.dependencyStack = []


  def setDelegate(self, delegate):
    """
    Set the package delegate.
    """
    try:
      getattr(delegate, "dependenciesFor")
    except AttributeError:
      raise InvalidDelegate

    self.__delegate = delegate


  def delegate(self):
    """
    Returns the package delegate.
    """
    return self.__delegate


  def depthScore(self, fileA):
    """
    Returns the depth score for a particular file.
    """

    if self.delegate() == None:
      raise NoDelegateSet

    try:
      index = self.dependencyStack.index(fileA)
      raise CircularReferenceError
    except ValueError:
      self.dependencyStack.append(fileA)

    # should memo-ize the files
    deps = self.delegate().dependenciesFor(fileA);

    val = 0
    if len(deps) == 0:
      self.dependencyStack.pop()
      return 0
    else:
      for f in deps:
        val = max(val, 1+self.depthScore(f))

    self.dependencyStack.pop()
    return val
	

  def depthScoresForPackage(self, package):
    """
    Returns an array of depth mappings for a package.
    """
    return [self.depthScore(f) for f in package]


  def depthScoredPackage(self, package):
    """
    Creates a copy with depth metadata attached.
    """
    wrappedPackage = [{'object':f} for f in package]
    depthMap = self.depthScoresForPackage(package)
 
    for i in range(0, len(package)):
      wrappedPackage[i]['depth'] = depthMap[i]

    return wrappedPackage


  def depthSort(self, fileA, fileB):
    """
    Used for sorting packages. Return 1, 0, -1 depending of the
    depedency depth of the two files in question.
    """
    return cmp(fileA['depth'], fileB['depth'])


  def isInDependencyTree(self, fileA, fileB):
    """
    Checks if the first argument is dependent on the second argument
    """

    if self.delegate() == None:
      raise NoDelegateSet

    # check for circular reference 
    try:
      index = self.dependencyStack.index(fileA)
      raise CircularReferenceError
    except ValueError:
      self.dependencyStack.append(fileA)

    # check if the fileA is dependent on fileB directly
    try:
      idx = self.delegate().dependenciesFor(fileA).index(fileB)
      return True
    except ValueError:
      pass

    # check dependecies whether file is in dependency tree
    for f in self.delegate().dependenciesFor(fileA):
      if self.isInDependencyTree(f, fileB, orig):
        return True

    # pop the item off the stack on exit
    self.dependencyStack.pop()

    return False


  def sortPackage(self, package):
    """
    Takes a package and returns a sorted copy.
    """
    scoredPackage = self.depthScoredPackage(package)
    scoredPackage.sort(self.depthSort)
    return [f['object'] for f in scoredPackage]

