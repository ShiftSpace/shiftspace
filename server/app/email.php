<?php

require_once "Mail.php";

class Email {
  public function __construct($server) {
    $this->server = $server;
  }
  
  public function send() {
    extract($_POST);

    $useremail = $this->server->user['email'];

    $headers = array ('From' => $useremail,
      'To' => $email_addresses,
      'Subject' => $subject);

    if ($send_email_to_current_user == 1)
      $headers['Cc'] = $useremail;

    $smtp = Mail::factory('smtp', array ('host' => 'owa.moma.org')); 
    $mail = $smtp->send($email_addresses, $headers, $body);
              
    if (PEAR::isError($mail)) {
      throw new Error('Error sending e-mail');
    } 
    else {
      return new Response('ok');
    }
  }
}

?>
