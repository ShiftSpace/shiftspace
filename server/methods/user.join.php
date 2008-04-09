<?php

extract($db->escape($_POST));

if (empty($username)) {
    $response = "Oops, you didn\\'t enter a username.";
} else if (empty($password)) {
    $response = "Oops, you didn\\'t enter a password.";
} else if ($password != $password_again) {
    $response = "The passwords you entered didn\\'t match. Please try again.";
} else if (empty($email)) {
    $response = "Oops, you didn\\'t enter an email address.";
} else {
    $exists = $db->value("
        SELECT COUNT(username)
        FROM user
        WHERE username = '$username'
    ");
    
    if ($exists) {
        $response = 'Sorry, that username has already been taken. Please choose again.';
    }
}

$password = md5($password);

if (empty($response)) {
    
    if (empty($display_name)) {
        $display_name = $username;
    }
    
    $user_id = $db->query("
        INSERT INTO user
        (username, password, display_name, email)
        VALUES ('$username', '$password', '$display_name', '$email')
    ");
    
    if (!session_id()) {
        session_start();
    }
    session_register('user');
    $_SESSION['user'] = $db->row("
        SELECT *
        FROM user
        WHERE id = $user_id
    ");
    $session = session_id();
    
    // This response doesn't actually get used
    $response = 'Glad to have you with us!';
    
    //copy('images/default-user.gif', "images/user/$username.gif");
    
    echo "{ status: 1, session: '$session', response: '$response' }";
    
} else {

    echo "{ status: 0, response: '$response' }";
    
}
    
?>
