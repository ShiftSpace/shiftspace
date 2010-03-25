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

def writeFile(data, filename):
    fh = open(os.path.join(WEB_ROOT, filename), "w")
    fh.write(data)
    fh.close()

def main():
    meta = readJsonFile("config/proxy/space.json")
    env = readJsonFile("config/env/mydev.json")
    ctxt = {
        "methods": meta["methods"][:-1],
        "last": meta["methods"][-1],
        "server": env["SERVER"]
        }
    t = Template(filename=os.path.join(WEB_ROOT, "config/proxy/space.mako"))
    spaceJs = t.render(**ctxt)
    writeFile(spaceJs, "builds/SpaceProxy.js")

def usage():
    pass

if __name__ == '__main__':
    main()
