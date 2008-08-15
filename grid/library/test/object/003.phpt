--TEST--
GridObject - loadTemplate
--FILE--
<?php

include dirname(__FILE__) . '/../../object.php';
$obj = new GridObject;

echo "1. Load a template file that exists\n";

file_put_contents('test.html', 'foo {=bar} baz');
$result = $obj->loadTemplate('test.html');
var_dump($result);
var_dump($obj->getTemplate());

// Clean up
unlink('test.html');

echo "2. Load a template file that doesn't exist\n";

try {
  $obj->loadTemplate('nonexistent.html');
} catch (Exception $e) {
  echo "Exception caught\n";
}
var_dump($obj->getTemplate());

?>
--EXPECT--
1. Load a template file that exists
bool(true)
string(14) "foo {=bar} baz"
2. Load a template file that doesn't exist
Exception caught
string(14) "foo {=bar} baz"
