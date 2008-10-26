# Builds a custom ShiftSpace core file from a config file, handles depedencies

#import json # only available in Python >= 2.6 
import os
import sys
import re
import simplejson as json # need to install simplejson from here http://pypi.python.org/pypi/simplejson/

#python json
#json.dumps([1, 2, 3, 4, 5]) -> returns '[1, 2, 3, 4, 5]'

#pretty print
#json.dumps([1, 2, 3, 4, 5], sort_keys=True, indent=4)
#/Users/davidnolen/Sites/shiftspace-0.5/client/

# Exceptions ==============================

class SSError(Exception): pass
class SSBuilderNoNameError(SSError): pass
class SSBuilderNoSuchFileOrPackage(SSError): pass

# Utilities ===============================

# sorting
def dependencySortForBuilder(builder):
  def fn(fileA, fileB):
    fA = builder.metadata[fileA]
    fB = builder.metadata[fileB]

    if fA.has_key('dependencies'):
      try:
        idx = fA['dependencies'].index(fileB)
        # also need to check if the file is the dependency tree
        print "< %s, %s, %s" % (fileA, fileB, idx)
        return 1
      except ValueError:
        pass

    if fB.has_key('dependencies'):
      try:
        idx = fB['dependencies'].index(fileA)
        print "> %s, %s, %s" % (fileA, fileB, idx)
        return -1
      except ValueError:
        pass

    print "== %s, %s" % (fileA, fileB)
    return 0
  return fn


# SSCoreBuilder ===========================

class SSCoreBuilder():

  def __init__(self):
    self.buildDefinitions = {}
    self.packages = {}
    self.names = {}
    self.metadata = {}
    self.requiredFiles = []
    self.optionalFile = []

    # regex for checking for a build definition
    # TODO: the following should be allow for Unicode characters
    self.builderPattern = re.compile('\/\/\s*==\s*Builder\s*==[\sA-Za-z0-9@.=/,_]*\/\/\s*==\s*/Builder\s*==', re.MULTILINE)
    self.namePattern = re.compile('@name\s*[A-Za-z0-9_.]*')
    self.requiredPattern = re.compile('@required\s*[A-Za-z0-9_.]*')
    self.optionalPattern = re.compile('@optioned\s*[A-Za-z0-9_.]*')
    self.packagePattern = re.compile('@package\s*[A-Za-z0-9_.]*')
    self.dependenciesPattern = re.compile('@dependencies\s*[A-Za-z0-9_.,\s]*')
    self.dependencySort = dependencySortForBuilder(self)


  def parseHeader(self, header):
    """
    Parse the header for a single file.
    """
    pass


  def parseFile(self, path):
    """
    Parse all of the relevant files.
    """
    self.hasBuildDefinition(path)
    pass


  def hasBuildDefinition(self, path):
    """
    Check if a file has a build definition.
    """

    # store a description for this file
    fileName = os.path.basename(path)
    fileHandle = open(path)
    contents = fileHandle.read()
    match = self.builderPattern.search(contents)

    if match:
      # grab the build description
      builderDescription = self.substringForMatch(contents, match)
      # parse the description
      self.buildMetadataForFile(path, builderDescription)
    else:
      print "No description for %s" % fileName

    fileHandle.close()


  def buildMetadataForFile(self, path, builderDescription):
    # get the name
    name = self.parseNameDirective(builderDescription)

    print "=============================="
    print name

    # if name, parse the directives
    if name:
      # get the actual file name
      #rname = os.path.basename(path)['name']
      # add it to internal array
      self.metadata[name] = {}
      self.metadata[name]['path'] = path

      # get optional directive
      optional = self.parseOptionalDirective(builderDescription)
      if optional != None:
        self.metadata[name]['optional'] = True

      # get the required directive
      required = self.parseRequiredDirective(builderDescription)
      if required != None:
        self.metadata[name]['required'] = True

      if optional == None and required == None:
        self.metadata[name]['optional'] = True

      # get the dependencies
      dependencies = self.parseDependenciesDirective(builderDescription)
      if dependencies:
        self.metadata[name]['dependencies'] = dependencies
        # sort the names in the packages based on dependencies

      # get the package directive
      package = self.parsePackageDirective(builderDescription)

      if package != None:
        self.metadata[name]['package'] = package
        
      # check if this package already exists
      if not self.packages.has_key(package) or self.packages[package] == None:
        self.packages[package] = []

      # add the name of the file to the package 
      self.packages[package].append(name)

      print "Pre-sort: %s" % self.packages[package]
      # sort the package files based on dependencies
      self.packages[package].sort(self.dependencySort)
      print "Post-sort: %s" % self.packages[package]

    else:
      # raise an error if no file name
      print "No name for %s" % path
      raise SSBuilderNoNameError


  def metadataForFile(self, name):
    metadata = None
    
    try:
      metadata = self.metadata[name]
    except:
      print name
      raise SSBuilderNoSuchFileOrPackage

    return metadata

  
  def dependenciesForFile(self, name):
    deps = None
    if (self.metadataForFile(name)).has_key('dependencies'):
      deps =  (self.metadataForFile(name))['dependencies']
    return deps


  def listContains(self, alist, object):
    try:
      idx = alist.index(object)
      return True
    except ValueError:
      pass
    return False

  
  def fileIsInDependencyTree(self, base, file):
    # NOTE: we could memoize to increase perf
    baseD = self.metadataForFile(base)
    deps = self.dependenciesForFile(base)

    # check if the file is in the deps list
    if self.listContains(deps, file):
      return True

    # check if the file and base share dependencies
    fdeps = self.dependenciesForFile(file)
    fileD = self.metadataForFile(file)

    if deps == None:
      return False
    
    # check if file is directly in the dependency list
    try:
      deps.index(file)
      return True
    except ValueError:
      pass

    # if not check the deps for each dep
    for depFile in deps:
      print "Checking %s" % depFile
      if self.fileIsInDependencyTree(base, depFile):
        return True

    return False


  def isDirectoryOrJsFile(self, path):
    """
    Returns True or False is a path is a directory or a Javascript file.
    """
    return (os.path.isdir(path) or 
            (os.path.isfile(path) and
             os.path.splitext(path)[1] == '.js'))


  def substringForMatch(self, string, match):
    if match:
      span = match.span()
      return string[span[0]:span[1]]
    return None

  
  def substringForPattern(self, string, pattern):
    return self.substringForMatch(string, pattern.search(string))


  def parseRequiredDirective(self, builderDescription):
    return self.requiredPattern.search(builderDescription)


  def parseOptionalDirective(self, builderDescription):
    return self.optionalPattern.search(builderDescription)


  def parseNameDirective(self, builderDescription):
    nameString = self.substringForPattern(builderDescription,
                                          self.namePattern)
    if nameString:
      return nameString[len("@name"):len(nameString)].strip()

    return None


  def parsePackageDirective(self, builderDescription):
    """
    Parses a package directive from a builder description.
    """
    packageString = self.substringForPattern(builderDescription,
                                             self.packagePattern)

    if packageString:
      return packageString[len("@package"):len(packageString)].strip()

    return None

  
  def parseDependenciesDirective(self, builderDescription):
    """
    Parse a dependency description from a builder description.
    """
    depsString = self.substringForPattern(builderDescription, 
                                         self.dependenciesPattern)

    if depsString:
      # get the dependency names and strip each of white space
      dependencies = [name.strip() 
                      for name in depsString[len("@dependencies"):len(depsString)].split(',')]
      return dependencies
    
    return None
    

  def parseDirectory(self, dir):
    """
    Parse a directory for javascript files.
    """
    files = [f for f in os.listdir(dir) 
             if(f != ".svn" and self.isDirectoryOrJsFile(os.path.join(dir, f)))]

    for file in files:
      path = os.path.join(dir, file)
      # check each file for the presence of a build directive
      if os.path.isdir(path):
        self.parseDirectory(path)
      else:
        self.parseFile(path)


  def writePackagesJSON(self):
    """
    Write a package json description.
    """
    print json.dumps(self.packages, sort_keys=True, indent=4)


  def buildTarget(self, packageJSON):
    """
    Build a target based on the package description.
    """
    pass


# testing function
b = None
def test():
  global b
  b = SSCoreBuilder()
  b.parseDirectory("/Users/davidnolen/Sites/shiftspace-0.5/")

#if __name__ == "__main__":
#  print ("corebuilder.py running " + sys.argv[1])
#  builder = SSCoreBuilder()
#  builder.writePackageJSON([])
