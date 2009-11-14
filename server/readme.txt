Dependencies
================================================================================

1. couchdb-python 0.6   
   http://pypi.python.org/packages/source/C/CouchDB/CouchDB-0.6.tar.gz
2. couchdb 0.10dev      
   svn co http://svn.apache.org/repos/asf/couchdb/trunk couchdb   
3. cherrypy 3.1.2       
   http://download.cherrypy.org/cherrypy/3.1.2/
4. routes 1.10.3        
   http://pypi.python.org/packages/source/R/Routes/Routes-1.10.3.tar.gz
5. couchdb-lucene 0.4   
   http://github.com/rnewson/couchdb-lucene/tree/master
6. Apache2
7. mod_wsgi

Installation
================================================================================

You can setup the server code in one of two ways. Proxying the built in
cherrypy web server to Apache, or using mod_wsgi. Proxying works well
for development enviroment. mod_wsgi is the way to go for
deployments.

mod_wsgi
================================================================================

proxy
================================================================================

apache config
================================================================================
<VirtualHost *>                                                                                                                                         
    ServerAdmin you@yoursite.com
    ServerName www.yoursite.com
    ProxyPreserveHost On

    DocumentRoot /Users/username/Sites/shiftserver

    # this prevents the follow path from being proxied                                                                                                  
    ProxyPass /~username/shiftspace/server/static !

    <Location /~username/shiftspace/server>
        Order allow,deny
        allow from all
        ProxyPass http://localhost:8080/~username/shiftspace/server
        ProxyPassReverse http://localhost:8080/~username/shiftspace/server
    </Location>
</VirtualHost>

couchdb local.ini
================================================================================
; CouchDB Configuration Settings

; Custom settings should be made in this file. They will override settings
; in default.ini, but unlike changes made to default.ini, this file won't be
; overwritten on server upgrade.

[couchdb]
;max_document_size = 4294967296 ; bytes
os_process_timeout=60000 ; 60 seconds for couchdb-lucene

[httpd]
;port = 5984
;bind_address = 127.0.0.1

[log]
;level = debug                                                                                                      

[update_notification]
;unique notifier name=/full/path/to/exe -with "cmd line arg"
indexer=/System/Library/Frameworks/JavaVM.framework/Versions/1.6.0/Home/bin/java -jar /Users/username/Sites/shiftserver/couchdb-lucene-0.4-jar-with-dependencies.jar -index

; To create an admin account uncomment the '[admins]' section below and add a
; line in the format 'username = password'. When you next start CouchDB, it                                        
; will change the password to a hash (so that your passwords don't linger                                                    
; around in plain-text files). You can add more admin accounts with more                                                      
; 'username = password' lines. Don't forget to restart CouchDB after                                                       
; changing this.                                                           
;[admins]                                                                                                               
;admin = mysecretpassword                                                                                                      

[external]
; the following provides search, trying to figure out indexing
fti=/System/Library/Frameworks/JavaVM.framework/Versions/1.6.0/Home/bin/java -jar /Users/username/Sites/shiftserver/couchdb-lucene-0.4-jar-with-dependencies.jar -search

[httpd_db_handlers]
_fti={couch_httpd_external, handle_external_req, <<"fti">>}
