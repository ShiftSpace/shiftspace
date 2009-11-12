import unittest
import sys
import os
import shutil
import getopt

missing = []
    
try:
    import simplejson as json
    import builder.preprocess as preprocess
    import builder.corebuilder as corebuilder
    import sandalphon.sandalphon as sandalphon
except:
    missing.append("simplejson")

try:
    import manual.build as manbuild
except:
    missing.append("mako")
try:
    import server.setup as setup
except:
    missing.append("couchdb-python")
try:
    import server.server as server
except:
    missing.append("cherrypy")


def bail(missinglibs):
    print "Missing %s. Please run the following first before attempting to use shifty features:" % missinglibs
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


def env(url):
    return {
        "SERVER": url,
        "SPACEDIR": url + "spaces/",
        "IMAGESDIR": url + "images/",
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


def update():
    """
    Update the source file and test file indexes.
    """
    corebuilder.run()


def build(argv):
    """
    Generates the supporting HTML and CSS files as well as the
    concatenated source.
    """
    input = None
    output = None
    env = None
    proj = None
    templ = None

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

    compiler = sandalphon.SandalphonCompiler("builds/compiledViews", env)
    compiler.compile(inputFile=templ)
    preprocessor = preprocess.SSPreProcessor(project=proj, env=env)
    preprocessor.preprocess(input=input, output=os.path.join("builds", output))


def processTemplate(path, outputdir, name):
    """
    Used by createSpace. Helper function for copying
    over space template files.
    """
    base, ext = os.path.splitext(os.path.basename(path))
    fh = open(path)
    contents = fh.read()
    fh.close()
    contents = contents.replace("Name", name)
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
    else:
        print "Error: A space called %s already exists" % name


def updatedb():
    """
    Resync the server/views folder with the design documents
    in the database.
    """
    # old way
    setup.loadDocs()
    # new way
    from couchdb.design import ViewDefinition
    from server.models import core
    from server.models.ssuserschema import SSUser
    from server.models.shiftschema import Shift
    from server.models.groupschema import Group
    from server.models.permschema import Permission
    db = core.connect()
    for cls in [SSUser, Shift, Group, Permission]:
        attrs = dir(cls)
        for attr in attrs:
            rattr = getattr(cls, attr)
            t = type(rattr)
            if t == ViewDefinition:
                rattr.sync(db)


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
    if toRun == "all" or "shift" in toRun:
        import server.tests.shift_model_test
        suite = unittest.TestLoader().loadTestsFromTestCase(server.tests.shift_model_test.BasicOperations)
    if toRun == "all" or "group" in toRun:
        import server.tests.group_model_test
        suite = unittest.TestLoader().loadTestsFromTestCase(server.tests.group_model_test.BasicOperations)
    unittest.TextTestRunner(verbosity=2).run(suite)


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
    if len(missing) > 0 and action != "nightly" and action != "installdeps":
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
        runserver(argv)
    elif action == "shell":
        shell()
    else:
        usage()
        sys.exit(2)


def usage():
    print
    print "Hello from Shifty! <item> is required, [item] is not."
    print "   %16s  a magical dance that installs all dependencies, builds docs, and configures the server!" % "dance"
    print "   %16s  install dependencies" % "installdeps"
    print "   %16s  configure ShiftSpace" % "configure <url>"
    print "   %16s  update ShiftSpace source and tests" % "update"
    print "   %16s  initialize the database" % "initdb"
    print "   %16s  update the database" % "updatedb"
    print "   %16s  build/update the core documentation" % "docs"
    print "   %16s  build/update the manual" % "manual"
    print "   %16s  create a new space" % "new <spacename>"
    print "   %16s  start ShiftServer on the specified port" % "runserver [port]"
    print "   %16s  deploy an application" % "app <appname>"
    print "   %16s  run unit tests" % "tests"
    print "   %16s  make a nightly" % "nightly"
    print


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1:])
    else:
        usage()
