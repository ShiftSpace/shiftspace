<?php

$dir = dirname(__FILE__);
require_once "$dir/collections.php";

class GlobalCalls {
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
  
  public function __construct($server) {
    $this->server = $server;
  }
  
  function version() {
    return new Response(array(
      'version' => SHIFTSPACE_VERSION
    ));
  }
  
  function query() {
    // Check for content based on URL
    $href = $this->server->normalizeURL(@$_REQUEST['href']);
    
    // Sanity check
    if (empty($href)) {
      throw new Error("Please specify an 'href' argument.");
    }
    
    $data = array();
    
    if (empty($this->server->user)) {
      // Only check for public content
      $data['count'] = $this->server->db->value($this->sql['queryAnonymous'], array(
        'href' => $href
      ));
    } else {
      // Check for both public and private content
      $data['count'] = $this->server->db->value($this->sql['queryLoggedIn'], array(
        'user' => $this->server->user->id,
        'href' => $href
      ));
      
      $data['username'] = $this->server->user->username;
      $data['email'] = $this->server->user->email;
    }
    
    return new Response($data);
  }
  
  function collections() {
    $desc = json_decode($_POST['desc'], true);
    $collections = new Collections($this->server);
    $result = array();
    
    if (!isset($desc[0])) {
      // this is an associative array meaning its not a bulk operation
      $method = $desc['action'];
      return new Response($collections->$method($desc));
    }
    else {
      // bulk operation      
      foreach ($desc as $operation) {
        $method = $operation['action'];
        $result[] = $collections->$method($operation);
      }
    }
    
    return new Response($result);
  }
}

?>
