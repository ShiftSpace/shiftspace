<?php

class Store extends Base {
  
  static public function factory($config) {
    if (empty($config['class'])) {
      throw new Exception('No class defined for store.');
    }
    $class = $config['class'];
    return new $class($config);
  }
    
}

?>
