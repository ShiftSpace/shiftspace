<?php

require_once "$dir/server/setup.php";

$method = @$_GET['method'];
if (empty($method)) {
    response(0, "No method specified.");
} else if (!file_exists("$dir/server/methods/$method.php")) {
    response(0, "Invalid method.");
} else {
    require_once "$dir/server/methods/$method.php";
}

function response($status, $payload) {
    if (is_string($payload)) {
        echo "{\"status\":$status,\"message\":\"$payload\"}";
    } else {
        $json = new stdClass;
        $json->status = $status;
        foreach ($payload as $key => $value) {
            $json->$key = $value;
        }
        echo json_encode($json);
    }
}

?>
