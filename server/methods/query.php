<?php

// Check for content based on URL
$href = $db->escape(normalize_url(@$_POST['href']));

// Sanity check
if (empty($href)) {
  respond(0, "Please specify an 'href' argument.");
}

$response = array();

if (empty($user)) {
  // Only check for public content
  $response['count'] = $db->value("
    SELECT COUNT(id)
    FROM shift
    WHERE status = 1
    AND href = '$href'
  ");
} else {
  // Check for both public and private content
  $response['count'] = $db->value("
    SELECT COUNT(s.id)
    FROM shift s,
         user u
    WHERE (
      s.status = 1
      OR (
        s.status = 2
        AND s.user_id = $user->id
      )
    )
    AND s.user_id = u.id
    AND s.href = '$href'
  ");
  $response['username'] = $user->username;
}

// Done
respond(1, $response);

?>
