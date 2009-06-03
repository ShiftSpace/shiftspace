<?php

$dir = dirname(__FILE__);
require_once "$dir/library/base.php";


function sscall($args) {
  $_GET = $args;
  $_REQUEST = $args;
  $_POST = $args;

  ob_start();

  $server = Base_Server::singleton('server.ini', 'working/server.ini');
  $server->main();
  $result = ob_get_contents();

  ob_end_clean();

  return $result;
}  

?>
