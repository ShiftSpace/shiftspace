<?php

class ShiftSpace_Server extends Server {
  
  function __construct($filename) {
    $this->configure($filename);
    $this->db = Store::factory($this->config->database);
  }
  
  function main() {
    
  }
  
}

?>
