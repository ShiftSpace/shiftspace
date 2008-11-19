<?php

class Image_Object extends Base_Object {
  
  function __construct($filename) {
    if (!file_exists($filename)) {
      throw new Exception("Error image '$filename' does not exist.");
    }
    $type = exif_imagetype($filename);
    switch ($type) {
      case IMAGETYPE_GIF:
        $this->im = imagecreatefromgif($filename); break;
      case IMAGETYPE_JPEG:
        $this->im = imagecreatefromjpeg($filename); break;
      case IMAGETYPE_PNG:
        $this->im = imagecreatefrompng($filename); break;
    }
  }
  
  function getColors() {
    $colors = array();
    for ($i = 0; $i < imagecolorstotal($this->im); $i++) {
      $colors[] = imagecolorsforindex($i);
    }
    return $colors;
  }
  
  function __destruct() {
    imagedestroy($this->im);
  }
  
}

?>
