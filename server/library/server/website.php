<?php

class Website_Server extends Base_Server {

  public $defaultClass = 'Page_Object';
  
  function main() {
    foreach ($this->config->routes as $name => $pattern) {
      if (($vars = $this->checkPattern($pattern)) !== false) {
        $filename = BASE_DIR . '/public/' . BASE_SERVER . "/$name.php";
        if (file_exists($filename)) {
          require_once $filename;
        }
        $class = $this->defaultClass;
        if (class_exists($name)) {
          $class = $name;
        }
        $this->page = new $class($name, $vars);
        if ($this->page->exists($pattern)) {
          echo $this->page->main();
          return;
        }
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
