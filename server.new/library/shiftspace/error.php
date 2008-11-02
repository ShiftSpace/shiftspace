<?php

class Error extends Exception {
  
  protected $resource;
  
  function __construct($message, $resource = false) {
    if (!empty($resource)) {
      $this->resource = $resource;
    }
    parent::__construct($message, 0);
  }
  
  function getResource() {
    return $this->resource;
  }
  
}

?>
