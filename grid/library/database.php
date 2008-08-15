<?php

/*
  Class: GridDatabase
  A wrapper class for the PDO database library
*/

class GridDatabase {
  
  protected $conn;
  protected $activeTransaction = false;
  
  /*
    Constructor: __construct
    The constructor for new GridDatabase objects
    
    Arguments:
      $config - (optional) Used to construct a PDO DSN for connecting to the
                database [array]. See <connect> for more details.
    
    Returns:
      Nothing.
    
    See also:
      <connect>
  */
  public function __construct($config = null) {
    if (!empty($config)) {
      $this->connect($config);
    }
  }
  
  
  /*
    Method: connect
    Establishes a connection to the database
   
    Arguments:
      $config - Used to construct a PDO DSN for connecting to the
                database. The following database drivers and configuration
                options are supported:
                  * mysql: host, username, password, dbname, unix_socket, port
                  * sqlite: path, memory [boolean]
                  * pgsql: host, user, password, dbname, port
    
    Returns:
      Nothing.
  */
  public function connect($config) {
    $this->config = $config;
    if (is_array($config)) {
      $dsn = $this->prepareDSN($config);
    } else if (is_string($config)) {
      $dsn = $config;
    } else {
      throw new Exception('Database could not be initiated.');
    }
    $username = empty($config['username']) ? null : $config['username'];
    $password = empty($config['password']) ? null : $config['password'];
    try {
      $this->conn = new PDO($dsn, $username, $password);
    } catch (PDOException $e) {
      throw new Exception('Database connection failed: ' . $e->getMessage());
    }
    $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
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
    $query = $this->prepare($sql);
    try {
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
      throw new Exception("No database connection available.");
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
  public function row($sql, $vars = null, $style = PDO::FETCH_OBJ) {
    $query = $this->query($sql, $vars);
    return $query->fetch($style);
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
  function rollBack() {
    $this->conn->rollBack();
    $this->activeTransaction = false;
  }
  
  // - - Protected helper methods - - - - - - - - - - - - - - - - - - - - - - -
  
  
  // Takes an associative array of configuration options and returns a PDO DSN.
  function prepareDSN($config) {
    extract($config);
    if (empty($driver)) {
      throw new Exception("No database driver specified.");
    }
    $dsn = "$driver:";
    switch ($driver) {
      case 'mysql':
        $vars = array('host', 'dbname', 'port', 'unix_socket');
        $separator = ';';
        break;
      case 'sqlite':
        $vars = array('path');
        if (!empty($memory)) {
          $dsn .= "memory:";
        }
        $separator = '';
        break;
      case 'pgsql':
        $vars = array('host', 'user', 'password', 'dbname', 'port');
        $separator = ' ';
        break;
      default:
        throw new Exception("Unknown database driver '$driver'.");
        break;
    }
    
    $config = array();
    foreach ($vars as $var) {
      if (!empty($$var)) {
        $config[] = "$var={$$var}";
      }
    }
    $dsn .= implode($separator, $config);
    
    return $dsn;
  }
  
}

?>
