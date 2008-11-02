<?php

require_once '../base.php';
try {
  $server = Server::singleton('shiftspace.ini');
  $server->main();
} catch (Exception $e) {
  echo 'Error: ' . $e->getMessage();
}

?>
