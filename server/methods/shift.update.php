<?php

// Make sure user is logged in
require_login();

// Load shift from storage
$url_slug = $db->escape($_POST['id']);
$shift = $db->row("
  SELECT id, user_id, space
  FROM shift
  WHERE url_slug = '$url_slug'
");

// Sanity checks
if (empty($shift)) {
  respond(0, "Shift not found.");
}
if ($shift->user_id != $user->id && $user->status < 2) {
  respond(0, "You don't have permission to update that shift.");
}

// An associative array of values to update
$updates = array();

if (isset($_POST['content'])) {
  // Filter content to prevent against XSS attacks
  $updates['content'] = filter_content($_POST['content']);
}

if (isset($_POST['summary'])) {
  // Strip tags, normalize whitespace, shorten if necessary
  $updates['summary'] = summarize($_POST['summary']);
}

if (isset($_POST['space'])) {
  // Update the space, this happens when shifts get migrated from legacy (a user
  // manually fixes a broken shift)
  $updates['space'] = $_POST['space'];
}

if (isset($_POST['version'])) {
  // Space version number
  $updates['version'] = $_POST['version'];
}

if (isset($_POST['status'])) {
  // Status: 0 = deleted, 1 = public, 2 = private
  $updates['status'] = $_POST['status'];
}

// Is this a broken shift?
if (isset($_POST['broken']) &&
    $_POST['broken'] == 1 ||
    $_POST['broken'] == 0) {
  $updates['broken'] = $_POST['broken'];
}

// Make sure we're actually updating something
if (empty($updates)) {
  respond(0, "Oops, you didn't update anything.");
}

// Update modified timestamp
$updates['modified'] = date('Y-m-d H:i:s');

// Defend against SQL injection
$updates = $db->escape($updates);

// Assemble SQL assignments
$sql_updates = array();
foreach ($updates as $key => $value) {
  $sql_updates[] = "$key = '$value'";
}
$sql_updates = implode(', ', $sql_updates);

// Save new shift data to storage
$db->query("
  UPDATE shift
  SET $sql_updates
  WHERE id = $shift->id
");

// Done
respond(1, "Success.");

?>
