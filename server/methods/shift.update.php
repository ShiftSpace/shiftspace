<?php

if (empty($user) || empty($user->id)) {
    echo "{status: 0, message: 'User not logged in.'}";
    exit;
}

$url_slug = $db->escape($_POST['id']);
$shift = $db->row("
    SELECT id, user_id
    FROM shift
    WHERE url_slug = '$url_slug'
");

if ($shift->user_id != $user->id) {
    echo "{status: 0, message:'User does not have permission'}";
    exit;
}

$content = $db->escape($_POST['content']);
$summary = $db->escape($_POST['summary']);
$now = date('Y-m-d H:i:s');

$db->query("
    UPDATE shift
    SET content = '$content',
        summary = '$summary',
        modified = '$now'
    WHERE id = $shift->id
");

echo "{status: 1}";

?>
