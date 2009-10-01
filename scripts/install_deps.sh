curl -O http://cloud.github.com/downloads/ShiftSpace/shiftspace/deps.zip
unzip deps
cd deps/CherryPy-3.1.2
sudo python setup.py install
cd ../Routes-1.10.3
sudo python setup.py install
cd ../httplib2-0.4.0
sudo python setup.py install
cd ../simplejson-2.0.9
sudo python setup.py install
cd ../CouchDB-0.6
sudo python setup.py install
cd ../../
cp deps/couchdb-lucene-0.4-jar-with-dependencies.jar server/
rm -rf deps
rm deps.zip