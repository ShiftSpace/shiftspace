<?php
require_once('shiftserver.php');
require_once('user.php');

class WPUserController extends UserController {
  public function __construct() {   
    global $current_user;
    $userData;
    if($this->isLoggedIn()) {
      $this->userData = array(
                              "userName" => $current_user->display_name,
                              "_id" => $current_user->ID,
                              "userLevel" => $current_user->user_level
                              );
      $this->userData = json_encode($this->userData);
    } else {
      $this->userData = "{message:'not logged in.'}";
    
    }
  }
  
  public function matchUser() {
    return $this->userData;
  }
  
  public function isLoggedIn() {
    return is_user_logged_in();
  }
}
?>