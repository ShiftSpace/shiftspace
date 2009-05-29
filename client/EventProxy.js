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

var __observers = $H();
var __notificationQueue = $H();


function SSAddObserver(object, name, method, sender)
{
  var notificationName = (sender != null) ? (name+':'+sender.getId()) : name;
  if(!__observers.get(notificationName))
  {
    __observers.set(notificationName, $H());
  }
  __observers.get(notificationName).set(object.getId(), method);
}


function SSGetObservers(name, sender)
{
  if(name)
  {
    var notificationName = (sender != null) ? (name+':'+sender.getId()) : name;
    return __observers.get(notificationName);
  }
  return __observers;
}


function SSRemoveObserver(object, name, sender)
{
  var notificationName = (sender != null) ? (name+':'+sender.getId()) : name;
  __observers.get(notificationName).erase(object.getId());
}


function SSPostNotification(name, data, sender)
{
  var notificationName = (sender != null) ? (name+':'+sender.getId()) : name;
  var observers = SSGetObservers(notificationName);
  
  observers.each(function(method, objid) {
    var obj = ShiftSpaceNameTable[objid];
    
    if(obj.isAwake())
    {
      method(data);
    }
    else
    {
      SSAddToNotificationQueue(obj, method, data);
    }
  });
}


function SSAddToNotificationQueue(object, method, data)
{
  var id = object.getId();
  if(!__notificationQueue.get(id))
  {
    __notificationQueue.set(id, []);
  }
  __notificationQueue.get(id).push({method:method, data:data});
}


function SSFlushNotificationQueue()
{
  __notificationQueue = $H();
}


function SSNotificationQueue()
{
  return __notificationQueue;
}


function SSFlushNotificationQueueForObject(object)
{
  __notificationQueue.get(object.getId()).each(function(notif) {
    notif.method(notif.data);
  });
  __notificationQueue.erase(id);
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