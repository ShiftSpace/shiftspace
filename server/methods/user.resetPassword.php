<?php

extract($db->escape($_POST));

if (empty($login)) {
  $response = "Oops, you didn't enter a username or email address.";
} else {
  if (strpos($login, '@')) {
    $u = $db->row("
      SELECT *
      FROM user
      WHERE email = '$login'
    ");
  } else {
    $u = $db->row("
      SELECT *
      FROM user
      WHERE username = '$login'
    ");
  }
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
  $response = "Your password has been reset and emailed to you. ($password)";
  $subject = 'ShiftSpace password reset';
  $body = wordwrap("Hello $u->username,

Somebody (hopefully you) has requested that your account's password be reset. Please login with the following credentials:

Username: $u->username
Password: $password

Thanks,
The ShiftSpace email robot
");
  //mail($u->email, $subject, $body, "From: ShiftSpace <info@shiftspace.org>\n");
  respond(1, $response);
} else {
  respond(0, $response);
}
    
?>
