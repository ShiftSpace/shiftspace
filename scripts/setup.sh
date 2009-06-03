#!/bin/bash

# make the build, and compiledViews diretories and set their permissions

if [ ! -f ../config/env/mydev.json ]
then
  echo "Enter the root URL of your ShiftSpace installation (something like http://localhost/shiftspace)."
  echo "It will be saved in ../config/env/mydev.json"
  echo
  
  read ss_url
  
  echo {                                     > ../config/env/mydev.json
  echo   \"SERVER\": \"$ss_url/\",          >> ../config/env/mydev.json
  echo   \"SPACEDIR\": \"$ss_url/spaces/\", >> ../config/env/mydev.json
  echo   \"LOG_LEVEL\": \"SSLogError\",     >> ../config/env/mydev.json
  echo   \"VARS\": {                        >> ../config/env/mydev.json
  echo     \"ShiftSpaceSandBoxMode\": true  >> ../config/env/mydev.json
  echo    }                                 >> ../config/env/mydev.json
  echo  }                                   >> ../config/env/mydev.json
  
  chmod a+w ../server/working
fi

python ../builder/corebuilder.py
python ../sandalphon/sandalphon.py -i ../client/views/SSConsole/SSConsole.html -o ../client/compiledViews/

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

./build_shiftspace_dev.sh

echo ============================================================================================
echo "Suddenly, David Nolen walks in and says 'don't be lazy!' [They weren't really being lazy...]"
echo ============================================================================================
echo
echo

./build_sandbox_dev.sh

echo ============================================================================================
echo Unfortunately, we didn\'t end up drinking sambouka at all, even though it was _really_ close.
echo ============================================================================================
echo
echo

./build_sandalphon.sh
