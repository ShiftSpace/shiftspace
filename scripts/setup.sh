# make the build, and compiledViews diretories and set their permissions
python ../builder/corebuilder.py
python ../sandalphon/sandalphon.py ../client/views/SSConsole/SSConsole.html
./build_ss.sh
./build_sb.sh
./build_sd.sh