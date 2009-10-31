cd tmp
cd deps/CherryPy-3.1.2
python setup.py install
cd ../Routes-1.10.3
python setup.py install
cd ../httplib2-0.4.0
python setup.py install
cd ../simplejson-2.0.9
python setup.py install
cd ../CouchDB-0.6
python setup.py install
cd ../Mako-0.2.5
python setup.py install
cd ../../
mv deps/couchdb-lucene-0.4-jar-with-dependencies.jar ../server/
mv deps/NaturalDocs-1.4 ../externals/
chmod u+x ../externals/NaturalDocs-1.4/NaturalDocs