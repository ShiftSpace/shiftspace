<?php

class Response {
  static private $current;
  private $data;
  private $resources = array();
  private $error = false;
  
  public function __construct($data = false, $error = false) {
    if (!empty($data)) {
      $this->data = $data;
    }
    
    if (!empty($error)) {
      $this->error = array('message' => $error);
    }
    
    if (!isset(self::$current)) {
      self::$current = $this;
    }
  }
  
  static public function currentResponse() {
    if (empty(self::$current)) {
      self::$current = new Response();
    }
    return self::$current;
  }
  
  public function __toString() {
    $response = array();
    if (!empty($this->data)) {
      $response['data'] = $this->data;
    }
    if (!empty($this->resources)) {
      $response['resources'] = $this->resources;
    }
    if (!empty($this->error)) {
      if (!empty($_REQUEST['debug'])) {
        $response['error'] = $this->error;
      } else {
        $response['error'] = array(
          'message' => $this->error['message']
        );
      }
      if (isset($_GET['debug'])) {
        setcookie('debug', $_GET['debug']);
      }
    }
    if (empty($response)) {
      $response['data'] = 'ok';
    }
    return json_encode($response);
  }
  
  public function getData() {
    return $this->data;
  }
  
  public function getResource($name) {
    return $this->resources[$name];
  }
  
  public function addResource($name, $value) {
    $this->resources[$name] = new Response($value);
  }
  
  public function handleError($error) {
    if (empty($error->resource)) {
      $this->error = array(
        'message' =>  $error->getMessage(),
        'filename' => $error->getFile(),
        'line' =>     $error->getLine(),
        'trace' =>    $error->getTraceAsString()
      );
    } else {
      $resource = $error->resource;
      $error->resource = false;
      $this->resources[$resource]->handleError($error);
    }
  }
  
}

?>
