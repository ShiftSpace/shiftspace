<?php

extract($db->escape($_POST));

if (empty($password)) {
  $response = "Oops, you didn't enter a password.";
} else if ($password != $password_again) {
  $response = "The passwords you entered didn't match. Please try again.";
} else if (strlen($password) < 6) {
  $response = "Oops, please enter a password at least 6 characters long.";
}

if (empty($response)) {
  $password = md5($password);
  $db->query("
    UPDATE user
    SET password = '$password'
    WHERE id = $user->id
  ");
  $response = "Your new password has been saved.";
  respond(1, $response);
} else {
  respond(0, $response);
}
    
?>
