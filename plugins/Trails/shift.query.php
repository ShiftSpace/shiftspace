<?php 

$trailsData = array();
for($i = 0; $i < count($shifts); $i++)
{
  $aShift = $shifts[$i];
  $url_slug = $aShift->id;
  $shiftId = $db->value("
    SELECT id FROM shift
    WHERE url_slug=$url_slug
  ");
  
  $trailsData[$url_slug] = array();

  // check to see if this shift is trailed
  $trailed = $db->row("
    SELECT * FROM trail_shift
    WHERE shift_id='$shiftId' 
    LIMIT 1
  ");
  
  if($trailed)
  {
    $trailsData[$url_slug]['icon'] = 'trails-on.png';
  }
  else
  {
    $trailsData[$url_slug]['icon'] = 'trails-off.png';
  }
}

$response['trails'] = $trailsData;

?>