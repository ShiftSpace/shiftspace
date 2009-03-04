<?php

class PDO_Store extends Base_Store {
  protected $logQuery = true;
  
  protected $conn;
  protected $activeTransaction = false;

  public $joinData = array();
  
  function __construct($config) {
    $this->config = $config;
    
    $dsn = $this->get('dsn');
    $username = empty($config['username']) ? null : $config['username'];
    $password = empty($config['password']) ? null : $config['password'];
    try {
      $this->conn = new PDO($dsn, $username, $password);
    } catch (PDOException $e) {
      throw new Exception('Database error: ' . $e->getMessage());
    }
    $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $this->setup();
  }
  
  
  function setup() {
    foreach ($this->config as $key => $value) {
      if (preg_match('/^vars:(\w+)$/', $key, $matches)) {
        list(, $table) = $matches;
        $this->setupTable($table, $value);
      }
    }
    $this->saveSetupConfig();
  }
  
  
  function load($options, $value = false) {    
    $regex = '/^(\w+)\((.+)\)$/';
    if (is_string($options) && preg_match($regex, $options, $matches)) {
      $options = array(
        'table' => $matches[1],
        'value' => $matches[2]
      );
    } else if (is_string($options) && !empty($value)) {
      $options = array(
        'table' => $options,
        'value' => $value
      );
    }
    
    if (empty($options['table'])) {
      return false;
    }
    
    $defaults = array(
      'key' => 'id',
      'sql' => "SELECT '{class}', * FROM {table} WHERE {key} = :value",
      '_store' => $this,
      'class' => "{$options['table']}_Object"
    );
    $options = array_merge($defaults, $options);
    
    $sql = $this->substitute($options['sql'], $options);
    $values = array();
    
    if (preg_match_all('/:(\w+)/', $sql, $matches)) {
      foreach ($matches[1] as $key) {
        if (isset($options[$key])) {
          $values[$key] = $options[$key];
        }
      }
    }
    
    $fetchStyle = PDO::FETCH_CLASS | PDO::FETCH_CLASSTYPE;
    $result = $this->row($sql, $values, $fetchStyle);

    // SQLite3 does not support PDO::FETCH_CLASS properly - http://www.sitepoint.com/forums/showthread.php?t=528019
    // This hack should make it work.
    if (is_array($result)) {
      $correctResult = new $options['class'];
      $correctResult->set($result);
      return $correctResult;
    }

    return $result;
  }
  
  public function save(&$object) {
    $vars = $object->get();
    
    // there must be a cool one-line thing that does this
    foreach ($vars as $key => $value)
      if (!isset($value) || $value == null)
        $vars[$key] = 'NULL';
        
    $table = strtolower(substr(get_class($object), 0, -7));
    $values = array();
    if (!isset($object->id)) {
      $columns = implode(', ', array_keys($vars));
      foreach ($vars as $key => $value) {
        $values[] = ":$key";
      }
      $values = implode(', ', $values);
      $template = "INSERT INTO $table ($columns) VALUES ($values)";
    } else {
      foreach ($vars as $key => $value) {
        $values[] = "$key = :$key";
      }
      $values = implode(', ', $values);
      $template = "UPDATE $table SET $values WHERE id = :id";
    }
    
    $this->query($template, $vars);
    $object->set('id', $this->lastInsertId);
  }
  
  
  /*
    Method: query
    Prepares and executes a SQL query
    
    Arguments:
      $sql  - A SQL query to execute [string].
      $vars - (optional) Variables used for substitution in a prepared SQL
              statement [array].
    
    Returns:
      A PDOStatement object resulting from the query.
  */
  public function query($sql, $vars = null) {
    $this->logQuery($sql, $vars);
  
    $query = $this->prepare($sql);
    try {
      // bug with false boolean value: http://pecl.php.net/bugs/bug.php?id=8298
      if ($vars) {
        foreach ($vars as $key => &$value) {
          if ($value == false)
            $value = 0;
        }
      }

      $query->execute($vars);
    } catch (PDOException $e) {
      if ($this->activeTransaction) {
        $this->rollBack();
      }
      throw new Exception($e->getMessage());
    }
    
    $insertId = $this->conn->lastInsertId();
    if (empty($this->lastInsertId) ||
        $insertId != $this->lastInsertId) {
      $this->lastInsertId = $insertId;
      $query->insertId = $insertId;
    }

    return $query;
  }
  
  
  /*
    Method: prepare
    Prepares a SQL query
    
    Arguments:
      $sql  - A SQL query to prepare [string].
    
    Returns:
      A PDOStatement object prepared for the query.
  */
  public function prepare($sql) {
    if (empty($this->conn)) {
      throw new Exception("No RelationalDB connection available.");
    }
    return $this->conn->prepare($sql);
  }
  
  
  /*
    Method: rows
    Executes a query and returns the results
    
    Arguments:
      $sql   - A SQL query to execute [string]
      $vars  - (optional) Variables used for substitution in a prepared SQL
               statement [array].
      $style - (optional) Specifies how the results should be encoded. See the
               documentation for PDOStatement_fetch for more details [integer].
    
    Returns:
      An array of results (anonymous objects by default).
  */
  function rows($sql, $vars = null, $style = PDO::FETCH_OBJ) {
    $query = $this->query($sql, $vars);
    return $query->fetchAll($style);
  }
  
  
  /*
    Method: row
    Executes a query and returns the first row from the results
    
    Arguments:
      $sql   - A SQL query to execute [string]
      $vars  - (optional) Variables used for substitution in a prepared SQL
               statement [array].
      $style - (optional) Specifies how the results should be encoded. See the
               documentation for PDOStatement_fetch for more details [integer].
    
    Returns:
      A single row result from the query. Encoded as an anonymous object by
      default, but varies according to the $style parameter.
  */
  public function row($sql, $vars = null, $style = PDO::FETCH_OBJ, $intoObj = null) {
    $query = $this->query($sql, $vars);
    $result = $query->fetch($style, $intoObj);
    return $result;
  }
  
  
  /*
    Method: value
    Executes a query and returns the first column from the first row of the
    results
    
    Arguments:
      $sql   - A SQL query to execute [string]
      $vars  - (optional) Variables used for substitution in a prepared SQL
               statement [array].
      
    Returns:
      A single value from the query [string].
  */
  public function value($sql, $vars = null) {
    $query = $this->query($sql, $vars);
    $row = $query->fetch(PDO::FETCH_NUM);
    if (count($row) < 1) {
      return null;
    }
    return $row[0];
  }
  
  
  /*
    Method: assoc
    Executes a query and returns an associative array from the first and second
    columns from the results
    
    Arguments:
      $sql  - A SQL query to execute [string]
      $vars - (optional) Variables used for substitution in a prepared SQL
               statement [array].
    
    Returns:
      An associative array of results from the query [array].
  */
  public function assoc($sql, $vars = null) {
    $query = $this->query($sql, $vars);
    $assoc = array();
    while ($row = $query->fetch(PDO::FETCH_NUM)) {
      if (count($row) < 2) {
        return null;
      }
      $assoc[$row[0]] = $row[1];
    }
    return $assoc;
  }
  
  
  /*
    Method: column
    Executes a query and returns the first column from the results
    
    Arguments:
      $sql  - A SQL query to execute [string]
      $vars - (optional) Variables used for substitution in a prepared SQL
               statement [array].
    
    Returns:
      A column of results from the query [array].
  */
  public function column($sql, $vars = null) {
    $query = $this->query($sql, $vars);
    return $query->fetchAll(PDO::FETCH_COLUMN);
  }
  
  
  /*
    Method: escape
    Escapes a string to defend against SQL injection
    
    Arguments:
      $value - A value or an array of values to escape [string or array].
    
    Returns
      An escaped version of the string [string].
  */
  function escape($value) {
    if (is_array($value)) {
      $escaped = array();
      foreach ($value as $key => $val) {
        $escaped[$key] = $this->escape($val);
      }
      return $escaped;
    } else if (is_scalar($value)) {
      return substr($this->conn->quote($value), 1, -1);
    } else {
      return null;
    }
  }
  
  
  /*
    Method: beginTransation
    Delays subsequent queries until executed with <commit>
    
    Arguments:
      None.
    
    Returns:
      Nothing.
    
    See also:
      <commit>, <rollback>
  */
  function beginTransaction() {
    $this->conn->beginTransaction();
    $this->activeTransaction = true;
  }
  
  
  /*
    Method: commit
    Commits pending queries from the current transaction
    
    Arguments:
      None.
    
    Returns:
      Nothing.
      
    See also:
      <beginTransaction>, <rollback>
  */
  function commit() {
    $this->conn->commit();
    $this->activeTransaction = false;
  }
  
  
  /*
    Method: rollBack
    Cancels pending queries and ends the current transaction
    
    Arguments:
      None.
    
    Returns:
      Nothing.
      
    See also:
      <beginTransaction>, <commit>
  */
  public function rollBack() {
    $this->conn->rollBack();
    $this->activeTransaction = false;
  }
  
  
  protected function getSequence() {
    $variations = array(
      'mysql' => 'BIGINT PRIMARY KEY NOT NULL AUTO_INCREMENT',
      'pgsql' => 'SERIAL NOT NULL',
      'sqlite' => 'INTEGER PRIMARY KEY AUTOINCREMENT'
    );
    $driver = $this->config['driver'];
    if (!empty($variations[$driver])) {
      return $variations[$driver];
    } else {
      return false;
    }
  }
  
  
  // Takes an associative array of configuration options and returns a PDO DSN.
  protected function getDSN() {
    if (is_array($this->config)) {
      extract($this->config);
    } else if (is_string($this->config)) {
      return $this->config;
    } else {
      throw new Exception('PDO: Invalid configuration.');
    }
    
    if (empty($driver)) {
      throw new Exception("PDO: No database driver specified.");
    }
    
    $dsn = "$driver:";
    switch ($driver) {
      case 'mysql':
        $vars = array('host', 'dbname', 'port', 'unix_socket');
        $separator = ';';
        break;
      case 'pgsql':
        $vars = array('host', 'user', 'password', 'dbname', 'port');
        $separator = ' ';
        break;
      case 'sqlite':
      case 'sqlite2':
        $vars = array();
        $separator = '';
        if (!empty($memory)) {
          $dsn .= ":memory:";
        } else {
          $dsn .= BASE_DIR . "/$path";
        }
        break;
      default:
        throw new Exception("PDO: Unknown database driver '$driver'.");
        break;
    }
    
    $options = array();
    foreach ($vars as $var) {
      if (!empty($$var)) {
        $options[] = "$var={$$var}";
      }
    }
    $dsn .= implode($separator, $options);
    return $dsn;
  }
  
  protected function setupTable($table, $vars) {  
    $types = array(
      'table' =>      $table,
      'sequence' =>   $this->get('sequence'),
      'binary' =>     'BLOB',
      'boolean' =>    'TINYINT(1)',
      'date' =>       'DATE',
      'datetime' =>   'DATETIME',
      'decimal' =>    'DECIMAL',
      'float' =>      'FLOAT',
      'integer' =>    'INT(11)',
      'string' =>     'VARCHAR(255)',
      'text' =>       'TEXT',
      'time' =>       'TIME',
      'timestamp' =>  'TIMESTAMP'
    );

    $columns = array();
    
    $this->joinData[$table] = array();    
    foreach ($vars as $name => $type) {
      $n = 'link to ';
      if (substr($type, 0, strlen($n)) == $n) {
        $linkData = split('\.', substr($type, strlen($n)));
      
        $this->joinData[$table][$name] = $linkData;
        $type = 'integer';
      }

      $columns[] = "  $name {{$type}}";
    }

    if (empty($this->config['setup'])) {
      // actually create table
      $template = $this->get('createTable', $columns);
      $query = $this->substitute($template, $types);
      $this->logQuery($query, null);
      $this->query($query);
    }
  }
  
  protected function getCreateTable($columns) {
    $columns = implode(",\n", $columns);
    return "\nCREATE TABLE IF NOT EXISTS {table} (\n$columns\n)\n";
  }

  protected function logQuery($sql, $vars) {
    if ($this->logQuery) {
      $f = fopen(dirname(__FILE__)."/../../working/query.log", "a");
      fwrite($f, "Query: $sql\n");
      fwrite($f, "Vars: ".print_r($vars, true)."\n\n");
      fwrite($f, "=====\n\n");
      fflush($f);
      fclose($f);
    }
  }
}

?>
