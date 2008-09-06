<?php

if (empty($user) || empty($user->id)) 
{
  echo "{status: 0, message:'User not logged in'}";
  exit;
}

if (!empty($_POST['id'])) 
{
  $id = $db->escape($_POST['id']);
} 
else if (!empty($_SERVER['HTTP_REFERER'])) 
{
  $href = $db->escape($_SERVER['HTTP_REFERER']);
}

$comment = $db->row("
  SELECT *
  FROM comment
  WHERE id = $id
");

if(!$comment)
{
  // return success
  echo "{status: 0, message:'Error. Invalid comment id.'}";
  exit;  
}

if($comment->user_id != $user->id)
{
  // return success
  echo "{status: 0, message:'Error. User is not the author of this comments.'}";
  exit;
}

$db->query("
  DELETE
  FROM comment
  WHERE id = $id
  ");
  
// return success
echo "{status: 1, message:'Success. Comment deleted.'}";

?>