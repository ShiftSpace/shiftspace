<?php

class User {
  protected $sql = array(
    'login' => "
      SELECT *
      FROM user
      WHERE username = :username
      AND password = :password
    ",
    'checkuser' => "
      SELECT COUNT(*)
      FROM user
      WHERE username = :username
    ",
    'checkemail' => "
      SELECT COUNT(*)
      FROM user
      WHERE email = :email
    "
  );
  
  public function __construct($server) {
    $this->server = $server;
  }  

  public function login() { 
    if ($_SERVER['REQUEST_METHOD'] != 'POST') {
      throw new Error('Invalid request.');
    } else if (empty($_POST['username'])) {
      throw new Error('Oops, you forgot to enter a username.');
    } else if (empty($_POST['password'])) {
      throw new Error('Oops, you forgot to enter a password.');
    }
    
    $username = $_POST['username'];
    $password = md5($_POST['password']);

    $user = $this->server->db->row($this->sql['login'], array(
      'username' => $username,
      'password' => $password
    ));

    if (empty($user)) {
      throw new Error('Oops! Please try again.');
    } else {
      if (!preg_match('#^[a-zA-Z0-9_.]+$#', $_POST['username'])) {
        throw new Error("We're sorry, but your username is not compatible with the latest release of ShiftSpace. Please contact us at info@shiftspace.org so we can fix your account.");
      }

      $this->server->user = $user;      
      return new Response($user);
    }
  }

  public function logout() {
    $this->server->user = null;
  }
  
  public function join() {
    extract($_POST);

    if ($password != $password_again)
      throw new Error("Passwords do not match");
    if (strlen($password) < 6)
      throw new Error("Oops, please enter a password at least 6 characters long.");
    if (!preg_match('#^[a-zA-Z0-9_.]+$#', $username))
      throw new Error("Oops, please enter a username composed letters, numbers, periods or underscores.");

    $userexists = $this->server->db->value($this->sql['checkuser'], array('username' => $username));
    if ($userexists)
      throw new Error('Sorry, that username has already been taken. Please choose again.');

    $emailexists = $this->server->db->value($this->sql['checkemail'], array('email' => $email));
    if ($emailexists)
      throw new Error('Sorry, that email has already been used. You can use the password retrieval form to retrieve your username.');

    $user = new User_Object();
    $user->set(array(
      'username'      => $username,
      'display_name'  => $username,
      'password'      => md5($password),
      'email'         => $email
    ));
    
    $this->server->db->save($user);
    $this->server->user = $user;
  }
}

?>
