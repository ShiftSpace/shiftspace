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

$exists = $db->value("
  SELECT id
  FROM comment
  WHERE id = $id
");

if(!$exists)
{
  echo "{status: 0, message:'Error. Comment does not exist.'}";
  exit; 
}

$now = date('Y-m-d H:i:s');

$db->query("
  UPDATE comment
    SET content = '$content',
    modified = '$now',
    WHERE id = $id
  ");

echo "{status: 1, message:'Comment updated.'}";
    
?>