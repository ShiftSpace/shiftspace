--TEST--
GridObject - setTemplate
--FILE--
<?php

include dirname(__FILE__) . '/../../object.php';
$obj = new GridObject;

echo "1. Assign an empty template\n";
var_dump($obj->setTemplate(false));
var_dump($obj->getTemplate());

echo "2. Assign a string template\n";
var_dump($obj->setTemplate('foo {=bar} baz'));
var_dump($obj->getTemplate());

echo "3. Assign a non-string, non-empty template\n";
var_dump($obj->setTemplate(true));
var_dump($obj->getTemplate());

?>
--EXPECT--
1. Assign an empty template
bool(true)
string(0) ""
2. Assign a string template
bool(true)
string(14) "foo {=bar} baz"
3. Assign a non-string, non-empty template
bool(false)
string(14) "foo {=bar} baz"
