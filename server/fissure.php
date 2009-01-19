<?php
function method_form($httpmethod, $method, $args) {
  echo "<form method=$httpmethod action=index.php>\n";
  echo "<h2>$method</h2>";
  echo "<table>\n";
  echo "<input type=hidden name=method value=$method>\n";
  
  foreach ($args as $arg) {
    $textarea = false;
    
    if (substr($arg, -1) == '_') {
      $arg = substr($arg, 0, -1);
      $textarea = true;
    }

    echo "<tr><td><label for=$arg>$arg</label></td>\n";

    if ($textarea) {
      echo "<td><textarea name=$arg cols=50 rows=10></textarea></td></tr>\n";
    }
    else {
      echo "<td><input type=text name=$arg></td></tr>\n";
    }
  }
  
  echo "<tr><td><input type=submit value='Call'></td></tr>";
  echo "</table></form><hr>\n\n";
}
?>

<html>
<body>
<h1>Method calls</h1>
<hr>
<?php method_form('get', "version", array()); ?>
<?php method_form('get', "query", array("href")); ?>
<?php method_form('get', "sandbox.getvalue", array("default", "key")); ?>
<?php method_form('get', "sandbox.setvalue", array("key", "value")); ?>
<?php method_form('get', "shift.query", array("href")); ?>
<?php method_form('post', "collections", array("desc_")); ?>
</body>
</html>

