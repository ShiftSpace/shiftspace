<?php

require_once '../library/base.php';
try {
  $server = Base_Server::singleton('config/server.ini');
  $server->main();
} catch (Exception $e) {
  echo 'Error: ' . $e->getMessage();
}

?>
