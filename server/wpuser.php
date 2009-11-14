<?php
require_once('shiftserver.php');
require_once('user.php');

class WPUserController extends UserController {
  public function __construct() {   
    // call into WP to see if there is a session store it here
    $this->isLoggedIn = is_user_logged_in();
    if($this->isLoggedIn) {   
      $userData = get_currentuserinfo();
      $this->userName = $display_name;
      $this->id = $user_ID;
      $this->level = $user_level;
    }
  }
}
?>