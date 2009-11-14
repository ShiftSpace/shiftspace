<?php
require_once('shiftserver.php');

class UserController {
  public function __construct() { 
  }

  public function isLoggedIn() {
    return true;
  }
}
?>