<?php

$server = 'http://localhost/shiftspace/';
$ff_profile = '/Users/Dan/Library/Application Support/Firefox/Profiles/Firefox 3';
$filename = "$ff_profile/gm_scripts/shiftspace/shiftspace.user.js";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "{$server}shiftspace.php?method=shiftspace.user.js");
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$contents = curl_exec($ch);
curl_close($ch);

file_put_contents($filename, $contents);

?>
