<?php

class User_Object extends Base_Object {
}

class User {
  protected $sql = array(
    'login' => "
      SELECT *
      FROM user
      WHERE username = :username
      AND password = :password
    "
  );
  
  public function __construct($server) {
    $this->server = $server;
  }  

  public function login() { 
    if ($_SERVER['REQUEST_METHOD'] != 'POST') {
      return new Response(false, 'Invalid request.');
    } else if (empty($_POST['username'])) {
      return new Response(false, 'Oops, you forgot to enter a username.');
    } else if (empty($_POST['password'])) {
      return new Response(false, 'Oops, you forgot to enter a password.');
    }
    
    $username = $_POST['username'];
    $password = md5($_POST['password']);

    $user = $this->server->db->row($sql['login'], array(
      'username' => $username,
      'password' => $password
    ));

    if (empty($user)) {
      return new Response(false, 'Oops! Please try again.');
    } else {
      if (!preg_match('#^[a-zA-Z0-9_.]+$#', $_POST['username'])) {
        return new Response(false, "We're sorry, but your username is not compatible with the latest release of ShiftSpace. Please contact us at info@shiftspace.org so we can fix your account.");
      }
      
      $_SESSION['user'] = $user;
      return new Response($user);
    }
  }
  
  public function join() {
    $user = new User_Object();
    $user->username = 'avital';
    $user->password = md5('avital');
    $user->display_name = 'avital';
    $this->server->db->save($user);
  }
}

?>
