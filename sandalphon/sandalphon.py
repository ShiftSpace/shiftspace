import os
import sys
import re
import xml.etree.ElementTree as ElementTree

class ViewParser:
    def __init__(self, element):
        self.element = element;


class SSTableViewParser(ViewParser):
    def __init__(self, element):
        ViewParser.__init__(self, element)
        pass


class SSCustomTableRowParser(ViewParser):
    def __init__(self, element):
        ViewParser.__init__(self, element)


def elementHasAttribute(element, attrib, value=None):
    """
    Check if an element has an attribute and matches a value
    """
    return ((value != None) and (element.get(attrib) == value)) or (element.get(attrib) != None)


class SandalphonCompiler:

    def __init__(self):
        # store paths to interface files
        self.paths = {}
        self.visitedViews = {}
        # store concatenated CSS file
        self.cssFile = ''
        # regex for template pattern /<\?.+?\?>/g
        self.templatePattern = re.compile('<\?.+?\?>')
        # generate lookup paths
        self.getPaths()


    def getPaths(self):
        """
        Looks into views and builds the paths to the interface files
        """
        viewsDirectory = "../client/views/"
        customViewsDirectory = "../client/customViews/"
        
        # grab the base view classes and filter out .svn files
        views = [f for f in os.listdir(viewsDirectory) if(f != ".svn")]
        # grab the custom views and filter out the .svn files
        customViews = [f for f in os.listdir(customViewsDirectory) if (f != ".svn")]

        self.paths = {}

        # These are bundle directories, .js .css .html
        for f in views:
            parts = os.path.splitext(f)
            base = parts[0]
            self.paths[base] = os.path.join(viewsDirectory, f)

        # These are not, need to look only for the html file, about to change
        for f in customViews:
            parts = os.path.splitext(f)
            base = parts[0]
            self.paths[base] = os.path.join(customViewsDirectory, base)
        

    def validateMarkup(self, markup):
        """
        Make sure the passed in markup checks out.
        """
        try:
            element = ElementTree.fromstring(markup)
        except xml.parsers.expat.ExpatError:
            raise xml.parsers.expath.ExpatError
        pass


    def parserForView(self, view):
        """
        Return the view parser class object associated with the view element.
        """
        theClass = view.get("uiclass") + "Parser"
        module = sys.modules[ViewParser.__module__]
        if(hasattr(module, theClass)):
            return getattr(module, theClass)
        else:
            return None


    def loadView(self, view):
        """
        Load a views a view and returns it.
        """
        filePath = self.paths[view]
        print "loadView: (%s, %s)" % (view, filePath)

        if filePath != None:
            htmlPath = os.path.join(filePath, view+'.html')
            print "htmlPath %s" % htmlPath
            # load the file
            fileHandle = open(htmlPath)

            # verify that this file is valid mark up
            fileContents = fileHandle.read()
            fileHandle.close()
            
            # add this view's css if necessary
            if self.visitedViews.has_key(view) != True:
                self.addCSSForHTMLPath(os.path.join(filePath, view+'.html'))
                self.visitedViews[view] = True

            return fileContents
        else:
            return None


    def addCSSForHTMLPath(self, filePath):
        print "addCSSForHTMLPath %s" % filePath
        cssPath = os.path.splitext(filePath)[0]+".css"
        # load the css file
        try:
            fileHandle = open(cssPath)

            if fileHandle != None:
                self.cssFile = self.cssFile + "\n\n/*========== " + cssPath + " ==========*/\n\n" + fileHandle.read()

            fileHandle.close()
        except IOError:
            print "***** Could not load css file at %s *****" % cssPath

    
    def addCSSForUIClasses(self, interfaceFile):
        # parse this file
        element = ElementTree.fromstring(interfaceFile)
        uiclasses = [el.get('uiclass') for el in element.findall(".//*") if elementHasAttribute(el, "uiclass")]

        print "Found some : %s" % uiclasses

        seen = {}

        for item in uiclasses:
            seen[item] = True

        viewDirectory = "../client/views/"

        toLoad = seen.keys()
        [self.addCSSForHTMLPath(os.path.join(os.path.join(viewDirectory, item), item+".css")) for item in toLoad]

    
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
        if instruction[0] == "customView":
            # load this view, will need match that view as well
            theView = self.loadView(instruction[1])
            # replace the match
            return self.templatePattern.sub(theView, file, 1)

        return file
    

    def compile(self, path):
        """
        Compile an interface file down to its parts
        """
        # First regex any dependent files into a master view
        # Parse the file at the path
        print "Loading file at path " + path
        fileHandle = open(path)
        interfaceFile = fileHandle.read()
        fileHandle.close()
        print "File loaded"

        # add the css for the main file at this path
        self.addCSSForHTMLPath(path)
        
        matches = self.templatePattern.finditer(interfaceFile)
        
        hasCustomViews = True
        while hasCustomViews:
            match = self.templatePattern.search(interfaceFile)
            if match:
                # get the span of the match in the file
                span = match.span()
                # grab the instruction
                instruction = self.getInstruction(interfaceFile[span[0]:span[1]])
                # mutate the file based on it
                interfaceFile = self.handleInstruction(instruction, interfaceFile)
            else:
                hasCustomViews = False
                
        # validate it
        tree = ElementTree.fromstring(interfaceFile)
 
        # load any css for references found at this level
        self.addCSSForUIClasses(interfaceFile)

        # get the actual file name
        compiledViewsDirectory = "../client/compiledViews/"

        fileName = os.path.basename(path)
        fullPath = os.path.join(compiledViewsDirectory, fileName)

        print "Writing compiled view file"
        fileHandle = open(fullPath, "w")
        # write the compiled file
        #print interfaceFile
        fileHandle.write(interfaceFile)
        # close the file
        fileHandle.close()

        print "Writing CSS file"
        cssFileName = os.path.splitext(fileName)[0]+".css"
        cssFilePath = os.path.join(compiledViewsDirectory, cssFileName)
        fileHandle = open(cssFilePath, "w")
        fileHandle.write(self.cssFile)
        fileHandle.close()

        print "Pretty printing"
        # make it pretty
        exitcode = os.system('tidy -i -xml -m %s' % (fullPath))

        print self.cssFile
        
        """
        # Grab the root element
        root = interfaceFile.getroot()
        # Check if it has a backing uiclass
        print "Root has uiclass %s" % elementHasAttribute(root, "uiclass")
        # Grab all the other uiclasses
        uiclasses = [el for el in interfaceFile.findall("//*") if elementHasAttribute(el, "uiclass")]
        print uiclasses
        # Instantiate each one with it's proper class
        [self.parserForView(el)(el) for el in uiclasses]
        """


if __name__ == "__main__":
    print ("sandalphon.py compiling " + sys.argv[1])
    compiler = SandalphonCompiler()
    compiler.compile(sys.argv[1])
