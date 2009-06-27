<?
shell_exec("python ../sandalphon/sandalphon.py -i ../client/views/SSConsole/SSConsole.html -o ../client/compiledViews/ -e dev");
shell_exec("python ../builder/preprocess.py -e dev -i ../client/ShiftSpace.js -p shiftspace -o ../builds/shiftspace.dev.user.js");
echo "{'data':'ok'}";
?>