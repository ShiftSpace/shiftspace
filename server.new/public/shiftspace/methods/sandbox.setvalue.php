<?php

$key = $db->escape($_POST['key']);
$value = $db->escape($_POST['value']);

$db->query("
  DELETE FROM sandbox
  WHERE id = '$key'
");

$db->query("
  INSERT INTO sandbox
  (id, value)
  VALUES ('$key', '$value')
");

echo $value;

?>
