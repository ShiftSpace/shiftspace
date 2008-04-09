<?php

if (!empty($_SERVER['HTTP_REFERER'])) {
    $href = $db->escape($_SERVER['HTTP_REFERER']);
} else {
    $href = $db->escape(@$_POST['href']);
}

if (empty($href)) {
    echo '[]';
    exit;
}

$anchor_pos = strpos($href, '#');
if ($anchor_pos !== false) {
    $href = substr($href, 0, $anchor_pos); 
}

if (!empty($user)) {
  $shifts = $db->rows("
      SELECT s.url_slug AS id,
             s.space,
             s.summary,
             s.content,
             s.modified,
             u.username
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
      ORDER BY s.created DESC
  ");
} else {
  $shifts = $db->rows("
      SELECT s.url_slug AS id,
             s.space,
             s.summary,
             s.content,
             s.modified,
             u.username
      FROM shift AS s, user AS u
      WHERE s.status = 1
      AND s.user_id = u.id
      AND s.href = '$href'
      ORDER BY s.created DESC
  ");
}

/*$announcement = new stdClass;
$announcement->type = 'shiftspace.announcement';
$announcement->summary = "alert('hi!');";
$shifts[] = $announcement;*/

echo '[';
foreach ($shifts as $n => $shift) {
    $shift->trails = $db->assoc("
        SELECT t.url_slug, t.title
        FROM trail AS t,
             trail_shift AS ts
        WHERE ts.shift_id = $shift->id
        AND t.id = ts.trail_id
    ");
    if ($n > 0) {
        echo ', ';
    }
    //$shift->content = $shift->content;
    echo json_encode($shift);
}
echo ']';

?>
