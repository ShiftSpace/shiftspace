--TEST--
GridConfig - load
--FILE--
<?php

include dirname(__FILE__) . '/../../config.php';
$obj = new GridConfig;

echo "1. Config file initial state\n";
var_dump($obj);

echo "2. Load a flat config file\n";
$ini = <<<END
key1 = "value1"
key2 = "value2"
key3 = "value3"
END;
file_put_contents('config.ini', $ini);

$obj->load('config.ini');
var_dump($obj);

echo "3. Load a config file with sections\n";
$ini = <<<END
[section1]
key1 = "value1"
key2 = "value2"
key3 = "value3"
[section2]
key1 = "value1"
key2 = "value2"
key3 = "value3"
END;
file_put_contents('config.ini', $ini);
$obj->load('config.ini');
var_dump($obj);

echo "4. Load a nonexistent config file\n";
try {
  $obj->load('nonexistent.ini');
} catch (Exception $e) {
  echo "Exception caught\n";
}

// Clean up
unlink('config.ini');

?>
--EXPECT--
1. Config file initial state
object(GridConfig)#1 (0) {
}
2. Load a flat config file
object(GridConfig)#1 (3) {
  ["key1"]=>
  string(6) "value1"
  ["key2"]=>
  string(6) "value2"
  ["key3"]=>
  string(6) "value3"
}
3. Load a config file with sections
object(GridConfig)#1 (2) {
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
4. Load a nonexistent config file
Exception caught
