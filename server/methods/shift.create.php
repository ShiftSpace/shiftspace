<?php

// Make sure user is logged in
require_login();

// Normalize the URL
$href = normalize_url(@$_POST['href']);

// Strip tags, normalize whitespace, shorten if necessary
$summary = summarize($_POST['summary']);

// Filter content to prevent against XSS attacks
$content = filter_content($_POST['content']);

// Escape content for the database to prevent SQL injection
$href = $db->escape($href);
$summary = $db->escape($summary);
$space = $db->escape($_POST['space']);
$content = $db->escape($content);
$version = $db->escape($_POST['version']);

if (isset($_POST['status']) && is_numeric($_POST['status'])) {
  $status = $db->escape($_POST['status']);
} else {
  $status = 1;
}

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
$domain = calculate_domain($href);

// Save the shift to storage
$db->query("
  INSERT INTO shift
  (user_id, space, href, summary, content, domain,
   url_slug, created, modified, version, status)
  VALUES ($user->id, '$space', '$href', '$summary', '$content', '$domain',
          '$url_slug', '$created', '$modified', '$version', '$status')
");

// Done
respond(1, array(
  'id' => $url_slug,
  'message' => 'Success.'
));

?>
