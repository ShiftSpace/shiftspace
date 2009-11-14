<?php
require_once ('Routes/Mapper.php');
require_once ('Routes/Exception.php');
require_once ('Routes/Route.php');
require_once ('Routes/Utils.php');
require_once ('utils.php');
require_once ('shift.php');
require_once ('user.php');

class ShiftServer {
  public function __construct($options=array()) { 
    if(isset($options["user"])) {
      $this->user = $options["user"];
    } else {
      $this->user = new UserController();
    }
    $this->user->server = $this;
    if(isset($options["shift"])) {
      $this->shift = $options["shift"];
    } else {
      $this->shift = new ShiftController();
    }
    $this->shift->server = $this;
    $this->mapper = $this->initRoutes();

    $request = $this->mapper->match($this->requestPath());
    $controller = $request['controller'];
    $method = $request['action'];
		
    if($this->user->isLoggedIn || $method == "read")
      {
	echo $this->$controller->$method($request);
      } else {
      echo "{error:\"Operation not permitted. You are not logged in.\", type:\"UserNotLoggedInError\"}";
    }
  }
	
  public function requestPath() {
    //pass the request path to Routes. All parameters 
    //following the "server" directory are sent to the URI. 
    return substr_replace(strstr($_SERVER['REQUEST_URI'], "server"), "", 0, 6);
  }
	
  public function initRoutes() {
    //Manage routing of URIs and actions. 
    $m = new Horde_Routes_Mapper();
    $m->environ = $_SERVER;
    $m->connect('shiftCreate', 'shift', array( 'controller' => 'shift', 
					       'action'     => 'create',
					       'conditions' => array("method" => array("POST"))));
    $m->connect('shiftRead', 'shift/:id', array( 'controller' => 'shift', 
						 'action'     => 'read',
						 'conditions' => array("method" => array("GET"))));
    $m->connect('shiftUpdate', 'shift/:id', array( 'controller' => 'shift', 
						   'action'     => 'update',
						   'conditions' => array("method" => array("PUT"))));
    $m->connect('shiftDelete', 'shift/:id', array( 'controller' => 'shift',
						   'action' 	=> 'delete',
						   'conditions' => array("method"=>array("DELETE"))));
    $m->connect('shiftPublish', 'shift/:id/publish', array( 'controller'=> 'shift',
							    'action' 	=> 'publish',
							    'conditions'=> array("method"=>array("POST"))));
    $m->connect('shiftUnPublish', 'shift/:id/unpublish', array( 'controller' => 'shift',
								'action' 	   => 'unpublish',
								'conditions' => array("method"=>array("POST"))));
    return $m;
  }
}
?>