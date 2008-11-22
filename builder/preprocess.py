#!/usr/bin/python

# Reads the file/package metadata information which was created by corebuilder
# and preprocesses ShiftSpace.js into shiftspace.user.js

#import json # only available in Python >= 2.6 
import os
import sys
import re
import getopt
import simplejson as json # need to install simplejson from here http://pypi.python.org/pypi/simplejson/

# Exceptions ==============================

class SSError(Exception): 
  def __init__(self, builder, message = ''):
    self.message = message

  def __str__(self):
    return self.message

INCLUDE_PACKAGE_REGEX = re.compile('^\s*//\s*INCLUDE PACKAGE\s+(\S+)\s*$');
INCLUDE_REGEX = re.compile('^\s*//\s*INCLUDE\s+(\S+)\s*$');

def setEnvVars(line, env=None):
  if env != None:
    for key in env['data'].keys():
      line = line.replace(("%%%%%s%%%%" % (key)), '%s' % env['data'][key])
    line = line.replace("%%SYSTEM_TABLE%%", env['meta'])
    line = line.replace("%%ENV_NAME%%", env['name'])
  return line
  

def includeFile(outFile, incFilename, env=None):
  flen = len(incFilename);
  logline1 = "\nif (SSInclude != undefined) SSLog('Including %s...', SSInclude);\n" % incFilename 
  prefix = ("\n// Start %s " % incFilename) + (69 - flen) * '-' + "\n\n"
  postfix = ("\n\n// End %s " % incFilename) + (71 - flen) * '-' + "\n\n"
  logline2 = "\nif (SSInclude != undefined) SSLog('... complete.', SSInclude);\n"
  
  incFile = open('../client/%s' % incFilename)
  outFile.write(logline1)
  outFile.write(prefix)

  for line in incFile:
    if env != None:
      line = setEnvVars(line, env)
    outFile.write(line)

  outFile.write(postfix)
  outFile.write(logline2)
  outFile.write("\nif(__sysavail__) __sysavail__.files.push('%s');\n" % os.path.splitext(os.path.basename(incFilename))[0])
  incFile.close()


def missingFileError():
  print "Error: no such package %s exists, perhaps you forgot to run corebuilder.py first?" % package
  sys.exit(2)


def main(argv):
  metadataJsonFile = open('../config/packages.json')
  metadataStr = metadataJsonFile.read()
  metadata = json.loads(metadataStr)
  metadataJsonFile.close()
  
  inFile = open('../client/ShiftSpace-0.5.js')
  outFile = open('../shiftspace.user.js', 'w')
  
  if len(argv) < 1:
    print "Usage: python preprocess.py <environment definition>"
    return -1

  envFile = None
  evnFileName = None
  try:
    # load environment file
    envFile = open('../config/env/%s.json' % argv[0])
    envFileName = argv[0]
  except IOError:
    # bail!
    print "Error: no such environment file exist."
    sys.exit(2)
    
  env = json.loads(envFile.read())
  envData = {"name":envFileName, "data":env, "meta":metadataStr}

  envFile.close()
  
  for line in inFile:
    mo = INCLUDE_PACKAGE_REGEX.match(line)
    if mo:
      package = mo.group(1)

      outFile.write('\n// === START PACKAGE [%s] ===\n\n' % package)
      # update the available packages dictionary
      outFile.write('\nif(__sysavail__) __sysavail__.packages.push("%s");\n' % package)

      # bail! no such package
      if not metadata['packages'].has_key(package):
        missingFileError()

      for component in metadata['packages'][package]:
        includeFile(outFile, metadata['files'][component]['path'], envData)

      outFile.write('\n// === END PACKAGE [%s] ===\n\n' % package)
    else:
      mo = INCLUDE_REGEX.match(line)
      if mo:
        incFilename = mo.group(1)
        
        # bail! no such file
        if not metadata['files'].has_key(incFilename):
          missingFileError()

        includeFile(outFile, metadata['files'][incFilename]['path'], envData)
      else:
        outFile.write(setEnvVars(line, envData))
  
  outFile.close()
  inFile.close()

  
if __name__ == "__main__":
  main(sys.argv[1:])
  pass
