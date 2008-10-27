<?php

class Server extends Base {
  
  static private $instance;
  
  public function __construct($filename) {
    $this->_config = new Ini_Object(BASE_DIR . "/config/$filename");
    $this->_stores = array();
    foreach ($this->_config->get() as $key => $value) {
      if (preg_match('/^store:(\w+)$/', $key, $matches)) {
        list(, $storeName) = $matches;
        $this->_stores[$storeName] = $value;
      } else if (preg_match('/^store:(\w+):(\w+)$/', $key, $matches)) {
        list(, $storeName, $table) = $matches;
        $this->_stores[$storeName]["vars:$table"] = $value;
      }
    }
    foreach ($this->_stores as $name => $config) {
      $config['_server'] = $this;
      $config['_name'] = $name;
      $this->$name = Store::factory($config);
    }
  }
  
  static public function singleton($filename) {
    if (!isset(self::$instance)) {
      try {
        $class = substr($filename, 0, -4) . '_Server';
        self::$instance = new $class($filename);
      } catch (Exception $e) {
        $class = 'Server';
        self::$instance = new $class($filename);
      }
    }
    return self::$instance;
  }
  
  public function __clone() {
    throw Exception('Cloning singleton server objects is not allowed.');
  }
  
}

?>
