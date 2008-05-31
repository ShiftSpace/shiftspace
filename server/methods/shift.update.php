<?php

// Make sure user is logged in
require_login();

// Load shift from storage
$url_slug = $db->escape($_POST['id']);
$shift = $db->row("
  SELECT id, user_id
  FROM shift
  WHERE url_slug = '$url_slug'
");

// Sanity checks
if (empty($shift)) {
  respond(0, "Shift not found.");
}
if ($shift->user_id != $user->id) {
  respond(0, "You don't have permission to update that shift.");
}

// Collect data for shift update
$content = $db->escape($_POST['content']);
$summary = $db->escape($_POST['summary']);
$version = $db->escape($_POST['version']);
$now = date('Y-m-d H:i:s');

// Set some default values, if not specified
if (empty($summary)) {
  $summary = '<i>No summary provided</i>';
}
if (empty($version)) {
  $version = '1.0';
}

// Save new shift data to storage
$db->query("
  UPDATE shift
  SET content = '$content',
      summary = '$summary',
      version = '$version',
      modified = '$now'
  WHERE id = $shift->id
");

// Done
respond(1, "Success.");

?>
