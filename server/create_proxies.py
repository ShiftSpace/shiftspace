import os
import sys
import getopt
import simplejson as json

from mako.template import Template
from mako.lookup import TemplateLookup

SERVER_ROOT = os.path.dirname(os.path.abspath(__file__))
WEB_ROOT = os.path.dirname(SERVER_ROOT)

def parseArgs(args):
    fh = open(os.path.join(WEB_ROOT, "config/proxy/space.json"))
    meta = json.loads(fh.read())
    fh.close()
    ctxt = {
        "methods": meta["methods"]
        }
    t = Template(filename=os.path.join(WEB_ROOT, "config/proxy/space.mako"))
    print t.render(**ctxt)

def usage():
    pass

if __name__ == '__main__':
    if len(sys.argv) > 1:
        parseArgs(sys.argv[1:])
    else:
        usage()
