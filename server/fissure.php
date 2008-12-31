<?php
function method_form($method, $args) {
  echo "<form method=get action=index.php>\n";
  echo "<h2>$method</h2>";
  echo "<table>\n";
  echo "<input type=hidden name=method value=$method>\n";
  
  foreach ($args as $arg) {
    echo "<tr><td><label for=$arg>$arg</label></td>\n";
    echo "<td><input type=text name=$arg></td></tr>\n";
  }
  
  echo "<tr><td><input type=submit value='Call'></td></tr>";
  echo "</table></form><hr>\n\n";
}
?>

<html>
<body>
<h1>Method calls</h1>
<hr>
<?php method_form("version", array()); ?>
<?php method_form("query", array("href")); ?>
<?php method_form("sandbox.getvalue", array("default", "key")); ?>
<?php method_form("shift.query", array("href")); ?>
</body>
</html>

