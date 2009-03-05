<?php

function ctype_alpha2($str) {
  return $str == '' || ctype_alpha($str);
}

class Collections {
  public function __construct($server) {
    $this->server = $server;
  }

  function generate_join_clause($table) {
    $sql = '';
    $joinData = $this->server->moma->joinData[$table];
    
    if (!empty($joinData)) {
      foreach ($joinData as $column => $joins) {
        $joinTable = $joins[0];
        $joinColumn = $joins[1];
        $sql .= " JOIN $joinTable ON $column=$joinTable.$joinColumn";
      }
    }

    return $sql;
  }
  
  function generate_where_clause($constraints, $careful = false, $modify = false) {
    $sql = '';
    
    if ($modify) {
      $constraints['userid'] = $this->server->user['id'];
    }
    
    if (!empty($constraints)) {
      $sql .= " WHERE ";
      $first = false;
      
      foreach ($constraints as $column => $value) {
        if ($first) $sql .= " AND ";
        
        if (is_string($value)) {
          $value = mysql_real_escape_string($value);
          $value = "'$value'";
        }

        if (!ctype_alpha2(str_replace(array('.', '_'), '', $column)))
          throw new Error("1");
          
        $sql .= "$column = $value";
        $first = true;
      }
    }

    if ($sql == '' && $careful)
      return " ITS_NOT_A_GOOD_IDEA_TO_DELETE_YOUR_ENTIRE_TABLE";

    return $sql;
  }
  
  function generate_all_properties($table) {
    $joinData = $this->server->moma->joinData[$table];
    
    if (empty($joinData))
      return '*';
    else {
      foreach ($joinData as $column => $joins) {
        $sql .= $joins[0].'.*, ';
      }

      $sql .= "$table.*";
      
      return $sql;      
    }
  }
  
  function read($desc) {
    extract($desc);
        
    if ($properties == '*')
      $properties = $this->generate_all_properties($table);

    if (!ctype_alpha2(str_replace(array('*', '_', '.', ' ', ',', '(', ')'), '', $properties)))
      throw new Error("2");
    
    if (!ctype_alpha2($table))
      throw new Error("3");
    
    $sql = "SELECT $properties FROM $table";
    $sql .= $this->generate_join_clause($table);
    $sql .= $this->generate_where_clause($constraints);
    
    if (!empty($orderby)) {
      if ($orderby[0] == '>')
        $ascdesc = 'DESC';
      else if ($orderby[0] == '<')
        $ascdesc = 'ASC';
      else
        throw new Error('orderby first value must be "<" or ">"');  

      if (!ctype_alpha2(str_replace(array('.', '_'), '', $orderby[1])))
        throw new Error("4");

      $sql .= " ORDER BY $orderby[1] $ascdesc"; 
    }

    if (!empty($range)) {
      extract($range);

      if (!ctype_digit($count) || !ctype_digit($startIndex))
        throw new Error("5");

      $sql .= " LIMIT $count OFFSET $startIndex";
    }

    if (($pos = strpos($sql, '%')) !== false) {
      // special %column% form
      $endpos = strpos($sql, '%', $pos + 1);
      $columnIdent = substr($sql, $pos, $endpos + 1 - $pos);
      $column = substr($columnIdent, 1, -1);
      
      foreach ($this->lastResult as $idRow) {
        $newsql = str_replace("'$columnIdent'", $idRow->$column, $sql);
        $result[] = $this->server->moma->rows($newsql);
      }
      
      return $result;
    }  
    else {
      $rows = $this->server->moma->rows($sql);
      $this->lastResult = $rows;
      return $rows;
    }
  }
  
  function delete($desc) {
    extract($desc);

    if (!ctype_alpha2($table))
      throw new Error("6");
    
    $sql = "DELETE FROM $table";
    $sql .= $this->generate_where_clause($constraints, true, true);
    $query = $this->server->moma->query($sql);
    return $query->rowCount();    
  }

  function update($desc) {
    extract($desc);
    $result = 0;
    
    $values['modified'] = time();

    if (!ctype_alpha2($table))
      throw new Error("7");
    
    $sql = "UPDATE $table SET ";
   
    $valuesSql = array();
    foreach ($values as $key => $value) {
      if (!ctype_alpha2(str_replace(array('_', '.'), '', $key)))
        throw new Error("8");

      if (is_string($value))
        $value = "'".mysql_escape_string($value)."'";
        
      $valuesSql[] = "$key = $value";
    }
                 
    $sql .= implode(', ', $valuesSql);                                             
    $sql .= $this->generate_where_clause($constraints, false, true);
    
    $query = $this->server->moma->query($sql);
    $result = $query->rowCount();
    
    return $result;    
  }

  function create($desc) {
    extract($desc);

    if (!ctype_alpha2($table))
      throw new Error("9");
    
    $sql = "INSERT INTO $table ";

    $valuesSql = array();

    $values['created'] = time();
    $values['modified'] = time();

    $columns = implode(', ', array_keys($values));
    foreach ($values as $key => $value) {
      if (!ctype_alpha2(str_replace(array('_', '.'), '', $key)))
        throw new Error("10");

      if (is_string($value))
        $value = "'".sqlite_escape_string($value)."'";
        
      $valuesSql[] = $value;
    }
    
                 
    $valuesClause = implode(', ', $valuesSql);
    $sql .= "($columns) VALUES ($valuesClause)";
    
    $query = $this->server->moma->query($sql);
    return $query->insertId;    
  }
}

?>
