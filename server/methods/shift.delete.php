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
    echo "{status: 0, message:'User does not have privileges'}";
    exit;
}

$db->query("
    DELETE
    FROM shift
    WHERE id = $shift->id
");

echo "{status: 1}";

?>
