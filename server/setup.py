#!/usr/bin/python
import ConfigParser, os

def listdirfull(dir):
  return [dir + '/' + filename for filename in os.listdir(dir)]

config = ConfigParser.RawConfigParser()
config.read(listdirfull('config'))
config.write(open('server.ini', 'w'))
