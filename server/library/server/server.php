<?php

class Base_Server {  
  static private $instance;
  
  static public function fix_magic_quotes() {
    function stripslashes_deep(&$value)
    {
      $value = is_array($value) ?
               array_map('stripslashes_deep', $value) :
               stripslashes($value);

      return $value;
    }

    if (get_magic_quotes_gpc()) {
      stripslashes_deep($_GET);
      stripslashes_deep($_POST);
      stripslashes_deep($_COOKIE);
      stripslashes_deep($_REQUEST);
    }
  }

  static public function singleton($filename, $workingFilename) {
    Server::fix_magic_quotes();

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
        self::$instance = new $class($filename, $workingFilename);
      } catch (Exception $e) {
        $class = 'Server';
        self::$instance = new $class($filename, $workingFilename);
      }
    }
    return self::$instance;
  }
  
  public function __construct($filename, $workingFilename) {
    $this->config = new Ini_Object($filename);
    $this->workingConfig = new Ini_Object($workingFilename, true);
    $this->stores = array();    

    // get information from base ini
    foreach ($this->config->get() as $key => $value) {
      if (preg_match('/^store:(\w+)$/', $key, $matches)) {
        list(, $storeName) = $matches;

        if (empty($this->stores[$storeName]))
          $this->stores[$storeName] = array();
          
        $this->stores[$storeName] = array_merge($this->stores[$storeName], $value);
      } else if (preg_match('/^store:(\w+):(\w+)$/', $key, $matches)) {
        list(, $storeName, $table) = $matches;
        
        if (empty($this->stores[$storeName]))
          $this->stores[$storeName] = array();
          
        $this->stores[$storeName]["vars:$table"] = $value;
      }
    }
    
    // add information from working ini
    foreach ($this->workingConfig->get() as $key => $value) {
      if (preg_match('/^store:(\w+)$/', $key, $matches)) {
        list(, $storeName) = $matches;
        if (in_array($storeName, array_keys($this->stores)))
          $this->stores[$storeName] += $value;
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
