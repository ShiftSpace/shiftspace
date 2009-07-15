<?php

require_once "Zend/OpenId/Consumer.php";
require_once "../library/base.php";

  
$status = "";
if (isset($_POST['openid_action']) &&
    $_POST['openid_action'] == "login" &&
    !empty($_POST['openid_identifier'])) {

    $consumer = new Zend_OpenId_Consumer();
    if (!$consumer->login($_POST['openid_identifier'])) {
        $status = "OpenID login failed.";
    }
} else if (isset($_GET['openid_mode'])) {
    if ($_GET['openid_mode'] == "id_res") {
        $consumer = new Zend_OpenId_Consumer();
        if ($consumer->verify($_GET, $id)) {
            $status = "VALID " . htmlspecialchars($id);
            $server = Base_Server::singleton('server.ini', 'working/server.ini');

            $user = $server->db->row("SELECT * FROM user WHERE openid_identity='$_GET[openid_identity]'");
            if (!$user) {
              echo "create new user: $_GET[openid_identity]";
            }
            else {
              ini_set('session.cookie_lifetime', 2592000);
              session_start();
              $_SESSION['user'] = get_object_vars($user);
              header('Location: http://localhost/moma-shiftspace-phase2/sandbox/#open');
            }
        } else {
            $status = "INVALID " . htmlspecialchars($id);
        }
    } else if ($_GET['openid_mode'] == "cancel") {
        $status = "CANCELLED";
    }
}
?>
