import sys
import os

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
        print "new"
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
