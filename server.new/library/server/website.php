<?php

class Website_Server extends Server {

  public $defaultClass = 'Page_Object';
  
  function main() {
    header('Content-type: text/html; charset=utf-8');
    foreach ($this->config->pages as $name => $pattern) {
      if (($vars = $this->checkPattern($pattern)) !== false) {
        $pagePath = BASE_DIR . '/library/' . BASE_SERVER . "/$name.php";
        if (file_exists($pagePath)) {
          require_once $pagePath;
        }
        $class = $this->defaultClass;
        if (class_exists("{$name}_Page")) {
          $class = "{$name}_Page";
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
