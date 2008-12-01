<?php

define('SHIFTSPACE_VERSION', '0.5');

$dir = dirname(__FILE__);
require_once "$dir/error.php";
require_once "$dir/shift.php";
require_once "$dir/response.php";
require_once "$dir/user.php";

class Server extends Base_Server {
  
  protected $sql = array(
    'queryAnonymous' => "
      SELECT COUNT(id)
      FROM shift
      WHERE status = 1
      AND href = :href
    ",
    'queryLoggedIn' => "
      SELECT COUNT(s.id)
      FROM shift s,
           user u
      WHERE (
        s.status = 1
        OR (
          s.status = 2
          AND s.user_id = :user
        )
      )
      AND s.user_id = u.id
      AND s.href = :href
    "
  );
  
  function main() {
    try {
      $method = @$_GET['method'];
      if (empty($method)) {
        throw new Error('No method parameter specified');
      } else if (preg_match('/^plugins\.(\w+)\.(.+)$/', $method, $matches)) {
        list(, $target, $method) = $matches;
        $class = "{$target}_Plugin";
        $plugin = new $class($this);
        if (!method_exists($plugin, $method)) {
          throw new Error("Method '$method' not defined.", $target);
        }
        $plugin->$method();
      } else if (method_exists($this, $method)) {
        $response = $this->$method();
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
  
  function version() {
    return new Response(array(
      'version' => SHIFTSPACE_VERSION
    ));
  }
  
  function query() {
    
    // Check for content based on URL
    $href = $this->normalizeURL(@$_REQUEST['href']);
    
    // Sanity check
    if (empty($href)) {
      throw new Error("Please specify an 'href' argument.");
    }
    
    $data = array();
    
    if (empty($this->user)) {
      // Only check for public content
      $data['count'] = $this->db->value($this->sql['queryAnonymous'], array(
        'href' => $href
      ));
    } else {
      // Check for both public and private content
      $data['count'] = $this->db->value($this->sql['queryLoggedIn'], array(
        'user' => $this->user->id,
        'href' => $href
      ));
      $data['username'] = $this->user->username;
      $data['email'] = $this->user->email;
    }
    
    return new Response($data);
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
