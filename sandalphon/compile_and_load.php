<?php
$command = "python ../sandalphon/sandalphon.py -i " . $_GET['filepath'] . " -j";
echo shell_exec($command);
?>