--TEST--
GridConfig - clear
--FILE--
<?php

include dirname(__FILE__) . '/../../config.php';

echo "1. Clear a flat config\n";
$obj = new GridConfig;
$obj->key1 = "value1";
$obj->key2 = "value2";
$obj->key3 = "value3";
var_dump($obj);
$obj->clear();
var_dump($obj);

echo "2. Clear a config with sections\n";
$obj = new GridConfig;
$obj->section1 = array(
  'key1' => 'value1',
  'key2' => 'value2',
  'key3' => 'value3'
);
$obj->section2 = array(
  'key1' => 'value1',
  'key2' => 'value2',
  'key3' => 'value3'
);
var_dump($obj);
$obj->clear();
var_dump($obj);

?>
--EXPECT--
1. Clear a flat config
object(GridConfig)#1 (3) {
  ["key1"]=>
  string(6) "value1"
  ["key2"]=>
  string(6) "value2"
  ["key3"]=>
  string(6) "value3"
}
object(GridConfig)#1 (0) {
}
2. Clear a config with sections
object(GridConfig)#2 (2) {
  ["section1"]=>
  array(3) {
    ["key1"]=>
    string(6) "value1"
    ["key2"]=>
    string(6) "value2"
    ["key3"]=>
    string(6) "value3"
  }
  ["section2"]=>
  array(3) {
    ["key1"]=>
    string(6) "value1"
    ["key2"]=>
    string(6) "value2"
    ["key3"]=>
    string(6) "value3"
  }
}
object(GridConfig)#2 (0) {
}
