<?php 

if (empty($user) || empty($user->id)) {
    echo "{status: 0, message:'User not logged in'}";
    exit;
}

if (!empty($_POST['href'])) {
    $href = $db->escape($_POST['href']);
} else if (!empty($_SERVER['HTTP_REFERER'])) {
    $href = $db->escape($_SERVER['HTTP_REFERER']);
}

$trailId = $db->escape($_POST['trailId']);
$content = $db->escape($_POST['content']);
$version = $db->escape($_POST['version']);

if (!empty($_POST['summary'])) {
    $summary = $db->escape(strip_tags($_POST['summary']));
} else if (!empty($_POST['_summary'])) {
    $var = $_POST['_summary'];
    $summary = $db->escape(strip_tags($_POST[$var]));
}

if (empty($summary)) {
    $summary = '<i>No summary provided</i>';
}

$created = date('Y-m-d H:i:s');
$modified = $created;

// Check to see if it exists in the db, if it doesn't insert it
if($trailId)
{
  // If it does update it
  $exists = $db->value("
      SELECT id
      FROM trail
      WHERE id = '$trailId'
  ");
}
else
{
  
}

?>