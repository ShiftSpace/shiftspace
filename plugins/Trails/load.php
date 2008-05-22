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

$trail = $db->row("
  SELECT t.title, t.content, t.created, t.modified, t.url_slug as trailId, t.thumb_status, t.version, u.username
  FROM trail t, user u
  WHERE u.id = t.user_id
  AND t.url_slug = '$trailId'
");

echo json_encode($trail);

?>