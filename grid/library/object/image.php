<?php

require_once dirname(__FILE__) . '/object.php';

class Image extends GridObject {
  
  /** string(255), unique() */
  public $filename;
  
  /** number() */
  public $width;
  
  /** number() */
  public $height;
  
}

?>
