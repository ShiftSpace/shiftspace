<?php

class Object extends Base {
  
  static public function factory($options) {
    $class = $options['class'];
    $object = new $class($options);
    if (!empty($options['values'])) {
      foreach ($options['values'] as $key => $value) {
        $object->$key = $value;
      }
    }
    return $object;
  }
  
  public function initialize($store) {
    
    $class = strtolower(get_class($this));
    $table = str_replace('_object', '', $class);
    $vars = array(
      'table' => $table,
      'sequence' => $store->getVariation('sequence')
    );
    
    $instance = new $class;
    $reflection = new ReflectionClass($class);
    $columns = array();
    
    foreach ($reflection->getProperties() as $prop) {
      if ($prop->isPublic()) {
        $name = $prop->getName();
        $value = $prop->getValue($instance);
        $comment = $prop->getDocComment();
        if (empty($comment)) {
          continue;
        }
        $type = preg_replace('#/\*\*(.+)\*/#', '$1', $comment);
        $columns[] = "$name $type";
      }
    }
    if (!empty($columns)) {
      $columns = ', ' . implode(', ', $columns);
    } else {
      $columns = '';
    }
    
    $store->query($this->sub("
CREATE TABLE IF NOT EXISTS {table} (
  $columns
)
    ", $vars));
    
  }
  
  public function save() {
    
  }
  
}

?>
