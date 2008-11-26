<?php

class Base_Server extends Base {
  
  static private $instance;
  
  static public function singleton($filename) {
    $name = substr(basename($filename), 0, -4);
    $config = new Ini_Object($filename);
    if (!empty($config->server) && !empty($config->server['class'])) {
      $class = $config->server['class'];
    } else {
      $class = 'Server';
    }
    if (!isset(self::$instance)) {
      try {
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
    $this->config = new Ini_Object($filename);
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
      $this->$name = Base_Store::factory($config);
    }
  }
  
  public function __clone() {
    throw Exception('Cloning singleton server objects is not allowed.');
  }
  
}

?>
