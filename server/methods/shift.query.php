<?php

if (!empty($_REQUEST['href'])) 
{
  // Load shifts by URL
  $href = normalize_url($_REQUEST['href']);
  $href = $db->escape($href);
  $shift_clause = "s.href = '$href'";
} 
else if (!empty($_REQUEST['id'])) 
{
  // Load shifts by ID
  $id = $db->escape($_REQUEST['id']);
  if (strpos($id, ',') === false) 
  {
    // Only want one shift
    $shift_clause = "s.url_slug = '$id'";
  } 
  else 
  {
    // Want multiple shifts
    $id = explode(',', $id);
    $id = "'" . implode("','", $id) . "'";
    $shift_clause = "s.url_slug IN ($id)";
  }
}

// For table view sorting
if (!empty($_REQUEST['sortByColumn']))
{
  $sortByColumn = $db->escape($_REQUEST['sortByColumn']);
}
else
{
  $sortByColumn = 'created';
}

// For table view sorting
if (!empty($_REQUEST['sortByDirection']))
{
  $sortValue = $db->escape($_REQUEST['sortByDirection']);
  if($sortValue == 1)
  {
    $sortByDirection = "ASC";
  }
  else
  {
    $sortByDirection = "DESC";
  }
}
else
{
  $sortByDirection = "DESC";
}

// For selecting a specific user's public shifts
if(!empty($_REQUEST['username']))
{
  $selectByUser = $db->escape($_REQUEST['username']);
  $select_by_user_clause = "AND u.username = '$selectByUser'";
}
else
{
  $select_by_user_clause = "";
}

// Sanity check
// TODO: the href and the id should both be optional, shift.query is a general data provider - David
if (empty($href) && empty($id)) {
  // run general query limit to 50 shifts per page?
  respond(0, "Please specify either an 'href' or 'id' parameter.");
}

if (!empty($user)) {
  // Include private shifts if logged in
  $user_clause = "
    (s.status = 1
    OR (
      s.status = 2
      AND s.user_id = $user->id
    ))
  ";
} else {
  // Only public shifts if not logged in
  $user_clause = "s.status = 1";
}

// Load shifts from storage
$shifts = $db->rows("
  SELECT s.url_slug AS id,
         s.href AS href,
         s.space AS space,
         s.summary AS summary,
         s.created AS created,
         u.username AS username,
         s.status AS status
  FROM shift AS s, user AS u
  WHERE $user_clause
    AND $shift_clause
    $select_by_user_clause
    AND s.broken = 0
    AND s.user_id = u.id
  ORDER BY $sortByColumn $sortByDirection
");

function set_elapsed_time(&$shift) {
  $shift->created = ucfirst(elapsed_time($shift->created));
}

// Make created property more human-friendly
array_map('set_elapsed_time', $shifts);

// The response data
$response = array(
  'count' => count($shifts),
  'shifts' => $shifts
);

// Include any plug-ins that implement the shift.query method
require_once "$dir/server/plugins.php";

// Done
respond(1, $response);

?>
