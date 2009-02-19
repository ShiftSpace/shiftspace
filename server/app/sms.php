<?php

class Artwork_Object extends Base_Object {}
class SavedArtWork_Object extends Base_Object {}

class Sms {
  public function __construct($server) {
    $this->server = $server;
  }
  
  public function send() {
    extract($_POST);

    $message = urlencode($message);
  }
  
  private function userByPhone($phone) {

    $users = $this->server->moma->rows("select * from user where phone=:phone", compact('phone'), PDO::FETCH_ASSOC);
    if (count($users) > 0) {
      return array($users[0], false);
    }  
    else {
      $user = new User_Object();
      $user->set(compact('phone'));
      $this->server->moma->save($user);
      
      return array($user->get(), true);
    }
  }
  
  public function receive() {
    extract($_REQUEST);
        
    $f = fopen(dirname(__FILE__)."/sms.log", "a");
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
      
      $savedartwork = new SavedArtWork_Object();
      $savedartwork->set(compact('userid', 'artworkid'));
      $this->server->moma->save($savedartwork);
      
      $artwork = $artwork->get();
      $title = $artwork['title'];
        
      if (!$dontremind) {      
        $updateuser = new User_Object();
        $updateuser->set($user);
        $updateuser->set('dontremind', 1);
        $this->server->moma->save($updateuser);

        if ($username == '')
          return "Hey there. '$title' was just saved for you. Go to txt.moma.org to retrieve it and any other works you collect. See you there!";
        else
          return "Hey $username. '$title' was added to your collection. You will find it and any other work you collect on moma.org. See you there!";
      }
    } 
    else {
      return "$artworkid does not refer to any item in our database. Please verify the number and try again.";
    }
  }
}

?>
