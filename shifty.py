import sys
import os


def processTemplate(path, outputdir, name):
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
    else:
        print "Error: A space called %s already exists" % name


def main(argv):
    try:
        action = argv[0]
    except Error:
        usage()
        sys.exit(2)
    if action in ("-h", "--help"):
        usage()
    if action == "installdeps":
        print "installdeps"
    elif action == "compile":
        print "compile"
    elif action == "initdb":
        print "initdb"
    elif action == "updatedb":
        print "updatedb"
    elif action == "new":
        createSpace(argv[1])
    elif action == "server":
        print "server"


def usage():
    print
    print "Hello from Shifty! <item> is required, [item] is not."
    print "   %15s  install dependencies" % "installdeps"
    print "   %15s  update ShiftSpace source" % "compile"
    print "   %15s  initialize the database" % "initdb"
    print "   %15s  update the database" % "updatedb"
    print "   %15s  create a new space" % "new <SpaceName>"
    print "   %15s  start ShiftServer on the specified port" % "server [port]"
    print


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1:])
    else:
        usage()
