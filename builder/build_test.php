<?php

$test = $_GET['test'];
$env = $_GET['env'];
$testsJson = json_decode(file_get_contents('../config/tests.json'), true);
$fileOrder = $testsJson['dependencies'][$test];

if(!$fileOrder)
{
  echo "({error: '" .$test. " does not exist, perhaps you need to run corebuilder.py?'})";
}
else
{
  foreach ($fileOrder as $f)
  {
    system("python preprocess.py -e test -p test -i $f");
    echo "\n";
  }
}

?>
