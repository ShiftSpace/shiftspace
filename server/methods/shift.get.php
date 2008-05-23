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
    SELECT * FROM shift
    WHERE url_slug='$shiftId'
    ");
    $theShifts[] = $aShift;
  }
}

echo $json_encode($theShifts);

?>