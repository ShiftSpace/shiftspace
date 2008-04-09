<?php

$key = $db->escape($_POST['key']);
$value = $db->value("
  SELECT value
  FROM sandbox
  WHERE id = '$key'
");
if (!empty($value)) {
  echo $value;
} else {
  echo $_POST['default'];
}

?>
