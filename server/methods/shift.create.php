<?php

if (empty($user) || empty($user->id)) {
  $options = array(
    'authenticate' => true
  );
  response(0, 'Oops your session expired, please need to login and try again.', $options);
  exit;
}

if (!empty($_POST['href'])) {
    $href = $db->escape($_POST['href']);
} else if (!empty($_SERVER['HTTP_REFERER'])) {
    $href = $db->escape($_SERVER['HTTP_REFERER']);
}

$anchor_pos = strpos($href, '#');
if ($anchor_pos !== false) {
    $href = substr($href, 0, $anchor_pos); 
}

$space = $db->escape($_POST['space']);
$content = $db->escape($_POST['content']);
$version = $db->escape($_POST['version']);

if (!empty($_POST['summary'])) {
    $summary = $db->escape(strip_tags($_POST['summary']));
} else if (!empty($_POST['_summary'])) {
    $var = $_POST['_summary'];
    $summary = $db->escape(strip_tags($_POST[$var]));
}

if (empty($summary)) {
    $summary = '<i>No summary provided</i>';
}

$created = date('Y-m-d H:i:s');
$modified = $created;

// Generate initial URL slug
$values = serialize($_POST);
$length = 4;
$url_slug = substr(md5($values . time()), 0, $length);
$exists = $db->value("
    SELECT id
    FROM shift
    WHERE url_slug = '$url_slug'
");

// Make sure we're not choosing an existing URL slug
while ($exists) {
    $length++;
    if ($length == 32) {
        // An exact duplicate shift exists
        echo "{status: 0, message:'Duplicate shift'}";
        exit;
    }
    $url_slug = substr(md5($values . time()), 0, $length);
    $exists = $db->value("
        SELECT id
        FROM shift
        WHERE url_slug = '$url_slug'
    ");
}

// Record a general accounting of shift
$db->query("
    INSERT INTO shift
    (user_id, space, href, summary, content, url_slug, created, modified, version)
    VALUES ($user->id, '$space', '$href', '$summary', '$content', '$url_slug', '$created', '$modified', '$version')
");

echo "{\"status\":1,\"id\":\"$url_slug\"}";

?>
