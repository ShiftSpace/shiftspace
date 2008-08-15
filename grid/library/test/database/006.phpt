--TEST--
GridDatabase - value
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

$query = $db->prepare("
  INSERT INTO test
  (content)
  VALUES (:content)
");

$query->execute(array('content' => 'foo'));
$query->execute(array('content' => 'bar'));
$query->execute(array('content' => 'baz'));

echo "1. Basic query\n";

$content = $db->value("
  SELECT content
  FROM test
  WHERE id = 1
");
echo "$content\n";

echo "2. Query with a prepared variable\n";

$content = $db->value("
  SELECT content
  FROM test
  WHERE id = ?
", array(2));
echo "$content\n";

$db->query("
  DROP TABLE test
");

?>
--EXPECT--
1. Basic query
foo
2. Query with a prepared variable
bar
