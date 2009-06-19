<?php

class Shift {
  public function __construct($server) {
    $this->server = $server;
  }
  
  function set_elapsed_time(&$shift) {
    $shift->created = ucfirst(elapsed_time($shift->created));
  }

  public function query() {
    if (!empty($this->server->user)) {
      $user_id = $this->server->user->id;
      
      // Include private shifts if logged in
      $user_clause = "
        (s.status = 1
        OR (
          s.status = 2
          AND s.user_id = :user_id
        ))
      ";
    } else {
      // Only public shifts if not logged in
      $user_clause = "s.status = 1"; 
    }

    // defaults
    $sortByDirection = 0;

    // extract args from request    
    extract($_REQUEST);

    if (!empty($href)) {
      // Load shifts by URL
      $href = $this->server->normalizeURL($href);
      $shift_clause = 'AND s.href = :href';
    } else {
      $shift_clause = '';
    }
    
    // For table view sorting
    if (empty($sortByColumn)) {
      $sortByColumn = 'created';
    }

    if ($sortByDirection == 1)
      $sortByDirection = 'ASC';
    else
      $sortByDirection = 'DESC';

    // For selecting a specific user's public shifts
    if (!empty($username)) {
      $select_by_user_clause = "AND u.username = :username";
    }
    else {
      $select_by_user_clause = '';
    }
      
    $shifts = $this->server->db->rows("
      SELECT s.id AS id,
         s.href AS href,
         s.space AS space,
         s.summary AS summary,
         s.created AS created,
         u.username AS username,
         s.status AS status,
         s.modified AS modified
      FROM shift AS s, user AS u
      WHERE $user_clause
        $shift_clause
        $select_by_user_clause
      AND s.broken = 0
      AND s.user_id = u.id
      ORDER BY $sortByColumn $sortByDirection
    ", compact('user_id', 'href', 'username'));

    // Make created property more human-friendly
    array_map($this->set_elapsed_time, $shifts);

    // The response data
    $response = array(
      'count' => count($shifts),
      'shifts' => $shifts
    );
  
    return new Response($response);
  }  

  function calculate_domain($url) {
    $url = @parse_url($url);
    if (empty($url) || empty($url['host'])) {
      continue;
    }
    $domain = $url['host'];
    if (substr($domain, 0, 4) == 'www.') {
      $domain = substr($domain, 4);
    }
    return $domain; 
  }

  public function delete() {
    $this->server->requireLogin();
    extract($_REQUEST);
    $this->server->db->query("DELETE FROM shift WHERE id=:id", compact('id'));
  }    

  public function update() {
    $this->server->requireLogin();
    extract($_REQUEST);
    $shift = new Shift_Object();
    $modified = date('Y-m-d H:i:s');
    $shift->set(compact('id', 'summary', 'content', 'modified'));
    $this->server->db->save($shift);
  }
  
  public function create() {
    $this->server->requireLogin();
  
    $href = $this->server->normalizeURL($_POST['href']);
    $summary = $this->server->summarize($_POST['summary']);
    $space = $_POST['space'];
    $content = $_POST['content'];
    $version = $_POST['version'];
    $status = 1;

    if (empty($href)) {
      throw new Error('Please specify an href argument');
    } else if (empty($space)) {
      throw new Error('Please specify a space argument');
    } else if (empty($content)) {
      throw new Error('Please specify a content argument');
    } else if (empty($summary)) {
      throw new Error('Please specify a summary argument');
    }
    
    if (empty($version)) {
      $version = '1.0';
    }
    
    $created = date('Y-m-d H:i:s');
    $modified = $created;
    $domain = $this->calculate_domain($href);
    $user_id = $this->server->user->id;
    $broken = false;
    
    $shift = new Shift_Object();
    $shift->set(compact('user_id', 'space', 'href', 'summary', 'content', 'domain', 'created', 'mofified', 'version', 'status', 'broken'));
    $this->server->db->save($shift);
    
    return new Response($shift); 
  }
  
  public function get() {
    $shiftIdsStr = $_REQUEST['shiftIds'];
    $shiftIds = explode(',', $shiftIdsStr);
    $theShifts = array();
    
    foreach ($shiftIds as $shiftId) {
      $theShifts[] = $this->server->db->load("shift($shiftId)")->get();
    }
    
    return new Response($theShifts);
  }
}

?>
