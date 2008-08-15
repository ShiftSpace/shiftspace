--TEST--
GridDatabase - connect
--FILE--
<?php

$dir = dirname(__FILE__) . '/../../..';
include "$dir/library/database.php";
include "$dir/library/config.php";

$config = new GridConfig("$dir/config/database.ini");

echo "1. Connecting with a valid configuration\n";
$db = new GridDatabase($config->testing);

echo "2. Connecting with an invalid configuration\n";
try {
  $db = new GridDatabase(array(
    'driver' => 'nonexistent'
  ));
} catch (Exception $e) {
  echo "Exception caught\n";
}

?>
--EXPECT--
1. Connecting with a valid configuration
2. Connecting with an invalid configuration
Exception caught
