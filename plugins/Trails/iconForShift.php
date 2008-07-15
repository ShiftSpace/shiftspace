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

// get the real shift id
$rshiftId = $db->value("
  SELECT id FROM shift
  WHERE url_slug='$shiftId'
");

// check to see if this shift is trailed
$trailed = $db->row("
  SELECT * FROM trail_shift
  WHERE shift_id='$rshiftId' 
  LIMIT 1
");

$json = array();

if($trailed)
{
  $json['icon'] = 'SSTrailsHasTrailsIcon';
}
else
{
  $json['icon'] = 'SSTrailsNoTrailsIcon';
}

echo json_encode($json);

?>