<?php

class Subscription_Object extends Base_Object {}
class Event_Object extends Base_Object {}

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
  
  public function post() {
    // $fix - check if admin
    $this->logged_in();
    extract($_REQUEST);
    
    foreach (explode(',', $stream_ids) as $stream_id) {
      $object = new Event_Object();
      $object->set(compact('stream_id', 'display'));
      $object->set('created', time());
      $object->set('created_by', $this->server->user->id);
      $this->server->db->save($object);
    }
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
      return new Response($this->server->db->rows("SELECT * FROM event WHERE ".implode(' OR ', $values)));
  }
}

?>
