#!/usr/bin/env python

from ez_setup import use_setuptools
import sys
if 'cygwin' in sys.platform.lower():
   min_version='0.6c6'
else:
   min_version='0.6a9'
try:
    use_setuptools(min_version=min_version)
except TypeError:
    # If a non-local ez_setup is already imported, it won't be able to
    # use the min_version kwarg and will bail with TypeError
    use_setuptools()

from setuptools import setup, find_packages, Extension, Feature
from distutils.command.build_ext import build_ext
from distutils.errors import CCompilerError, DistutilsExecError, \
    DistutilsPlatformError

VERSION = '2.0.9'
DESCRIPTION = "Simple, fast, extensible JSON encoder/decoder for Python"
LONG_DESCRIPTION = """
simplejson is a simple, fast, complete, correct and extensible
JSON <http://json.org> encoder and decoder for Python 2.4+.  It is
pure Python code with no dependencies, but includes an optional C
extension for a serious speed boost.

simplejson was formerly known as simple_json, but changed its name to
comply with PEP 8 module naming guidelines.

The encoder may be subclassed to provide serialization in any kind of
situation, without any special support by the objects to be serialized
(somewhat like pickle).

The decoder can handle incoming JSON strings of any specified encoding
(UTF-8 by default).
"""

CLASSIFIERS = filter(None, map(str.strip,
"""                 
Intended Audience :: Developers
License :: OSI Approved :: MIT License
Programming Language :: Python
Topic :: Software Development :: Libraries :: Python Modules
""".splitlines()))


speedups = Feature(
    "options C speed-enhancement modules",
    standard=True,
    ext_modules = [
        Extension("simplejson._speedups", ["simplejson/_speedups.c"]),
    ],
)

if sys.platform == 'win32' and sys.version_info > (2, 6):
   # 2.6's distutils.msvc9compiler can raise an IOError when failing to
   # find the compiler
   ext_errors = (CCompilerError, DistutilsExecError, DistutilsPlatformError,
                 IOError)
else:
   ext_errors = (CCompilerError, DistutilsExecError, DistutilsPlatformError)

class BuildFailed(Exception):
    pass

class ve_build_ext(build_ext):
    # This class allows C extension building to fail.

    def run(self):
        try:
            build_ext.run(self)
        except DistutilsPlatformError, x:
            raise BuildFailed()

    def build_extension(self, ext):
        try:
            build_ext.build_extension(self, ext)
        except ext_errors, x:
            raise BuildFailed()

def run_setup(with_binary):
    if with_binary:
        features = {'speedups': speedups}
    else:
        features = {}

    setup(
        name="simplejson",
        version=VERSION,
        description=DESCRIPTION,
        long_description=LONG_DESCRIPTION,
        classifiers=CLASSIFIERS,
        author="Bob Ippolito",
        author_email="bob@redivi.com",
        url="http://undefined.org/python/#simplejson",
        license="MIT License",
        packages=find_packages(exclude=['ez_setup']),
        platforms=['any'],
        test_suite="simplejson.tests",
        zip_safe=True,
        features=features,
        cmdclass={'build_ext': ve_build_ext},
    )

try:
    run_setup(True)
except BuildFailed:
    BUILD_EXT_WARNING = "WARNING: The C extension could not be compiled, speedups are not enabled."
    print '*' * 75
    print BUILD_EXT_WARNING
    print "Failure information, if any, is above."
    print "I'm retrying the build without the C extension now."
    print '*' * 75

    run_setup(False)

    print '*' * 75
    print BUILD_EXT_WARNING
    print "Plain-Python installation succeeded."
    print '*' * 75
