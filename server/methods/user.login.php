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
  $_SESSION['user'] = $user;
  respond(1, "Hi, $user->display_name!");
}

?>
