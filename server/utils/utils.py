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

# adapted from http://evaisse.com/post/93417709/python-pretty-date-function
def pretty_date(t=False):
    """
    Get a datetime object or a int() Epoch timestamp and return a
    pretty string like 'an hour ago', 'Yesterday', '3 months ago',
    'just now', etc
    """
    import time
    import datetime
    now = datetime.datetime.now()
    if type(t) is datetime.datetime:
        diff = now - t
    elif type(t) is int:
        diff = now - datetime.datetime.fromtimestamp(t)
    elif not time:
        diff = now - now
    print type(time)
    second_diff = diff.seconds
    day_diff = diff.days

    if day_diff < 0:
        return ''

    if day_diff == 0:
        if second_diff < 10:
            return "just now"
        if second_diff < 60:
            return str(second_diff) + " seconds ago"
        if second_diff < 120:
            return  "a minute ago"
        if second_diff < 3600:
            return str( second_diff / 60 ) + " minutes ago"
        if second_diff < 7200:
            return "an hour ago"
        if second_diff < 86400:
            return str( second_diff / 3600 ) + " hours ago"
    if day_diff == 1:
        return "Yesterday"
    if day_diff < 7:
        return str(day_diff) + " days ago"
    if day_diff < 31:
        return str(day_diff/7) + " weeks ago"
    if day_diff < 365:
        return str(day_diff/30) + " months ago"
    return str(day_diff/365) + " years ago"
