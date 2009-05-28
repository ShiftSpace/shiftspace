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

function SSAddObserver(options)
{
}

function SSRemoveObserver(options)
{
}

function SSPostNotification(name)
{
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
  __eventProxy.fireEvent(eventType, data);
  
  var awakeNow = __sleepingObjects.filter(function(objectHash, objectName) {
    return objectHash.get('object').isAwake();
  });
  
  awakeNow.each(function(objectHash, objectName) {
    SSAddEventsAndFire(eventType, objectHash.get('events').get(eventType));
  });
  
  var stillSleeping = __sleepingObjects.filter(function(objectHash, objectName) {
    return !objectHash.get('object').isAwake();
  });
  
  stillSleeping.each(function(objectHash, objectName) {
    objectHash.get('object').addEvent('onAwake', function() {
      SSAddEventsAndFire(eventType, objectHash.get('events').get(eventType));
    });
  });
  
  __sleepingObjects = stillSleeping;
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