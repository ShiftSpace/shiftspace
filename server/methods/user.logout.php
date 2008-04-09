<?php

$_SESSION['user'] = null;
$expires = time() - 60 * 60 * 24 * 365;
setcookie('auth', "", $expires, '/');

?>
