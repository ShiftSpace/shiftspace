<?php 

if (!empty($_POST['href'])) 
{
  $href = $db->escape($_POST['href']);
} 
else if (!empty($_SERVER['HTTP_REFERER'])) 
{
  $href = $db->escape($_SERVER['HTTP_REFERER']);
}

$trailId = $db->escape($_POST['trailId']);
$version = $db->escape($_POST['version']);

$created = date('Y-m-d H:i:s');
$modified = $created;

// Check to see if it exists in the db, if it doesn't insert it
if($trailId)
{
  // If it does update it
  $exists = $db->value("
    SELECT *
    FROM trail
    WHERE id = '$trailId'
    ");
}
else
{

}

?>