<?php

$key = $db->escape($_REQUEST['key']);
$value = $db->value("
  SELECT value
  FROM sandbox
  WHERE id = '$key'
");

if (!empty($value)) 
{
  echo $value;
}
else 
{
  echo $_REQUEST['default'];
}

?>
