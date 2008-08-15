--TEST--
GridConfig - save
--FILE--
<?php

include dirname(__FILE__) . '/../../config.php';

echo "1. Save flat config file\n";
$obj = new GridConfig;
$obj->key1 = "value1";
$obj->key2 = "value2";
$obj->key3 = "value3";
$obj->save('config.ini');
var_dump(file_get_contents('config.ini'));
unlink('config.ini');

echo "2. Save a config file with sections\n";
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
$obj->save('config.ini');
var_dump(file_get_contents('config.ini'));
unlink('config.ini');

?>
--EXPECT--
1. Save flat config file
string(48) "key1 = "value1"
key2 = "value2"
key3 = "value3"
"
2. Save a config file with sections
string(118) "[section1]
key1 = "value1"
key2 = "value2"
key3 = "value3"
[section2]
key1 = "value1"
key2 = "value2"
key3 = "value3"
"
