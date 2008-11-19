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

def includeFile(outFile, incFilename):
  flen = len(incFilename);
  prefix = ("\n// Start %s " % incFilename) + (69 - flen) * '-' + "\n\n";
  postfix = ("\n\n// End %s " % incFilename) + (71 - flen) * '-' + "\n\n";
              
  incFile = open('../client/%s' % incFilename)
  outFile.write(prefix)
  outFile.write(incFile.read())
  outFile.write(postfix)
  incFile.close()

def main(argv):
  metadataJsonFile = open('../config/packages.json')
  metadata = json.loads(metadataJsonFile.read())
  metadataJsonFile.close()
  
  inFile = open('../client/ShiftSpace-0.5.js')
  outFile = open('../shiftspace.user.js', 'w')
  
  for line in inFile:
    mo = INCLUDE_PACKAGE_REGEX.match(line)
    if mo:
      package = mo.group(1)

      outFile.write('\n// === START PACKAGE [%s] ===\n\n' % package)

      for component in metadata['packages'][package]:
        includeFile(outFile, metadata['files'][component]['path'])

      outFile.write('\n// === END PACKAGE [%s] ===\n\n' % package)
    else:
      mo = INCLUDE_REGEX.match(line)
      if mo:
        incFilename = mo.group(1)
        includeFile(outFile, incFilename)
      else:
        outFile.write(line) 
  
if __name__ == "__main__":
  main(sys.argv[1:])
  pass
