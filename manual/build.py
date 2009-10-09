import sys
import os
import getopt
from mako.template import Template
from mako.lookup import TemplateLookup


all = ['manual/install.mako',
       'manual/installation-osx.mako',
       'manual/installation-windows.mako',
       'manual/tutorial.mako',
       #'manual/developer.mako',
       #'manual/advanced.mako'
]


def build(path=None, outputFile=None):
    """
    Builds the output HTML for a page of the ShiftSpace manual.
    """
    if not path:
        usage()
        sys.exit(2)
    lookup = TemplateLookup(directories=['.', 'manual', 'wiki'])
    tmpl = Template(filename=path, lookup=lookup)
    if not outputFile:
        outputFile = "%s.html" % os.path.splitext(path)[0]
    fh = open(outputFile, "w")
    fh.write(tmpl.render())
    fh.close()


def buildAll():
    for template in all:
        build(template)
    

def main(argv):
    inputFile = None
    outputFile = None
    doAll = False
    
    try:
        opts, args = getopt.getopt(argv, "i:o:ha", ["input=", "output=", "help", "all"])
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
            outputFile = arg
        elif opt in ("-a", "--all"):
            doAll = True
    if (not inputFile) and (not doAll):
        print "No input file!"
        usage()
        sys.exit(2)
    if doAll:
        buildAll()
    else:
        build(inputFile, outputFile)


def usage():
    print
    print "-i input file, required"
    print "-o ouput file"


if __name__ == '__main__':
    if len(sys.argv) > 1:
        main(sys.argv[1:])
    else:
        usage()
