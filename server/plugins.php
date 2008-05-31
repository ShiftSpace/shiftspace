<?php

// This is included by method scripts to include plug-in scripts implementing
// the current method name. The specific plugins and order of inclusion is
// defined by the 'plugins' parameter.

if (!empty($_REQUEST['plugins'])) {
  $plugins = explode(',', $_REQUEST['plugins']);
  foreach ($plugins as $plugin) {
    if (file_exists("$dir/plugins/$plugin/$method.php")) {
      require_once "$dir/plugins/$plugin/$method.php";
    }
  }
}

?>
