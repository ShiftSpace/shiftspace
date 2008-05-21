<?php 

if (!empty($_POST['href'])) 
{
  $href = $db->escape($_POST['href']);
} 
else if (!empty($_SERVER['HTTP_REFERER'])) 
{
  $href = $db->escape($_SERVER['HTTP_REFERER']);
}

$shiftId = $db->escape($_POST['shiftId']);
$version = $db->escape($_POST['version']);

// we nee the actual id
$rshiftId = $db->value("
  SELECT id from shift where url_slug='$shiftId'
");

$trails = $db->assoc("
    SELECT t.url_slug, t.title
    FROM trail t, trail_shift x
    WHERE x.trail_id = t.id
    AND x.shift_id = $rshiftId
");

echo json_encode($trails);

?>