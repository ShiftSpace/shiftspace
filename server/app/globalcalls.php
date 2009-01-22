<?php

class GlobalCalls {
  protected $sql = array(
    'queryAnonymous' => "
      SELECT COUNT(id)
      FROM shift
      WHERE status = 1
      AND href = :href
    ",
    'queryLoggedIn' => "
      SELECT COUNT(s.id)
      FROM shift s,
           user u
      WHERE (
        s.status = 1
        OR (
          s.status = 2
          AND s.user_id = :user
        )
      )
      AND s.user_id = u.id
      AND s.href = :href
    "
  );
  
  public function __construct($server) {
    $this->server = $server;
  }
  
  function version() {
    return new Response(array(
      'version' => SHIFTSPACE_VERSION
    ));
  }
  
  function query() {
    // Check for content based on URL
    $href = $this->server->normalizeURL(@$_REQUEST['href']);
    
    // Sanity check
    if (empty($href)) {
      throw new Error("Please specify an 'href' argument.");
    }
    
    $data = array();
    
    if (empty($this->server->user)) {
      // Only check for public content
      $data['count'] = $this->server->db->value($this->sql['queryAnonymous'], array(
        'href' => $href
      ));
    } else {
      // Check for both public and private content
      $data['count'] = $this->server->db->value($this->sql['queryLoggedIn'], array(
        'user' => $this->server->user->id,
        'href' => $href
      ));
      
      $data['username'] = $this->server->user->username;
      $data['email'] = $this->server->user->email;
    }
    
    return new Response($data);
  }
  
  function collections() {
    $desc = json_decode($_POST['desc'], true);
    $method = 'collections_'.$desc['action'];
    return $this->$method($desc);
  }
  
  function generate_where_clause($constraints) {
    $sql = '';
    
    if (!empty($constraints)) {
      $sql .= " WHERE ";
      $first = false;
      
      foreach ($constraints as $column => $value) {
        if ($first) $sql .= " AND ";
        
        if (is_string($value))
          $value = "'$value'";
        
        $sql .= "$column = $value";
        $first = true;
      }
    }

    return $sql;    
  }
  
  function collections_read($desc) {
    extract($desc);
    $sql = "SELECT $properties FROM $table";
    $sql .= $this->generate_where_clause($constraints);
    
    if (!empty($orderby)) {
      if ($orderby[0] == '>')
        $ascdesc = 'DESC';
      else if ($orderby[0] == '<')
        $ascdesc = 'ASC';
      else
        throw new Error('orderby first value must be "<" or ">"');  

      $sql .= " ORDER BY $orderby[1] $ascdesc"; 
    }

    if (!empty($range)) {
      extract($range);
      $sql .= " LIMIT $count OFFSET $startIndex";
    }
      
    $rows = $this->server->moma->rows($sql);
    return new Response($rows);
  }

  function collections_delete($desc) {
    extract($desc);
    $sql = "DELETE FROM $table";
    $sql .= $this->generate_where_clause($constraints);
    $query = $this->server->moma->query($sql);
    return new Response($query->rowCount());    
  }

  function collections_update($desc) {
    extract($desc);
    $sql = "UPDATE $table SET ";
    
    $valuesSql = array();
    foreach ($values as $key => $value) {
      if (is_string($value))
        $value = "'$value'";
        
      $valuesSql[] = "$key = $value";
    }
                 
    $sql .= implode(', ', $valuesSql);                                             
    $sql .= $this->generate_where_clause($constraints);
    
    $query = $this->server->moma->query($sql);
    return new Response($query->rowCount());    
  }

  function collections_create($desc) {
    extract($desc);
    $sql = "INSERT INTO $table ";

    $valuesSql = array();
    $columns = implode(', ', array_keys($values));
    foreach ($values as $key => $value) {
      if (is_string($value))
        $value = "'$value'";
        
      $valuesSql[] = $value;
    }
    
    $valuesClause = implode(', ', $valuesSql);
    $sql .= "($columns) VALUES ($valuesClause)";
    
    $query = $this->server->moma->query($sql);
    return new Response($query->insertId);    
  }
}

?>
