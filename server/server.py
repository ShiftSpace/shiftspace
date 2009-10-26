import os
import sys
import getopt
import time
import StringIO
import simplejson as json
import ConfigParser
import routes
import email

from mako.template import Template
from mako.lookup import TemplateLookup

import cherrypy
from cherrypy.lib.static import serve_file

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


version = "1.0"
lookup = TemplateLookup(directories=['html', 'manual', 'wiki'])
serverroot = os.path.dirname(os.path.abspath(__file__))
webroot = os.path.dirname(serverroot)
serverport = 8080


class RootController:
    def statusContext(self, status="noerr", details="noerr"):
        return {
            "version": version,
            "statusType": status,
            "detailsType": details
        }

    def statusPage(self, status="noerr", details="noerr"):
        t = Template(filename="html/index.mako", lookup=lookup)
        ctxt = self.statusContext(status, details)
        return t.render(**ctxt)

    def index(self):
        """
        Serves the status page for developers.
        """
        import models.core
        t = Template(filename="html/index.mako", lookup=lookup)
        try:
            server = core.server()
            server.version
        except Exception:
            return self.statusPage(status="err", details="couchdb")
        try:
            db = core.connect()
            db["_design/validation"]
        except:
            return self.statusPage(status="err", details="initdb")
        return self.statusPage()

    def docs(self):
        """
        For developers. Serves the documentation pages.
        """
        if os.path.exists("docs"):
            return serve_file(os.path.join(webroot, 'docs/index.html'))
        else:
            return self.statusPage(status="err", details="docs")

    def manual(self):
        """
        For developers. Serves the manual.
        """
        if os.path.exists("manual/install.html"):
            raise cherrypy.HTTPRedirect("http://localhost:%s/manual/install.html" % serverport)
        else:
            return self.statusPage(status="err", details="manual")

    def sandbox(self):
        """
        For developers. Serves the sandbox development enviroment. Automatically cocatenates 
        and preprocess all of CSS files and HTML files for the interface and
        as well as all of the JavaScript before serving the page.
        """
        import models.core
        t = Template(filename="html/index.mako", lookup=lookup)
        try:
            server = core.server()
            server.version
        except Exception:
            return self.statusPage(status="err", details="couchdb")
        corebuilder.run()
        compiler = sandalphon.SandalphonCompiler("client/compiledViews", "mydev")
        compiler.compile(inputFile="client/views/SSConsole/SSConsole.html")
        preprocessor = preprocess.SSPreProcessor(project="sandbox", env="mydev")
        preprocessor.preprocess(input="client/ShiftSpace.js",
                                output="builds/shiftspace.sandbox.js")
        return serve_file(os.path.join(webroot, 'sandbox/index.html'))

    def test(self, test="SSDefaultTest", env="mydev"):
        """
        For developers. Serves the testing environment. Similar to index above but uses
        the sandalphon env file instead of mydev.
        """
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
        """
        For developers. Serves individual tests. Adds any test dependencies if there are any.
        """
        corebuilder.run()
        preprocessor = preprocess.SSPreProcessor(project="sandalphon", env="sandalphon", export=True)
        preprocessor.preprocess(input="sandalphon/BootstrapSandalphon.js",
                                output="builds/shiftspace.sandalphon.js")
        return serve_file(os.path.join(webroot, 'tests/index.html'))

    @jsonencode
    def build(self):
        """
        For developers. Serves the developer greasemonkey user script for deployment testing.
        """
        corebuilder.run()
        compiler = sandalphon.SandalphonCompiler("client/compiledViews", "dev")
        compiler.compile(inputFile="client/views/SSConsole/SSConsole.html")
        preprocessor = preprocess.SSPreProcessor(project="shiftspace", env="dev")
        preprocessor.preprocess(input="client/ShiftSpace.js",
                                output="builds/shiftspace.dev.user.js")
        return ack

    def absolutify(self, attrs):
        space = attrs["name"]
        for k, v in attrs.items():
            if k in ["css", "html", "icon"]:
                if v.find("http://") != 0:
                    attrs[k] = "http://localhost:%s/spaces/%s/%s" % (serverport, space, v)
        return attrs

    def proxy(self, id):
        """
        Serves the proxy. Takes a shift id and returns the original page
        where the shift was created, injects the required Javascript and CSS
        and recreates the shift. All scripts and onload handlers are removed
        from the original page to prevent interference with shift loading.
        """
        try:
            import models.shift as shift
            from urllib import FancyURLopener, urlcleanup
            from lxml.html import fromstring, tostring
            from linkprocessor import LinkProcessor
        except:
            return self.statusPage(status="err", details="proxy")
        
        class FancyOpener(FancyURLopener):
            version = "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9.0.1) Gecko/2008070206 Firefox/3.0.1"
        pageopener = FancyOpener()
        
        theShift = shift.read(id)
        shiftId = theShift["_id"]
        space = theShift["space"]["name"]
        url = theShift["href"]
        created = theShift["created"]
        userName = theShift["userName"]
        
        # clear the urllib cache
        urlcleanup()
        page = pageopener.open(url)
        source = page.read()
        
        linkprocessor = LinkProcessor();
        
        linkprocessor.parse(source);
        linkprocessor.set_url(url)
        
        dom = linkprocessor.get_dom()
        [node.drop_tree() for node in dom.cssselect("script")]
        for node in dom.cssselect("*[onload]"):
            del node.attrib['onload']

        # load the space attributes
        fh = open(os.path.join("spaces", space, "attrs.json"))
        attrs = fh.read()
        fh.close()
        attrs = self.absolutify(json.loads(attrs))
        
        # load the scripts 
        source = tostring(dom)
        server = "http://localhost:%s" % serverport
        ctxt = {
            "server": server,
            "spacesDir": "/".join([server, "spaces"]),
            "shiftId": shiftId,
            "space": space,
            "shift": json.dumps(theShift),
            "attrs": json.dumps(attrs),
            }
        t = Template(filename="server/bootstrap.mako", lookup=lookup)
        source = source.replace("</head>", "%s</head>" % t.render(**ctxt))

        # load proxy message
        t = Template(filename="server/proxymessage.mako", lookup=lookup)
        ctxt = {
            "space": space,
            "href": url,
            "created": created,
            "userName": userName,
            }
        source = source.replace("</body>", "%s</body>" % t.render(**ctxt))
        return source


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
    d.connect(name='root', route='', controller=root, action='index')
    d.connect(name='rootDocs', route='docs', controller=root, action='docs')
    d.connect(name='rootManual', route='manual', controller=root, action='manual')
    d.connect(name='rootSandbox', route='sandbox', controller=root, action='sandbox')
    d.connect(name='rootTest', route='test/:test', controller=root, action='test')
    d.connect(name='rootTests', route='tests', controller=root, action='tests')
    d.connect(name='rootBuild', route='build', controller=root, action='build')
    d.connect(name='rootProxy', route='proxy/:id', controller=root, action='proxy')
    return d


def start(conf="default.conf", port=8080):
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

    serverport = port
    cherrypy.config.update({'server.socket_port':port})

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
