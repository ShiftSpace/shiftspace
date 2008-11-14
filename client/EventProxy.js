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
function SSAddEvent(eventType, callback, anObject)
{
  __eventProxy__.addEvent(eventType, callback);
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
  __eventProxy__.fireEvent(eventType, data);
};

var __eventQueue__ = [];
function SSFlushEventQueueForContext(context)
{
  
}