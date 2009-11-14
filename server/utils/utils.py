import os
import sys
import time
import datetime
try:
    # Python 2.5+
    from hashlib import md5
except ImportError:
    from md5 import new as md5

def domain(url):
    return "http://" + url[7:].split("/")[0]

def md5hash(str):
    m = md5()
    m.update(str)
    return m.hexdigest()

def ids(rows):
  return [row["_id"] for row in rows]

def genrefn(pre):
  def refn(id, post=None):
    if post:
      return ":".join([pre, id, post])
    else:
      return ":".join([pre, id])
  return refn

# TODO: adjust for user's actual time - David 7/6/09
def utctime():
  return datetime.datetime.strftime(datetime.datetime.utcnow(), "%a, %d %b %Y %H:%M:%S")

# taken from http://stackoverflow.com/questions/72852/how-to-do-relative-imports-in-python
# unnecessary in Python >= 2.6
def import_path(fullpath):
    """ 
    Import a file with full path specification. Allows one to
    import from anywhere, something __import__ does not do. 
    """
    path, filename = os.path.split(fullpath)
    filename, ext = os.path.splitext(filename)
    sys.path.append(path)
    module = __import__(filename)
    reload(module) # Might be out of date
    del sys.path[-1]
    return module

