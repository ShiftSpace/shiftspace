<?php

class Shift_Object extends Base_Object {
}

class Shift {
  public function __construct($server) {
    $this->server = $server;
  }
  
  function set_elapsed_time(&$shift) {
    $shift->created = ucfirst(elapsed_time($shift->created));
  }

  public function query() {

  $user_id = $this->server->user->id;

if (!empty($this->server->user)) {
  // Include private shifts if logged in
  $user_clause = "
    (s.status = 1
    OR (
      s.status = 2
      AND s.user_id = $user_id
    ))
  ";
} else {
  // Only public shifts if not logged in
  $user_clause = "s.status = 1";
}


if (!empty($_REQUEST['href'])) 
{
  // Load shifts by URL
  $href = $this->server->normalizeURL($_REQUEST['href']);
  $shift_clause = "AND s.href = '$href'";
} 
else if (!empty($_REQUEST['id'])) 
{
  $id = $_REQUEST['id'];
  // Load shifts by ID
  if (strpos($id, ',') === false) 
  {
    // Only want one shift
    $shift_clause = "AND s.url_slug = '$id'";
  }
  else 
  {
    // Want multiple shifts
    $id = explode(',', $id);
    $id = "'" . implode("','", $id) . "'";
    $shift_clause = "AND s.url_slug IN ($id)";
  }
}
else
{
  $shift_clause = "";
}

// For table view sorting
if (!empty($_REQUEST['sortByColumn']))
{
  $sortByColumn = $_REQUEST['sortByColumn'];
}
else
{
  $sortByColumn = 'created';
}

// For table view sorting
if (!empty($_REQUEST['sortByDirection']))
{
  $sortValue = $_REQUEST['sortByDirection'];
  if($sortValue == 1)
  {
    $sortByDirection = "ASC";
  }
  else
  {
    $sortByDirection = "DESC";
  }
}
else
{
  $sortByDirection = "DESC";
}

// For selecting a specific user's public shifts
if(!empty($_REQUEST['username']))
{
  $selectByUser = $_REQUEST['username'];
  $select_by_user_clause = "AND u.username = '$selectByUser'";
}
else
{
  $select_by_user_clause = "";
}








    $shifts = $this->server->db->rows("
      SELECT s.id AS id,
         s.href AS href,
         s.space AS space,
         s.summary AS summary,
         s.created AS created,
         u.username AS username,
         s.status AS status
      FROM shift AS s, user AS u
      WHERE $user_clause
        $shift_clause
        $select_by_user_clause
      AND s.broken = 0
      AND s.user_id = u.id
      ORDER BY $sortByColumn $sortByDirection
    ");


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

  public function create() {
    $href = $this->server->normalizeURL($_POST['href']);
    $summary = $this->server->summarize($_POST['summary']);
    $space = $_POST['space'];
    $content = $_POST['content'];
    $version = $_POST['version'];
    $status = 1;
    
    if (empty($href)) {
      throw new Error('Please specify a href argument');
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
    $shiftIdsStr = $_POST['shiftIds'];
    $shiftIds = explode(',', $shiftIdsStr);
    $theShifts = array();
    
    foreach ($shiftIds as $shiftId) {
      $theShifts[] = $this->server->db->load("shift($shiftId)")->get();
    }
    
    return new Response($theShifts);
  }
}

?>
