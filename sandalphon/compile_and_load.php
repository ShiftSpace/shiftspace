<?php
echo shell_exec("python ../sandalphon/sandalphon.py -i" . $_POST['filepath'] . " -j");
?>