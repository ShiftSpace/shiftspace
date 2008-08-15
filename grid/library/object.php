<?php

/*
  Class: GridObject
  The base class for GridPublish objects
*/
class GridObject {
  
  /** serial() */
  public $id;
  
  /** timestamp() */
  public $modified;
  
  /** datetime() */
  public $created;
  
  protected $_template = '';
  
  /*
    Method: setTemplate
    Assigns a template string to the object
    
    Arguments:
      $content - The template content
    
    Returns:
      True on success, false on failure [boolean].
    
    See also:
      <getTemplate>, <loadTemplate>, <introspect>, <evaluate>
  */
  public function setTemplate($content = '') {
    if (empty($content)) {
      $this->_template = '';
      return true;
    } else if (is_string($content)) {
      $this->_template = $content;
      return true;
    }
    return false;
  }
  
  
  /*
    Method: getTemplate
    Retrieves the currently assigned template
    
    Arguments:
      None.
    
    Returns:
      The currently assigned template [string].
    
    See also:
      <setTemplate>, <loadTemplate>, <introspect>, <evaluate>
  */
  public function getTemplate() {
    if (!empty($this->_template)) {
      return $this->_template;
    }
    return '';
  }
  
  
  /*
    Method: loadTemplate
    Loads a template from a file
    
    Arguments:
      $filename - The template file to load [string].
    
    Returns:
      True on success (boolean), throws an exception on failure.
    
    See also:
      <setTemplate>, <getTemplate>, <introspect>, <evaluate>
  */
  public function loadTemplate($filename) {
    if (file_exists($filename)) {
      $this->setTemplate(file_get_contents($filename));
      return true;
    } else {
      throw new Exception("Template '$filename' not found.");
    }
  }
  
  
  /*
    Method: introspect
    Describes a template in terms of its definable properties
    
    Arguments:
      $content - (optional) A template to introspect on. If not set, the
                 currently assigned template is introspected [string].
    
    Returns:
      An associative array of variables and blocks [array].
    
    See also:
      <setTemplate>, <getTemplate>, <loadTemplate>, <evaluate>
  */
  public function introspect($content = null) {
    if (is_null($content)) {
      $content = $this->getTemplate();
    }
    $content = $this->_injectIncludes($content);
    $collapsed = $this->_flattenBlocks($content);
    return array(
      'variables' => $this->_getVariables($collapsed),
      'blocks' => $this->_getBlocks($content)
    );
  }
  
  
  /*
    Method: evaluate
    Evaluates a template based on its defined properties
    
    Arguments:
      $content - (optional) A template string to be evaluated. If not set, the
                 currently assigned template is evaluated [string].
    
    Returns:
      The evaluated template [string].
    
    See also:
      <setTemplate>, <getTemplate>, <loadTemplate>, <introspect>
  */
  public function evaluate($content = null) {
    if (is_null($content)) {
      $content = $this->getTemplate();
    }
    
    $blocks = $this->_getBlocks($content);
    $content = $this->_injectIncludes($content);
    $collapsed = $this->_flattenBlocks($content, true);
    $vars = $this->_getVariables($collapsed);
    
    foreach ($vars as $var) {
      if (!isset($this->$var)) {
        if (isset($blocks[$var])) {
          throw new Exception("Block {" . $var . "} is not defined.");
        } else {
          throw new Exception("Variable {=$var} is not defined.");
        }
      }
      if (isset($blocks[$var])) {
        $this->$var->setTemplate($blocks[$var]);
      }
      $collapsed = str_replace("{=$var}", "{$this->$var}", $collapsed);
    }
    return $collapsed;
  }
  
  
  /*
    Method: __toString
    An alias of the method evaluate, also a PHP "magic method"
    
    Arguments:
      None.
    
    Returns:
      The evaluated template [string].
    
    See also:
      <evaluate>
  */
  public function __toString() {
    return $this->evaluate();
  }
  
  
  // - - Protected helper methods - - - - - - - - - - - - - - - - - - - - - - -
  
  
  protected function onBeforeInsert() {
    $this->created = date('Y-m-d H:i:s');
  }
  
  
  // Returns an array of variables that match the pattern {=var_name}, based on
  // the content argument.
  protected function _getVariables($content) {
    $label = '[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*';
    preg_match_all("
      /
        \{        # Open brace
        =         # Equal sign
        ($label)  # Variable name
        \}        # Close brace
      /x
    ", $content, $matches);
    return $matches[1];
  }
  
  
  // Returns an associative array of blocks, where each key is the name of the
  // block and each value is the block's template. Blocks are defined by the
  // pattern {block_name} ... {/block_name}.
  protected function _getBlocks($content) {
    $blocks = array();
    $label = '[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*';
    $regex = "
      /
        \{        # Open brace
        ($label)  # Block name
        \}        # Close brace
      /x
    ";
    $flags = PREG_OFFSET_CAPTURE;
    $offset = 0;
    while (preg_match($regex, $content, $matches, $flags, $offset)) {
      $label = $matches[1][0];
      $start = $matches[0][1] + strlen($label) + 2;
      $end = strpos($content, "{/$label}", $start);
      if ($end === false) {
        throw new Exception("Unclosed {" . $label . "} block.");
      }
      $template = substr($content, $start, $end - $start);
      $blocks[$label] = $template;
      $offset = $end + strlen($label) + 3;
    }
    return $blocks;
  }
  
  
  // Returns an array of file includes defined by the pattern {+filename}.
  protected function _getIncludes($content) {
    $path = '[a-zA-Z0-9_\x7f-\xff\/.-]+';
    preg_match_all("
      /
        \{        # Open brace
        \+        # Plus sign
        ($path)   # File path
        \}        # Close brace
      /x
    ", $content, $matches);
    return $matches[1];
  }
  
  
  // Returns the template content with blocks removed. If the second argument
  // is set to true blocks are replaced by variable stubs.
  protected function _flattenBlocks($content, $includeStubs = false) {
    $blocks = array_keys($this->_getBlocks($content));
    foreach ($blocks as $block) {
      $replacement = $includeStubs ? "{=$block}" : '';
      $content = preg_replace("
        /
          \{$block\}    # Start of block
          .*?           # Block content
          \{\/$block\}  # End of block
        /sx
      ", $replacement, $content);
    }
    return $content;
  }
  
  
  // Injects included file contents into template.
  protected function _injectIncludes($content) {
    $includes = $this->_getIncludes($content);
    foreach ($includes as $num => $include) {
      if (!file_exists($include)) {
        throw new Exception("Include '$include' not found."); 
      }
      $template = file_get_contents($include);
      $content = str_replace("{+$include}", $template, $content);
    }
    return $content;
  }
  
  /*
  function addEvent($type, $method) {
    if (empty($this->_events)) {
      $this->_events = array();
    }
    if (empty($this->_events[$type])) {
      $this->_events[$type] = array();
    }
    $this->_events[$type][] = $method;
    return true;
  }
  
  function removeEvent($type, $method) {
    if (empty($this->_events) ||
        empty($this->_events[$type])) {
      return false;
    }
    $this->_events[$type] = array_diff($this->_events[$type], array($method));
    return true;
  }
  
  function fireEvent($type, $args = null) {
    if (empty($this->_events) ||
        empty($this->_events[$type])) {
      return false;
    }
    foreach ($this->_events[$type] as $func) {
      if ($this->$func($args) === false) {
        break;
      }
    }
    return true;
  }*/
  
}

?>
