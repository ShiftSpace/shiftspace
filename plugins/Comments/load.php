<?php 

if (!empty($_POST['shiftId'])) 
{
  $shiftId = $db->escape($_POST['shiftId']);
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

// grab all comments for this shift
$comments = $db->rows("
  SELECT c.comment, u.username
  FROM comment c, user u
  WHERE u.id = c.user_id
  AND c.shift_id = '$rShiftId'
  ORDER BY c.created DESC
");

$commentsHTML = '';
for($i = 0; $i < count($comments); $i++)
{
  
}

$json = array();

$json['data'] = $comments;
$json['html'] = $commentsHTML;

echo json_encode($json);

?>