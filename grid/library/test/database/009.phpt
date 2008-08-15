--TEST--
GridDatabase - escape
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

$string = "The cat's meow";

echo "1. Attempt to insert non-escaped value\n";

try {
  $db->query("
    INSERT INTO test
    (content)
    VALUES ('$string')
  ");
} catch (Exception $e) {
  echo "Exception caught\n";
}


echo "2. Escape an input value\n";

$escaped = $db->escape($string);

$query = $db->query("
  INSERT INTO test
  (content)
  VALUES ('$escaped')
");

print_r($db->row("
  SELECT id, content
  FROM test
"));

echo "3. Escape an array of values\n";

$sequence = array(
  "A zebra's stripe",
  "A baker's dozen",
  "A wizard's wand"
);
$escaped = $db->escape($sequence);

foreach ($escaped as $content) {
  $db->query("
    INSERT INTO test
    (content)
    VALUES ('$content')
  ");
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
1. Attempt to insert non-escaped value
Exception caught
2. Escape an input value
stdClass Object
(
    [id] => 1
    [content] => The cat's meow
)
3. Escape an array of values
Array
(
    [0] => stdClass Object
        (
            [id] => 1
            [content] => The cat's meow
        )

    [1] => stdClass Object
        (
            [id] => 2
            [content] => A zebra's stripe
        )

    [2] => stdClass Object
        (
            [id] => 3
            [content] => A baker's dozen
        )

    [3] => stdClass Object
        (
            [id] => 4
            [content] => A wizard's wand
        )

)
