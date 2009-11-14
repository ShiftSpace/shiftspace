<?php
/*
Utils for Shiftspace-lite. 
*/

function flatten($input) {
  $flattened = array();
  foreach ($input as $key => $value) {
    if (!is_scalar($value) && $key != 'content') {
      $nextKey = "";
      $values = flatten($value);
      foreach ($values as $k => $v) {
	$flattened[$key. "_" .$k] = $v;
      }
    } else {
      if($key == 'content') {
	$flattened[$key] = json_encode($value);
      } else {
	$flattened[$key] = $value;
      }
    }
  }
  return $flattened;
}

function unflatten ($input) {
  $result = array();
  foreach ($input as $key => $value) {
    $parts = explode("_", $key);
    if(count($parts) > 1) {
      $current = &$result;
      for($i = 0; $i < count($parts)-1; $i++) {
	$subkey = $parts[$i];
	$temp = array();
	if(!isset($current[$subkey])) {
	  $current[$subkey] = $temp;
	  $current = &$current[$subkey];
	} else {
	  $current = &$current[$subkey];
	}
	$subkey = $parts[$i+1];
      }
      $current[$subkey] = $value;
    } else {
      $result[$key] = $value;
    }	
  }
  return $result;
}
?>