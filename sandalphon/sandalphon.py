import os
import sys
import re
import xml.etree.ElementTree as ET


class ViewParser:
    def __init__(self, element):
        print "Init ViewParser"
        self.element = element;


class SSTableViewParser(ViewParser):
    def __init__(self, element):
        print "Init SSTableViewParser"
        ViewParser.__init__(self, element)
        pass


class SSCustomTableRowParser(ViewParser):
    def __init__(self, element):
        print "Init SSCustomTableRowParser"
        ViewParser.__init__(self, element)


def elementHasAttribute(element, attrib, value=None):
    """
    Check if an element has an attribute and matches a value
    """
    return ((value != None) and (element.get(attrib) == value)) or (element.get(attrib) != None)


class SandalphonCompiler:
    def __init__(self):
        self.paths = {}
        self.getPaths()

    def getPaths(self):
        """
        Looks into views and builds the paths to the interface files
        """
        viewsDirectory = "../client/views/"
        # filter out .svn files
        self.paths = [os.path.join(viewsDirectory, f) for f in os.listdir(viewsDirectory) if(f != ".svn")]
        
        print "%s files in path" % len(self.paths)
        print ", ".join([("%s" % f) for f in self.paths])
        
        pass

    def parserForView(self, view):
        """
        Return the view parser class object associated with the view element.
        """
        theClass = view.get("uiclass") + "Parser"
        print "getParserForView: " + theClass
        module = sys.modules[ViewParser.__module__]
        if(hasattr(module, theClass)):
            return getattr(module, theClass)
        else:
            return None

    def loadView(self, fileName):
        print ("loadView: " + fileName)
    
    def compile(self, path):
        """
        Compile an interface file down to its parts
        """
        # First regex any dependent files into a master view
        # Parse the file at the path
        fileRef = open(path)
        interfaceFile = fileRef.read()
        
        # look for custom view pointers
        # /<\?.+?\?>/g
        p = re.compile('<\?.+?\?>')
        matches = p.finditer(interfaceFile)
        
        hasCustomViews = True
        while hasCustomViews:
            match = p.search(interfaceFile)
            if match:
                span = match.span()
                # load this view, will need match that view as well
                self.loadView(interfaceFile[span[0]:span[1]])
                # replace the match
                interfaceFile = p.sub("<replaced>", interfaceFile, 1)
            else:
                hasCustomViews = False
                
        """
        interfaceFile = ET.parse(path)
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
    print "Saldalphon interface compiler"
    compiler = SandalphonCompiler()
    compiler.compile("../client/views/Console/Console.html")
