--TEST--
GridDatabase - transactions
--FILE--
<?php

$dir = dirname(__FILE__) . '/../../..';
include "$dir/library/database.php";
include "$dir/library/config.php";

$config = new GridConfig("$dir/config/database.ini");
$db = new GridDatabase($config->testing);

$db->query("
  DROP TABLE IF EXISTS test
");

$db->query("
  CREATE TABLE test (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    content VARCHAR(255),
    created TIMESTAMP
  ) TYPE=InnoDB
");

echo "1. Commit a transaction\n";

$db->beginTransaction();

$query = $db->prepare("
  INSERT INTO test
  (content)
  VALUES (?)
");

$query->execute(array('foo'));
$query->execute(array('bar'));
$query->execute(array('baz'));

$db->commit();

print_r($db->rows("
  SELECT id, content
  FROM test
"));

echo "2. Roll back a transaction\n";

$db->beginTransaction();

$db->query("
  DELETE FROM test
");

print_r($db->rows("
  SELECT id, content
  FROM test
"));

$db->rollBack();

print_r($db->rows("
  SELECT id, content
  FROM test
"));

echo "3. Roll back automatically after an exception is caught\n";

$db->beginTransaction();

try {
  $db->query("
    DELETE FROM test
  ");
  print_r($db->rows("
    SELECT id, content
    FROM test
  "));
  $db->query("
    UPDATE test
    SET nonexistent = 'value'
  ");
} catch (Exception $e) {
  echo "Exception caught\n";
}

print_r($db->rows("
  SELECT id, content
  FROM test
"));

$db->query("
  DROP TABLE test
");


?>
--EXPECT--
1. Commit a transaction
Array
(
    [0] => stdClass Object
        (
            [id] => 1
            [content] => foo
        )

    [1] => stdClass Object
        (
            [id] => 2
            [content] => bar
        )

    [2] => stdClass Object
        (
            [id] => 3
            [content] => baz
        )

)
2. Roll back a transaction
Array
(
)
Array
(
    [0] => stdClass Object
        (
            [id] => 1
            [content] => foo
        )

    [1] => stdClass Object
        (
            [id] => 2
            [content] => bar
        )

    [2] => stdClass Object
        (
            [id] => 3
            [content] => baz
        )

)
3. Roll back automatically after an exception is caught
Array
(
)
Exception caught
Array
(
    [0] => stdClass Object
        (
            [id] => 1
            [content] => foo
        )

    [1] => stdClass Object
        (
            [id] => 2
            [content] => bar
        )

    [2] => stdClass Object
        (
            [id] => 3
            [content] => baz
        )

)
