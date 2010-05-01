import os
import smtplib
import mail
import ConfigParser
import server.server as server

parser = ConfigParser.ConfigParser()
options = parser.readfp(open(os.path.join(server.SERVER_ROOT, "mail.conf")))
