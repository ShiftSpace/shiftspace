<?php

$dir = dirname(__FILE__);

class Artwork_Object extends Base_Object {}

function filter1($x) {
  return $x->width == 155 && $x->height == 170;
}

function filter2($x) {
  return $x->width == 165 && $x->height == 80;
}

class Artwork {
  public function __construct($server) {
    $this->server = $server;
  }

  public function store_artwork_by_id($artworkid) {
    Artwork::store_artwork(file_get_contents("http://moma.org/explore/collection/objects/$artworkid.json"));
  }
  
  public function store_artwork($jsonObject) {
    $momaObject = json_decode($jsonObject)->data;
    $ourData = new Artwork_Object();

    $thumbnail = array_values(array_filter($momaObject->collection_images[0]->collection_fullsize_image->thumbnails, 'filter1'));
    $setThumb  = array_values(array_filter($momaObject->collection_images[0]->collection_fullsize_image->thumbnails, 'filter2'));

    $ourData->_new = TRUE;  
    $ourData->id = $momaObject->objectid;
    $ourData->image = $thumbnail[0]->public_filename;
    $ourData->setimage = $setThumb[0]->public_filename;
    $ourData->artist = $momaObject->artistcredittext;
    $ourData->title = $momaObject->displaytitle;

    $ourData->year = $momaObject->datebegin;
    $ourData->datetext = $momaObject->datetext || 'unknown';
    $ourData->onview = $momaObject->onviewflag;
    $ourData->href = '/collection/object.php?object_id='.$momaObject->objectid;

    $this->server->moma->save($ourData);
    $ourData->_new = FALSE;
    $this->server->moma->save($ourData);
  }  

  public function store() {
    extract($_POST);
    $this->store_artwork($jsonObject);
  }
}

?>
