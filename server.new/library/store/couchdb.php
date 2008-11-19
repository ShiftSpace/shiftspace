<?php

class CouchDB_Store extends Base_Store {
  
  public $config = array(
    'host' => 'localhost',
    'port' => '5984'
  );
  
  function __construct($config) {
    $this->config = array_merge($this->config, $config);
    if (!empty($this->config['database'])) {
      $this->database = $this->config['database'];
      if (empty($this->config['setup'])) {
        $this->setup();
      }
    }
  }
  
  public function setup() {
    if (!$this->databaseSelect($this->database)) {
      $this->databaseCreate($this->database);
    }
    $this->saveSetupConfig();
  }
  
  public function databaseList() {
    return json_decode($this->send('GET', '/_all_dbs'));
  }
  
  
  public function databaseCreate($database) {
    return json_decode($this->send('PUT', "/$database/"));
  }
  
  
  public function databaseDelete($database) {
    return json_decode($this->send('DELETE', "/$database/"));
  }
  
  
  public function databaseInfo($database = null) {
    if (empty($database) && empty($this->database)) {
      return false;
    } else if (empty($database)) {
      $database = $this->database;
    }
    return json_decode($this->send('GET', "/$database/"));
  }
  
  
  public function databaseSelect($database) {
    $info = $this->databaseInfo($database);
    if (!empty($info) && empty($info->error)) {
      $this->database = $database;
      return true;
    } else {
      return false;
    }
  }
  
  
  public function all() {
    if (empty($this->database)) {
      return false;
    }
    return json_decode($this->send('GET', "/$this->database/_all_docs"));
  }
  
  
  public function get($id) {
    if (empty($this->database)) {
      return false;
    }
    return json_decode($this->send('GET', "/$this->database/$id"));
  }
  
  
  public function put($id, $data) {
    if (empty($this->database)) {
      return false;
    }
    $encoded = json_encode($data);
    return json_decode($this->send('PUT', "/$this->database/$id", $encoded));
  }
  
  
  public function post($data) {
    if (empty($this->database)) {
      return false;
    }
    unset($data->_id);
    unset($data->_rev);
    $encoded = json_encode($data);
    return json_decode($this->send('POST', "/$this->database/", $encoded));
  }
  
  
  public function delete($id, $rev) {
    if (empty($this->database)) {
      return false;
    }
    return json_decode($this->send('DELETE', "/$this->database/$id?rev=$rev"));
  }
  
  
  public function view($options) {
    $query = $this->generateQueryString($options);
    if (!empty($options['map'])) {
      $data = array(
        'map' => $options['map']
      );
      if (!empty($reduce)) {
        $data['reduce'] = $options['reduce'];
      }
      $data = json_encode($data);
      return json_decode($this->send('POST', "/$this->database/_temp_view$query", $data));
    } else if (!empty($options['path'])) {
      return json_decode($this->send('POST', "/$this->database/{$options['path']}$query", $data));
    }
  }
  
  
  protected function generateQueryString($options) {
    $query = array();
    $encode = array('key', 'startkey', 'endkey');
    $scalar = array('startkey_docid', 'endkey_docid', 'count', 'skip');
    $boolean = array('update', 'descending', 'group');
    foreach ($options as $key => $value) {
      if (in_array($key, $encode)) {
        if (is_scalar($value) && !preg_match('/^".+"$/', $value)) {
          $value = "\"$value\"";
        } else if (!is_scalar($value)) {
          $value = json_encode($value);
        }
        $query[$key] = $value;
      } else if (in_array($key, $scalar)) {
        $query[$key] = $value;
      } else if (in_array($key, $boolean)) {
        if ($options[$key]) {
          $query[$key] = 'true';
        } else {
          $query[$key] = 'false';
        }
      }
    }
    if (empty($query)) {
      return '';
    } else {
      $queryString = '?';
      foreach ($query as $key => $value) {
        $queryString .= "$key=" . urlencode($value);
      }
      return $queryString;
    }
  }
  
  
  protected function send($method, $path, $data = NULL) {
    extract($this->config);
    $socket = @fsockopen($host, $port, $errno, $errstr);
    if (!$socket) {
      throw new Exception("CouchDB: $errstr ($errno)\n");
    }

    $request = "$method $path HTTP/1.0\r\nHost: $host\r\n";
    
    if ($data) {
      $length = strlen($data);
      $request .= "Content-Length: $length\r\n\r\n";
      $request .= "$data\r\n";
    } else {
      $request .= "\r\n";
    }
    
    fwrite($socket, $request);
    $response = "";
    while (!feof($socket)) {
      $response .= fgets($socket);
    }
    
    fclose($socket);
    
    list($this->headers, $this->body) = explode("\r\n\r\n", $response);
    return $this->body;
    
  }
  
}

?>
