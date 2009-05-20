<?php

class Subscription_Object extends Base_Object {}
class Event_Object extends Base_Object {}
class Stream_Object extends Base_Object {}
class StreamPermission_Object extends Base_Object {}

class Event {
  public function __construct($server) {
    $this->server = $server;
  }

  private function logged_in() {
    if (!$this->server->user) {
      throw new Error('You must be logged in.');
    }    
  }

  private function get_subscription_object() {
    $this->logged_in();
    extract($_REQUEST);
    
    $this->can_read($stream_id);
    
    $object = new Subscription_Object();
    $object->set(Array(
      'user_id' => $this->server->user->id,
      'stream_id' => $stream_id));
      
    return $object;
  }
  
  public function subscribe() {
    $object = $this->get_subscription_object();
    $this->server->db->toggleon($object);
  }
  
  public function unsubscribe() {
    $object = $this->get_subscription_object();
    $this->server->db->toggleoff($object);    
  }
  
  private function permission($stream_id) {
    $result = $this->server->db->row("SELECT type FROM streampermission WHERE user_id=".$this->server->user->id." AND stream_id=:stream_id", compact('stream_id'));
    return $result->type;
  }
  
  public function createstream() {
    $this->logged_in();
    extract($_REQUEST);
    
    $object = new Stream_Object();
    $object->set(compact('private'));    
    $this->server->db->save($object);
    
    $permission = new StreamPermission_Object();
    $permission->set(Array(
      'user_id' => $this->server->user->id,
      'stream_id' => $object->id,
      'type' => 3));
      
    $this->server->db->save($permission);
    return new Response($object);  
  }
  
  public function post() {
    $this->logged_in();
    extract($_REQUEST);
    
    if ($this->permission($stream_id) < 2)
      throw new Error("You don't have permission for this operation.");
    
    $object = new Event_Object();
    $object->set(compact('stream_id', 'display', 'object_ref'));
    $object->set('created', time());
    $object->set('created_by', $this->server->user->id);
    $this->server->db->save($object);
  }

  private function can_read($stream_id) {
    $stream = $this->server->db->load("stream($stream_id)");

    if (!$stream)
      throw new Error("No such stream.");
      
    if ($stream->private) {
      if ($this->server->user) {
        if ($this->permission($stream_id) < 1) {
          throw new Error("You don't have permission for this operation.");
        }
      } else {
        throw new Error("This is a private stream. If you have permissions please log in and try again.");
      }
    }
  }    
 
  public function onefeed() {
    extract($_REQUEST);
    $this->can_read($stream_id);
       
    return new Response($this->server->db->rows("SELECT * FROM event WHERE stream_id=:stream_id", compact('stream_id')));
  }
  
  public function feed() {
    $this->logged_in();
    $query = "SELECT stream_id, since FROM subscription WHERE user_id=".$this->server->user->id;
    $streams = $this->server->db->rows($query);
    
    $values = Array();
    
    foreach ($streams as $stream) {
      $values[] = 'stream_id = '.$stream->stream_id.' AND created > '.$stream->since;
    }
    
    if (count($values) == 0)
      return new Response(Array());
    else
      return new Response($this->server->db->rows("SELECT * FROM event LEFT JOIN eventread ON event.id = eventread.event_id AND eventread.user_id = ".$this->server->user->id." WHERE ".implode(' OR ', $values)));
  }
  
  public function permissionstream() {
    $this->logged_in();
    extract($_REQUEST);

    if ($this->permission($stream_id) >= 3) {
      $this->server->db->query("DELETE FROM streampermission WHERE stream_id=:stream_id and user_id=:user_id", compact('stream_id', 'user_id'));

      $permission = new StreamPermission_Object();
      $permission->set(compact('stream_id', 'user_id', 'type'));
      $this->server->db->save($permission);
    }
    else {
      throw new Error("You don't have permission for this operation.");
    }
  }

  public function findstreams() {
    extract($_REQUEST);
    return new Response($this->server->db->rows("SELECT * FROM event, stream WHERE event.stream_id = stream.id AND stream.private = 0 AND object_ref=:object_ref", compact('object_ref')));
  }
}

?>
