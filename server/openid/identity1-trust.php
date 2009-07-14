<?php

require_once "Zend/OpenId/Provider.php";

$server = new Zend_OpenId_Provider();

if ($_SERVER['REQUEST_METHOD'] == 'POST' &&
    isset($_POST['openid_action']) &&
    $_POST['openid_action'] === 'trust') {

    if (isset($_POST['allow'])) {
        if (isset($_POST['forever'])) {
            $server->allowSite($server->getSiteRoot($_GET));
        }
        $server->respondToConsumer($_GET);
    } else if (isset($_POST['deny'])) {
        if (isset($_POST['forever'])) {
            $server->denySite($server->getSiteRoot($_GET));
        }
        Zend_OpenId::redirect($_GET['openid_return_to'],
                              array('openid.mode'=>'cancel'));
    }
}
?>
<html>
<body>
<p>A site identifying as
<a href="<?php echo htmlspecialchars($server->getSiteRoot($_GET));?>">
<?php echo htmlspecialchars($server->getSiteRoot($_GET));?>
</a>
has asked us for confirmation that
<a href="<?php echo htmlspecialchars($server->getLoggedInUser());?>">
<?php echo htmlspecialchars($server->getLoggedInUser());?>
</a>
is your identity URL.
</p>
<form method="post">
<input type="checkbox" name="forever">
<label for="forever">forever</label><br>
<input type="hidden" name="openid_action" value="trust">
<input type="submit" name="allow" value="Allow">
<input type="submit" name="deny" value="Deny">
</form>
</body>
</html>
