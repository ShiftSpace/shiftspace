import xml.etree.ElementTree as ET

def hasAttribute(element, attrib, value=None):
    """Check if an element has an attribute and matches a value"""
    return ((value != None) and (element.get(attrib) == value)) or (element.get(attrib) != None)

def compile(path):
    """Compile an interface file down to it's parts"""
    # Parse the file at the path
    interfaceFile = ET.parse(path)
    root = interfaceFile.getroot()
    print "Root has uiclass %s" % hasAttribute(root, "uiclass")
    uiclasses = [el for el in interfaceFile.findall("//*") if hasAttribute(el, "uiclass")]
    print uiclasses

if __name__ == "__main__":
    print "Saldalphon interface compiler"
    compile("../client/views/SSTableView/SSTableView.html")
