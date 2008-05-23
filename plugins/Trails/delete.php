<?php

$trailId = $db->escape($_POST['trailId']);

$ownerId = $db->value("
  SELECT u.id
  FROM trail t, user u
  WHERE t.user_id = u.id
");

// not logged in
if (empty($user) || empty($user->id)) 
{
  echo "{status: 0, message:'User not logged in'}";
  exit;
}

// not trail owner
if ($user->id != $ownerId)
{
  echo "{status: 0, message:'User does not have permissions to delete this trail'}";
}

// get the real trail id
$rTrailId = $db->value("
  SELECT id FROM trail
  WHERE url_slug='$trailId'
  ");

// delete all references from the trail_shift db
$db->query("
  DELETE
  FROM trail_shift
  WHERE trail_id = '$rTrailId'
  ");

// delete all reference from the trail db
$db->query("
  DELETE
  FROM trail
  WHERE url_slug = '$trailId'
  ");
  
echo "{type:'message', value:'success'}";

;?>