<?php

if(!empty($_REQUEST['id']))
{
  $url_slug = $db->escape($_REQUEST['id']);
}

// grab the broken shift
$theShift = $db->row("
  SELECT * FROM shift WHERE url_slug='$url_slug'
");

if($url_slug && $theShift)
{
  // check if it exists in the broken table
  $exists = $db->value("
    SELECT * FROM broken WHERE url_slug={$theShift['url_slug']}
  ");
  
  if(!$exists)
  {
    // insert it
    $qry = "
      INSERT INTO broken
      (user_id, space, href, summary, content, url_slug, created, modified, version, status)
       VALUES ('{$theShift['user_id']}',
               '{$theShift['space']}',
               '{$theShift['href']}',
               '{$theShift['summary']}',
               '{$theShift['content']}',
               '{$theShift['url_slug']}',
               '{$theShift['created']}',
               '{$theShift['modified']}',
               '{$theShift['version']}',
               '{$theShift['status']}')
    ";
    // echo $qry;
    // Save the shift to storage
    $db->query($qry);
    respond(1, "Added broken shift");
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
    respond(1, "Updated broken shift");
  }
}
else
{
  respond(0, "Oops shift $url_slug ($theShift) does not exist.");
}

?>