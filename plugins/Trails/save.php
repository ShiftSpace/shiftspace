<?php 

if (empty($user) || empty($user->id)) 
{
  echo "{status: 0, message:'User not logged in'}";
  exit;
}

if (!empty($_POST['href'])) 
{
  $href = $db->escape($_POST['href']);
} 
else if (!empty($_SERVER['HTTP_REFERER'])) 
{
  $href = $db->escape($_SERVER['HTTP_REFERER']);
}

$trailId = $db->escape($_POST['trailId']);
$content = $db->escape($_POST['content']);
$version = $db->escape($_POST['version']);
$title = $db->escape($_POST['title']);
$shifts = $db->escape($_POST['shifts']);
$version = $db->escape($_POST['version']);

$now = date('Y-m-d H:i:s');

$error = false;
if($trailId)
{
  echo "EXISTING";
  
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
    modified = '$now',
    version = '$version',
    WHERE url_slug='$trailId'
    ");
}
else
{
  echo "NOT EXISTING!";
  
  // generate a url_slug
  $created = $now;

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
  while ($exists) 
  {
    $length++;
    if ($length == 32) 
    {
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
    (user_id, content, title, url_slug, created, modified, status, thumb_status, version)
    VALUES ($user->id, '$content', '$title', '$url_slug', '$created', '$modified', '$status', '$thumb_status', '$version')
    ");
    
  $trailId = $url_slug;
}


// update the trail_shift table
// get the real trail id
$rTrailId = $db->value("
  SELECT id FROM trail
  WHERE url_slug='$trailId'
  ");
  
// we need to insert fields for each shift in the
$shiftArray = explode(',', $shifts);

for($i = 0; $i < count($shiftArray); $i++)
{
  $shiftId = $shiftArray[$i];

  if($shiftId)
  {
    // get the real shift id
    $rShiftId = $db->value("
      SELECT id FROM shift
      WHERE url_slug='$shiftId'
      ");
    
    // make sure it doesn't already exist
    $exists = $db->value("
      SELECT trail_id FROM trail_shift
      WHERE trail_id=$rTrailId AND shift_id=$rShiftId
    ");

    if(!$exists)
    {
      $db->query("
        INSERT INTO trail_shift
        (trail_id, shift_id)
        VALUES ($rTrailId, $rShiftId)
        ");
    }
  }
}

if(!$error)
{
  echo "{'success':true, 'trailId':'$trailId'}";  
}
else
{
  echo "{'success':false, 'message':'save operation failed'}";
}

?>