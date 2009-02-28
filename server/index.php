<?php

$dir = dirname(__FILE__);

// 1 month
ini_set('session.gc_maxlifetime', 2952000);

require_once "$dir/library/base.php";
try {
  $server = Base_Server::singleton('server.ini', 'working/server.ini');
  $server->main();
} catch (Exception $e) {
  echo 'Error: ' . $e->getMessage();
}

// testing

?>
