<?php

$dir = dirname(__FILE__);
require_once "$dir/library/base.php";

function sscall($args) {
  $_GET = $args;
  $_REQUEST = $args;
  $_POST = $args;
  
  try {
    $server = Base_Server::singleton('server.ini', 'working/server.ini');
    $server->main();
  } catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
  }
}  

?>
