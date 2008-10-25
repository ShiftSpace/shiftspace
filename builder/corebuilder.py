# Builds a custom ShiftSpace core file from a config file, handles depedencies

#import json # only available in Python >= 2.6 
import os
import sys
import re
import simplejson as json # need to install simplejson from here http://pypi.python.org/pypi/simplejson/

#python json
#json.dumps([1, 2, 3, 4, 5]) -> returns '[1, 2, 3, 4, 5]'

#pretty prin
#json.dumps([1, 2, 3, 4, 5], sort_keys=True, indent=4)
#/Users/davidnolen/Sites/shiftspace-0.5/client/
class SSCoreBuilder():

  def __init__(self):
    self.buildDefinitions = {}
    self.packages = {}
    self.names = {}

    # regex for checking for a build definition
    self.builderPattern = re.compile('\/\/\s*==\s*Builder\s*==[\sA-Za-z0-9@.=/]*\/\/\s*==\s*/Builder\s*==', re.MULTILINE)
    self.requiredPattern = re.compile('@required\s*[A-Za-z0-9_.]*')
    self.optionalPattern = re.compile('@optioned\s*[A-Za-z0-9_.]*')
    self.packagePattern = re.compile('@package\s*[A-Za-z0-9_.]*')
    self.dependenciesPattern = re.compile('@dependencies\s*[A-Za-z0-9_.,\s]*')


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

    fileHandle = open(path)
    contents = fileHandle.read()
    match = self.builderPattern.search(contents)

    if match:
      print "FOUND A MATCH %s" % path
      print self.substringForMatch(contents, match)

    fileHandle.close()


  def isDirectoryOrJsFile(self, path):
    """
    Returns True or False is a path is a directory or a Javascript file.
    """
    return (os.path.isdir(path) or 
            (os.path.isfile(path) and
             os.path.splitext(path)[1] == '.js'))


  def substringForMatch(self, string, match):
    return string[match.span()[0]: match.span()[1]]


  def parseRequireDirective(self, builderDescription):
    pass


  def parseNameDirective(self, builderDescription):
    pass


  def parsePackageDirective(self, builderDescription):
    pass

  
  def parseDependencies(self, builderDescription):
    depsString = self.substringForMatch(self.dependenciesPattern.match(builderDescription), builderDescription)
    # get the dependency names and strip each of white space
    dependencies = [name.strip() for name in depsString[13:len(depsString)].split(',')]
    print dependencies
    

  def parseDirectory(self, dir):
    """
    Parse a directory for javascript files.
    """
    files = [f for f in os.listdir(dir) if(f != ".svn" and 
                                           self.isDirectoryOrJsFile(os.path.join(dir, f)))]

    for file in files:
      path = os.path.join(dir, file)
      # check each file for the presence of a build directive
      if os.path.isdir(path):
        self.parseDirectory(path)
      else:
        self.parseFile(path)


  def writePackageJSON(self, packageDef):
    """
    Write a package json description.
    """
    pass


  def buildTarget(self, packageJSON):
    """
    Build a target based on the package description.
    """
    pass


b = None
def test():
  global b
  b = SSCoreBuilder()
  b.parseDirectory("/Users/davidnolen/Sites/shiftspace-0.5/client/")

#if __name__ == "__main__":
#  print ("corebuilder.py running " + sys.argv[1])
#  builder = SSCoreBuilder()
#  builder.writePackageJSON([])
