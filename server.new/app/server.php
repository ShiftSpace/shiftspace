<?php

define('SHIFTSPACE_VERSION', '0.5');

class Server extends Base_Server {
  function main() {
    try {
      $method = @$_GET['method'];
      $global = new GlobalCalls($this);
      if (empty($method)) {
        throw new Error('No method parameter specified');
      } else if (preg_match('/^(\w+)\.(.+)$/', $method, $matches)) {
        list(, $target, $submethod) = $matches;
        $class = ucfirst("$target");
        $relay = new $class($this);
        if (!method_exists($relay, $submethod)) {
          throw new Error("Method '$method' not defined.", $target);
        }
        $response = $relay->$submethod();        
      } 
      else if (method_exists($global, $method)) {
        $response = $global->$method();
      } else {
        throw new Error("Method '$method' not defined.");
      }
    } catch (Error $e) {
      $response = Response::currentResponse();
      $response->handleError($e);
    }
    header('Content-type: text/plain');
    echo $response;
  }


  function normalizeURL($url) {
    $anchor_pos = strpos($url, '#');

    if ($anchor_pos !== false) {
      $url = substr($url, 0, $anchor_pos);
    }
    
    return $url;
  }
}

?>
