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
var __sleepingObjects__ = $H();
function SSAddEvent(eventType, callback, anObject)
{
  //console.log('adding event ' + eventType);
  if(anObject && anObject.isAwake && !anObject.isAwake())
  {
    var objId = anObject.getId();
    if(!__sleepingObjects__.get(objId))
    {
      __sleepingObjects__.set(anObject.getId(), $H({
        object: anObject,
        events: $H()
      }));
    }
    var eventsHash = __sleepingObjects__.get(objId).get('events');
    if(!eventsHash.get(eventType))
    {
      eventsHash.set(eventType, []);
    }
    eventsHash.get(eventType).push(callback);
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
  //console.log('SSFireEvent ' + eventType);
  __eventProxy__.fireEvent(eventType, data);
  
  var awakeNow = __sleepingObjects__.filter(function(objectHash, objectName) {
    return objectHash.get('object').isAwake();
  });
  
  // call back these immediate
  awakeNow.each(function(objectHash, objectName) {
    //console.log('now awake ' + objectName);
    SSAddEventsAndFire(eventType, objectHash.get('events').get(eventType));
  });
  
  var stillSleeping = __sleepingObjects__.filter(function(objectHash, objectName) {
    //console.log('checking ' + objectName + ' ' + objectHash.get('object').isAwake());
    return !objectHash.get('object').isAwake();
  });
  
  stillSleeping.each(function(objectHash, objectName) {
    objectHash.get('object').addEvent('onAwake', function() {
      //console.log('waking up!');
      SSAddEventsAndFire(eventType, objectHash.get('events').get(eventType));
    });
  });
  
  // update which objects are still sleeping
  __sleepingObjects__ = stillSleeping;
  
  //console.log('still sleeping');
  //console.log(__sleepingObjects__.getLength());
};

// takes and event type and a list of event callbacks
// adds each callback as well as executing
function SSAddEventsAndFire(eventType, events)
{
  if(events && events.length > 0)
  {
    events.each(function(callback) {
      SSAddEvent(eventType, callback);
      callback();
    });
  }
}