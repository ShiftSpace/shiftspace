<?php

class Email {
  public function __construct($server) {
    $this->server = $server;
  }
  
  public function send() {
    extract($_POST);

    $useremail = $this->server->user['email'];
    $headers = "From: $useremail";
    
    if ($send_email_to_current_user == 1)
      $headers .= "\r\nCc: $useremail";
            
    $result = mail($email_addresses, $email_subject, $message, $headers);

    if ($result)
      return new Response('ok');
    else
      throw new Error('Error sending e-mail');
  }
}

?>
