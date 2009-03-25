<?php

$dir = dirname(__FILE__);
require_once("$dir/../../momasocialbar/sms.php");

class Artwork_Object extends Base_Object {}
class SavedArtWork_Object extends Base_Object {}

class Sms {
  public function __construct($server) {
    $this->server = $server;
  }
  
  public function send() {
    extract($_POST);

    $result = Array();

    $month = date('m/Y');
    
    if ($this->server->user['last_sms_month'] != $month) {
      $this->server->user['last_sms_month'] = $month;
      $this->server->user['num_sms'] = 0;
    }
    
    if (isset($phone) && $phone != '')
      $numbers = explode(',', $phone);
    else
      $numbers = array();
      
    if ($toself == 1) {
      $numbers[] = $this->server->user['normalized_phone'];
      $this->server->user['num_sms']++;
    }
    
    foreach ($numbers as $number) {
      $result[] = sendsms($this->normalizePhoneNumber($number), $msg);
      $this->server->user['num_sms']++;

      if ($this->server->user['num_sms'] > 3) {
        $user = new User_Object();
        $user->set($this->server->user);
        $this->server->moma->save($user);                
                         
        throw new Error("Sorry, you have surpassed your allowed monthly text message limit");
      }
    }

    $user = new User_Object();
    $user->set($this->server->user);
    $this->server->moma->save($user);
                  
    return new Response($result);
  }

  static public function normalizePhoneNumber($phone) {
    $phone = str_replace(Array('.', '(', ')', '-', ' '), '', $phone);
    
    if (substr($phone, 0, 1) != '+') // We're in the US
      $phone = '+1' . $phone;
    
    return $phone;
  }
  
  private function userByPhone($phone) {
    $users = $this->server->moma->rows("select * from user where normalized_phone=:phone and phone_validated=1", compact('phone'), PDO::FETCH_ASSOC);
    if (count($users) > 0) {
      return array($users[0], false);
    }  
    else {
      $user = new User_Object();
      $user->set('normalized_phone', $phone);
      $user->set('phone_validated', 1);
      $this->server->moma->save($user);
      
      return array($user->get(), true);
    }
  }
  
  public function receive() {
    extract($_REQUEST);
        
    $f = fopen(dirname(__FILE__)."/sms.log", "a");
    fwrite($f, "[RECEIVE]\n");
    fwrite($f, "Phone: $phone\n");
    fwrite($f, "Message: $msg\n");
    fwrite($f, "Action: $action\n");
    fwrite($f, "=====\n\n");
    fflush($f);
    fclose($f);

    $artworkid = trim($msg);
    $artwork = $this->server->moma->load("artwork($artworkid)");
    
    if ($artwork) {
      list($user, $new) = $this->userByPhone($phone);
      extract($user);
      $userid = $id;

      $args = compact('userid', 'artworkid');
      $count = $this->server->moma->value("SELECT COUNT(*) FROM savedartwork WHERE userid=:userid AND artworkid=:artworkid", $args);
      
      if ($count == 0) {      
        $savedartwork = new SavedArtWork_Object();
        $savedartwork->set(compact('userid', 'artworkid'));
        $this->server->moma->save($savedartwork);
      }
            
      $artwork = $artwork->get();
      $title = $artwork['title'];
        
      if (!$dontremind) {      
        $updateuser = new User_Object();
        $updateuser->set($user);
        $updateuser->set('dontremind', 1);
        $this->server->moma->save($updateuser);

        if ($username == '')
          sendsms($normalized_phone, "Hey there. '$title' was just saved for you. Go to moma.org/txt to retrieve it and any other works you collect. See you there!");
        else
          sendsms($normalized_phone, "Hey $username. '$title' was added to your collection. You will find it and any other work you collect on moma.org. See you there!");
      }
    } 
    else {
      sendsms($phone, "$artworkid does not refer to any item in our database. Please verify the number and try again.");
    }
  }
}

?>
