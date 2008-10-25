<?php

class Page_Object extends Object {
  
  function __construct($name, $vars) {
    $this->name = $name;
    echo $name;
    foreach ($vars as $key => $value) {
      $this->$key = $value;
    }
  }
  
  function exists($pattern) {
    return true;
  }
  
  function __toString() {
    return '';
  }
  
}

?>
