<?php

function ctype_alpha2($str) {
  return $str == '' || ctype_alpha($str);
}


class Collections {
  public function __construct($server) {
    $this->server = $server;
  }

  function esc($value) {      
    if (is_string($value)) {
      $value = $this->server->db->escape($value);
      $value = "'$value'";
    }
        
    return $value;
  }

  function generate_join_clause($table) {
    $sql = '';
    $joinData = $this->server->db->joinData[$table];
    
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

        if (!is_array($value))
          $value = array($value);
          
        $value = array_map(array($this, esc), $value);

        if (!ctype_alpha2(str_replace(array('.', '_'), '', $column)))
          throw new Error("Possible hack attempt 1");
          
        $sql .= "$column in (".implode(',', $value).") ";
        $first = true;
      }
    }

    if ($sql == '' && $careful)
      return " ITS_NOT_A_GOOD_IDEA_TO_DELETE_YOUR_ENTIRE_TABLE";

    return $sql;
  }
  
  function generate_all_properties($table) {
    $joinData = $this->server->db->joinData[$table];
    
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
      throw new Error("Possible hack attempt 2");
    
    if (!ctype_alpha2($table))
      throw new Error("Possible hack attempt 3");
    
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
        throw new Error("Possible hack attempt 4");

      $sql .= " ORDER BY $orderby[1] $ascdesc"; 
    }

    if (!empty($range)) {
      extract($range);

      if (!is_numeric($count) || !is_numeric($startIndex))
        throw new Error("Possible hack attempt 5");

      $sql .= " LIMIT $count OFFSET $startIndex";
    }

    if (($pos = strpos($sql, '%')) !== false) {
      // special %column% form
      $endpos = strpos($sql, '%', $pos + 1);
      $columnIdent = substr($sql, $pos, $endpos + 1 - $pos);
      $column = substr($columnIdent, 1, -1);
      
      foreach ($this->lastResult as $idRow) {
        $newsql = str_replace("'$columnIdent'", $idRow->$column, $sql);
        $result[] = $this->server->db->rows($newsql);
      }
      
      return $result;
    }  
    else {
      $rows = $this->server->db->rows($sql);
      $this->lastResult = $rows;
      return $rows;
    }
  }
  
  function delete($desc) {
    extract($desc);

    if (!ctype_alpha2($table))
      throw new Error("Possible hack attempt 6");
    
    $sql = "DELETE FROM $table";
    $sql .= $this->generate_where_clause($constraints, true, true);
    $query = $this->server->db->query($sql);
    return $query->rowCount();    
  }

  function update($desc) {
    extract($desc);
    $result = 0;
    
    $values['modified'] = time();

    if (!ctype_alpha2($table))
      throw new Error("Possible hack attempt 7");
    
    $sql = "UPDATE $table SET ";
   
    $valuesSql = array();
    foreach ($values as $key => $value) {
      if (!ctype_alpha2(str_replace(array('_', '.'), '', $key)))
        throw new Error("Possible hack attempt 8");

      if (is_string($value))
        $value = "'".$this->server->db->escape($value)."'";

      $value = str_replace("\\'", "''", $value);
        
      if ($key == 'setnote' || $key == 'title')
        $value = strip_tags($value);
        
      $valuesSql[] = "$key = $value";
    }
                 
    $sql .= implode(', ', $valuesSql);                                             
    $sql .= $this->generate_where_clause($constraints, false, $table != 'artwork');
    
    $query = $this->server->db->query($sql);
    $result = $query->rowCount();
    
    return $result;    
  }

  function create($desc) {
    extract($desc);

    // crazy non-generic hack
    if ($table == 'savedartwork') {
      Artwork::store_artwork_by_id($values['artworkid']);
    }
    
    if (!ctype_alpha2($table))
      throw new Error("Possible hack attempt 9");
    
    $sql = "INSERT INTO $table ";

    $valuesSql = array();

    $values['created'] = time();
    $values['modified'] = time();
    $values['userid'] = $this->server->user['id'];

    $columns = implode(', ', array_keys($values));
    foreach ($values as $key => $value) {
      if (!ctype_alpha2(str_replace(array('_', '.'), '', $key)))
        throw new Error("Possible hack attempt 10");

      if (is_string($value))
        $value = "'".$this->server->db->escape($value)."'";
        
      $value = str_replace("\\'", "''", $value);
        
      if ($key == 'setnote' || $key == 'title')
        $value = strip_tags($value);
        
      $valuesSql[] = $value;
    }
    
                 
    $valuesClause = implode(', ', $valuesSql);
    $sql .= "($columns) VALUES ($valuesClause)";
    
    $query = $this->server->db->query($sql);
    return $query->insertId;    
  }
}

?>
