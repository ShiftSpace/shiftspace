<?php

class Server extends Base {
  
  static private $instance;
  
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
