<?php

require_once "Zend/OpenId/Provider.php";

$server = new Zend_OpenId_Provider("identity1-login.php",
                                   "identity1-trust.php");
$ret = $server->handle();
if (is_string($ret)) {
    echo $ret;
} else if ($ret !== true) {
    header('HTTP/1.0 403 Forbidden');
    echo 'Forbidden';
}
?>
