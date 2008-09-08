<?php

extract($db->escape($_REQUEST));

// create an array to store updates
$updates = array();

if(!empty($password)) 
{
  if ($password != $password_again) 
  {
    $response = "The passwords you entered didn't match. Please try again.";
    respond(0, $response);
  } 
  else if (strlen($password) < 6) 
  {
    $response = "Oops, please enter a password at least 6 characters long.";
    respond(0, $response);
  }
  // encrypt
  $password = md5($password);
  // add the password
  $updates['password'] = $password;
}

if(isset($email_comments) &&
   ($email_comments == 0 || $email_comments == 1))
{
  $updates['email_comments'] = $email_comments;
}

// Assemble SQL assignments
$sql_updates = array();
foreach ($updates as $key => $value) 
{
  if(is_string($value))
  {
    $sql_updates[] = "$key = '$value'";
  }
  else
  {
    $sql_updates[] = "$key = $value";
  }
}
$sql_updates = implode(', ', $sql_updates);

$qry = "
  UPDATE user
  SET $sql_updates
  WHERE id = $user->id
";

echo $qry;

$db->query($qry);

$response = "Your information has been updated.";

respond(1, $response);
    
?>
