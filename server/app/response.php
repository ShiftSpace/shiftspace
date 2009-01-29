<?php

class Response {
  static private $current;
  private $data;
  private $resources = array();
  private $error = false;
  
  public function __construct($data = false) {
    if ($data !== false) {
      $this->data = $data;
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
    if (isset($this->data)) {
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
      if (isset($_REQUEST['debug'])) {
        setcookie('debug', $_REQUEST['debug']);
      }
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
