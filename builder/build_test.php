<?php

$test = $_GET['test'];
$env = $_GET['env'];
$testsJson = json_decode(file_get_contents('../config/tests.json'), true);
$fileOrder = $testsJson['dependencies'][$test];

foreach ($fileOrder as $f)
{
  system("python preprocess.py -e $env -p shiftspace -i $f");
  echo "\n";
}

?>
