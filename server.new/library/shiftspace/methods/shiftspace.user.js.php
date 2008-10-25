<?php

header('Content-type: text/plain');

// NOTE: move from setting server var here- David
//$options = array('server', 'debug', 'cacheFiles');
$options = array('debug', 'cacheFiles');

$base = file("$dir/client/ShiftSpace.js");
$include_regex = '#^\s*//\s*INCLUDE\s+(\S+)\s*$#';
$variable_regex = '#^\s*var\s*(\w+)\s*=\s*(\S+\s*);#';

// NOTE: move away from setting server var here, second check for security reasons- David
/*$config = array('server' => $server);*/
$config = array();
foreach ($_POST as $key => $value) {
  if (in_array($key, $options)) {
    $config[$key] = $value;
  }
}

foreach ($base as $n => $line) {
  if (preg_match($include_regex, $line, $matches)) {
    list(, $file) = $matches;
    $replace = file_get_contents("$dir/client/$file");
    $len = strlen($file);
    $prefix = "\n// Start $file" . str_repeat(' -', 70 - $len) . "\n\n";
    $postfix = "\n\n// End $file" . str_repeat(' -', 72 - $len) . "\n\n";
    $base[$n] = "$prefix$replace$postfix\n";
  } else if (preg_match($variable_regex, $line, $matches)) {
    list(, $variable, $value) = $matches;
    if (isset($config[$variable])) {
      if (!is_numeric($config[$variable])) {
        $new_value = "\"{$config[$variable]}\"";
      } else {
        $new_value = $config[$variable];
      }
      $base[$n] = str_replace("$value;", "$new_value;", $line);
    }
  }
} 

if (!empty($_GET['sandbox'])) {
  //echo "// Sandbox mode\nvar ShiftSpaceSandBoxMode = true;\nvar server = '$server';\n";
}
echo join('', $base);

?>
