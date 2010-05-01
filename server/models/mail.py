import os
import smtplib
import mail
import ConfigParser
import server.server as server

parser = ConfigParser.ConfigParser()
options = parser.readfp(open(os.path.join(server.SERVER_ROOT, "mail.conf")))

def sendMail(to=None, text=None):
    server = smtplib.SMTP(smtpServer)
    server.set_debuglevel(1)
    server.sendmail(options.get("Mail Settings", "from"), to, text)
    server.quit()
