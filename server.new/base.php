<?php

if (!defined('BASE_DIR')) {
  define('BASE_DIR', dirname(__FILE__));
}

if (!function_exists('__autoload')) {
  function __autoload($class) {
    if (strpos($class, '_') === false) {
      $filename = "$class/$class.php";
    } else {
      $path = explode('_', $class);
      $filename = implode('/', array_reverse($path)) . '.php';
    }
    $filename = strtolower($filename);
    if (file_exists(BASE_DIR . "/library/$filename")) {
      require_once BASE_DIR . "/library/$filename";
    }
    if (!class_exists($class) && isset($path)) {
      $class = array_shift($path);
      __autoload($class);
    }
  }
}

class Base {
  
  private static $subRegex = '/\\\?\{([^}]+)\}/';
  private static $subVars = null;
  
  public function configure($filename) {
    $dir = new File_Store(BASE_DIR . '/config');
    $this->config = $dir->load($filename);
    return $this->config;
  }
  
  public function substitute($template, $vars = null) {
    if (!empty($vars)) {
      self::$subVars = $vars;
    }
    $callback = array($this, 'subCallback');
    $replaced = preg_replace_callback(self::$subRegex, $callback, $template);
    self::$subVars = null;
    return $replaced;
  }
  
  public function introspect($template) {
    preg_match_all(self::$subRegex, $template, $matches);
    return $matches[1];
  }
  
  public function get($key) {
    $method = "get$key";
    if (method_exists($this, $method)) {
      return $this->$method();
    } else {
      return $this->$key;
    }
  }
  
  public function set($key, $value) {
    $method = "set$key";
    if (method_exists($this, $method)) {
      return $this->$method($value);
    } else {
      return $this->$key = $value;
    }
  }
  
  private function subCallback($matches) {
    $key = $matches[1];
    $vars = empty(self::$subVars) ? get_object_vars($this) : self::$subVars;
    if (substr($matches[0], 0, 1) == '\\') {
      return substr($matches[0], 1);
    } else if (isset($vars[$key])) {
      return $vars[$key];
    } else {
      return '';
    }
  }
  
}

?>
