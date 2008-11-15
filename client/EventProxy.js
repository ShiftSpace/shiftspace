// ==Builder==
// @required
// @name              EventProxy
// @package           System
// ==/Builder==

// event proxy object since, ShiftSpace is not a MooTools class
var __eventProxyClass__ = new Class({});
__eventProxyClass__.implement(new Events);
var __eventProxy__ = new __eventProxyClass__();

/*
  Function: SSAddEvent
    Adds a Mootools style custom event to the ShiftSpace object.

  Parameters:
    eventType - a event type as string.
    callback - a function.

  See also:
    SSFireEvent
*/
var __eventsForContext__ = $H();
var __eventQueueForContext__ = $H();
function SSAddEvent(eventType, callback, anObject)
{
  // check to see if the object's context is ready
  if(anObject && !Sandalphon.contextIsReady(anObject.getContext()))
  {
    var ctxtid = Sandalphon.getContextId(anObject.getContext());
    console.log('SSAddEvent ' + eventType + ' ' + ctxtid);
    console.log(anObject.getContext());
    // create events Hash for a particular context
    if(!__eventsForContext__.get(ctxtid)) __eventsForContext__.set(ctxtid, $H());
    
    var eventsHash = __eventsForContext__.get(ctxtid);
    // check if the event hash has events of this type
    if(!eventsHash.get(eventType)) eventsHash.set(eventType, []);
    eventsHash.get(eventType).push(callback);
    
    // add a event queue array
    if(!__eventQueueForContext__.get(ctxtid)) __eventQueueForContext__.set(ctxtid, []);
  }
  else
  {
    __eventProxy__.addEvent(eventType, callback);
  }
};

/*
  Function: SSFireEvent
    A function to fire events.

  Parameters:
    eventType - event type as string.
    data - any extra event data that should be passed to the event listener.
*/
function SSFireEvent(eventType, data) 
{
  console.log('SSFireEvent ' + eventType);
  __eventProxy__.fireEvent(eventType, data);
  
  // check all contexts that listening for this event
  __eventsForContext__.each(function(eventsHash, ctxtid) {
    console.log(Sandalphon.contextIsReady(Sandalphon.contextForId(ctxtid)));
    if(Sandalphon.contextIsReady(Sandalphon.contextForId(ctxtid)))
    {
      console.log('context is ready firing events!');
      // if the context is ready fire all callbacks and add them as normal events
      if(eventsHash.get(eventType))
      {
        SSAddEventsAndFire(eventType, eventsHash.get(eventType));
      }
    }
    else
    {
      console.log('queue up');
      console.log(Sandalphon.contextForId(ctxtid));
      // if the context is not ready queue the callbacks up to
      // be fired when the context becomes ready
      __eventQueueForContext__.get(ctxtid).push(eventType);
    }
  });
};

function SSFlushEventQueueForContext(context)
{
  // only called once for each context
  var contextId = Sandalphon.getContextId(context);
  console.log('SSFlushEventQueueForContext ' + contextId);
  console.log(context);
  // call any events for this context
  if(__eventQueueForContext__.get(contextId) &&
     __eventQueueForContext__.get(contextId).length > 0)
  {
    __eventQueueForContext__.get(contextId).each(function(eventType) {
      SSAddEventsAndFire(eventType, __eventsForContext__.get(contextId).get(eventType));
    });
    // empty the queue
    __eventQueueForContext__.set(contextId, []);
  }
};

// takes and event type and a list of event callbacks
// adds each callback as well as executing
function SSAddEventsAndFire(eventType, events)
{
  events.each(function(callback) {
    SSAddEvent(eventType, callback);
    callback();
  });
}