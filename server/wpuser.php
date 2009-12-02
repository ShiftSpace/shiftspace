<?php
require_once('shiftserver.php');
require_once('user.php');

class WPUserController extends UserController {
  public function __construct() {   
    // call into WP to see if there is a session store it here
    if($this->isLoggedIn()) {
    	$userData = wp_get_current_user();
    	
    }
  }
  
  public function showThis() {
  	return $this->userData;
  }
  
  public function isLoggedIn() {
  	return is_user_logged_in();
  }
}
?>