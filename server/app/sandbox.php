<?php

class Sandbox_Object extends Base_Object {
}

class Sandbox {
  public function __construct($server) {
    $this->server = $server;
  }
  
  function getvalue() {
    $key = $_REQUEST['key'];
    $value = $this->server->db->row("select value from sandbox where key=:key", array('key' => $key));
    
    if (!empty($value))
      return $value->value;
    else
      return new Response();
  }
  
  function setvalue() {
    $key = $_REQUEST['key'];
    $sandboxObject = new Sandbox_Object();
    
    $sandboxObject = $this->server->db->row("select * from sandbox where key=:key", array('key' => $key));
    $saveObject = new Sandbox_Object();
    
    $saveObject->set(array(
      'key' => $_REQUEST['key'],
      'value' => $_REQUEST['value']
    ));

    if (!empty($sandboxObject->id)) {
      $saveObject->set('id', $sandboxObject->id);
    }
    
    $this->server->db->save($saveObject);
  }
  
  function proxy() {
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
    $response = curl_exec($ch);
    curl_close($ch);
    
    return new Response($response);
  }
}

?>
