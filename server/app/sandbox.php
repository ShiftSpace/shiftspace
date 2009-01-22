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
    $default = json_decode($_REQUEST['default']);
    
    if (!empty($value))
      return $value->value;
    else
      return $default->$key;
  }
  
  function setvalue() {
    $key = $_REQUEST['key'];
    $sandboxObject = new Sandbox_Object();
    
    $this->server->db->row("select * from sandbox where key=:key", array('key' => $key), PDO::FETCH_INTO, $sandboxObject);
    if (empty($sandboxObject->id)) {
      echo "yyy\n";
      $sandboxObject = new Sandbox_Object();
    }
    else echo "xxx\n";
    
    $sandboxObject->set(array(
      'key' => $_REQUEST['key'],
      'value' => $_REQUEST['value']
    ));
    
    $this->server->db->save($sandboxObject);
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
