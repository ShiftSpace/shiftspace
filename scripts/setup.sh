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

./build_shiftspace.sh

echo ============================================================================================
echo "Suddenly, David Nolen walks in and says 'don't be lazy!' [They weren't really being lazy...]"
echo ============================================================================================
echo
echo

./build_sandbox.sh

echo ============================================================================================
echo Unfortunately, we didn\'t end up drinking sambouka at all, even though it was _really_ close.
echo ============================================================================================
echo
echo

./build_sandalphon.sh
