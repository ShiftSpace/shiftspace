<?php

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
  respond(0, 'Invalid request.');
} else if (empty($_POST['username'])) {
  respond(0, 'Oops, you forgot to enter a username.');
} else if (empty($_POST['password'])) {
  respond(0, 'Oops, you forgot to enter a password.');
}
    
$username = $db->escape($_POST['username']);
$password = md5($_POST['password']);

$user = $db->row("
  SELECT *
  FROM user
  WHERE username = '$username'
  AND password = '$password'
");

if (empty($user)) {
  respond(0, 'Oops! Please try again.');
} else {
  if (!preg_match('#^[a-zA-Z0-9_.]+$#', $_POST['username'])) {
    respond(0, "We're sorry, but your username is not compatible with the latest release of ShiftSpace. Please contact us at info@shiftspace.org so we can fix your account.");
  }
  $_SESSION['user'] = $user;
  respond(1, $user);
}

?>
