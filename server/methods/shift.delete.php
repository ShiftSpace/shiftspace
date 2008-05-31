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
} else if ($shift->user_id != $user->id) {
  respond(0, "You don't have permission to delete that shift.");
}

// Delete the shift
$db->query("
  DELETE
  FROM shift
  WHERE id = $shift->id
");

// Done
respond(1, "Success.");

?>
