import xml.etree.ElementTree as ET

class ClassParser:
    def __init__(self, element):
        print "Init ClassParser"
        self.element = element;

class SSTableViewParser(ClassParser):
    def __init__(self, element):
        print "Init SSTableViewParser"
        ClassParser.__init__(self, element)
        pass

def hasAttribute(element, attrib, value=None):
    """Check if an element has an attribute and matches a value"""
    return ((value != None) and (element.get(attrib) == value)) or (element.get(attrib) != None)

def compile(path):
    """Compile an interface file down to it's parts"""
    # Parse the file at the path
    interfaceFile = ET.parse(path)
    # Grab the root element
    root = interfaceFile.getroot()
    # Check if it has a backing uiclass
    print "Root has uiclass %s" % hasAttribute(root, "uiclass")
    # Grab all the other uiclasses
    uiclasses = [el for el in interfaceFile.findall("//*") if hasAttribute(el, "uiclass")]
    print uiclasses
    # Create a new class parser for each backing uiclass
    p = SSTableViewParser(uiclasses[0])

if __name__ == "__main__":
    print "Saldalphon interface compiler"
    compile("../client/views/SSTableView/SSTableView.html")
