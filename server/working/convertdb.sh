echo 'moma.sqlite3 was backed up as moma.sqlite3.bak'
cp moma.sqlite3 moma.sqlite3.bak
mv moma.sqlite3 moma_.sqlite3
rm -f server.ini

echo
echo
echo
echo '(1) *** please enter fissure and run version to generate a clean db with the new schema.'
echo '(1.5) sudo chmod a+w moma.sqlite3'
echo '(2) then run s2.sh'
echo '(3) if there are errors somehow (like a renamed column) fix the file convertdb.sql and run s3.sh (which actually runs cat convertdb.sql | sqlite3 moma.sqlte3)'
echo '    [you may safely ignore PRIMARY KEY errors]'
echo '(4) repeat (3) until there are no errors.'


