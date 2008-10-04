<?php

$localurl = $_POST['url'];

$originalHeaders = apache_request_headers();

$headers = array();

// copy over basic auth header
if($originalHeaders['Authorization'])
{
  $headers[] = 'Authorization: ' . $originalHeaders['Authorization'];
}

// determine whether GET or POST
$postRequest = true;
if (empty($_POST['url'])) 
{
  if (empty($_GET['url']))
  {
    exit;
  }
  else
  {
    $postRequest = false; // A get request
    $localurl = $_GET['url'];
  }
}

// create the parameter string
$parametersJSON = $_REQUEST['parameters'];
if($parametersJSON)
{
  $params = json_decode($parametersJSON);
  $tempArray = array();
  foreach($params as $key => $value)
  {
    if($key != 'requestMethod' && $key != 'url') $tempArray[] = $key . '=' . $value;
  }
  $parameterString = implode($tempArray, '&');
}

// set up curl
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $localurl);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

// a post request
/*
if($postRequest)
{
  // convert the keys to a param string
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $paramString); // concat the string yourself
}
*/

curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
echo curl_exec($ch);
curl_close($ch);

?>
