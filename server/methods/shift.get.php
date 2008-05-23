<?php 

// get an array of shifts, and returns a json object
$shiftIdsStr = $db->escape($_POST['shiftIds']);
$shiftIds = explode(',', $shiftIdsStr);

$theShifts = array();

for($i = 0; $i < count($shiftIds); $i++)
{
  $shiftId = $shiftIds[$i];
  if($shiftId)
  {
    $aShift = $db->row("
    SELECT s.space, s.href, s.summary, s.content, s.url_slug as id, s.created, s.modified, s.version, u.username
    FROM shift s, user u
    WHERE s.rl_slug = '$shiftId' AND
    s.user_id = u.id
    ");
    $theShifts[] = $aShift;
  }
}

echo $json_encode($theShifts);

?>