<?php

define('SHIFTSPACE_VERSION', '0.5');

class Shift_Object extends Base_Object {}
class User_Object extends Base_Object {}

class Server extends Base_Server {
  function main() {
    try {
      session_start();
      $this->user = $_SESSION['user'];
      
      $method = @$_REQUEST['method'];
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
      
      $_SESSION['user'] = $this->user;
    } catch (Error $e) {
      $response = Response::currentResponse();
      $response->handleError($e);
    }
    header('Content-type: text/plain');
    
    if ($response)
      echo $response;
    else
      echo new Response("ok");
  }

  function normalizeURL($url) {
    $anchor_pos = strpos($url, '#');

    if ($anchor_pos !== false) {
      $url = substr($url, 0, $anchor_pos);
    }
    
    return $url;
  }
    
  function summarize($summary) {
    $summary = strip_tags($summary);
    $summary = preg_replace("#\s+#", ' ', $summary);
  
    if (strlen($summary) > 140) {
      $summary = substr($summary, 0, 140) . '...';
    }
                
    return $summary;
  }
  
  function requireLogin() {
    if (empty($this->user) || empty($this->user->id)) {
      throw new Error('Oops, your session has expired. Please login and try again.');
    }                          
  }
}

?>
