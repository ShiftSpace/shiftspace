<?php

/*
 * Database_PDO
 * http://phiffer.org/svn/homebrew/database/database_pdo.php
 *
 * A PDO database handler, used as a subordinate to a Database object.
 *
 * Release 01 / June 2006
 * By Dan Phiffer (dan@phiffer.org)
 */

class Database_PDO {
    
    /**
     * Database_PDO::Database_PDO
     *
     * Opens a PDO database.
     */
    function Database_PDO($dsn) {
        try {
            $this->conn = new PDO($dsn);
            $this->type = substr($dsn, 0, strpos($dsn, ':'));
        } catch (PDOException $e) {
            trigger_error($e->getMessage());
        }
    }
    
    /**
     * Database_PDO::setup
     *
     * Initializes a new database, if it hasn't already been configured.
     */
    function setup($sql) {
        $queries = $this->parent->split_queries($sql);
        //print_r($queries);
        foreach ($queries as $query) {
            try {
                $this->conn->query($query);
            } catch (PDOException $e) {
                trigger_error($e->getMessage() . " ($sql)");
            }
        }
    }
    
    /**
     * Database_PDO::query
     *
     * Executes a SQL query and returns an array of row result objects.
     */
    function query($sql) {
        try {
            $result = $this->conn->query($sql);
            $rows = array();
            
            if (!empty($result)) {
                foreach ($result as $row) {
                    $obj = new stdClass();
                    foreach ($row as $col => $value) {
                        if (!is_numeric($col)) {
                            $obj->$col = $value;
                        }
                    }
                    $rows[] = $obj;
                }
            }
            
            
        } catch (PDOException $e) {
            trigger_error($e->getMessage() . " ($sql)");
        }
        
        return $rows;
    }
    
    /**
     * Database_PDO::tables
     *
     * Returns an array of database table names.
     */
    function tables() {
        if ($this->type == 'sqlite' || $this->type == 'sqlite2') {
            $sql = "
                SELECT name
                FROM sqlite_master
                WHERE type = 'table'
            ";
        } else if ($this->type == 'mysql') {
            $sql = "
                SHOW TABLES
            ";
        }
        
        return $this->parent->column($sql);
    }
    
    /**
     * Database_PDO::columns
     *
     * Returns an associative array of columns and their types (name => type)
     * for a particular database table.
     */
    function columns($table) {
        
        if ($this->type == 'sqlite' || $this->type == 'sqlite2') {
            $sql = $this->parent->value("
                SELECT sql
                FROM sqlite_master
                WHERE type = 'table'
                AND name = '$table'
            ");
            
            preg_match('/\((.+)\)/', $sql, $matches);
            list(, $columns) = $matches;
            $columns = explode(',', $columns);
            
            $column_ids = array();
            foreach ($columns as $column) {
                preg_match('/(\w+)/', $column, $matches);
                $column_ids[] = $matches[1];
            }
            return $column_ids;
        } else if ($this->type == 'mysql') {
            return $this->parent->column("
                DESCRIBE $table
            ");
        }
    }
    
    /**
     * Database_PDO::insert_id
     *
     * Returns the last row ID of an INSERT query.
     */
    function insert_id() {
        return $this->conn->lastInsertId();
    }
    
    /**
     * Database_PDO::escape
     *
     * Escapes a value for inclusion in a SQL command. Prevents SQL injection
     * attacks.
     */
    function escape($value) {
        return substr($this->conn->quote($value), 1, -1);
    }
    
}

?>
