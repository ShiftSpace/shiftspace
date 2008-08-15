--TEST--
GridDatabase - query
--FILE--
<?php

$dir = dirname(__FILE__) . '/../../..';
include "$dir/library/database.php";
include "$dir/library/config.php";

$config = new GridConfig("$dir/config/database.ini");
$db = new GridDatabase($config->testing);

echo "1. Create a table\n";

$db->query("
  DROP TABLE IF EXISTS test
");

$db->query("
  CREATE TABLE test (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    content VARCHAR(255),
    created timestamp
  );
");

echo "2. Insert a value\n";

$query = $db->query("
  INSERT INTO test
  (content)
  VALUES (?)
", array('foo'));
var_dump($query->insertId);

echo "3. Select inserted value\n";

$query = $db->query("
  SELECT content
  FROM test
  WHERE id = (?)
", array(1));
var_dump($query->fetch());

echo "4. Delete row\n";

$query = $db->query("
  DELETE FROM test
  WHERE id = $db->lastInsertId
");
var_dump($query->rowCount());

$query = $db->query("
  DROP TABLE test
");

?>
--EXPECT--
1. Create a table
2. Insert a value
string(1) "1"
3. Select inserted value
array(2) {
  ["content"]=>
  string(3) "foo"
  [0]=>
  string(3) "foo"
}
4. Delete row
int(1)
