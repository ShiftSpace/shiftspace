<?php

require_once "Zend/OpenId/Provider.php";

// Set up test identity
define("TEST_SERVER", Zend_OpenId::absoluteURL("identity1.php"));
define("TEST_ID", Zend_OpenId::selfURL());
define("TEST_PASSWORD", "123");
$server = new Zend_OpenId_Provider();
if (!$server->hasUser(TEST_ID)) {
    $server->register(TEST_ID, TEST_PASSWORD);
}
?>
<html><head>
<link rel="openid.server" href="<?php echo TEST_SERVER;?>" />
</head><body>
<?php echo TEST_ID;?>
</body></html>
