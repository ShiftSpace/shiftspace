cd tmp
cd deps/CherryPy-3.1.2
python setup.py install
cd ../Routes-1.10.3
python setup.py install
cd ../httplib2-dev
python setup.py install
cd ../simplejson-2.0.9
python setup.py install
cd ../CouchDB-0.8
python setup.py install
cd ../Mako-0.2.5
python setup.py install
cd ../../
mv deps/couchdb-lucene ../server/
mv deps/NaturalDocs-1.4 ../externals/
chmod u+x ../externals/NaturalDocs-1.4/NaturalDocs
