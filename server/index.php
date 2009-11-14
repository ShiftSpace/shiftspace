<?php
if (!function_exists('add_action')) {
  require_once("../../../../wp-config.php");
}
require_once('shiftserver.php');
require_once('wpuser.php');
new ShiftServer(array("user" => new WPUserController()));
?>