<?php
require_once('shiftserver.php');

class ShiftController {
  public function __construct() { 
    $filename = dirname(__FILE__) . '/shiftspace.sqlite3';
    $this->db = new PDO("sqlite://$filename");
  }
   
  public function create($request) {
    //create a shift in the database.
    global $current_user;
	
    $post_vars = get_posts();
    $post_id = $post_vars[0]->ID;
		
    $data = flatten(json_decode(file_get_contents("php://input"), true));
    extract($data);
    
    $createdBy = $current_user->ID;
    $created = date("Y/m/d H:i:s", time());
    $modified = $created;

    $sql = "INSERT INTO shift (createdBy,
                               href,
                               space_name,
                               space_version,
                               summary,
                               created,
                               modified,
                               content)
                VALUES ('$createdBy',
                        '$href',
                        '$space_name',
                        '$space_version',
                        '$summary',
                        '$created',
                        '$modified',
                        '$content')";

    $this->db->query($sql);
    $id = $this->db->lastInsertId();

    if($id) {
      $insert_data = array('comment_post_ID' => $post_id,
                           'comment_author' => $createdBy,
                           'comment_content' => "<a rel='shift:$space_name:$id'>$summary</a>",
                           'comment_type' => "shiftpress");
      $comment_id = wp_insert_comment($insert_data);
      return json_encode($this->_read($id));
    } else {
      return json_encode(array('error' => 'Database error, could not save shift',
                               'type' => 'DatabaseError'));
    }
  }
 
  public function read($request) {
    //get a specific shift.
    extract($request);
    return json_encode($this->_read($id));
  }

  private function _read($id) {
    $query = $this->db->prepare("SELECT * FROM shift WHERE id = :id");
    $query->execute(array(':id'=>$id));
    return unflatten($query->fetch(PDO::FETCH_ASSOC));
  }
 
  public function update($request) {
    //Update a shift in the Database.
    extract($request);
    $data = flatten(json_decode(file_get_contents("php://input"), true));
    extract($data);
    
    $query = $this->db->prepare("UPDATE shift
                                 SET createdBy=:createdBy,
                                     href=:href,
                                     space_name=:space_name,
                                     space_version=:space_version,
                                     summary=:summary,
                                     created=:created,
                                     modified=:modified,
                                     publishData_draft=:publishData_draft,
                                     publishData_publishTime=:publishData_publishTime,
                                     content=:content
                                 WHERE id=:id");
    $query->execute(array(':createdBy' => $createdBy,
                          ':href'=> $href,
                          ':space_name'=> $space_name,
                          ':space_version'=> $space_version,
                          ':summary'=> $summary,
                          ':created'=>$created,
                          ':modified'=>$modified,
                          ':publishData_draft'=>$publishData_draft,
                          ':publishData_publishTime'=>$publishdData_publishTime,
                          ':content'=>$content, ":id"=>$id));
    return json_encode($this->_read($id));
  }
 
  public function delete($request) {  
    //delete a shift from the database.
    extract($request);
    $query = $this->db->prepare("DELETE FROM shift WHERE id = :id");
    $query->execute(array(':id' => $id));
  }
 
  public function publish($request) {
    /*Set draft status of a shift to false. Sync publishData field.
     If the shift is private only publish to the streams that
     the user has access. If the shift is publich publish it to
     any of the public non-user streams. Creates the comment stream
     if it doesn't already exist.*/
    extract($request);
    $query = $this->db->prepare("UPDATE shift SET publishData_draft = 0 WHERE id = :id");
    $query->execute(array(':id'=>$id ));
    echo "yes";
  }
 
  public function unpublish($request) {
    // Set the draft status of a shift back to True
    extract($request);
    $query = $this->db->prepare("UPDATE shift SET publishData_draft = 1 WHERE id = :id");
    $query->execute(array(':id'=>$id));
  }
}
?>