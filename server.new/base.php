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
  
  static private $_subRegex = '/\\\?\{([^}]+)\}/';
  static private $_subVars = null;
  protected $events;
  
  public function substitute($template, $vars = null) {
    if (!empty($vars)) {
      self::$_subVars = $vars;
    }
    $callback = array($this, '_subCallback');
    $replaced = preg_replace_callback(self::$_subRegex, $callback, $template);
    self::$_subVars = null;
    return $replaced;
  }
  
  public function introspect($template = false) {
    if (empty($template) && isset($this->_vars)) {
      return $this->_vars;
    }
    if (preg_match_all(self::$_subRegex, $template, $matches)) {
      return $matches[1];
    } else {
      return array();
    }
  }
  
  public function get($key = false, $options = false) {
    if (empty($key) && is_subclass_of($this, 'Object')) {
      return $this->contents['values'];
    } else if (empty($key)) {
      return get_object_vars($this);
    }
    $method = "get$key";
    if (method_exists($this, $method)) {
      return $this->$method($options);
    } else if (is_subclass_of($this, 'Object')) {
      return $this->contents['values'][$key];
    } else {
      return $this->$key;
    }
  }
  
  public function set($key, $value) {
    $method = "set$key";
    if (method_exists($this, $method)) {
      return $this->$method($value);
    } else if (is_subclass_of($this, 'Object')) {
      $this->contents['values'][$key] = $value;
    } else {
      return $this->$key = $value;
    }
  }
  
  public function addEvent($event, $function) {
    $this->_events[$event] = $function;
  }
  
  public function fireEvent($event) {
    if (isset($this->_events[$event])) {
      call_user_func($this->_events[$event]);
    }
  }
  
  public function removeEvent($event, $function) {
    unset($this->_events[$event]);
  }
  
  private function _subCallback($matches) {
    $key = $matches[1];
    $vars = empty(self::$_subVars) ? $this->get() : self::$_subVars;
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
