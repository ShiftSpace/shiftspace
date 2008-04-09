<?php

if ($_SERVER['REQUEST_METHOD'] != 'POST' ||
    empty($_POST['username']) ||
    empty($_POST['password'])) {
  response(0, 'Invalid request.');
  exit;
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
  response(0, 'Oops! Please try again.');
} else {
  $_SESSION['user'] = $user;
  $expires = time() + 60 * 60 * 24 * 365 * 10;
  $token = md5(time() . $password);
  setcookie('auth', "$username:$token", $expires, '/');
  response(1, "Hi, $user->display_name!");
}

?>
