--TEST--
GridObject - getTemplate
--FILE--
<?php

include dirname(__FILE__) . '/../../object.php';
$obj = new GridObject;

echo "1. Retrieve the initial state\n";
var_dump($obj->getTemplate());

echo "2. Retrieve an assigned template\n";
$obj->setTemplate('foo {=bar} baz');
var_dump($obj->getTemplate());

?>
--EXPECT--
1. Retrieve the initial state
string(0) ""
2. Retrieve an assigned template
string(14) "foo {=bar} baz"
