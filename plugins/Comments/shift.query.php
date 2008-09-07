<?php

$commentsData = array();

for($i = 0; $i < count($shifts); $i++)
{
  $aShift = $shifts[$i];
  $url_slug = $aShift->id;
  $shiftId = $db->value("
    SELECT id FROM shift
    WHERE url_slug='$url_slug'
  ");
  
  $commentsData[$url_slug] = array();

  // check to see if this shift is trailed
  $comments = $db->rows("
    SELECT * FROM comment
    WHERE shift_id=$shiftId
  ");
  
  if($comments)
  {
    $commentsData[$url_slug]['count'] = count($comments);
  }
  else
  {
    $commentsData[$url_slug]['count'] = 0;
  }
}

// here we go
$response['Comments'] = array();
$response['Comments']['type'] = 'interface';
$response['Comments']['data'] = $commentsData;

?>