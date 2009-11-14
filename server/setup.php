<?php
function apache_access() {
  $pathToServer = dirname($_SERVER['REQUEST_URI']);
  file_put_contents('.htaccess', 
		    "Options +FollowSymLinks
                    RewriteEngine On
                    RewriteBase $pathToServer
                    RewriteRule (.*) index.php");
}
apache_access();
?>