<?php

class Sandbox {
  protected $sql = array(
    'getvalue' => "
      SELECT value
      FROM sandbox
      WHERE id = :key
    "
  );
  
  public function __construct($server) {
    $this->server = $server;
  }
  
  function getvalue() {
    $key = $_REQUEST['key'];
    $value = $this->server->db->value($sql['getvalue'], array('key' => $key));
    $default = json_decode($_REQUEST['default']);
    
    if (!empty($value))
      return $value;
    else
      return $default->$key;
  }
}

?>
