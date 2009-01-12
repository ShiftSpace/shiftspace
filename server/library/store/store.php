<?php

class Base_Store extends Base {
  
  static public function factory($config) {
    if (empty($config['class'])) {
      throw new Exception('No class defined for store.');
    }
    $class = $config['class'];
    return new $class($config);
  }
  
  public function saveSetupConfig() {
    $server = $this->config['_server'];
    $name = $this->config['_name'];
    
    $server->workingConfig->set("store:$name", array('setup' => true));
    $server->workingConfig->save();
  }
  
}

?>
