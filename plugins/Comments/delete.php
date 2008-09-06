<?

if (empty($user) || empty($user->id)) 
{
  echo "{status: 0, message:'User not logged in'}";
  exit;
}

if (!empty($_POST['id'])) 
{
  $shiftId = $db->escape($_POST['id']);
} 
else if (!empty($_SERVER['HTTP_REFERER'])) 
{
  $href = $db->escape($_SERVER['HTTP_REFERER']);
}


// grab the real shift id
$rShiftId = $db->value("
  SELECT id 
  FROM shift
  WHERE url_slug='$shiftId'
");

if(!$rShiftId)
{
  echo "{status: 0, message:'User does not exist.'}";
  exit;
}

$created = date('Y-m-d H:i:s');

// insert it
// Record a general accounting of shift
$db->query("
  INSERT INTO comment
  (user_id, content, shift_id, created, modified)
  VALUES ($user->id, '$content', $rShiftId, '$created', '$created')
  ");

// return success
echo "{status: 1, message:'Success. Comment added.'}";

?>