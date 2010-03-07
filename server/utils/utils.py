import os
import sys
import time
import datetime

try:
    from lxml.html.clean import Cleaner
except:
    pass

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

def futcstr(dstr):
    dt, _, us = dstr.partition(".")
    dt = datetime.datetime.strptime(dt.rstrip("Z"), "%Y-%m-%dT%H:%M:%S")
    if us != '':
        us = int(us.rstrip("Z"), 10)
    else:
        us = 0
    return dt + datetime.timedelta(microseconds=us)

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


def clean(d):
    result = {}
    for k, v in d.items():
        if type(v) == dict:
            v = clean(v)
        result[str(k)] = v
    return result


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


# ------------------------------------------------------------------------------
# Cleaning Utilities

cleaner = None
summary_cleaner = None
try:
    cleaner = Cleaner(style=True,
                      embedded=False,
                      safe_attrs_only=True,
                      remove_unknown_tags=False,
                      allow_tags=['a', 'abbr', 'acronym', 'em', 'i', 'blockquote'
                                  'cite', 'code', 'del', 'q', 'strike', 'strong'])
    summary_cleaner = Cleaner(style=True,
                              embedded=False,
                              safe_attrs_only=True,
                              remove_tags=['a'],
                              allow_tags=[])
except Exception, err:
    print err
    pass
    

def sanitize(d, key="summary"):
    """
    HTML sanitize a specific field in a dict. Defaults to summary.
    """
    if cleaner == None:
        return d
    if key == "summary" and d.get("summary"):
        d[key] = summary_cleaner.clean_html(d[key])
    elif d.get("key"):
        d[key] = cleaner.clean_html(d[key])
    return d
