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
  
  $trailId = "junk";
}
else
{
  // generate a url_slug
  $created = date('Y-m-d H:i:s');
  
  // Generate initial URL slug
  $values = serialize($_POST);
  $length = 4;
  $url_slug = substr(md5($values . time()), 0, $length);
  $exists = $db->value("
      SELECT id
      FROM trail
      WHERE url_slug = '$url_slug'
  ");

  // Make sure we're not choosing an existing URL slug
  while ($exists) {
      $length++;
      if ($length == 32) {
          // An exact duplicate shift exists
          echo "{status: 0, message:'Duplicate trail'}";
          exit;
      }
      $url_slug = substr(md5($values . time()), 0, $length);
      $exists = $db->value("
          SELECT id
          FROM trail
          WHERE url_slug = '$url_slug'
      ");
  }
  
  // insert it
  // Record a general accounting of shift
  $db->query("
      INSERT INTO trail
      (user_id, title, content, url_slug, created, modified, status, version, thumb_status)
      VALUES ($user->id, '$content', '$url_slug', '$created', '$modified', '$status', '$version', '$thumb_status')
  ");
  
  $trailId = $url_slug;
}

echo "{'success':true, 'trailId':'$trailId'}";

?>