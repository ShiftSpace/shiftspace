#!/usr/bin/python

# Parses metadata in ShiftSpace client components and their dependencies, generates
# a JSON representation of that in a way that would allow later loading of components
# on a per-file or per-package basis

#import json # only available in Python >= 2.6 
import os
import sys
import re
import getopt
import simplejson as json # need to install simplejson from here http://pypi.python.org/pypi/simplejson/

# test change

from SSPackageSorter import SSPackageSorter

# Exceptions ==============================

class SSError(Exception):
  def __init__(self, builder, message = ''):
    if builder.sorter != None:
      builder.sorter.emptyDependencyStack()

    self.message = message

  def __str__(self):
    return self.message

class NoNameError(SSError): pass
class NoSuchFileError(SSError): pass
class NoSuchPackage(SSError): pass
class BuilderDirectiveNotClosed(SSError): pass
class FilenameExistsTwice(SSError): pass
class MissingExportDescription(SSError): pass
  

# SSCoreBuilder ===========================

class SSCoreBuilder():

  def __init__(self):
    self.packages = {}
    self.tests = []

    self.BUILDER_BEGIN_PATTERN = re.compile("\/\/\s*==Builder==")
    self.BUILDER_END_PATTERN = re.compile("\/\/\s*==\/Builder==")
    self.DIRECTIVE_PATTERN = re.compile("\/\/\s*@([^\s]*)\s*(.*)")
    self.DIRECTIVES_WITH_MULTIPLE_VALUES = ["dependencies", "export"]

    self.sorter = SSPackageSorter(self)    


  def parseFile(self, path):
    """
    Parse all of the relevant files.
    """

    print "Parsing %s" % path
    fileName = os.path.basename(path)
    name = os.path.splitext(fileName)[0]

    if self.metadata.has_key(name):
      raise FilenameExistsTwice(self, "name: %s, %s and %s" % (name, path, self.metadata[name]['path']))

    fileHandle = open(path)

    for line in fileHandle:
      if self.BUILDER_BEGIN_PATTERN.match(line.strip()):
        # we found the beginning of the header. now go parse it
        directives = self.parseDirectives(fileHandle);

        if directives.has_key('package'):
          package = directives['package']
         
          if not self.packages.has_key(package):
            self.packages[package] = []

          self.packages[package].append(name)

        directives['path'] = path

        if directives.has_key('test'):
          self.tests.append(name)
        
        self.metadata[name] = directives
        
        break;

    fileHandle.close()


  def parseDirectives(self, fileHandle):
    """
    Parse all directives -- @<directive> <list of values>
    """

    directives = {}

    for line in fileHandle:
      # check if we are done with the metadata header
      if self.BUILDER_END_PATTERN.match(line.strip()):
        return directives;

      # match a directive line
      match = self.DIRECTIVE_PATTERN.match(line.strip())
      if match:
        directive = match.group(1);
        value = match.group(2);

        # if can have multiple values, split it
        if directive in self.DIRECTIVES_WITH_MULTIPLE_VALUES:
          value = [x.strip() for x in value.split(',')]

        if not value:
          value = True

        directives[directive] = value;

    raise BuilderDirectiveNotClosed(self)


  def isDirectoryOrJsFile(self, path):
    """
    Returns True or False is a path is a directory or a Javascript file.
    """
    return (os.path.isdir(path) or 
            (os.path.isfile(path) and
             os.path.splitext(path)[1] == '.js'))



  def parseDirectory(self, dir, recurse=False):
    """
    Parse a directory for javascript files.
    """
    files = [f for f in os.listdir(dir) 
             if(f != ".svn" and self.isDirectoryOrJsFile(os.path.join(dir, f)))]

    for afile in files:
      path = os.path.join(dir, afile)
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


  def metadataForFile(self, name):
    """
    Returns the metadata for a particular file, throwing an exception if not found
    """
    if self.metadata.has_key(name):
      return self.metadata[name]
    else:
      raise NoSuchFileError(self, "metadataForFile error: %s" % name)


  def dependenciesForFile(self, name):
    """
    Returns the dependency list for a particular file.
    """
    deps = []
    if (self.metadataForFile(name)).has_key('dependencies'):
      deps = (self.metadataForFile(name))['dependencies']
    return deps


  def packageForFile(self, name):
    """
    Returns the package that a file belongs to.
    """
    metadata = self.metadataForFile(name)

    if metadata.has_key('package') and metadata['package'] != None:
      return self.packages[metadata['package']]
    else:
      return []


  def dependenciesFor(self, file, excludeNonPackageFiles=True):
    """
    Returns the dependencies for a particular file. Excludes files not in the file's own package by default.
    """
    deps = self.dependenciesForFile(file)
    if not excludeNonPackageFiles:
      return deps
    packageFiles = self.packageForFile(file)
    return [f for f in deps if f in packageFiles]


  def writePackagesJSON(self, output="../config/packages.json", writeToFile=True):
    """
    Write a package json description.
    """

    # create dictionary to hold file data as well as package data
    packageDict = {}
    packageDict['packages'] = self.packages
    packageDict['files'] = self.metadata
    packageDict['exports'] = self.exports
    
    # get a json dump
    jsonString = json.dumps(packageDict, sort_keys=True, indent=4)
    
    # write this out to a file
    if writeToFile:
      fileHandle = open(output, "w")
      fileHandle.write(jsonString)
      fileHandle.close()
    else:
      print jsonString

  def writeTestsJSON(self, output="../config/tests.json", writeToFile=True):
    """
    Write tests json description.
    """

    # create dictionary to hold file data as well as package data
    testsDict = {}
    testsDict['dependencies'] = self.testDependencies
    
    # get a json dump
    jsonString = json.dumps(testsDict, sort_keys=True, indent=4)
    
    # write this out to a file
    if writeToFile:
      fileHandle = open(output, "w")
      fileHandle.write(jsonString)
      fileHandle.close()
    else:
      print jsonString


  def filesWithDependency(self, name):
    """
    Returns a list of files that have particular dependency
    """

    filesWithDependency = []
    for fileName, metadata in self.metadata.items():
      if self.sorter.isInDependencyTree(fileName, name):
        filesWithDependency.append(fileName)
    return filesWithDependency


  def recursivelyAddTestDependency(self, testFile, dependency):
    """
    Add a file to the list of dependencies of a test. If this file is dependent on other
    files add them to the list before
    """
    
    dependencies = self.dependenciesForFile(dependency)
    transitiveDependencies = self.testDependencies[testFile]
    
    # always add X's dependencies before adding X itself
    for newDependency in dependencies:
      self.recursivelyAddTestDependency(testFile, newDependency)
      
    path = self.metadata[dependency]['path']
    
    if not path in transitiveDependencies:
      transitiveDependencies.append(path)
    

  def calculateTestDependencies(self):
    """
    Create a list of files to be loaded before a each test can be run
    """
    
    self.testDependencies = {}
    
    for testFile in self.tests:
      print "Calculating test dependency: %s" % testFile
      metadata = self.metadata[testFile]
      self.testDependencies[testFile] = []
      
      if metadata.has_key('dependencies'):
        for dependency in metadata['dependencies']:
          self.recursivelyAddTestDependency(testFile, dependency)

      self.testDependencies[testFile].append(metadata['path'])


  def collectExports(self):
    """
    Collects all export metadata.
    """
    self.exports = {}
    for afile in self.metadata:
      if self.metadata[afile].has_key('export'):
        # determine the exports
        fileExports = self.metadata[afile]['export']
        print fileExports
        if isinstance(fileExports, bool):
          raise MissingExportDescription(self, message="No mapping value supplied to @export directive in file %s" % self.metadata[afile]['path'])
        exportMappings = dict([((len(kv) > 1 and (kv[0].strip(), kv[1].strip())) or 
                                (kv[0].strip(), kv[0].strip())) 
                               for kv in [s.split(" as ") for s in fileExports]])
        self.exports.update(exportMappings)
        


  def build(self, path, recurse=False):
    """
    Creates all the internal data structures and sorts all found packages.
    """

    self.metadata = {}
    # build all the internal data structures
    self.parseDirectory(path, recurse)
    # sort the internal package data structure
    self.sortPackages()
    self.calculateTestDependencies()
    self.collectExports()


def usage():
  print "corebuilder.py takes the following flags:"
  print "  -h help"
  print "  -i input, directory or file"
  print "  -r recursively search directories"
  print "  -o output directory. two files will be generated - packages.json and tests.json"


def main(argv):
  inputFile = "../"
  outputDir = "../config"
  recursive = False

  try:
    opts, args = getopt.getopt(argv, "hi:o:r", ["help", "input=", "output="])
  except getopt.GetoptError:
    usage()
    sys.exit(2)

  for opt, arg in opts:
    if opt in ("-h", "--help"):
      usage()
      sys.exit()
    elif opt in ("-i", "--input"):
      inputFile = arg
    elif opt in ("-o", "--output"):
      outputDir = arg
    elif opt == "-r":
      recursive = True
    else:
      assert False, "unhandled options"

  packagesFile = outputDir + '/packages.json'
  testsFile = outputDir + '/tests.json'

  builder = SSCoreBuilder()
  builder.build(path=inputFile, recurse=True)
  builder.writePackagesJSON(output=packagesFile)
  builder.writeTestsJSON(output=testsFile)
  
  
if __name__ == "__main__":
  main(sys.argv[1:])
  pass
