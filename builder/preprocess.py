#!/usr/bin/python

# Reads the file/package metadata information which was created by corebuilder
# and preprocesses ShiftSpace.js into shiftspace.user.js

import os
import sys
import re
import getopt
import simplejson as json # need to install simplejson from here http://pypi.python.org/pypi/simplejson/


class SSError(Exception): 
  def __init__(self, message = ''):
    self.message = message

  def __str__(self):
    return self.message


class SSPreProcessor:

  INCLUDE_PACKAGE_REGEX = re.compile('\s*//\s*INCLUDE PACKAGE\s+(\S+)\s*\n')
  INCLUDE_REGEX = re.compile('\s*//\s*INCLUDE\s+(\S+)\s*\n')
  SYSTEM_TABLE_REGEX = re.compile('%%SYSTEM_TABLE%%')
  ENV_NAME_REGEX = re.compile('%%ENV_NAME%%')
  VARS_REGEX = re.compile('%%VARS%%')

  def setEnvVars(self, source):
    if self.envData != None:
      for key in self.envData['data'].keys():
        if key != "VARS":
          varRegex = re.compile("%%%%%s%%%%" % (key))
          source = varRegex.sub('%s' % self.envData['data'][key], source)

      source = self.SYSTEM_TABLE_REGEX.sub(self.envData['meta'], source)
      source = self.ENV_NAME_REGEX.sub(self.envData['name'], source)

      envVars = ""
      if self.envData['data'].has_key("VARS"):
        envVars = "\n".join([("var %s = %s;" % (k, json.dumps(v))) for k,v in self.envData['data']['VARS'].iteritems()])
      source = self.VARS_REGEX.sub(envVars, source)
    return source


  def sourceForFile(self, incFilename):
    flen = len(incFilename)
    
    logline1 = ''.join(["\nif (SSInclude != undefined) SSLog('Including ", incFilename, "...', SSInclude);\n"])
    prefix = ''.join(["\n// Start ", incFilename, (69 - flen) * '-', "\n\n"])
    postfix = ''.join(["\n\n// End ", incFilename, (71 - flen) * '-', "\n\n"])
    logline2 = "\nif (SSInclude != undefined) SSLog('... complete.', SSInclude);\n"
  
    realName = os.path.splitext(os.path.basename(incFilename))[0]

    if realName in self.proj['files']['remove']:
      return '// PROJECT OVERRIDE -- FILE NOT INCLUDED\n\n'
    if self.proj['files']['replace'].has_key(realName):
      incFilename = self.metadata['files'][realName]['path']
      return ''.join(['// PROJECT OVERRIDE -- INCLUDING ', incFilename, ' INSTEAD\n'])
    
    sourceFile = open(incFilename)

    sysavail = ("\nif(__sysavail__) __sysavail__.files.push('%s');\n" % os.path.splitext(os.path.basename(incFilename))[0])
    
    uiclass = ""
    if self.metadata['files'].has_key(realName) and self.metadata['files'][realName].has_key('uiclass'):
      uiclass = ("\nif(typeof ShiftSpaceUI != 'undefined') ShiftSpaceUI.%s = %s;\n" % (realName, realName))
    
    return ''.join([logline1, prefix, sourceFile.read(), postfix, logline2, sysavail, uiclass])
    
    
  def sourceForPackage(self, package):
    source = []
    source.append('\n// === START PACKAGE [%s] ===\n' % package)

    if package in self.proj['packages']['remove']:
      source.append('// PROJECT OVERRIDE -- PACKAGE NOT INCLUDED\n\n')
      return

    if self.proj['packages']['replace'].has_key(package):
      package = self.proj['packages']['replace'][package]
      source.append('// PROJECT OVERRIDE -- INCLUDING PACKAGE %s INSTEAD\n' % package)

    source.append('\nif(__sysavail__) __sysavail__.packages.push("%s");\n' % package)

    if not self.metadata['packages'].has_key(package):
      self.missingFileError(package)

    for component in self.metadata['packages'][package]:
      if self.metadata['files'].has_key(component):
        source.append(self.sourceForFile(self.metadata['files'][component]['path']))

    source.append('\n// === END PACKAGE [%s] ===\n\n' % package)
    return ''.join(source)


  def preprocessFile(self, file, fileName):
    preprocessed = file.read()  
    
    # recursively include source for packages and files
    hasPackageOrFileInclude = True
    while hasPackageOrFileInclude:
      packageMatch = None
      fileIncludeMatch = None
      
      packageMatch = self.INCLUDE_PACKAGE_REGEX.search(preprocessed)
      
      if packageMatch == None:
        fileIncludeMatch = self.INCLUDE_REGEX.search(preprocessed)

      if packageMatch:
        package = packageMatch.group(1)
        source = self.sourceForPackage(package)

        start = packageMatch.start()
        end = packageMatch.end()
        
        preprocessed = ''.join([preprocessed[0:start],
                                source,
                                preprocessed[end:]])
      elif fileIncludeMatch:
        incFilename = fileIncludeMatch.group(1)
        if not self.metadata['files'].has_key(incFilename):
          self.missingFileError(incFilename)
        source = self.sourceForFile(self.metadata['files'][incFilename]['path'])

        start = fileIncludeMatch.start()
        end = fileIncludeMatch.end()
        
        preprocessed = ''.join([preprocessed[0:start], 
                                source, 
                                preprocessed[end:len(preprocessed)]])
      else:
        hasPackageOrFileInclude = False
    
    preprocessed = self.setEnvVars(preprocessed)
      
    return preprocessed


  def missingFileError(self, package):
    print "Error: no such package %s exists, perhaps you forgot to run corebuilder.py first?" % package
    sys.exit(2)

            
  def usage(self):
      print "Usage: python preprocess.py <environment definition> [<project>] [<input file>]"
      print "  -e REQUIRED, the environment file, must be in SHIFTSPACE_DIR/config/env/"
      print "  -h help"
      print "  -p project, defaults to shiftspace.json, must be in SHIFTSPACE_DIR/config/proj/"
      print "  -i input file, defaults to SHIFTSPACE_DIR/client/ShiftSpace.js"
      print "  -o output file, if none specified, writes to standard output" 


  def main(self, argv):
    # defaults
    proj = "shiftspace"
    outFile = None
    inFile = None
    envFileOption = None
    exportObjects = False
    fileName = None

    try:
      opts, args = getopt.getopt(argv, "hp:i:o:e:x", ["environment=", "project=", "output=", "input=", "help", "project", "export"])
    except getopt.GetoptError:
      self.usage()
      sys.exit(2)

    # check for environment key
    optsDict = dict(opts)
    if not optsDict.has_key("-e") and not optsDict.has_key("--environment"):
      self.usage()
      sys.exit(2)

    # parse arguments
    for opt, arg in opts:
      if opt in ("-h", "--help"):
        self.usage()
        sys.exit()
      elif opt in ("-p", "--project"):
        proj = arg
      elif opt in ("-o", "--output"):
        outFile = arg
      elif opt in ("-i", "--input"):
        inFile = arg
      elif opt in ("-e", "--environment"):
        envFileOption = arg
      elif opt in ("-x", "--export"):
        exportObjects = True
      else:
        assert False, "unhandled options"
        
    # get the metadata
    metadataJsonFile = open('../config/packages.json')
    metadataStr = metadataJsonFile.read()
    self.metadata = json.loads(metadataStr)
    metadataJsonFile.close()

    # get the input file
    if inFile != None:
      try:
        self.inFile = open(inFile)
        fileName = os.path.splitext(os.path.basename(inFile))[0]
      except IOError:
        print "Error: no such input file exist"
        sys.exit(2)
    else:
      self.inFile = open('../client/ShiftSpace.js')

    if outFile != None:
      self.outFile = open(outFile, "w")
    else:
      self.outFile = sys.stdout
  
    # load environment file
    envFile = None
    envFilePath = '../config/env/%s.json' % (os.path.splitext(envFileOption)[0])

    try:
      # load environment file
      envFile = open(envFilePath)
      envFileName = argv[0]
      env = json.loads(envFile.read())
      envFile.close()
      
      self.envData = {"name": envFileName, "data": env, "meta": metadataStr}
    except IOError:
      print "Error: no such environment file exists. (%s)" % envFilePath
      sys.exit(2)
    
    projFilePath = '../config/proj/%s.json' % (os.path.splitext(proj)[0])
    try:
      # load project file
      projFile = open(projFilePath)
      self.proj = json.loads(projFile.read())
      projFile.close()
    except IOError:
      print "Error: no such project file exists. (%s)" % projFilePath
      sys.exit(2)
    
    # remove things not included in the project
    for packageToRemove in self.proj['packages']['remove']:
      self.metadata['packages'].pop(packageToRemove)
    for fileToRemove in self.proj['files']['remove']:
      self.metadata['files'].pop(fileToRemove)
    self.envData['meta'] = json.dumps(self.metadata, sort_keys=True, indent=4)
    
    preprocessed = self.preprocessFile(self.inFile, fileName)
    self.outFile.write(preprocessed)

    # export symbols
    if exportObjects and len(self.metadata['exports']) > 0:
      print self.metadata['exports']
      print type(self.metadata['exports'])
      self.outFile.write('if(typeof ShiftSpace == "undefined") ShiftSpace = {};\n')
      for realName, exportName in self.metadata['exports'].iteritems():
        self.outFile.write('if(typeof %s != "undefined") ShiftSpace.%s = %s;\n' % (realName, exportName, realName))

    # load main if there is one
    if self.proj.has_key("main"):
      mainFile = "../config/main/%s.js" % os.path.splitext(self.proj["main"])[0]
      try:
        mainFileHandle = open(mainFile)
        self.outFile.write(mainFileHandle.read())
        mainFileHandle.close()
      except IOError:
        print "Error: no such main file exists. (%s)" % mainFile

    self.outFile.close()
    self.inFile.close()

  
if __name__ == "__main__":
  preprocessor = SSPreProcessor()
  preprocessor.main(sys.argv[1:])