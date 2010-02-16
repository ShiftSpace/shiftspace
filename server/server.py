import os
import sys
import getopt
import time
import StringIO
import simplejson as json
import ConfigParser
import routes
import email
import setup

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
from controllers.group import GroupsController
from controllers.message import MessageController


version = "1.0"
SERVER_ROOT = os.path.dirname(os.path.abspath(__file__)) # directory this file lives in
WEB_ROOT = os.path.dirname(SERVER_ROOT) # one directory up, where docs, manual, spaces, etc are
_template_dirs = [os.path.join(WEB_ROOT, adir) for adir in ['html', 'manual', 'wiki']]
lookup = TemplateLookup(directories=_template_dirs)
serverport = 8080


class DevController:
    def routes(self, d):
        d.connect(name='root', route='', controller=self, action='index')
        d.connect(name='rootDocs', route='docs', controller=self, action='docs')
        d.connect(name='rootManual', route='manual', controller=self, action='manual')
        d.connect(name='rootSandbox', route='sandbox', controller=self, action='sandbox')
        d.connect(name='rootTest', route='test/:test', controller=self, action='test')
        d.connect(name='rootTests', route='tests', controller=self, action='tests')
        d.connect(name='rootBuild', route='build', controller=self, action='build')
        return d

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
            db["_design/users"]
        except:
            return self.statusPage(status="err", details="initdb")
        return self.statusPage()

    def docs(self):
        """
        For developers. Serves the documentation pages.
        """
        if os.path.exists("docs"):
            return serve_file(os.path.join(WEB_ROOT, 'docs/index.html'))
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
        compiler = sandalphon.SandalphonCompiler()
        compiler.compile(inputFile="client/ShiftSpace.html",
                         outDir="builds/compiledViews",
                         envFile="mydev")
        preprocessor = preprocess.SSPreProcessor(project="sandbox", env="mydev")
        preprocessor.preprocess(input="client/ShiftSpace.js",
                                output="builds/shiftspace.sandbox.js")
        return serve_file(os.path.join(WEB_ROOT, 'sandbox/index.html'))

    def test(self, test="SSDefaultTest", env="mydev"):
        """
        For developers. Serves the testing environment. Similar to index above but uses
        the sandalphon env file instead of mydev.
        """
        fh = open(os.path.join(WEB_ROOT, "config/tests.json"))
        teststr = fh.read()
        tests = json.loads(teststr)
        fh.close()
        fileOrder = tests['dependencies'].get(test)
        if fileOrder == None:
            return "Error: %s does not exists." % test
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
        return serve_file(os.path.join(WEB_ROOT, 'tests/index.html'))

    @jsonencode
    def build(self):
        """
        For developers. Serves the developer greasemonkey user script for deployment testing.
        """
        corebuilder.run()
        compiler = sandalphon.SandalphonCompiler()
        compiler.compile(inputFile="client/ShiftSpace.html",
                         outDir="builds/compiledViews",
                         envFile="dev")
        preprocessor = preprocess.SSPreProcessor(project="shiftspace", env="dev")
        preprocessor.preprocess(input="client/ShiftSpace.js",
                                output="builds/shiftspace.dev.user.js")
        return ack


class RootController:
    def routes(self, d):
        d.connect(name='root', route='/', controller=self, action='index')
        d.connect(name='rootProxy', route='proxy/:id', controller=self, action='proxy')
        d.connect(name='rootAttrs', route='spaces/:space/attrs', controller=self, action='attrs')
        d.connect(name='rootRev', route='rev', controller=self, action='rev')
        return d
    
    def index(self):
        return "ShiftSpace Server 1.0"

    def rev(self, name):
        fh = open(os.path.join(WEB_ROOT, "builds/meta.json"))
        meta = json.loads(fh.read())
        fh.close()
        rev = meta.get(name)
        if rev:
            return json.dumps({"data":rev})
        else:
            return json.dumps({"message":"unknown"});
        
    def walk(self, fdir, d):
        """
        Used by attrs.
        """
        files = os.listdir(fdir)
        for afile in files:
            path = os.path.join(fdir, afile)
            if os.path.isdir(path):
                d[afile] = self.walk(path, {})
            elif os.path.isfile(path):
                if os.path.splitext(path)[1] in ['.js', '.json', '.txt', '.html', '.css']:
                    fh = open(path)
                    d[afile] = fh.read()
                    fh.close()
        return d
        
    def langwalk(self, fdir, d):
        """
        Used by attrs.
        """
        # redundant refactor later - David 10/28/09
        files = os.listdir(fdir)
        for afile in files:
            path = os.path.join(fdir, afile)
            if os.path.isdir(path):
                d[afile] = self.walk(path, {})
            elif os.path.isfile(path):
                fh = open(path)
                name = os.path.splitext(os.path.basename(afile))[0]
                d[name] = json.loads(fh.read())
                fh.close()
        return d
        
    def attrs(self, space):
        """
        Return the attrs.json file for a space. If the attrs.json
        file specifies a lib property, walk that directory and return
        the contents of the lib directory as strings in the returned
        JSON.
        """
        try:
            spacePath = os.path.join(WEB_ROOT, 'spaces', space)
            attrsPath = os.path.join(spacePath, 'attrs.json')
            fh = open(attrsPath)
            attrs = json.loads(fh.read())
            fh.close()
            liborlang = False
            if attrs.get("lib"):
                liborlang = True
                libPath = os.path.join(spacePath, attrs["lib"])
                attrs["lib"] = self.walk(libPath, {})
            if attrs.get("lang"):
                liborlang = True
                langPath = os.path.join(spacePath, attrs["lang"])
                attrs["lang"] = self.langwalk(langPath, {})
            if liborlang:
                return json.dumps(attrs)
            else:
                f = serve_file(attrsPath)
                return f
        except error:
            return json.dumps(error("No space called %s exists" % space, SpaceDoesNotExistError))

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
            from models.shift import Shift
            from urllib import FancyURLopener, urlcleanup
            from lxml.html import fromstring, tostring
            from linkprocessor import LinkProcessor
        except:
            return self.statusPage(status="err", details="proxy")
        
        class FancyOpener(FancyURLopener):
            version = "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.5; en-US; rv:1.9.0.1) Gecko/2008070206 Firefox/3.0.1"
        pageopener = FancyOpener()
        
        theShift = Shift.read(id, proxy=True)
        
        if theShift['type'] != 'shift':
            return self.statusPage(status="err", details="proxyperm")
        
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
        fh = open(os.path.join(WEB_ROOT, "spaces", space, "attrs.json"))
        attrs = fh.read()
        fh.close()
        attrs = self.absolutify(json.loads(attrs))
        
        # load the scripts 
        source = tostring(dom)
        server = "http://localhost:%s" % serverport
        ctxt = {
            "server": server,
            "spacesPath": "/".join([server, "spaces"]),
            "shiftId": shiftId,
            "space": space,
            "shift": json.dumps(theShift.toDict()),
            "attrs": json.dumps(attrs),
            }
        t = Template(filename=os.path.join(WEB_ROOT, "server/bootstrap.mako"), lookup=lookup)
        source = source.replace("</head>", "%s</head>" % t.render(**ctxt))

        # load proxy message
        t = Template(filename=os.path.join(WEB_ROOT, "server/proxymessage.mako"), lookup=lookup)
        ctxt = {
            "space": space,
            "href": url,
            "created": created,
            "userName": userName,
            }
        source = source.replace("</body>", "%s</body>" % t.render(**ctxt))
        return source


def initRootRoutes(d):
    """
    Initialize the root routes.
    """
    s = RootController()
    return s.routes(d)


def initAppRoutes(d):
    """
    Initialize the actual application routes.
    """
    UserController(d)
    ShiftController(d)
    GroupsController(d)
    MessageController(d)
    return d


def initDevRoutes(d):
    """
    Initialize developments routes, attrs.json and proxy routes as well.
    """
    r = DevController()
    return r.routes(d)


def loadConfig(fileName="default.conf"):
    config = ConfigParser.ConfigParser({'WEB_ROOT':WEB_ROOT, 'SERVER_ROOT':SERVER_ROOT})
    fh = open(os.path.join(SERVER_ROOT, fileName))
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
    return d


def start(appConf="default.conf", port=8080):
    """
    Starts the server using default.conf and port 8080.
    """
    #TODO: needs to be more general and really support file configuration. - David 2/6/10
    cherrypy.config.update({'server.socket_port':port})
    config = loadConfig(appConf)
    d = cherrypy.dispatch.RoutesDispatcher()
    config['/']['request.dispatch'] = initDevRoutes(initRootRoutes(d))
    cherrypy.tree.mount(root=None, script_name='/', config=config)
    d = cherrypy.dispatch.RoutesDispatcher()
    config['/']['request.dispatch'] = initAppRoutes(d)
    cherrypy.tree.mount(root=None, script_name='/server', config=config)
    cherrypy.quickstart()


def startWsgi(siteConf="site.conf", appConf="apache.conf"):
    """
    Used when running ShiftSpace with Apache + mod_wsgi
    """
    if not os.path.isabs(siteConf):
        siteConf = os.path.join(SERVER_ROOT, siteConf)
    if not os.path.isabs(appConf):
        appConf = os.path.join(SERVER_ROOT, appConf)
    cherrypy.config.update(siteConf)
    config = loadConfig(appConf)
    d = cherrypy.dispatch.RoutesDispatcher()
    config['/']['request.dispatch'] = initRootRoutes(d)
    cherrypy.tree.mount(root=None, script_name='/shiftspace', config=config)
    d = cherrypy.dispatch.RoutesDispatcher()
    config['/']['request.dispatch'] = initAppRoutes(d)
    cherrypy.tree.mount(root=None, script_name='/shiftspace/server', config=config)
    return cherrypy.tree


def usage():
    print
    print '\t-s --site\tspecify a site wide configuration'
    print '\t-a --app \tspecify application configuration'
    print


def parseArgs(argv):
    app = 'default.conf'
    site = None
    try:
        opts, args = getopt.getopt(argv, 's:a:h', ['site=', 'app='])
    except:
        print 'Invalid flag\n'
        usage()
        sys.exit(2)
    for opt, arg in opts:
        if opt in ('-h', '--help'):
            usage()
            sys.exit()
        elif opt in ('-s', '--site'):
            site = arg
        elif opt in ('-a', '--app'):
            app = arg
    start(site_conf=site, app_conf=app)


if __name__ == '__main__':
    if len(sys.argv) > 1:
        parseArgs(sys.argv[1:])
    else:
        start()
