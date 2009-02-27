<?php

require_once "Mail.php";

class Email {
  public function __construct($server) {
    $this->server = $server;
  }
  
  public function send() {
    extract($_POST);

    $useremail = $this->server->user['email'];
    $to = $email_addresses;

    $headers = array ('From' => $useremail,
      'Subject' => $subject);

    if ($email_addresses != '')
      $headers['To'] = $email_addresses;

    if ($send_email_to_current_user == 1) {
      $headers['Cc'] = $useremail;
      
      if ($to != '')
        $to .= ', ';

      $to .= $useremail;
    }

    $smtp = Mail::factory('smtp', array ('host' => 'owa.moma.org')); 
    $mail = $smtp->send($to, $headers, $body);
              
    if (PEAR::isError($mail)) {
      throw new Error('Error sending e-mail: '.$mail->getMessage());
    } 
    else {
      return new Response('ok');
    }
  }
}

?>
