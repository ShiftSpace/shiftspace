<?php

require_once "Zend/OpenId/Provider.php";

$server = new Zend_OpenId_Provider();

if ($_SERVER['REQUEST_METHOD'] == 'POST' &&
    isset($_POST['openid_action']) &&
    $_POST['openid_action'] === 'login' &&
    isset($_POST['openid_identifier']) &&
    isset($_POST['openid_password'])) {
    $server->login($_POST['openid_identifier'],
                   $_POST['openid_password']);
    Zend_OpenId::redirect("identity1.php", $_GET);
}
?>
<html>
<body>
<form method="post">
<fieldset>
<legend>OpenID Login</legend>
<table border=0>
<tr>
<td>Name:</td>
<td>
<input type="text"
       name="openid_identifier"
       value="<?php echo htmlspecialchars($_GET['openid_identity']);?>">
</td>
</tr>
<tr>
<td>Password:</td>
<td>
<input type="text"
       name="openid_password"
       value="">
</td>
</tr>
<tr>
<td>&nbsp;</td>
<td>
<input type="submit"
       name="openid_action"
       value="login">
</td>
</tr>
</table>
</fieldset>
</form>
</body>
</html>
