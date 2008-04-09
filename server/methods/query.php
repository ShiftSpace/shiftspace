<?php

$href = $db->escape(@$_POST['href']);
if (empty($href)) {
    response(0, "No URL specified.");
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

response(1, array(
    'shifts' => $shift_count
));

?>
