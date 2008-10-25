<?php

class File_Store extends Store {
  
  function __construct($base) {
    $this->base = $base;
  }
  
  public function load($filename) {
    if (preg_match('/\.(\w+)$/', $filename, $matches)) {
      $class = $matches[1] . '_Object';
      return new $class("$this->base/$filename");
    }
  }
  
  public function save($object) {
    $object->save();
  }
  
}

?>
