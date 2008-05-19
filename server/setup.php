<?php

require_once "$dir/server/config.php";
require_once "$dir/server/database/database.php";

// Load the database

$db_filename = '';
if (preg_match('#sqlite://(.+)#', $db_path, $matches) {
    list(, $db_filename) = $matches;
}
$db = new Database($db_path);

if ($db->tables() == array()) {
    // Setup the initial database configuration
    $db->setup("$dir/server/init.sql");
    $db->query("
        INSERT INTO user
        (username, status)
        VALUES ('shiftspace', 1)
    ");
}

// Set up the user session
session_register('user');
$user = $_SESSION['user'];

if (empty($user) && !empty($_COOKIE['auth'])) {
    list($username, $password) = explode(':', $_COOKIE['auth']);
    $user = $db->row("
        SELECT *
        FROM user
        WHERE username = '$username'
        AND password = '$password'
    ");
    if (!empty($user)) {
        $_SESSION['user'] = $user;
    }
}

if (!empty($_GET['v'])) {
    $client_version = $_GET['v'];
}

$server = 'http://' . $_SERVER['SERVER_NAME'] . dirname($_SERVER['PHP_SELF']) . '/';

?>
