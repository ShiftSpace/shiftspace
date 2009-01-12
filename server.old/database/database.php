<?php

/*
 * Database
 * http://phiffer.org/svn/homebrew/database/database.php
 *
 * An object-oriented abstraction of a relational database. Provides a common
 * interface to specific database platforms.
 *
 * Release 01 / June 2006
 * By Dan Phiffer (dan@phiffer.org)
 */

class Database {
    
    // A subordinate object that handles platform-specific database queries
    var $handler;
    
    /*
     * Database::Database
     *
     * Initializes the handler object based on a DSN. Mimicks the behavior of
     * the PEAR DB DSN. If a second argument is provided and the database has
     * not been initialized, SQL commands are read from the file specified to
     * initialize the database.
     */
    function Database($dsn) {
        
        // Determine handler source file
        $cwd = dirname(__FILE__);
        $handler_type = substr($dsn, 0, strpos($dsn, ':'));
        $handler_filename = "$cwd/$handler_type.php";
        
        // Handler doesn't exist
        if (!file_exists($handler_filename)) {
            trigger_error("No '$handler_type' database handler exists.");
            return false;
        }
        
        $this->type = $handler_type;
        
        // Create handler and pass it the rest of the DSN
        require_once $handler_filename;
        $handler_config = substr($dsn, strpos($dsn, ':') + 3);
        $handler_class = "Database_$handler_type";
        $this->handler = new $handler_class($handler_config);
        $this->handler->parent =& $this;
        if (!empty($this->handler->pdo)) {
            $this->handler->pdo->parent =& $this;
        }
        
    }
    
    
    /*
     * Database::setup
     *
     * Executes a series of SQL commands, contained within the $filename
     * parameter. An optional second parameter can be used to pass template
     * variables. See the Template module for more information.
     */
    function setup($filename, $vars = null) {
        if (is_array($vars)) {
            $dir = dirname(__FILE__);
            require_once "$dir/../template/template.php";
            $template = new Template(file_get_contents($filename));
            $sql = $template->evaluate($vars);
        } else {
            $sql = file_get_contents($filename);
        }
        $this->handler->setup($sql);
    }
    
    /*
     * Database::query
     *
     * Executes a SQL query and returns either an array of objects, as in the
     * Database::rows method, or the new row ID if the query was an INSERT.
     */
    function query($sql) {
        $rows = $this->handler->query($sql);
        $insert_id = $this->insert_id();
        if ($insert_id != 0) {
            return $insert_id;
        } else {
            return $rows;
        }
    }
    
    
    /*
     * Database::rows
     *
     * Executes a SQL query and returns an array of objects, each corresponding
     * to a row result.
     */
    function rows($sql) {
        return $this->handler->query($sql);
    }
    
    
    /*
     * Database::row
     *
     * Executes a SQL query and returns either an object (representing a row
     * result) or null, depending on whether the query yielded a result.
     */
    function row($sql) {
        $rows = $this->handler->query($sql);
        if (empty($rows)) {
            return null;
        }
        return $rows[0];
    }
    
    
    /*
     * Database::column
     *
     * Executes a SQL query and returns an array of values corresponding to the
     * first column of results.
     */
    function column($sql) {
        
        $rows = $this->handler->query($sql);
        
        if (empty($rows)) {
            return array();
        }
        
        $columns = array_keys(get_object_vars($rows[0]));
        $key = array_shift($columns);
        
        $column = array();
        foreach ($rows as $row) {
            $column[] = $row->$key;
        }
        
        return $column;
    }
    
    
    /*
     * Database::assoc
     *
     * Executes a SQL query and returns an associative array, corresponding to
     * the first column of results keying the second column.
     */
    function assoc($sql, $multiple_values = false) {
        
        $rows = $this->handler->query($sql);
        
        if (empty($rows)) {
            return array();
        }
        
        $columns = array_keys(get_object_vars($rows[0]));
        $key = array_shift($columns);
        $value = array_shift($columns);
        
        $assoc = array();
        if (!$multiple_values) {
            foreach ($rows as $row) {
                $assoc[$row->$key] = $row->$value;
            }
        } else {
            foreach ($rows as $row) {
                $assoc[$row->$key] = $rows[0];
            }
        }
        return $assoc;
    }
    
    
    /*
     * Database::value
     *
     * Executes a SQL query and returns the value of the first column of the
     * first row of results, or null if no results are yielded.
     */
    function value($sql) {
        $rows = $this->handler->query($sql);
        if (!empty($rows)) {
            return array_pop(get_object_vars($rows[0]));
        } else {
            return null;
        }
    }
    
    /*
     * Database::tables
     *
     * Returns an array of table names in the database.
     */
    function tables() {
        return $this->handler->tables();
    }
    
    /*
     * Database::columns
     *
     * Returns an associative array of columns and their types (name => type)
     * for a particular database table.
     */
    function columns($table) {
        return $this->handler->columns($table);
    }
    
    /*
     * Database::insert_id
     *
     * Returns the last row ID of an INSERT query.
     */
    function insert_id() {
        return $this->handler->insert_id();
    }
    
    /*
     * Database::escape
     *
     * Escapes a value for inclusion in a SQL command. Prevents SQL injection
     * attacks.
     */
    function escape($value) {
        if (ini_get('magic_quotes_gpc')) {
            if (is_array($value)) {
                $newValue = array();
                foreach ($value as $key => $val) {
                    $newValue[$key] = stripslashes($val);
                }
                $value = $newValue;
            } else {
                $value = stripslashes($value);
            }
        }
        if (is_array($value)) {
            $escaped = array();
            foreach ($value as $key => $val) {
                $escaped[$key] = $this->handler->escape($val);
            }
            return $escaped;
        } else {
            return $this->handler->escape($value);
        }
    }
    
    /*
     * Database::split_queries
     *
     * Returns an array of individual SQL queries from a semicolon-separated
     * set of multiple queries.
     */
    function split_queries($sql) {
        
        $paren_level = 0;
        $splits = array();
        $queries = array();
        for ($i = 0; $i < strlen($sql); $i++) {
            $char = substr($sql, $i, 1);
            switch($char) {
                case '(':
                    $paren_level++;
                    break;
                case ')':
                    $paren_level--;
                    break;
                case ';':
                    if ($paren_level == 0) {
                        $splits[] = $i;
                    }
                    break;
            }
        }
        
        $last = 0;
        foreach ($splits as $pos) {
            if ($last != 0) {
                $start = $last + 1;
            } else {
                $start = 0;
            }
            $queries[] = substr($sql, $start, $pos - $last);
            $last = $pos;
        }
        
        return $queries;
    }
    
}

?>
