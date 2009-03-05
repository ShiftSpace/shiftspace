<?php

require_once "Mail.php";
require_once 'Mail/mime.php';

class Email {
  public function __construct($server) {
    $this->server = $server;
  }
  
  public function send() {
    extract($_POST);

    $crlf = "\n";
                                          
    $mime = new Mail_mime($crlf);
                                          
    $mime->setTXTBody(strip_tags($body));
//    $mime->setHTMLBody($body);
    $mimebody = $mime->get();

    $useremail = $this->server->user['email'];
    if ($useremail == null)
      $useremail = "noreply@moma.org";
      
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
