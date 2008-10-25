<?php

class Store extends Base {
  
  static public function factory($config) {
    $class = $config['class'];
    return new $class($config);
  }
    
}

?>
