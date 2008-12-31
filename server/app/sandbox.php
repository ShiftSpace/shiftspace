<?php

class Sandbox_Object extends Base_Object {
}

class Sandbox {
  public function __construct($server) {
    $this->server = $server;
  }
  
  function getvalue() {
/*
    $key = $_REQUEST['key'];
    $value = $this->server->db->load("sandbox($key)")->get();
    $default = json_decode($_REQUEST['default']);
    
    if (!empty($value))
      return $value;
    else
      return $default->$key;
*/
  }
  
  function setvalue() {
    $sandbox_object = new Sandbox_Object();
    $sandbox_object->set(array(
      'key' => $_REQUEST['key'],
      'value' => $_REQUEST['value']
    ));
    
    $this->server->db->save($sandbox_object);
  }
}

?>
