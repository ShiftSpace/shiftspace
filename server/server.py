import os
import sys
import getopt
import time
import StringIO
import cherrypy
from cherrypy.lib.static import serve_file
import ConfigParser
import routes
import email
import simplejson as json

import builder.corebuilder as corebuilder
import builder.preprocess as preprocess
import sandalphon.sandalphon as sandalphon

from utils.utils import *
from utils.errors import *
from utils.decorators import *
from utils.returnTypes import *

from controllers.user import UserController
from controllers.shift import ShiftController
from controllers.stream import StreamController
from controllers.event import EventController
from controllers.permission import PermissionController
from controllers.group import GroupsController

serverroot = os.path.dirname(os.path.abspath(__file__))
webroot = os.path.dirname(serverroot)

class RootController:
    def read(self):
        return 'The ShiftSpace 1.0 Robot says \"Hello\"'

    def sandbox(self):
        corebuilder.run()
        compiler = sandalphon.SandalphonCompiler("client/compiledViews", "mydev")
        compiler.compile(inputFile="client/views/SSConsole/SSConsole.html")
        preprocessor = preprocess.SSPreProcessor(project="sandbox", env="mydev")
        preprocessor.preprocess(input="client/ShiftSpace.js",
                                output="builds/shiftspace.sandbox.js")
        return serve_file(os.path.join(webroot, 'sandbox/index.html'))

    def test(self, test="SSDefaultTest", env="mydev"):
        fh = open(os.path.join(webroot, "config/tests.json"))
        teststr = fh.read()
        tests = json.loads(teststr)
        fh.close()
        fileOrder = tests['dependencies'].get(test)
        if fileOrder == None:
            return "Error: %s does not exists, perhaps you need to run setup.sh" % test
        else:
            out = StringIO.StringIO()
            preprocessor = preprocess.SSPreProcessor(project="sandalphon", env="sandalphon")
            for f in fileOrder:
                preprocessor.preprocess(f, out)
                out.write("\n\n")
            cherrypy.response.headers['Content-Type'] = "text/plain"
            str = out.getvalue()
            out.close()
            return str

    def tests(self):
        corebuilder.run()
        preprocessor = preprocess.SSPreProcessor(project="sandalphon", env="sandalphon", export=True)
        preprocessor.preprocess(input="sandalphon/BootstrapSandalphon.js",
                                output="builds/shiftspace.sandalphon.js")
        return serve_file(os.path.join(webroot, 'tests/index.html'))

    @jsonencode
    def build(self):
        corebuilder.run()
        compiler = sandalphon.SandalphonCompiler("client/compiledViews", "dev")
        compiler.compile(inputFile="client/views/SSConsole/SSConsole.html")
        preprocessor = preprocess.SSPreProcessor(project="shiftspace", env="dev")
        preprocessor.preprocess(input="client/ShiftSpace.js",
                                output="builds/shiftspace.dev.user.js")
        return ack


def initAppRoutes():
    d = cherrypy.dispatch.RoutesDispatcher()
    user = UserController(d)
    shift = ShiftController(d)
    stream = StreamController(d)
    event = EventController(d)
    permission = PermissionController(d)
    group = GroupsController(d)
    return d


def initDevRoutes():
    d = cherrypy.dispatch.RoutesDispatcher()
    root = RootController()
    d.connect(name='root', route='', controller=root, action='read')
    d.connect(name='rootSandbox', route='sandbox', controller=root, action='sandbox')
    d.connect(name='rootTest', route='test/:test', controller=root, action='test')
    d.connect(name='rootTests', route='tests', controller=root, action='tests')
    d.connect(name='rootBuild', route='build', controller=root, action='build')
    return d


def start(conf="default.conf"):
    serverroot = os.path.dirname(os.path.abspath(__file__))
    webroot = os.path.dirname(serverroot)
    config = ConfigParser.ConfigParser({'webroot':webroot,
                                        'serverroot':serverroot})
    fh = open(os.path.join(serverroot, conf))
    config.readfp(fh)
    fh.close()

    d = {}

    for section in config.sections():
        for k, v in config.items(section):
            if d.get(section) == None:
                d[section] = {}
            if k == 'tools.sessions.timeout':
                v = int(v)
            d[section][k] = v

    cherrypy.config.update({'server.socket_port':8080})

    d['/']['request.dispatch'] = initDevRoutes()
    dev = cherrypy.tree.mount(root=None, script_name='/', config=d)

    d['/']['request.dispatch'] = initAppRoutes()
    app = cherrypy.tree.mount(root=None, script_name='/server', config=d)

    cherrypy.quickstart()


def usage():
    print 'You may only pass in a configuration file to load via the -f flag.'


def parseArgs(argv):
    conf = 'default.conf'
    try:
        opts, args = getopt.getopt(argv, 'f:h', ['file='])
    except:
        print 'Invalid flag\n'
        usage()
        sys.exit(2)
    for opt, arg in opts:
        if opt in ('-h', '--help'):
            usage()
            sys.exit()
        elif opt in ('-f', '--file'):
            conf = arg
    start(conf)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        parseArgs(sys.argv[1:])
    else:
        start()
