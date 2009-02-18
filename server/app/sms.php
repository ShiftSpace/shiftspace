<?php

class Artwork_Object extends Base_Object {
}

class Sms {
  public function __construct($server) {
    $this->server = $server;
  }
  
  public function send() {
    extract($_POST);

    $message = urlencode($message);
  }
  
  public function receive() {
    extract($_POST);
        
    $f = fopen(dirname(__FILE__)."/sms.log", "a");
    fwrite($f, "Phone: $phone\n");
    fwrite($f, "Message: $msg\n");
    fwrite($f, "Action: $action\n");
    fwrite($f, "=====\n\n");
    fflush($f);
    fclose($f);

    $artworkid = trim($msg);
    $artwork = $this->server->moma->load("artwork($artworkid)")->get();
    $title = $artwork['title'];
    return "Hey there. $title was just saved for you. Go to txt.moma.org to retrieve it and any other works you collect. See you there!";
  }
}

?>
