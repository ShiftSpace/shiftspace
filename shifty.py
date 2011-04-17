import unittest
import sys
import os
import shutil
import getopt

missing = []
    
try:
    import simplejson as json
except Exception, err:
    missing.append("simplejson")
try:
    import builder.preprocess as preprocess
    import builder.corebuilder as corebuilder
    import sandalphon.sandalphon as sandalphon
except Exception, err:
    print err
try:
    import manual.build as manbuild
except Exception, err:
    missing.append("mako")
try:
    import server.setup as setup
except Exception, err:
    print err
    missing.append("couchdb-python")
try:
    import server.server as server
except Exception, err:
    print err
    missing.append("cherrypy")


def bail(missinglibs):
    print "Perhaps missing %s? Please run the following first before attempting to use shifty features:" % missinglibs
    print "sudo python shifty.py installdeps"
    sys.exit(2)


def nightly():
    """
    Used to build the nightlies.
    """
    os.system("git submodule init")
    os.system("git submodule update")
    os.system("scripts/clean_git.sh")
    if not os.path.exists("tmp/deps"):
        os.system("scripts/download_deps.sh")
    os.system("rm tmp/deps.tar.gz")
    os.system("scripts/clean_py.sh")


def env(url):
    return {
        "SERVER": url,
        "MEDIA_PATH": url,
        "SPACES_PATH": url + "spaces/",
        "IMAGES_PATH": url + "images/",
        "GLOBAL_CSS": "styles/SSGlobalStyles.css",
        "LOG_LEVEL": None,
        }


def configure(url):
    """
    Configure ShiftSpace to be served from a particular url.
    """
    if url[-1] != "/":
        url = url + "/"
    url = url.strip()
    def writeEnv(name, mergedict):
        fh = open("config/env/%s.json" % name, "w")
        envdict = env(url)
        envdict.update(mergedict)
        s = json.dumps(envdict, sort_keys=True, indent=2)
        fh.write('\n'.join([l.rstrip() for l in  s.splitlines()]))
        fh.close()
    sys.stdin.close()
    writeEnv("mydev", {
            "LOG_LEVEL":"SSLogError",
            "VARS": {
                "ShiftSpaceSandBoxMode": True
                }
            })
    writeEnv("dev", {
            "LOG_LEVEL": "SSLogError | SSLogSystem"
            })
    writeEnv("sandalphon", {
            "LOG_LEVEL": "SSLogError | SSLogSandalphon",
            "VARS": {
                "SandalphonToolMode": True
                }
            })


def shiftpress(url):
    """
    Configure for shiftpress.
    """
    import urlparse
    configure(url)
    path = urlparse.urlparse(url + "/server").path
    cdir = os.getcwd()
    htaccess = ("Options +FollowSymLinks\nRewriteEngine On\nRewriteBase %s\nRewriteRule (.*) index.php\n" % path)
    fh = open(os.path.join(cdir, "server", ".htaccess"), "w")
    fh.write(htaccess)
    fh.close()


def update():
    """
    Update the source file and test file indexes.
    """
    installDefaultSpaces()
    updatedb()


def build(argv):
    """
    Generates the supporting HTML and CSS files as well as the
    concatenated source.
    """
    input = "client/ShiftSpace.js"
    output = "shiftspace.sandbox.js"
    env = "mydev"
    proj = "sandbox"
    templ = "client/ShiftSpace.html"
    
    def buildUsage():
        print
        print "When running build you may use the following options"
        print "    -i     input file"
        print "    -t     template file"
        print "    -o     output file"
        print "    -e     environment file"
        print "    -p     project file"
        print "    -app   build an application"
        print

    try:
        opts, args = getopt.getopt(argv, "i:o:e:p:t:", ['input=', 'output=', 'environment=', 'project=', 'template='])
    except Exception:
        print 'Invalid flag\n'
        buildUsage()
        sys.exit(2)

    for opt, arg in opts:
        if opt in ('-i', '--input'):
            input = arg
        elif opt in ('-o', '--output'):
            output = arg
        elif opt in ('-e', '--environment'):
            env = arg
        elif opt in ('-p', '--project'):
            proj = arg
        elif opt in ('-t', '--template'):
            templ = arg
        else:
            buildUsage()
    
    corebuilder.run()
    compiler = sandalphon.SandalphonCompiler()
    compiler.compile(inputFile=templ,
                     outDir="builds/compiledViews",
                     envFile=env)
    preprocessor = preprocess.SSPreProcessor(project=proj, env=env)
    preprocessor.preprocess(input=input, output=os.path.join("builds", output))


def processTemplate(path, outputdir, name):
    """
    Used by createSpace. Helper function for copying
    over space template files.
    """
    import re
    base, ext = os.path.splitext(os.path.basename(path))
    fh = open(path)
    contents = fh.read()
    fh.close()
    contents = contents.replace("Name", name)
    if ext == ".json":
        r = re.compile("\/\*.+?\*\/|\/\/.*(?=[\n\r])")
        contents = r.sub('', contents)
    lines = [line for line in contents.split('\n') if line.strip()]
    contents = '\n'.join(lines)
    fbasename = (ext == ".json" and "attrs") or name
    fname = "%s%s" % (fbasename, ext)
    fh = open(os.path.join(outputdir, fname), "w")
    fh.write(contents)
    fh.close()


def createSpace(name):
    """
    Creates a new directory in the spaces directory with the specified
    name. Also copies over templates for JavaScript, HTML, CSS and the
    required attrs.json file.
    """
    cwd = os.getcwd()
    tmplpath = os.path.join(cwd, "template")
    dirpath = os.path.join(cwd, "spaces", name)
    if not os.path.isdir(dirpath):
        os.mkdir(dirpath)
        for file in ("template.js", "template.html", "template.css", "attrs.json"):
            processTemplate(os.path.join(tmplpath, file), dirpath, name)
        shutil.copyfile(os.path.join(tmplpath, "template.png"),
                        os.path.join(dirpath, "%s.png" % name))
        shutil.copytree(os.path.join(tmplpath, "lib"),
                        os.path.join(dirpath, "lib"))
        shutil.copytree(os.path.join(tmplpath, "lang"),
                        os.path.join(dirpath, "lang"))
        installSpace(name)
    else:
        print "Error: A space called %s already exists" % name


def updatedb():
    """
    Resync the server/views folder with the design documents
    in the database.
    """
    from server.models import core
    if core.test():
        setup.sync()
    else:
        print
        print "CouchDB is not running, please start it and run the following again:"
        print
        print "    python shifty.py update"
        print
        sys.exit(2)


def deletedbs():
    """
    Delete the databases, the database path must have been set
    first for this to work.
    """
    from server.models import core
    from server.models.ssuser import SSUser
    from server.models.group import Group

    # delete all core dbs and user and group dbs
    server = core.server()
    [group.delete() for group in core.objects(Group.all(core.connect()))]
    [user.delete() for user in core.objects(SSUser.all(core.connect()))]
    del server["shiftspace/public"]
    del server["shiftspace/shared"]
    del server["shiftspace/messages"]
    del server["shiftspace/master"]
    #[comment.deleteInstance() for comment in core.object(Comment.all(core.connect()))]
    # cleanup, remove any empty folders (left from deleted users
    try:
        fh = open("config/conf.json")
    except:
        print "config/conf.json does not exist. Set the path the database first."
        sys.exit(2)
    conf = json.loads(fh.read())
    if conf.get("dbpath"):
        userdbdir = os.path.join(conf["dbpath"], "user")
        if os.path.exists(userdbdir):
            for file in os.listdir(userdbdir):
                filepath = os.path.join(userdbdir, file)
                if os.path.isdir(filepath):
                    os.rmdir(filepath)
            os.rmdir(userdbdir)
        grpdbdir = os.path.join(conf["dbpath"], "group")
        if os.path.exists(grpdbdir):
            os.rmdir(grpdbdir)
        ssdbdir = os.path.join(conf["dbpath"], "shiftspace")
        if os.path.exists(ssdbdir):
            os.rmdir(ssdbdir)


def resetdb():
    """
    Delete all the databases and recreate them. The database path
    must be set for this to work.
    """
    deletedbs()
    installDefaultSpaces()
    setup.init()


def setdbpath(path):
    """
    Set the path to where the database actually lives. Required
    for database reset operations.
    """
    fh = open("config/conf.json", "w")
    conf = {
        "dbpath": path
        }
    fh.write(json.dumps(conf, indent=4))
    fh.close()


def installdeps():
    """
    Run the dependency install scripts for the appropiate platform.
    """
    platform = sys.platform
    if not os.path.exists("tmp/deps"):
        os.system("scripts/download_deps.sh")
    if platform == "darwin":
        os.system("scripts/install_deps.sh")
    elif platform == "linux2":
        os.system("scripts/install_deps.sh")
    elif platform == "win32":
        os.system("scripts/install_deps_win.sh")
    os.system("scripts/clean.sh")


def docs():
    """
    Build all the documentation for the project.
    """
    cwd = os.getcwd()
    docpath = os.path.join(cwd, "docs")
    if not os.path.isdir(docpath):
        os.mkdir(docpath)
    ndpath = os.path.join(cwd, "tmp/docs")
    if not os.path.isdir(ndpath):
        os.mkdir(ndpath)
    os.system("./externals/NaturalDocs-1.4/NaturalDocs -i . -o html docs -p tmp/docs -xi externals -xi NaturalDocs-1.4 -xi builds -xi spaces -xi ideas -xi tmp")


def manual():
    """
    Build the manual
    """
    manbuild.buildAll()


def tests(toRun):
    """
    Run all the unit tests.
    """
    suites = []
    if toRun == "all" or "shift" in toRun:
        import server.tests.shift_model_test
        suites.append(unittest.TestLoader().loadTestsFromTestCase(server.tests.shift_model_test.BasicOperations))
    if toRun == "all" or "group" in toRun:
        import server.tests.group_model_test
        suites.append(unittest.TestLoader().loadTestsFromTestCase(server.tests.group_model_test.BasicOperations))
    if toRun == "all" or "comment" in toRun:
        import server.tests.comment_model_test
        suites.append(unittest.TestLoader().loadTestsFromTestCase(server.tests.comment_model_test.BasicOperations))
    if toRun == "all" or "favorite" in toRun:
        import server.tests.favorite_model_test
        suites.append(unittest.TestLoader().loadTestsFromTestCase(server.tests.favorite_model_test.BasicOperations))
    for suite in suites:
        unittest.TextTestRunner(verbosity=2).run(suite)


def runlucene():
    try:
        os.system("server/couchdb-lucene/bin/run&")
        pass
    except:
        pass


def runserver(argv):
    """
    Run the builtin webserver on the specified port (defaults to 8080).
    """
    try:
        fh = open("config/env/mydev.json")
    except:
        print
        print "ERROR: You have not specified the domain from which ShiftSpace will be served."
        print "You should run something like the following first:"
        print
        print "python shifty.py configure http://locahost:8080"
        print
        sys.exit(2)
    try:
        port = argv[1]
        server.start(port=int(port))
    except:
        server.start()


def installSpace(space):
    """
    Installs a space's attributes into the database.
    """
    setup.installSpace(space)


def installDefaultSpaces():
    """
    Installs the default spaces.
    """
    [installSpace(s) for s in ['Notes', 'Highlights', 'SourceShift', 'ImageSwap']]


def shell():
    """
    Launch the shell with the models loaded. Useful for testing.
    """
    os.system("python -i shell.py")
    

def main(argv):
    try:
        action = argv[0]
    except Error:
        usage()
        sys.exit(2)
    if len(missing) > 0 and (not (action in ["nightly", "installdeps", "build", "configure", "shiftpress", ""])):
        bail(", ".join(missing))
    if action in ("-h", "--help"):
        usage()
    elif action == "nightly":
        nightly()
    elif action == "configure":
        try:
            url = argv[1]
        except:
            usage()
            sys.exit(2)
        configure(url)
    elif action == "docs":
        docs()
    elif action == "manual":
        manual()
    elif action == "installdeps":
        installdeps()
    elif action == "update":
        update()
    elif action == "initdb":
        setup.init()
    elif action == "build":
        build(argv[1:])
    elif action == "updatedb":
        updatedb()
    elif action == "resetdb":
        resetdb()
    elif action == "install":
        installSpace(argv[1])
    elif action == "setdbpath":
        try:
            url = argv[1]
        except:
            usage()
            sys.exit(2)
        setdbpath(url)
    elif action == "shiftpress":
        try:
            url = argv[1]
        except:
            usage()
            sys.exit(2)
        shiftpress(url)
    elif action == "tests":
        toRun = "all"
        if len(argv) > 1:
            toRun = [str.strip() for str in argv[1:]]
        tests(toRun)
    elif action == "new":
        try:
            name = argv[1]
        except:
            usage()
            sys.exit(2)
        createSpace(argv[1])
    elif action == "runserver":
        print
        print "Make sure that you start lucene as well with:"
        print "\tpython shifty.py runlucene"
        print
        runserver(argv)
    elif action == "runlucene":
        runlucene()
    elif action == "shell":
        shell()
    else:
        usage()
        sys.exit(2)


def usage():
    print
    print "Hello from Shifty! <item> is required, [item] is not."
    print
    print "   %16s  install dependencies" % "installdeps"
    print "   %16s  build a shiftspace script" % "build"
    print
    print "   %16s  configure ShiftSpace" % "configure <url>"
    print "   %16s  configure ShiftPress" % "shiftpress <url>"
    print
    print "   %16s  simpler way of keeping project submodules up-to-date" % "update"
    print "   %16s  initialize the database" % "initdb"
    print "   %16s  update the database" % "updatedb"
    print "   %16s  reset the database (delete and recreate)" % "resetdb"
    print "   %16s  set the database path" % "setdbpath <path>"
    print
    print "   %16s  build/update the core documentation" % "docs"
    print "   %16s  build/update the manual" % "manual"
    print
    print "   %16s  create a new space" % "new <spacename>"
    print "   %16s  start ShiftServer on the specified port" % "runserver [port]"
    print "   %16s  deploy an application" % "app <appname>"
    print
    print "   %16s  run unit tests" % "tests"
    print "   %16s  make a nightly" % "nightly"
    print 


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1:])
    else:
        usage()
