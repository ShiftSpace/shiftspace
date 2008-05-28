<?php

if (!empty($_REQUEST['href'])) {
  $href = normalize_url($_REQUEST['href']);
  $href = $db->escape($href);
  $shift_clause = "s.href = '$href'";
} else if (!empty($_REQUEST['id'])) {
  $id = $db->escape($_REQUEST['id']);
  if (strpos($id, ',') === false) {
    $shift_clause = "s.url_slug = '$id'";
  } else {
    $id = explode(',', $id);
    $id = "'" . implode("','", $id) . "'";
    $shift_clause = "s.url_slug IN ($id)";
  }
} else if (!empty($_SERVER['HTTP_REFERER'])) {
  $href = normalize_url($_SERVER['HTTP_REFERER']);
  $href = $db->escape($href);
  $shift_clause = "s.href = '$href'";
}

if (empty($href) && empty($id)) {
  response(0, "Please specify either an 'href' or 'id' parameter.");
  exit;
}

if (!empty($user)) {
  $user_clause = "
    (s.status = 1
    OR (
      s.status = 2
      AND s.user_id = $user->id
    ))
  ";
} else {
  $user_clause = "s.status = 1";
}

$shifts = $db->rows("
  SELECT s.url_slug AS id,
         s.space,
         s.summary,
         s.content,
         s.modified,
         u.username
  FROM shift AS s, user AS u
  WHERE $user_clause
  AND $shift_clause
  AND s.user_id = u.id
  ORDER BY s.created DESC
");

echo '{"status":1,"count":' . count($shifts) . ',"shifts":[';
$shifts = array_map('json_encode', $shifts);
echo implode(',', $shifts);
echo ']}';

function normalize_url($href) {
  $anchor_pos = strpos($href, '#');
  if ($anchor_pos !== false) {
    $href = substr($href, 0, $anchor_pos); 
  }
  return $href;
}

?>
