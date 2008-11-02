<?php

define('SHIFTSPACE_VERSION', '0.5');

$dir = dirname(__FILE__);
require_once "$dir/shift.php";
require_once "$dir/response.php";
require_once "$dir/user.php";
require_once "$dir/error.php";

class ShiftSpace_Server extends Server {
  
  function main() {
    try {
      $method = @$_GET['method'];
      if (empty($method)) {
        throw new Error('No method specified');
      } else if (preg_match('/^plugins\.(\w+)\.(.+)$/', $method, $matches)) {
        list(, $target, $method) = $matches;
        $class = "{$target}_Plugin";
        $plugin = new $class($this);
        if (!method_exists($plugin, $method)) {
          throw new Error("Method '$method' not defined.", $target);
        }
        $plugin->$method();
      } else if (!method_exists($this, $method)) {
        throw new Error("Method '$method' not defined.");
      }
      $this->$method();
    } catch (Error $e) {
      $response = Response::currentResponse();
      $response->handleError($e);
    }
    header('Content-type: text/plain');
    echo Response::currentResponse();
  }
  
  function version() {
    $response = new Response(SHIFTSPACE_VERSION);
  }
  
  function query() {
    
  }
  
  function normalizeURL($url) {
    return $url;
  }
  
}

?>
