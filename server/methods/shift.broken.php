<?php

if(!empty($_REQUEST['id']))
{
  $url_slug = $db->escape($_REQUEST['id']);
}

if($url_slug)
{
  // grab the broken shift
  $theShift = $db->value("
    SELECT * FROM shift WHERE url_slug='$url_slug'
  ");
  
  // check if it exists in the broken table
  $exists = $db->value("
    SELECT * FROM broken WHERE id={$theShift['id']}
  ");
  
  if(!$exists)
  {
    // insert it
    // Save the shift to storage
    $db->query("
      INSERT INTO broken
      (id, user_id, space, href, summary, content, url_slug, created, modified, version, status)
       VALUES ('{$theShift['id']}',
               '{$theShift['user_id']}',
               '{$theShift['space']}',
               '{$theShift['href']}',
               '{$theShift['summary']}',
               '{$theShift['content']}',
               '{$theShift['url_slug']}',
               '{$theShift['created']}',
               '{$theShift['modified']}', 
               '{$theShift['version']}', 
               '{$theShift['status']}')
    ");
  }
  else
  {
    // update it
    $db->query("
      UPDATE broken
      SET summary = {$theShift['summary']},
          content = {$theShift['content']},
          modified = {$theShift['modified']},
          status = {$theShift['status']}
      WHERE
    ");
  }
}

?>