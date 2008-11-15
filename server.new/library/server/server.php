<?php

class Server extends Base {
  
  static private $instance;
  
  static public function singleton($filename) {
    $name = substr($filename, 0, -4);
    if (!isset(self::$instance)) {
      try {
        $class = "{$name}_Server";
        define('BASE_SERVER', strtolower($name));
        self::$instance = new $class($filename);
      } catch (Exception $e) {
        $class = 'Server';
        self::$instance = new $class($filename);
      }
    }
    return self::$instance;
  }
  
  public function __construct($filename) {
    $this->config = new Ini_Object("config/$filename");
    $this->stores = array();
    foreach ($this->config->get() as $key => $value) {
      if (preg_match('/^store:(\w+)$/', $key, $matches)) {
        list(, $storeName) = $matches;
        $this->stores[$storeName] = $value;
      } else if (preg_match('/^store:(\w+):(\w+)$/', $key, $matches)) {
        list(, $storeName, $table) = $matches;
        $this->stores[$storeName]["vars:$table"] = $value;
      }
    }
    foreach ($this->stores as $name => $config) {
      $config['_server'] = $this;
      $config['_name'] = $name;
      $this->$name = Store::factory($config);
    }
  }
  
  public function __clone() {
    throw Exception('Cloning singleton server objects is not allowed.');
  }
  
}

?>
