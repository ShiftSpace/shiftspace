// ==Builder==
// @required
// @name              EventProxy
// @package           System
// ==/Builder==

// event proxy object since, ShiftSpace is not a MooTools class
var __eventProxyClass = new Class({});
__eventProxyClass.implement(new Events);
var __eventProxy = new __eventProxyClass();

function SSEventProxy()
{
  return __eventProxy;
}

function SSSetEventProxy(newProxy)
{
  __eventProxy = newProxy;
}

/*
  Function: SSAddEvent
    Adds a Mootools style custom event to the ShiftSpace object.

  Parameters:
    eventType - a event type as string.
    callback - a function.

  See also:
    SSFireEvent
*/
var __sleepingObjects = $H();
function SSAddEvent(eventType, callback, anObject)
{
  //console.log('adding event ' + eventType);
  if(anObject && anObject.isAwake && !anObject.isAwake())
  {
    var objId = anObject.getId();
    if(!__sleepingObjects.get(objId))
    {
      __sleepingObjects.set(anObject.getId(), $H({
        object: anObject,
        events: $H()
      }));
    }
    var eventsHash = __sleepingObjects.get(objId).get('events');
    if(!eventsHash.get(eventType))
    {
      eventsHash.set(eventType, []);
    }
    eventsHash.get(eventType).push(callback);
  }
  else
  {
    __eventProxy.addEvent(eventType, callback);
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
  __eventProxy.fireEvent(eventType, data);
  
  var awakeNow = __sleepingObjects.filter(function(objectHash, objectName) {
    return objectHash.get('object').isAwake();
  });
  
  // call back these immediate
  awakeNow.each(function(objectHash, objectName) {
    //console.log('now awake ' + objectName);
    SSAddEventsAndFire(eventType, objectHash.get('events').get(eventType));
  });
  
  var stillSleeping = __sleepingObjects.filter(function(objectHash, objectName) {
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
  __sleepingObjects = stillSleeping;
  
  //console.log('still sleeping');
  //console.log(__sleepingObjects.getLength());
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