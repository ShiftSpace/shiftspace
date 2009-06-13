<?php

$env = isset($_GET['env']) ? $_GET['env'] : 'dev';
$proj = isset($_GET['proj']) ? $_GET['proj'] : 'shiftspace';
$input = isset($_GET['input']) ? $_GET['input'] : '../client/ShiftSpace.js';
$export = isset($_GET['export']) ? "-x" : "";

system("python preprocess.py -e $env -p $proj -i $input $export");
echo "\n";

?>