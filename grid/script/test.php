<?php

$test_dir = dirname(__FILE__) . '/../library/test';
$pear = '/usr/local/php5/bin/pear';
$totals = array(
  'passed' => 0,
  'skipped' => 0,
  'failed' => 0
);

if ($argc == 1) {
  echo "- - - - - - - - - - - - - - - - - - - - - -\n";
  echo "Testing all targets\n";
  echo "- - - - - - - - - - - - - - - - - - - - - -\n";
  $targets = array();
  $dh = opendir($test_dir);
  while ($file = readdir($dh)) {
    if (substr($file, 0, 1) != '.') {
      $targets[] = $file;
      echo count($targets) . ". $file\n";
    }
  }
  echo "\n";
  closedir($dh);
  foreach ($targets as $n => $target) {
    test($target, null, $n + 1);
  }
  echo "All targets\n";
  echo "- - - - - - - - - - - - - - - - - - - - - -\n";
  echo "{$totals['passed']} PASSED TESTS\n";
  echo "{$totals['skipped']} SKIPPED TESTS\n";
  echo "{$totals['failed']} FAILED TESTS\n";
  echo "- - - - - - - - - - - - - - - - - - - - - -\n";
} else if ($argc == 2) {
  if (file_exists("$test_dir/$argv[1]")) {
    test($argv[1]);
  } else {
    die("Sorry, target '$argv[1]' not found.");
  }
} else if ($argc == 3) {
  $num = str_pad($argv[2], 3, '0', STR_PAD_LEFT);
  if (file_exists("$test_dir/$argv[1]/$num.phpt")) {
    test($argv[1], "$num.phpt");
  } else {
    die("Sorry, target '$argv[1]/$num.phpt' not found.");
  }
}

function test($target, $test = null, $num = null) {
  global $test_dir, $pear, $totals;
  
  if (is_null($test)) {
    echo "$num. Testing $target\n";
    echo "- - - - - - - - - - - - - - - - - - - - - -\n";
    ob_start();
    system("cd $test_dir/$target && $pear run-tests");
    $result = ob_get_contents();
    ob_end_flush();
    
    if (preg_match('/(\d+) PASSED TESTS/', $result, $matches)) {
      $totals['passed'] += $matches[1];
    }
    if (preg_match('/(\d+) SKIPPED TESTS/', $result, $matches)) {
      $totals['skipped'] += $matches[1];
    }
    if (preg_match('/(\d+) FAILED TESTS/', $result, $matches)) {
      $totals['failed'] += $matches[1];
    }
    
    echo "\n";
  } else {
    echo "Testing $target/$test\n";
    system("$pear run-tests $test_dir/$target/$test");
    echo "\n";
  }
  
}

?>
