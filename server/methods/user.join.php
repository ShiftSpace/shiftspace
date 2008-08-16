<?php

extract($db->escape($_POST));

if (empty($username)) {
  $response = "Oops, you didn\\'t enter a username.";
} else if (empty($password)) {
  $response = "Oops, you didn\\'t enter a password.";
} else if ($password != $password_again) {
  $response = "The passwords you entered didn\\'t match. Please try again.";
} else if (empty($email)) {
  $response = "Oops, you didn\\'t enter an email address.";
} else if (strlen($password) < 6) {
  $response = "Oops, please enter a password at least 6 characters long.";
} else if (!preg_match('#^[a-zA-Z0-9_.]+$#', $username)) {
  $response = "Oops, please enter a username composed letters, numbers, periods or underscores.";
} else {
  $exists = $db->value("
    SELECT COUNT(username)
    FROM user
    WHERE username = '$username'
  ");
  if ($exists) {
    $response = 'Sorry, that username has already been taken. Please choose again.';
  } else {
    $exists = $db->value("
      SELECT COUNT(username)
      FROM user
      WHERE email = '$email'
    ");
    if ($exists) {
      $response = 'Sorry, that email has already been used. You can use the password retrieval form to retrieve your username.';
    }
  }
}

$password = md5($password);

if (empty($response)) {
    
  if (empty($display_name)) {
    $display_name = $username;
  }
  
  $user_id = $db->query("
    INSERT INTO user
    (username, password, display_name, email)
    VALUES ('$username', '$password', '$display_name', '$email')
  ");
  
  if (!session_id()) {
    session_start();
  }
  session_register('user');
  $_SESSION['user'] = $db->row("
    SELECT *
    FROM user
    WHERE id = $user_id
  ");
  
  // This response doesn't actually get used
  $response = "Welcome, $display_name!";
  respond(1, $response);
  
} else {
  respond(0, $response);
}
    
?>
