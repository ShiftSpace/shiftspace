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

if($trailId)
{
  // If it does update it
  $exists = $db->value("
      SELECT id
      FROM trail
      WHERE id = '$trailId'
  ");

  $db->query("
      UPDATE trail
      SET content = '$content',
          title = '$title',
          modified = '$now'
      WHERE url_slug='$trailId'
  ");
}
else
{
  $created = date('Y-m-d H:i:s');
  
  // insert it
  // Record a general accounting of shift
  $db->query("
      INSERT INTO trail
      (user_id, title, content, url_slug, created, modified, status, version, thumb_status)
      VALUES ($user->id, '$content', '$url_slug', '$created', '$modified', '$status', '$version', '$thumb_status')
  ");
}

echo "{'success':true}";

?>