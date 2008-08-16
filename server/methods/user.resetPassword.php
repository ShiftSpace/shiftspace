<?php

extract($db->escape($_POST));

if (empty($email)) {
  $response = "Oops, you didn't enter an email address.";
} else {
  $u = $db->row("
    SELECT *
    FROM user
    WHERE email = '$email'
  ");
  if (empty($u)) {
    $response = "Sorry, we couldn't find a matching account.";
  }
}

if (empty($response)) {
  $chars = 'abcdefghijklmnopqrstuvwxyz01234567890';
  $password = '';
  for ($i = 0; $i < 8; $i++) {
    $index = rand(0, strlen($chars) - 1);
    $password .= $chars[$index];
  }
  $hashed = md5($password);
  $db->query("
    UPDATE user
    SET password = '$hashed'
    WHERE id = $u->id
  ");
  $response = "Your password has been reset and emailed to you.";
  $subject = 'ShiftSpace password reset';
  $body = wordwrap("Hello $u->username,

Somebody (hopefully you) has requested that your account's password be reset. Please login with the following credentials:

Username: $u->username
Password: $password

Tip:
After loging in with this password, you may go to Settings > Account in the ShiftSpace console and change your password again to something you can more easily remember.

Kisses,
The ShiftSpace email robot
");
  mail($u->email, $subject, $body, "From: ShiftSpace <info@shiftspace.org>\n");
  respond(1, $response);
} else {
  respond(0, $response);
}
    
?>
