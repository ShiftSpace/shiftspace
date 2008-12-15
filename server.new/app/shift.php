<?php

class Shift {
  public function __construct($server) {
    $this->server = $server;
  }
  
  function set_elapsed_time(&$shift) {
    $shift->created = ucfirst(elapsed_time($shift->created));
  }

  public function query() {

if (!empty($user)) {
  // Include private shifts if logged in
  $user_clause = "
    (s.status = 1
    OR (
      s.status = 2
      AND s.user_id = $user->id
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
}

?>
