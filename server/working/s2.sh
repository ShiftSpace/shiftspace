#!/bin/bash


curl http://localhost/shiftspacegit/server/index.php?method=version

#mv moma.sqlite3 moma_.sqlite3
#rm server.ini

tables=`echo .dump | sqlite3 moma_.sqlite3 | grep CREATE | sed s/"CREATE TABLE "//g | sed s/" (.*"//g | sed s/'"'//g`
#echo Tables: $tables
#echo

dump=`echo .dump | sqlite3 moma_.sqlite3 | grep INSERT`


# | sed s/'"savedartwork"'/'"savedartwork" (a, b)'/`

for table in $tables; do 
  # start generating a file of sqlite3 commands
  echo > convertdb.tmp
  echo .mode csv >> convertdb.tmp
  echo .header on >> convertdb.tmp
  echo select \* from $table\; >> convertdb.tmp
  gensql=`cat convertdb.tmp | sqlite3 moma_.sqlite3 | head -n 1`
  cmd='sed s/"'$table'"/"'$table'"('$gensql')/g'
#  echo $cmd
  dump=`echo $dump | $cmd`
done;





echo $dump | sed 's/);/);\n/g' > convertdb.sql
./s3.sh

