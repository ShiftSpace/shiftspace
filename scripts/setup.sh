#!/bin/bash

# make the build, and compiledViews diretories and set their permissions

if [ ! -f ../config/env/mydev.json ]
then
  echo "Enter the root URL of your ShiftSpace installation (something like http://localhost/shiftspace)."
  echo "It will be saved in ../config/env/mydev.json"
  echo
  
  read ss_url
  
  echo {                                                                > ../config/env/mydev.json
  echo   \"SERVER\": \"$ss_url/\",                                     >> ../config/env/mydev.json
  echo   \"SPACEDIR\": \"$ss_url/spaces/\",                            >> ../config/env/mydev.json
  echo   \"IMAGESDIR\": \"$ss_url/images/\",                           >> ../config/env/mydev.json
  echo   \"GLOBAL_CSS\": \"styles/SSGlobalStyles.css\",                >> ../config/env/mydev.json
  echo   \"LOG_LEVEL\": \"SSLogError\",                                >> ../config/env/mydev.json
  echo   \"VARS\": {                                                   >> ../config/env/mydev.json
  echo     \"ShiftSpaceSandBoxMode\": true                             >> ../config/env/mydev.json
  echo    }                                                            >> ../config/env/mydev.json
  echo  }                                                              >> ../config/env/mydev.json
  
  echo {                                                                > ../config/env/dev.json
  echo   \"SERVER\": \"$ss_url/\",                                     >> ../config/env/dev.json
  echo   \"SPACEDIR\": \"$ss_url/spaces/\",                            >> ../config/env/dev.json
  echo   \"IMAGESDIR\": \"$ss_url/images/\",                           >> ../config/env/dev.json
  echo   \"GLOBAL_CSS\": \"styles/SSGlobalStyles.css\",                >> ../config/env/dev.json
  echo   \"LOG_LEVEL\": \"SSLogError \| SSLogSystem \| SSLogShift\"    >> ../config/env/dev.json
  echo }                                                               >> ../config/env/dev.json
  
  echo {                                                                > ../config/env/sandalphon.json
  echo   \"SERVER\": \"$ss_url/\",                                     >> ../config/env/sandalphon.json
  echo   \"SPACEDIR\": \"$ss_url/spaces/\",                            >> ../config/env/sandalphon.json
  echo   \"IMAGESDIR\": \"$ss_url/images/\",                           >> ../config/env/sandalphon.json
  echo   \"GLOBAL_CSS\": \"styles/SSGlobalStyles.css\",                >> ../config/env/sandalphon.json
  echo   \"LOG_LEVEL\": \"SSLogError \| SSLogSandalphon\",             >> ../config/env/sandalphon.json
  echo   \"VARS\": {                                                   >> ../config/env/sandalphon.json
  echo     \"SandalphonToolMode\": true                                >> ../config/env/sandalphon.json
  echo    }                                                            >> ../config/env/sandalphon.json
  echo }                                                               >> ../config/env/sandalphon.json
fi

python ../builder/corebuilder.py
chmod a+w ../client/compiledViews
chmod a+w ../builds
