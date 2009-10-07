import sys
import os
import getopt
from mako.template import Template
from mako.lookup import TemplateLookup


all = ['manual/install.mako',
       'manual/tutorial.mako',
       'manual/developer.mako',
       'manual/advanced.mako']


def build(path=None):
    """
    Builds the output HTML for a page of the ShiftSpace manual.
    """
    if not path:
        usage()
        sys.exit(2)
    lookup = TemplateLookup(directories=['.', 'manual', 'wiki'])
    tmpl = Template(filename='print.mako', lookup=lookup)
    basename = os.path.splitext(path)[0]
    fh = open("%s.html" % basename, "w")
    fh.write(tmpl.render())
    fh.close()


def buildAll():
    for file in all:
        build(file)


def main(argv):
    pass


def usage():
    print
    print "-i input file"
    print "-o ouput file"


if __name__ == '__main__':
    if len(sys.argv) > 1:
        main(sys.argv[1:])
    else:
        usage()