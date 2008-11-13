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
var __awakeEvents__ = $H();
function SSAddEvent(eventType, callback, anObject)
{
  if(anObject != null && $type(anObject.awake) == 'function')
  {
    console.log('SSAddEvent set ' + eventType)
    console.log(anObject);
    var eventsArray = $pick(__awakeEvents__.get(eventType), []);
    eventsArray.push(anObject);
    __awakeEvents__.set(eventType, eventsArray);
  }
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
  console.log('SSFireEvent ' + eventType);
  __eventProxy__.fireEvent(eventType, data);
  // notify any sleeping objects
  if(__awakeEvents__.get(eventType))
  {
    console.log('listing on fire event');
    console.log(eventType);
    console.log(__awakeEvents__.get(eventType));
    __awakeEvents__.set(eventType, __awakeEvents__.get(eventType).filter(function(anObject) {!anObject.isAwake();}));
    console.log('Sleeping objects!');
    console.log(__awakeEvents__.get(eventType));
  }
};