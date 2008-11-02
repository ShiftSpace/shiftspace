<?php

require_once '../base.php';
try {
  $server = Server::singleton('dphiffer.ini');
  $server->main();
} catch (Exception $e) {
  echo 'Error: ' . $e->getMessage();
}

?>
