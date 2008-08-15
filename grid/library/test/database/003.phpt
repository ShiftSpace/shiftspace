--TEST--
GridDatabase - prepare
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
  );
");

echo "1. Prepare and execute a set of INSERT queries\n";

$query = $db->prepare("
  INSERT INTO test
  (content)
  VALUES (:content)
");

$query->execute(array('content' => 'foo'));
$query->execute(array('content' => 'bar'));
$query->execute(array('content' => 'baz'));

print_r($db->rows("
  SELECT id, content
  FROM test
"));

echo "2. Prepare and execute a set of UPDATE queries\n";

$query = $db->prepare("
  UPDATE test
  SET content = ?
  WHERE id = ?
");

$query->execute(array('first', 1));
$query->execute(array('second', 2));
$query->execute(array('third', 3));

print_r($db->rows("
  SELECT id, content
  FROM test
"));

echo "3. Prepare and execute a set of DELETE queries\n";

$query = $db->prepare("
  DELETE FROM test
  WHERE id = ?
");

$query->execute(array(1));
$query->execute(array(2));

print_r($db->rows("
  SELECT id, content
  FROM test
"));

$db->query("
  DROP TABLE test
");

?>
--EXPECT--
1. Prepare and execute a set of INSERT queries
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
2. Prepare and execute a set of UPDATE queries
Array
(
    [0] => stdClass Object
        (
            [id] => 1
            [content] => first
        )

    [1] => stdClass Object
        (
            [id] => 2
            [content] => second
        )

    [2] => stdClass Object
        (
            [id] => 3
            [content] => third
        )

)
3. Prepare and execute a set of DELETE queries
Array
(
    [0] => stdClass Object
        (
            [id] => 3
            [content] => third
        )

)
