<?php

require_once '../library/base.php';
try {
  $server = Server::singleton('dp.ini');
  $server->main();
} catch (Exception $e) {
  echo 'Error: ' . $e->getMessage();
}

?>
