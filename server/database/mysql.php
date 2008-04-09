<?php

/*
 * Database_MySQL
 * http://phiffer.org/svn/homebrew/database/database_mysql.php
 *
 * A MySQL database handler, used as a subordinate to a Database object.
 *
 * Release 01 / June 2006
 * By Dan Phiffer (dan@phiffer.org)
 */

class Database_MySQL {
    
    /**
     * Database_MySQL::Database_MySQL
     *
     * Opens a MySQL database connection.
     */
    function Database_MySQL($dsn) {
        list($auth, $target) = explode('@', $dsn);
        list($username, $password) = explode(':', $auth);
        list($host, $database) = explode('/', $target);
        $this->conn = mysql_connect($host, $username, $password);
        mysql_select_db($database, $this->conn);
    }
    
    /**
     * Database_MySQL::setup
     *
     * Initializes a new database, if it hasn't already been configured.
     */
    function setup($sql) {
        $queries = $this->parent->split_queries($sql);
        foreach ($queries as $query) {
            $query = $this->translate_query($query);
            mysql_query($query, $this->conn);
            $error = mysql_error();
            if (!empty($error)) {
                trigger_error("$error ($query)");
            }
        }
    }
    
    /**
     * Database_MySQL::query
     *
     * Executes a SQL query and returns an array of row result objects.
     */
    function query($sql) {
        $result = mysql_query($sql, $this->conn);
        $rows = array();
        if (mysql_error()) {
            trigger_error(mysql_error());
            return;
        }
        
        $last_id = mysql_insert_id($this->conn);
        
        if (is_resource($result)) {
            while ($row = mysql_fetch_object($result)) {
                $rows[] = $row;
            }
        } else if (!empty($last_id)) {
            $rows = $last_id;
        }
        
        return $rows;
    }
    
    /**
     * Database_MySQL::tables
     *
     * Returns an array of database table names.
     */
    function tables() {
        return $this->parent->column("
            SHOW TABLES
        ");
    }
    
    /**
     * Database_MySQL::columns
     *
     * Returns an associative array of columns and their types (name => type)
     * for a particular database table.
     */
    function columns($table) {
        return $this->parent->assoc("
            DESCRIBE $table
        ");
    }
    
    /**
     * Database_MySQL::insert_id
     *
     * Returns the last row ID of an INSERT query.
     */
    function insert_id() {
        return mysql_insert_id();
    }
    
    /**
     * Database_MySQL::escape
     *
     * Escapes a value for inclusion in a SQL command. Prevents SQL injection
     * attacks.
     */
    function escape($value) {
        if (function_exists('mysql_real_escape_string')) {
            return mysql_real_escape_string($value);
        } else {
            return mysql_escape_string($value);
        }
    }
    
    
    /**
     * Database_MySQL::translate_query
     *
     * Performs some rudimentary conversions to the MySQL-specific SQL syntax.
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
        $replace = '$1$2 INTEGER UNSIGNED AUTO_INCREMENT PRIMARY KEY';
        $sql = preg_replace($search, $replace, $sql);
        return $sql;
        
    }
    
}

?>
