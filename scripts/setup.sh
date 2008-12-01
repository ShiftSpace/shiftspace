# make the build, and compiledViews diretories and set their permissions
python ../builder/corebuilder.py
python ../sandalphon/sandalphon.py ../client/views/SSConsole/SSConsole.html

echo
echo
echo
echo
echo
echo =============================================================================
echo A rabbi, a priest and a javascript programmer are sitting in a coffee shop...
echo =============================================================================
echo
echo
echo
echo
echo

./build_ss.sh
./build_sb.sh
./build_sd.sh
