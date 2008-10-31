# Builds a custom ShiftSpace core file from a config file, handles depedencies

#import json # only available in Python >= 2.6 
import os
import sys
import re
import getopt
import simplejson as json # need to install simplejson from here http://pypi.python.org/pypi/simplejson/
from SSPackageSorter import SSPackageSorter

# Exceptions ==============================

class SSError(Exception): 
  def __init__(self, builder):
    if builder.sorter != None:
      builder.sorter.emptyDependencyStack()

class NoNameError(SSError): pass
class NoSuchFileError(SSError): pass
class NoSuchPackage(SSError): pass

# Utilities ===============================



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
    self.sorter = SSPackageSorter(self)


  def parseFile(self, path):
    """
    Parse all of the relevant files.
    """
    self.hasBuildDefinition(path)


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
      #print "No description for %s" % fileName
      pass

    fileHandle.close()


  def buildMetadataForFile(self, path, builderDescription):
    """
    Construct metadata for each file based on the builder description.
    """

    # get the name
    name = self.parseNameDirective(builderDescription)

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
      # set it to an empty array for SSPackageSorter
      if dependencies == None:
        dependencies = []
      
      self.metadata[name]['dependencies'] = dependencies

      # get the package directive
      package = self.parsePackageDirective(builderDescription)

      # check if this package already exists
      if not self.packages.has_key(package) or self.packages[package] == None:
        self.packages[package] = []

      # add the name of the file to the package 
      self.packages[package].append(name)

      if package != None:
        self.metadata[name]['package'] = package

    else:
      # raise an error if no file name
      print "No name for %s" % path
      raise NoNameError(self)


  def metadataForFile(self, name):
    """
    Returns the metadata for a particular file.
    """
    metadata = None
    
    try:
      metadata = self.metadata[name]
    except:
      print "metadataForFile error: %s" % name
      raise NoSuchFileError(self)

    return metadata


  def packageForFile(self, name):
    """
    Returns the package that a file belongs to.
    """
    metadata = self.metadataForFile(name)

    if metadata['package'] != None:
      return self.packageForName(metadata['package'])
    else:
      raise NoSuchPackage(self)


  def packageForName(self, name):
    """
    Returns the package for a particular name.
    """
    return self.packages[name]


  def dependenciesFor(self, file, excludeNonPackageFiles=True):
    """
    Returns the dependencies for a particular file. Excludes files in the file's own package by default.
    """
    deps = self.dependenciesForFile(file)
    if not excludeNonPackageFiles:
      return deps
    packageFiles = self.packageForFile(file)
    return [f for f in deps if self.listContains(packageFiles, f)]


  def listContains(self, list, obj):
    """
    Convenience method for checking if an object exists in a list.
    """
    try:
      idx = list.index(obj)
      return True
    except:
      return False


  def dependenciesForFile(self, name):
    """
    Returns the dependency list for a particular file.
    """
    deps = []
    if (self.metadataForFile(name)).has_key('dependencies'):
      deps = (self.metadataForFile(name))['dependencies']
    return deps


  def isDirectoryOrJsFile(self, path):
    """
    Returns True or False is a path is a directory or a Javascript file.
    """
    return (os.path.isdir(path) or 
            (os.path.isfile(path) and
             os.path.splitext(path)[1] == '.js'))


  def substringForMatch(self, string, match):
    """
    Utility method takes a regex match result and a string and returns the matching 
    portion.
    """
    if match:
      span = match.span()
      return string[span[0]:span[1]]
    return None

  
  def substringForPattern(self, string, pattern):
    """
    Utility method that tages a compiled regex pattern and returns the first match
    in the string.
    """
    return self.substringForMatch(string, pattern.search(string))


  def parseRequiredDirective(self, builderDescription):
    """
    Parse the required directive in a builder description.
    Returns None or a match.
    """
    return self.requiredPattern.search(builderDescription)


  def parseOptionalDirective(self, builderDescription):
    """
    Parse the optional directive in a builder description.
    Returns None or a match.
    """
    return self.optionalPattern.search(builderDescription)


  def parseNameDirective(self, builderDescription):
    """
    Parse the name directive in a builder description.
    Returns None or a match.
    """
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
    

  def parseDirectory(self, dir, recurse=False):
    """
    Parse a directory for javascript files.
    """
    files = [f for f in os.listdir(dir) 
             if(f != ".svn" and self.isDirectoryOrJsFile(os.path.join(dir, f)))]

    for file in files:
      path = os.path.join(dir, file)
      # check each file for the presence of a build directive
      if os.path.isdir(path) and recurse:
        self.parseDirectory(path, recurse)
      elif os.path.isfile(path):
        self.parseFile(path)

  
  def sortPackages(self):
    """
    Sorts all of the packages.  This should be called only after all the
    internal tables have been built via parseDirectory.
    """
    for packageName, package in self.packages.items():
      self.packages[packageName] = self.sorter.sortPackage(package)


  def writePackagesJSON(self, output="packages.json"):
    """
    Write a package json description.
    """
    packageDict = {}
    packageDict['packages'] = self.packages
    packageDict['files'] = self.metadata
    print json.dumps(packageDict, sort_keys=True, indent=4)


  def filesWithDependency(self, name):
    """
    Returns a list of files that have particular dependency
    """
    filesWithDependency = []
    for fileName, metadata in self.metadata.items():
      if self.sorter.isInDependencyTree(fileName, name):
        filesWithDependency.append(fileName)
    return filesWithDependency


  def checkPackageDependencies(self):
    """
    Checks to see which packages are dependent on each other.
    """
    # look at the packages and determine their dependencies
    pass


  def build(self, path, recurse=False, output="packages.json"):
    """
    Creats all the internal data structures and sorts all found packages.
    """
    # build all the internal data structures
    self.parseDirectory(path, recurse)
    # sort the internal package data structure
    self.sortPackages()
    # write out the file
    #self.writePackagesJSON(output)


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
  b.build(path="/Users/davidnolen/Sites/shiftspace-0.5/", recurse=True)


def usage():
  print "corebuilder.py takes the following flags:"
  print "-h help"
  print "-i input, directory or file"
  print "-r recursively search directories"
  print "-o output file, file name defaults to packages.json"


def main(argv):
  # there is a sanity check to make sure that
  # certain directories exist so that this
  # script isn't accidentally run anywhere
  inputFile = "../"
  outputFile = "test.json"
  recursive = False

  try:
    opts, args = getopt.getopt(argv, "hi:o:r", ["help", "input=", "output="])
  except getopt.GetoptError:
    usage()
    sys.exit(2)

  print opts
  print args

  for opt, arg in opts:
    if opt in ("-h", "--help"):
      usage()
      sys.exit()
    elif opt in ("-i", "--input"):
      inputFile = arg
    elif opt in ("-o", "--output"):
      outputFile = arg
    elif opt == "-r":
      recursive = True
    else:
      assert False, "unhandled options"

  print "input:%s, output:%s, recurse:%s" % (inputFile, outputFile, recursive)
  #builder = SSCoreBuilder()
  #builder.build(path=inputField, output=outputFile, recurse=True)
  
  
if __name__ == "__main__":
  main(sys.argv[1:])
