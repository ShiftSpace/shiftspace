<?php
echo shell_exec("python sandalphon.py -i" . $_POST['filepath'] . " -o ../client/compiledViews/");
?>