<?php
/*

WHOA WHAT JUST HAPPENED?

If you've clicked on a link and are wondering why this web page looks so
strange, it's because your server isn't configured to handle PHP scripts.
Please consult with the included readme.txt file for help setting up your
server environment.

*/

$version = '0.13';
$dir = dirname(__FILE__);

if (!empty($_GET['method'])) {
  // ShiftSpace on the line, talk in JSON
  require_once "$dir/server/main.php";
} else {
  // A human on the line, talk in HTML
  require_once "$dir/server/status.php";
}

?>
