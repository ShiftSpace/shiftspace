import sys
import os
import shutil
import getopt
import simplejson as json

import builder.corebuilder as corebuilder
import sandalphon.sandalphon as sandalphon
import builder.preprocess as preprocess

import server.server as server
import server.setup as setup


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
            "LOG_LEVEL": "SSLogError | SSLogSystem | SSLogShift"
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

    compiler = sandalphon.SandalphonCompiler("client/compiledViews", env)
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
    else:
        print "Error: A space called %s already exists" % name


def updatedb():
    """
    Resync the server/views folder with the design documents
    in the database.
    """
    setup.loadDocs()


def installdeps():
    """
    Run the dependency install scripts for the appropiate platform.
    """
    platform = sys.platform
    if platform == "darwin":
        os.system("sudo scripts/install_deps.sh")
    elif platform == "linux2":
        os.system("sudo scripts/install_deps.sh")
    elif platform == "win32":
        os.system("scripts/install_deps_win.sh")


def main(argv):
    try:
        action = argv[0]
    except Error:
        usage()
        sys.exit(2)
    if action in ("-h", "--help"):
        usage()
    if action == "configure":
        configure(argv[1])
    if action == "installdeps":
        installdeps()
    elif action == "update":
        update()
    elif action == "initdb":
        setup.init()
    elif action == "build":
        build(argv[1:])
    elif action == "updatedb":
        updatedb()
    elif action == "new":
        createSpace(argv[1])
    elif action == "runserver":
        server.start()


def usage():
    print
    print "Hello from Shifty! <item> is required, [item] is not."
    print "   %16s  install dependencies" % "installdeps"
    print "   %16s  configure ShiftSpace" % "configure <url>"
    print "   %16s  update ShiftSpace source and tests" % "update"
    print "   %16s  initialize the database" % "initdb"
    print "   %16s  update the database" % "updatedb"
    print "   %16s  create a new space" % "new <spacename>"
    print "   %16s  start ShiftServer on the specified port" % "runserver [port]"
    print "   %16s  deploy an application" % "app <appname>"
    print


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1:])
    else:
        usage()
