<?php

/*
 * Database_SQLite
 * http://phiffer.org/svn/homebrew/database/database_sqlite.php
 *
 * A SQLite database handler, used as a subordinate to a Database object.
 *
 * Release 01 / June 2006
 * By Dan Phiffer (dan@phiffer.org)
 */

class Database_SQLite {
    
    /**
     * Database_SQLite::Database_SQLite
     *
     * Opens a SQLite database.
     */
    function Database_SQLite($dsn) {
        
        if (file_exists($dsn)) {
            
            if (function_exists('sqlite_open')) {
                // Test to see if database is from SQLite version 2
                $this->conn = @sqlite_open($dsn);
            }
            
            if (!is_resource($this->conn) && class_exists('PDO')) {
                
                $dir = dirname(__FILE__);
                require_once "$dir/pdo.php";
                
                try {
                    $this->pdo = new Database_PDO("sqlite:$dsn");
                } catch (Exception $e) {
                    try {
                        $this->pdo = new Database_PDO("sqlite2:$dsn");
                    } catch (Exception $e) {
                        trigger_error($e);
                        return;
                    }
                }
                
            }
        } else {
            
            $this->_empty_database = true;
            
            if (class_exists('PDO')) {
                
                $pdo_drivers = PDO::getAvailableDrivers();
                
                if (in_array('sqlite', $pdo_drivers)) {
                    $dir = dirname(__FILE__);
                    require_once "$dir/pdo.php";
                    $this->pdo = new Database_PDO("sqlite:$dsn");
                } else {
                    $this->conn = sqlite_open($dsn);
                }
                
            }
            
        }
            
    }
    
    /**
     * Database_SQLite::setup
     *
     * Initializes a new database, if it hasn't already been configured.
     */
    function setup($sql) {
        if (empty($this->pdo)) {
            sqlite_query($sql, $this->conn);
        } else {
            $this->pdo->parent = $this->parent;
            $this->pdo->setup($sql);
        }
    }
    
    /**
     * Database_SQLite::query
     *
     * Executes a SQL query and returns an array of row result objects.
     */
    function query($sql) {
        
        if (!empty($this->pdo)) {
            return $this->pdo->query($sql);
        }
        
        $result = sqlite_query($sql, $this->conn);
        $rows = array();
        
        if (is_resource($result)) {
            while ($row = sqlite_fetch_object($result)) {
                foreach (get_object_vars($row) as $key => $value) {
                    if (preg_match('/[\w_]+\.(.+)/', $key, $matches)) {
                        list(, $column_name) = $matches;
                        $row->$column_name = $value;
                    }
                }
                $rows[] = $row;
            }
        }
        
        $error = sqlite_last_error($this->conn);
        if (!empty($error)) {
            trigger_error("$error ($sql)");
        }
        
        return $rows;
    }
    
    /**
     * Database_SQLite::tables
     *
     * Returns an array of database table names.
     */
    function tables() {
        return $this->parent->column("
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
        ");
    }
    
    /**
     * Database_SQLite::columns
     *
     * Returns an associative array of columns and their types (name => type)
     * for a particular database table.
     */
    function columns($table) {
        if (!empty($this->pdo)) {
            return $this->pdo->columns($table);
        } else {
            return sqlite_fetch_column_types($table, $this->conn);
        }
    }
    
    /**
     * Database_SQLite::insert_id
     *
     * Returns the last row ID of an INSERT query.
     */
    function insert_id() {
        if (!empty($this->pdo)) {
            return $this->pdo->insert_id();
        } else {
            return sqlite_last_insert_rowid($this->conn);
        }
    }
    
    /**
     * Database_SQLite::escape
     *
     * Escapes a value for inclusion in a SQL command. Prevents SQL injection
     * attacks.
     */
    function escape($value) {
        if (empty($this->pdo)) {
            return sqlite_escape_string($value);
        } else {
            return $this->pdo->escape($value);
        }
    }
    
    /**
     * Database_SQLite::translate_query
     *
     * Performs some rudimentary conversions to the SQLite-specific SQL syntax.
     */
    function translate_query($sql) {
        
        // Add AUTO_INCREMENT to INTEGER PRIMARY KEY columns
        $search = "
            /
                (
                    CREATE\s+TABLE\s+       # CREATE TABLE command
                    [\w_]+\s*               # Table name
                    \(                      # Open parenthesis
                    [^)]+?                  # Stop at close parenthesis
                )
                (
                    [\w_]+                  # Column name
                )
                \s+INTEGER\s+PRIMARY\s+KEY  # Type INTEGER PRIMARY KEY
            /misx
        ";
        $replace = '$1$2 INTEGER PRIMARY KEY AUTOINCREMENT';
        $sql = preg_replace($search, $replace, $sql);
        return $sql;
        
    }
    
}

?>
