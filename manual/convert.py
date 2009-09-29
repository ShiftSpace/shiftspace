import os
import sys
import getopt
import textile

def main(argv):
    input = None
    output = None
    try:
        print argv
        opts, args = getopt.getopt(argv, "i:o:h", ["input=", "output=", "help"])
    except:
        print "\nERROR: Invalid flag"
        usage()
        sys.exit(2)
    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()
        elif opt in ("-i", "--input"):
            input = arg
        elif opt in ("-o", "--output"):
            output = arg
    if input == None:
        print "No input file\n"
        usage()
        sys.exit(2)
    if output == None:
        basename = os.splitext(os.file.basename(input))[0]
        input = "%.html" % basename
    fh = open(input)
    converted = textile.textile(fh.read())
    fh.close()
    fh = open(output, "w")
    fh.write(converted)
    fh.close()


def usage():
    print "convert.py takes the following flags:"
    print "\t-i input .textile file"
    print "\t-o output file, default to inputfilename.html\n"


if __name__ == "__main__":
    if len(sys.argv) > 1:
        main(sys.argv[1:])
    else:
        usage()
