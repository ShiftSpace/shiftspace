echo 'moma.sqlite3 was backed up as moma.sqlite3.bak'
cp shiftspace.sqlite3 shiftspace.sqlite3.bak
mv shiftspace.sqlite3 shiftspace_.sqlite3
touch shiftspace.sqlite3
chmod a+w shiftspace.sqlite3
rm -f server.ini

echo 'If you are running this, you already have a new verison of server.ini, right?'
echo
echo '(1) ./s2.sh'
echo '(2) if there are errors somehow (like a renamed column) fix the file convertdb.sql and run s3.sh (which actually runs cat convertdb.sql | sqlite3 moma.sqlte3)'
echo '    [you may safely ignore PRIMARY KEY errors]'
echo '(3) repeat (2) until there are no errors.'


