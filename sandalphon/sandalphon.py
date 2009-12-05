#!/usr/bin/python

#  Take a HTML file and loads any referenced HTML files as well as CSS files.

import os
import sys
import re
import getopt
import urllib
import xml
import xml.etree.ElementTree as ElementTree # Python >= 2.5
import simplejson as json  # need to install simplejson from here http://pypi.python.org/pypi/simplejson/


def elementHasAttribute(element, attrib, value=None):
    """
    Check if an element has an attribute and matches a value
    """
    return ((value != None) and (element.get(attrib) == value)) or (element.get(attrib) != None)


class SandalphonCompiler:
    def __init__(self, outputDirectory=None, envFile=None):
        # store paths to interface files
        self.paths = {}
        self.visitedViews = {}
        # load the specified environment file
        if envFile:
            fh = open('config/env/%s.json' % envFile)
        if fh == None:
            print "Environment file SHIFTSPACE_ROOT/config/env/%s.json does not exist" % envFileName
            sys.exit(2)
        else:
            envData = json.loads(fh.read())
            fh.close()
            env = {"name": envFile, "data": envData}
        self.env = env
        if self.env:
            self.outputDirectory = os.path.join(outputDirectory, self.env["name"])
            if not os.path.exists(self.outputDirectory):
                os.makedirs(self.outputDirectory)
        else:
            self.outputDirectory = outputDirectory
        # load the packages json file
        packagesJsonFile = open('config/packages.json')
        self.packages = json.loads(packagesJsonFile.read())
        self.files = self.packages['files']
        self.cssFile = ''
        self.cssFiles = []
        self.templatePattern = re.compile('<\?.+?\?>')
        self.cssImagePattern = re.compile('(?<=url\()/images/')
        self.htmlImagePattern = re.compile("(?<=src=[\"\'])/images/(?=.+?[\"\'])")
        self.getPaths()

    def getPaths(self):
        """
        Looks into views.json and builds the paths to the interface files
        """
        fh = open("config/views.json")
        self.paths = json.loads(fh.read())
        fh.close()
    
    def validateMarkup(self, markup):
        """
        Make sure the passed in markup checks out.
        """
        try:
            ElementTree.fromstring(markup)
        except xml.parsers.expat.ExpatError:
            raise xml.parsers.expat.ExpatError
        pass
  
    def loadView(self, view):
        """
        Load a views a view and returns it.
        """
        filePath = self.paths.get(view)
        if filePath != None:
            htmlPath = os.path.join(filePath, view+'.html')
            fileHandle = open(htmlPath)
            fileContents = fileHandle.read()
            fileHandle.close()
            # add this view's css if necessary
            if self.visitedViews.has_key(view) != True:
                self.addCSS({"path":os.path.join(filePath, view+'.html'), "file":view})
                self.visitedViews[view] = True
            return fileContents
        else:
            return None
    
    def preprocessCSSImageUrls(self, css, imageUrl):
        return self.cssImagePattern.sub(imageUrl, css)
      
    def preprocessHTMLImageUrls(self, html, imageUrl):
        return self.htmlImagePattern.sub(imageUrl, html)
    
    def addCSS(self, fileData):
        self.cssFiles.append(fileData)
    
    def addCSSForHTMLPath(self, filePath):
        """
        Appends the contents of the specified css file to self.cssFile.
        """
        cssPath = os.path.splitext(filePath)[0]+".css"
        basename = os.path.basename(cssPath)
        # load the css file
        try:
            fileHandle = open(cssPath)
            if fileHandle != None:
                if self.env:
                    server = self.env["data"]["SERVER"]
                    importPath = "%sclient/%s" % (server, cssPath)
                    imageUrl = self.env["data"].get("IMAGESDIR")
                    if imageUrl:
                        preprocessed = self.preprocessCSSImageUrls(fileHandle.read(), imageUrl)
                        importPath = os.path.join(self.outputDirectory, basename)
                        newCSSFileHandle = open(importPath, 'w')
                        newCSSFileHandle.write(preprocessed)
                        newCSSFileHandle.close()
                    # damn Windows
                    importPath = (server + importPath).replace('\\', '/')
                    self.cssFile = self.cssFile + "@import url(%s);\n" % importPath
                else:
                    self.cssFile = self.cssFile + "\n\n/*========== " + cssPath + " ==========*/\n\n"
                    self.cssFile = self.cssFile + fileHandle.read()
            fileHandle.close()
        except IOError:
            pass
    
    def uiclassDeps(self, uiclass, result=[]):
        """
        Returns all uiclass superclasses fo a uiclass.
        """
        # TODO - throw error if uiclass not found! David 7/12/09
        # load any css for any dependencies as well
        entry = self.files[uiclass]
        if entry.has_key('dependencies'):
            deps = entry['dependencies']
            for dep in deps:
                if self.files[dep].has_key('uiclass'):
                    result.append(dep)
                    self.uiclassDeps(dep, result)
        return result
    
    def addCSSForUIClasses(self, interfaceFile):
        """
        Loads any uiclass css that hasn't already been included.
        """
        element = ElementTree.fromstring(interfaceFile)
        uiclasses = [el.get('uiclass') for el in element.findall(".//*") if elementHasAttribute(el, "uiclass")]
        if elementHasAttribute(element, "uiclass"):
            uiclasses.append(element.get('uiclass'))
        depuiclasses = []
        for uiclass in uiclasses:
            depuiclasses.extend(self.uiclassDeps(uiclass))
        uiclasses.extend(depuiclasses)
        seen = {}
        for uiclass in uiclasses:
            seen[uiclass] = True
        viewDirectory = "client/views/"
        toLoad = seen.keys()
        [self.addCSS({"path": os.path.join(os.path.join(viewDirectory, uiclass),
                                           uiclass+".css"),
                      "file":uiclass})
         for uiclass in toLoad]
    
    def getInstruction(self, str):
        """
        Takes a raw template instruction and returns a tuple holding the instruction name and it's parameter.
        """
        temp = str[2:len(str)-2]
        temp = temp.split(':')
        return (temp[0], temp[1])
    
    def handleInstruction(self, instruction, file):
        """
        Takes an instruction tuple and the contents of the file as a string. Returns the file post instruction.
        """
        if instruction[0] == "view":
            theView = self.loadView(os.path.basename(instruction[1]))
            return self.templatePattern.sub(theView, file, 1)
        else:
            raise Exception("Instruction %s not recognized" % instruction)
    
    def compile(self, inputFile=None, jsonOutput=False):
        """
        Compile an interface file down to its parts
        """
        # First regex any dependent files into a master view
        # Parse the file at the path
        fileHandle = open(inputFile)
        interfaceFile = fileHandle.read()
        fileHandle.close()
        # add the css for the main file at this path
        self.addCSSForHTMLPath(inputFile)
        hasCustomViews = True
        while hasCustomViews:
            match = self.templatePattern.search(interfaceFile)
            if match:
                span = match.span()
                instruction = self.getInstruction(interfaceFile[span[0]:span[1]])
                interfaceFile = self.handleInstruction(instruction, interfaceFile)
            else:
                hasCustomViews = False
        # validate it
        ElementTree.fromstring(interfaceFile)
        # load all css
        self.addCSSForUIClasses(interfaceFile)
        
        # add css for all the ui classes first
        coreui = [item["path"] for item in self.cssFiles 
                  if item["file"] in self.packages['packages']['ShiftSpaceCoreUI']]
        [self.addCSSForHTMLPath(path) for path in coreui]
        
        # output the global css file if it exists
        globalCSS = self.env["data"].get("GLOBAL_CSS")
        if globalCSS:
            cssPath = globalCSS
            self.addCSSForHTMLPath(cssPath)
        
        # out the rest of the css files
        notcore = [item["path"] for item in self.cssFiles
                   if (not item["file"] in self.packages['packages']['ShiftSpaceCoreUI'])]
        [self.addCSSForHTMLPath(path) for path in notcore]

        # output to specified directory or standard out or as json
        if self.outputDirectory != None:
            fileName, ext = os.path.splitext(os.path.basename(inputFile))
            fullPath = os.path.join(self.outputDirectory, fileName+"Main.html")
            fileHandle = open(fullPath, "w")
            if self.env:
                imagesUrl = self.env["data"].get("IMAGESDIR")
                if imagesUrl:
                    interfaceFile = self.preprocessHTMLImageUrls(interfaceFile, imagesUrl)
            fileHandle.write(interfaceFile)
            fileHandle.close()
            cssFilePath = os.path.join(self.outputDirectory, fileName+"Main.css")
            fileHandle = open(cssFilePath, "w")
            fileHandle.write(self.cssFile)
            fileHandle.close()
        elif jsonOutput == True:
            outputJsonDict = {}
            outputJsonDict['interface'] = urllib.quote(interfaceFile)
            outputJsonDict['styles'] = urllib.quote(self.cssFile)
            print json.dumps(outputJsonDict, indent=4)
        else:
            print interfaceFile
            print "\n"
            print self.cssFile


def usage():
    print "sandalphon.py takes the following flags:"
    print "  -h help"
    print "  -i input file, must be an .html file"
    print "  -o output directory."
    print "  -j json output. Sends to standard out."


def main(argv):
    """
    Parse the command line arguments.
    """
    jsonOutput = False
    outputDirectory = None
    inputFile = None
    envFile = None
    env = None
    try:
        opts, args = getopt.getopt(argv, "i:o:e:jh", ["input=", "output=", "environment=", "json", "help"])
    except:
        print "Invalid flag\n"
        usage()
        sys.exit(2)
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()
        elif opt in ("-i", "--input"):
            inputFile = arg
        elif opt in ("-o", "--output"):
            outputDirectory = arg
        elif opt in ("-j", "--json"):
            jsonOutput = True
        elif opt in ("-e", "--environment"):
            envFile = arg
    if inputFile == None:
        print "No input file\n"
        usage()
        sys.exit(2)
    compiler = SandalphonCompiler(outputDirectory, envFile)
    compiler.compile(inputFile, jsonOutput)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1:])
    else:
        usage()
