<?php

require_once "$dir/server/setup.php";
$method = str_replace('..', '', $_GET['method']);

if (empty($method)) {
  respond(0, "No method specified.");
} else if (substr($method, 0, 8) == 'plugins.') {
  $method = preg_replace('#plugins\.(\w+)\.(.+)#', '$1/$2', $method);
  if (!file_exists("$dir/plugins/$method.php")) {
    respond(0, "Invalid method.");
  } else {
    require_once "$dir/plugins/$method.php";
  }
} else if (!file_exists("$dir/server/methods/$method.php")) {
  respond(0, "Invalid method.");
} else {
  require_once "$dir/server/methods/$method.php";
}

function respond($status, $payload) {
  if (is_string($payload)) {
    $payload = array(
      'status' => $status,
      'message' => $payload
    );
  } else if (is_array($payload)) {
    $payload['status'] = $status;
  }
  echo json_encode($payload);
  exit;
}

function normalize_url($url) {
  $anchor_pos = strpos($url, '#');
  if ($anchor_pos !== false) {
    $url = substr($url, 0, $anchor_pos); 
  }
  return $url;
}

function require_login() {
  global $user;
  if (empty($user) || empty($user->id)) {
    respond(0, array(
      'authenticate' => 1,
      'message' => 'Oops, your has session expired. Please login and try again.'
    ));
  }
}

function generate_slug($length = 4) {
  global $db;
  $values = serialize($_POST);
  $length = 4;
  $slug = substr(md5($values . time()), 0, $length);
  $exists = $db->value("
    SELECT COUNT(id)
    FROM shift
    WHERE url_slug = '$slug'
  ");
  if ($length == 32) {
    respond(0, "Could not generate URL slug.");
  }
  if ($exists) {
    return generate_slug($length + 1);
  } else {
    return $slug;
  }
}

if ($db->type == 'mysql' && $db->handler->conn) {
  mysql_close($db->handler->conn);
}

?>
