// ==Builder==
// @package           System_
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

var SSNotificationProxy = {
  getId: function() { return "ShiftSpace"; }
};

/*
  Function: SSAddObserver
    Add an observer to the notification center.
    
  Parameters:
    object - an object, must implement getId.
    name - the name of the notification.
    method - the function to called when the notification is posted.
    sender - an object, must implement getId.
*/
function SSAddObserver(object, name, method, sender)
{
  var id = object.getId();
  
  var notificationName = (sender != null) ? (name+':'+sender.getId()) : name;
  if(!__observers[notificationName])
  {
    __observers[notificationName] = $H();
  }
  if(!__observers[notificationName][id])
  {
    __observers[notificationName][id] = [];
  }
  __observers[notificationName][id].push(method);
}

/*
  Function: SSGetObservers
    Return the all the observers register for a notification.
    
  Parameters:
    name - the name of the notification.
    sender - the sender of notification (optional).
    
  Returns:
    a hash table of objects listening to the notification.
*/
function SSGetObservers(name, sender)
{
  if(name)
  {
    var notificationName = (sender != null) ? (name+':'+sender.getId()) : name;
    return __observers[notificationName];
  }
  return __observers;
}

/*
  Function: SSRemoveObserver
    Remove an observer from the notification center.
    
  Parameters:
    object - an object, must implement getId.
    name - the name of the notification to be observed.
    sender - only notify if notification posted by sender who also must implement getId. (options)
*/
function SSRemoveObserver(object, name, sender)
{
  var notificationName = (sender != null) ? (name+':'+sender.getId()) : name;
  __observers[notificationName].erase(object.getId());
}

/*
  Function: SSPostNotification
    Post a notification, all observers will be notified.
    
  Parameters:
    name - the name of the notification to listen for.
    data - data to be sent to the observer.
    sender - the sender of the notification, must implement getId.
*/
var SSPostNotification = function(name, data, sender)
{
  var notificationName = (sender != null) ? (name+':'+sender.getId()) : name;
  var observers = SSGetObservers(notificationName);

  if(observers)
  {
    observers.each(function(methods, objid) {
      var obj = ShiftSpaceObjects[objid];
    
      if((obj && obj.isAwake && obj.isAwake()) ||
         (obj && !obj.isAwake) ||
         !obj)
      {
        methods.each(function(method) { method(data); });
      }
      else
      {
        SSAddToNotificationQueue(obj, methods, data);
      }
    });
  }
}.asPromise();

/*
  Function: SSAddToNotificationQueue
    Add a sleeping object to the notification queue.
    
  Parameters:
    object - an object, must implement getId.
    method - the callback function.
    data - the data to be passed. NOTE: be watchful of mutating data.
*/
function SSAddToNotificationQueue(object, methods, data)
{
  var id = object.getId();
  if(!__notificationQueue.get(id))
  {
    __notificationQueue.set(id, []);
  }
  __notificationQueue.get(id).push({methods:methods, data:data});
}

/*
  Function: SSClearObservers
    Clear all observers from the notification center.
*/
function SSClearObservers()
{
  __observers = $H();
}

/*
  Function: SSEmptyNotificationQueue
    Clear the notification queue.
*/
function SSEmptyNotificationQueue()
{
  __notificationQueue = $H();
}

/*
  Function: SSNotificationQueue
    Return the notification queue, a hash object.
*/
function SSNotificationQueue()
{
  return __notificationQueue;
}

/*
  Function: SSNotificationCenterReset
    Reset the notification center. Clears all observers and flushes
    the notification queue.
*/
function SSNotificationCenterReset()
{
  SSClearObservers();
  SSEmptyNotificationQueue();
}


function SSNotificationQueueForObject(object)
{
  return __notificationQueue[object.getId()];
}

/*
  Function: SSFlushNotificationQueueForObject
    Flush the notification queue for a single object.
*/
function SSFlushNotificationQueueForObject(object)
{
  var id = object.getId();
  if(__notificationQueue[id])
  {
    __notificationQueue[id].each(function(notif) {
      notif.methods.each(function (method) { method(notif.data); });
    });
    __notificationQueue.erase(id);
  }
}

/*
  Function: SSAddEvent
    Add an event handler to the window.

  Parameters:
    eventType - a event type as string.
    callback - a function.

  See also:
    SSPostNotification
*/
var __listeners = $H();
function SSAddEvent(eventType, callback)
{
  if(!__listeners[eventType])
  {
    __listeners[eventType] = [];
  }
  __listeners[eventType].push(callback);
  window.addEvent(eventType, callback);
};

function SSRemoveEvent(eventType, callback)
{
  __listeners[eventType].remove(callback);
  window.removeEvent(eventType, callback);
}

/*
  Function: SSFireEvent
    A function to fire events on the window - for event forwarding.

  Parameters:
    eventType - event type as string.
    data - event data
*/
function SSFireEvent(eventType, eventData) 
{
  var callbacks = __listeners[eventType];
  if(callbacks) 
  {
    callbacks.each(function(fn) {
      fn(eventData);
    });
  }
};