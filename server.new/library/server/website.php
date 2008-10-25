<?php

class Website_Server extends Server {

  function __construct($filename) {
    $this->configure($filename);
    
  }
  
  function main() {
    foreach ($this->config->pages as $name => $pattern) {
      if (($vars = $this->checkPattern($pattern))) {
        $this->page = new Page_Object($name, $vars);
        echo $this->page;
        return;
      }
    }
    echo "Not found.";
  }
  
  function checkPattern($pattern) {
    $url = $_SERVER['REQUEST_URI'];
    $vars = $this->introspect($pattern);
    foreach ($vars as $var) {
      $pattern = str_replace('{' . $var . '}', "([^/]+)", $pattern);
    }
    $regex = '/^' . str_replace('/', '\/', $pattern) . '\/?$/i';
    if (preg_match($regex, $url, $matches)) {
      $values = array();
      foreach ($vars as $num => $var) {
        $values[$var] = $matches[$num + 1];
      }
      return $values;
    }
    return false;
  }

}

?>
