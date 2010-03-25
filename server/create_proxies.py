import os
import sys
import getopt
import simplejson as json

from mako.template import Template
from mako.lookup import TemplateLookup

SERVER_ROOT = os.path.dirname(os.path.abspath(__file__))
WEB_ROOT = os.path.dirname(SERVER_ROOT)

def readJsonFile(filename):
    fh = open(os.path.join(WEB_ROOT, filename))
    result = json.loads(fh.read())
    fh.close()
    return result

def main():
    meta = readJsonFile("config/proxy/space.json")
    env = readJsonFile("config/env/mydev.json")
    ctxt = {
        "methods": meta["methods"],
        "server": env["SERVER"]
        }
    t = Template(filename=os.path.join(WEB_ROOT, "config/proxy/space.mako"))
    print t.render(**ctxt)

def usage():
    pass

if __name__ == '__main__':
    main()
