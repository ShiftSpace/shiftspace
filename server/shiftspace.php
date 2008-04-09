<?php

require_once 'setup.php';

if (!empty($_SERVER['HTTP_REFERER'])) {
    $href = $db->escape($_SERVER['HTTP_REFERER']);
} else {
    $href = $db->escape(@$_GET['href']);
}

if (empty($href)) {
    echo '{status: 0}';
    exit;
}

if ($version < $curr_version) {
    echo '{status: 1, user: "upgrade", shifts: 1}';
    exit;
}

$anchor_pos = strpos($href, '#');
if ($anchor_pos !== false) {
    $href = substr($href, 0, $anchor_pos); 
}

if (empty($user)) {
    $shift_count = $db->value("
        SELECT COUNT(id)
        FROM shift
        WHERE status = 1
        AND href = '$href'
    ");
    $user = '';
} else {
    $shift_count = $db->value("
        SELECT COUNT(s.id)
        FROM shift AS s, user AS u
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
    $user = "\n    user: '$user->username',";
}

echo "{
    status: 1,$user
    shifts: $shift_count
}";
