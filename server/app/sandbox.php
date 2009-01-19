<?php

class Sandbox_Object extends Base_Object {
}

class Sandbox {
  public function __construct($server) {
    $this->server = $server;
  }
  
  function getvalue() {
    $key = $_REQUEST['key'];
    $value = $this->server->db->row("select value from sandbox where key=:key", array('key' => $key));
    $default = json_decode($_REQUEST['default']);
    
    if (!empty($value))
      return $value->value;
    else
      return $default->$key;
  }
  
  function setvalue() {
    $key = $_REQUEST['key'];
    $sandboxObject = new Sandbox_Object();
    
    $this->server->db->row("select * from sandbox where key=:key", array('key' => $key), PDO::FETCH_INTO, $sandboxObject);
    if (empty($sandboxObject->id)) {
      echo "yyy\n";
      $sandboxObject = new Sandbox_Object();
    }
    else echo "xxx\n";
    
    $sandboxObject->set(array(
      'key' => $_REQUEST['key'],
      'value' => $_REQUEST['value']
    ));
    
    $this->server->db->save($sandboxObject);
  }
}

?>
