<?php

require_once dirname(__FILE__) . '/../library/image.php';

$class = 'image';

$instance = new $class;
$reflection = new ReflectionClass($class);

foreach ($reflection->getProperties() as $prop) {
  if ($prop->isPublic()) {
    $name = $prop->getName();
    $value = $prop->getValue($instance);
    $type = $prop->getDocComment();
    $cols[] = $name
  }
}

class GridTable {
  
  function __construct($class) {
    
  }
  
}

class GridColumn {
  
}

?>
