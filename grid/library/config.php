<?php

/*
  Class: GridConfig
  A simple object wrapper for INI files.
*/

class GridConfig {
  
  /*
    Constructor: __construct
    Initializes the GridConfig object
    
    Arguments:
      $file - (optional) The path of a file to load [string].
    
    See also:
      <load>
  */
  public function __construct($file = null) {
    if (!empty($file)) {
      $this->load($file);
    }
  }
  
  
  /*
    Method: load
    Loads configuration from a file
    
    Arguments:
      $file - The path of a file to load.
    
    Returns:
      Nothing.
    
    See also:
      <save>
  */
  public function load($file) {
    if (!file_exists($file)) {
      throw new Exception("Config file '$file' not found.");
    }
    try {
      $content = parse_ini_file($file, true);
    } catch (Exception $e) {
      $message = $e->getMessage();
      throw new Exception("Could not parse config file '$file': $message");
    }
    $this->clear();
    foreach ($this->loadArray($content) as $key => $value) {
      $this->$key = $value;
    }
  }
  
  
  /*
    Method: save
    Saves the current configuration to a file
    
    Arguments:
      $file - The path of a file to save to.
    
    Returns:
      Nothing.
    
    See also:
      <load>
  */
  public function save($file) {
    if (!is_writable(dirname($file)) ||
        file_exists($file) && !is_writable($file)) {
      throw new Exception("Could not save config file '$file'.");
    }
    $contents = $this->saveArray(get_object_vars($this));
    file_put_contents($file, $contents);
  }
  
  
  /*
    Method: clear
    Resets the configuration
    
    Arguments:
      None.
    
    Returns:
      Nothing.
  */
  public function clear() {
    foreach (get_object_vars($this) as $key => $value) {
      unset($this->$key);
    }
  }
  
  
  // - - Protected helper methods - - - - - - - - - - - - - - - - - - - - - - -
  
  
  // Takes an array of items and applies a reverse encoding process.
  protected function loadArray($array) {
    $contents = array();
    foreach ($array as $key => $value) {
      if (is_scalar($value) && substr($value, 0, 15) == '__SERIALIZED__:') {
        $value = substr($value, 15);
        $value = $this->unescape($value);
        $contents[$key] = unserialize($value);
      } else if (is_scalar($value)) {
        $contents[$key] = $this->unescape($value);
      } else if (is_array($value)) {
        $contents[$key] = $this->loadArray($value);
      }
    }
    return $contents;
  }
  
  
  // Takes an array of variables and encodes them into an INI string.
  protected function saveArray($array) {
    $contents = '';
    foreach ($array as $key => $value) {
      if (is_scalar($value)) {
        $contents .= "$key = \"" . $this->escape($value) . '"' . "\n";
      } else if (is_array($value)) {
        $contents .= "[$key]\n" . $this->saveArray($value);
      } else {
        $serialized = serialize($value);
        $contents .= "$key = \"__SERIALIZED__:" .
                     $this->escape($serialized) . '"' . "\n";
      }
    }
    return $contents;
  }
  
  
  // Escapes values so they can be safely stored in INI format
  protected function escape($value) {
    $value = str_replace("\r", '', $value);
    $value = str_replace("\n", '\n', $value);
    $value = str_replace('&', '&amp;', $value);
    $value = str_replace('"', '&quot;', $value);
    return $value;
  }
  
  
  // The reverse escaping process, for values retrieved from an INI file.
  protected function unescape($value) {
    $value = str_replace('\n', "\n", $value);
    $value = str_replace('&quot;', '"', $value);
    $value = str_replace('&amp;', '&', $value);
    return $value;
  }
  
}

?>
