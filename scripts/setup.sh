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
  
  echo {                                                                > ../config/env/dev.json
  echo   \"SERVER\": \"$ss_url/\",                                     >> ../config/env/dev.json
  echo   \"SPACEDIR\": \"$ss_url/spaces/\",                            >> ../config/env/dev.json
  echo   \"LOG_LEVEL\": \"SSLogError \| SSLogSystem \| SSLogShift\"    >> ../config/env/dev.json
  echo }                                                               >> ../config/env/dev.json
  
  echo {                                                                > ../config/env/sandalphon.json
  echo   \"SERVER\": \"$ss_url/\",                                     >> ../config/env/sandalphon.json
  echo   \"SPACEDIR\": \"$ss_url/spaces/\",                            >> ../config/env/sandalphon.json
  echo   \"LOG_LEVEL\": \"SSLogError \| SSLogSandalphon\",             >> ../config/env/sandalphon.json
  echo   \"VARS\": {                                                   >> ../config/env/sandalphon.json
  echo     \"SandalphonToolMode\": true                                >> ../config/env/sandalphon.json
  echo    }                                                            >> ../config/env/sandalphon.json
  echo }                                                               >> ../config/env/sandalphon.json
  
  chmod a+w ../server/working
  chmod a+w ../client/compiledViews
  chmod a+w ../builds
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
