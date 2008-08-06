import os
import sys
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


def parserForView(view):
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


def hasAttribute(element, attrib, value=None):
    """
    Check if an element has an attribute and matches a value
    """
    return ((value != None) and (element.get(attrib) == value)) or (element.get(attrib) != None)


def compile(path):
    """
    Compile an interface file down to its parts
    """
    # Parse the file at the path
    interfaceFile = ET.parse(path)
    # Grab the root element
    root = interfaceFile.getroot()
    # Check if it has a backing uiclass
    print "Root has uiclass %s" % hasAttribute(root, "uiclass")
    # Grab all the other uiclasses
    uiclasses = [el for el in interfaceFile.findall("//*") if hasAttribute(el, "uiclass")]
    print uiclasses
    # Instantiate each one with it's proper class
    [parserForView(el)(el) for el in uiclasses]


if __name__ == "__main__":
    print "Saldalphon interface compiler"
    compile("../client/views/SSTableView/SSTableView.html")
