<?php

class Page_Object extends Base_Object {
  
  function __construct($name, $vars) {
    global $server;
    $this->name = $name;
    $config = $server->config->get("page:$name");
    if (!empty($config) && is_array($config)) {
      foreach ($config as $key => $value) {
        $this->$key = $value;
      }
    }
    foreach ($vars as $key => $value) {
      $this->$key = $value;
    }
  }
  
  function exists($pattern) {
    return false;
  }
  
  function main() {
    if (isset($this->template)) {
      $template = $this->loadTemplate($this->template);
      return $this->substitute($template);
    }
    return '';
  }
  
  function __toString() {
    return $this->main();
  }
  
}

?>
