<?php

$dir = dirname(__FILE__);
require_once("$dir/sms.php");

require_once "Mail.php";
require_once 'Mail/mime.php';

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
    ",
    'checkphone' => "
      SELECT COUNT(*)
      FROM user
      WHERE normalized_phone = :nphone
      AND phone_validated = 1
      AND username <> ''
    ",
    'checkemailupdate' => "
      SELECT COUNT(*)
      FROM user
      WHERE email = :email
      AND id <> :userid
    ",
    'checkphoneupdate' => "
      SELECT COUNT(*)
      FROM user
      WHERE normalized_phone = :nphone
      AND phone_validated = 1
      AND username <> ''
      AND id <> :userid
    ",
    'find_userid_by_phone' => "
      SELECT id, username
      FROM user
      WHERE normalized_phone = :nphone
      AND phone_validated = 1
    ",
    'replace_bookmarks' => "
      UPDATE savedartwork
      SET userid = :newuserid
      WHERE userid = :olduserid  
    ",
    'delete_user' => "
      DELETE FROM user
      WHERE id = :userid
    "
  );
  
  public function __construct($server) {
    $this->server = $server;
  }  

  public function login() { 
    if ($_SERVER['REQUEST_METHOD'] != 'POST') {
      throw new Error('Invalid request.');
    } else if (empty($_POST['username'])) {
      throw new Error('Please enter a username.');
    } else if (empty($_POST['password'])) {
      throw new Error('Please enter your password.');
    }
    
    $username = $_POST['username'];
    $password = md5($_POST['password']);

    $user = $this->server->moma->row($this->sql['login'], array(
      'username' => $username,
      'password' => $password
    ));

    if (empty($user)) {
      throw new Error('Incorrect username or password. Please try again.');
    } else {
      if (!preg_match('#^[a-zA-Z0-9_.]+$#', $_POST['username'])) {
        throw new Error("We're sorry, but your username is not compatible with the latest release of ShiftSpace. Please contact us at info@shiftspace.org so we can fix your account.");
      }

      $this->server->user = get_object_vars($user);      
      return new Response($this->server->user);
    }
  }

  public function logout() {
    $this->server->user = null;
    return new Response('ok');
  }

  public function update() {
    extract($_POST);

    if (isset($password) && $password != '') {
      if ($password != $password_again)
        throw new Error("Passwords do not match");
      if (strlen($password) < 6)
        throw new Error("Oops, please enter a password at least 6 characters long.");
    }
    
    $userid = $this->server->user['id'];

    $emailexists = $this->server->moma->value($this->sql['checkemailupdate'], array('email' => $email, 'userid' => $userid));
    if ($emailexists)
      throw new Error('Sorry, that email has already been used. You can use the password retrieval form to retrieve your username.');

    $nphone = Sms::normalizePhoneNumber($phone);

    $phoneexists = $this->server->moma->value($this->sql['checkphoneupdate'], array('nphone' => $nphone, 'userid' => $userid));
    if ($emailexists)
      throw new Error('Sorry, that phone number has already been used.');

    $user = $this->server->moma->load("user($userid)");

    if ($nphone != $this->server->user['normalized_phone']) {
      $user->set('phone_validated', 0);
      $user->set('phone_key', 0);
    }

    $user->set(array(
      'phone'             => $phone,
      'normalized_phone'  => $nphone,
      'email'             => $email,
      'perspective'       => $perspective
    ));

    if (isset($password) && $password != '') {
      $user->set('password', md5($password));
    }

    $this->server->moma->save($user);

    $user = $this->server->moma->load("user($userid)");
    $this->server->user = $user->get();
    
    return new Response($this->server->user);
  }

  private function generate_key() {
    return rand(100000, 999999);
  }

  public function validate_phone() {
    if ($this->server->user['phone_validated'] == 1)
      return new Response("ok");
    else {
      $key = $this->generate_key();
      $this->server->user['phone_key'] = md5($key);

      $user = new User_Object();
      $user->set($this->server->user);
      $this->server->moma->save($user);
      
      $sms_msg = "Enter this passcode on MoMA.org to validate your phone: $key";
      sendsms($this->server->user['normalized_phone'], $sms_msg);
      return new Response("key"); 
    }
  }

  public function validate_phone_complete() {
    extract($_POST);
    
    if (md5($key) == $this->server->user['phone_key']) {
      
      $oldusers = $this->server->moma->rows($this->sql['find_userid_by_phone'], array('nphone' => $this->server->user['normalized_phone']), PDO::FETCH_ASSOC);
      if (count($oldusers) > 0) {
        $olduserid = $oldusers[0]['id'];
  
        // an sms bookmarked user
        $this->server->moma->query($this->sql['replace_bookmarks'], array('olduserid' => $olduserid, 'newuserid' => $this->server->user['id']));
        $this->server->moma->query($this->sql['delete_user'], array('userid' => $olduserid));
      }
      
      $this->server->user['phone_validated'] = 1;

      $user = new User_Object();
      $user->set($this->server->user);
      $this->server->moma->save($user);
      
      return new Response("validated");
    } else {
      throw new Error("Invalid key");
    }
  }
  
  public function join() {
    extract($_POST);

    if ($password != $password_again)
      throw new Error("Passwords do not match");
    if (strlen($password) < 6)
      throw new Error("Oops, please enter a password at least 6 characters long.");
    if (!preg_match('#^[a-zA-Z0-9_.]+$#', $username))
      throw new Error("Oops, please enter a username composed of letters, numbers, periods or underscores, but no spaces.");

    $userexists = $this->server->moma->value($this->sql['checkuser'], array('username' => $username));
    if ($userexists)
      throw new Error('Sorry, that username has already been taken. Please choose again.');

    $emailexists = $this->server->moma->value($this->sql['checkemail'], array('email' => $email));
    if ($emailexists)
      throw new Error('Sorry, that email has already been used. You can use the password retrieval form to retrieve your username.');

    $nphone = Sms::normalizePhoneNumber($phone);

    $phoneexists = $this->server->moma->value($this->sql['checkphone'], array('nphone' => $nphone));
    if ($phoneexists)
      throw new Error('Sorry, that phone number has already been used. You can use the password retrieval form to retrieve your username.');

    $user = new User_Object();
    $user->set(array(
      'username'          => $username,
      'display_name'      => $username,
      'password'          => md5($password),
      'phone'             => $phone,
      'normalized_phone'  => $nphone,
      'email'             => $email,
      'membership_id'     => $membership_id,
      'first_name'        => $first_name,
      'last_name'         => $last_name,
      'perspective'       => $perspective
    ));
    
    $this->server->moma->save($user);
    $this->server->user = $user->get();
    
    return new Response($this->server->user);
  }
  
  public function query() {
    return new Response($this->server->user);
  }
  
  public function bookmarks_by_phone() {
    extract($_REQUEST);
    
    $result = $this->server->moma->value("SELECT COUNT(*) FROM savedartwork, user WHERE savedartwork.userid = user.id 
                                          AND user.normalized_phone = :nphone AND user.phone_validated = 1", 
                                          array('nphone' => Sms::normalizePhoneNumber($phone)));
    
    return new Response($result);
  }

  static function generatePassword ($length = 8)
  {

    // start with a blank password
    $password = "";

    // define possible characters
    $possible = "0123456789bcdfghjkmnpqrstvwxyz"; 
    
    // set up a counter
    $i = 0; 
    
    // add random characters to $password until $length is reached
    while ($i < $length) { 

      // pick a random character from the possible ones
      $char = substr($possible, mt_rand(0, strlen($possible)-1), 1);
        
      // we don't want this character if it's already in the password
      if (!strstr($password, $char)) { 
        $password .= $char;
        $i++;
      }

    }

    // done!
    return $password;
  }

  public function getname() {
    extract($_REQUEST);
    $user = $this->server->moma->load("user($userid)");
    return new Response($user->username);
  }
  
  public function renew_password() {
    extract($_REQUEST);
    
    $to = $this->server->moma->row("SELECT email FROM user WHERE username=:username", compact('username'));

    if ($to == null)
      throw new Error("No such username");

    $to = $to->email;

    $new_password = $this->generatePassword();
    $md5 = md5($new_password);
    
    $this->server->moma->query("UPDATE user SET password=:md5 WHERE username=:username", compact('md5', 'username'));    

    $crlf = "\n";
    $mime = new Mail_mime($crlf);
    $mime->setTXTBody("Your new password is $new_password. You can change it once you log-in.");
    $mimebody = $mime->get();

    $useremail = $this->server->user['email'];
    if ($useremail == null)
      $useremail = "noreply@moma.org";

    $headers = array ('From' => 'noreply@moma.org',
      'Subject' => 'New password for MoMA.org',
      'To' => $to);

    $headers = $mime->headers($headers);

    $smtp = Mail::factory('smtp', array ('host' => 'owa.moma.org'));
    $mail = $smtp->send($to, $headers, $mimebody);

    if (PEAR::isError($mail)) {
      throw new Error('Error sending e-mail: '.$mail->getMessage());
    }
    else {
      return new Response('ok');
    }
  }
}

?>
