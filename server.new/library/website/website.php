<?php

class Website_Server extends Server {

  function __construct($filename) {
    $this->configure($filename);
    
  }
  
  function main() {
    foreach ($this->config->pages as $name => $pattern) {
      if (($vars = $this->checkPattern($pattern))) {
        $this->page = new Page($vars);
        echo $this->page;
        break;
      }
    }
  }
  
  function checkPattern($pattern) {
    $vars = $this->introspect($pattern);
    return false;
  }

}

?>
