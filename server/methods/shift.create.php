<?php

// Make sure user is logged in
require_login();

// Collect data for shift creation
$href = $db->escape(normalize_url(@$_POST['href']));
$space = $db->escape($_POST['space']);
$content = $db->escape($_POST['content']);
$version = $db->escape($_POST['version']);
$summary = $db->escape(substr(strip_tags($_POST['summary']), 0, 140));

// Check to make sure we have everything
if (empty($href)) {
  respond(0, "Please specify an 'href' argument.");
} else if (empty($space)) {
  respond(0, "Please specify a 'space' argument.");
} else if (empty($content)) {
  respond(0, "Please specify a 'content' argument.");
} else if (empty($summary)) {
  respond(0, "Please specify a 'summary' argument.");
}

// Set some default values, if not specified
if (empty($summary)) {
  $summary = '<i>No summary provided</i>';
}
if (empty($version)) {
  $version = '1.0';
}

// Generate a URL slug and creation time
$created = date('Y-m-d H:i:s');
$modified = $created;
$url_slug = generate_slug();

// Save the shift to storage
$db->query("
  INSERT INTO shift
  (user_id, space, href, summary, content,
   url_slug, created, modified, version)
  VALUES ($user->id, '$space', '$href', '$summary', '$content',
          '$url_slug', '$created', '$modified', '$version')
");

// Done
respond(1, array(
  'id' => $url_slug,
  'message' => 'Success.'
));

?>
