// ==Builder==
// @optional          
// @name              PinHelpers
// @package           Pinning
// @dependencies      Pin
// ==/Builder==

// ===================
// = Pin API Support =
// ===================

// An array of allocated Pin Widgets
var __pinWidgets__ = [];
// Exceptions
var __SSPinOpException__ = "__SSPinOpException__";
// for holding the current pin selection
var __currentPinSelection__ = null;
var __shiftSpacePinSelect__ = null;

/*
  Function: SSCreatePinSelect
    Create the visible pin selection interface bits.
*/
function SSCreatePinSelect() 
{
  var targetBorder = new SSElement('div', {
    'class': "SSPinSelect SSPinSelectInset"
  });

  var insetOne = new SSElement('div', {
    'class': "SSPinSelectInset"
  });
  var insetTwo = new SSElement('div', {
    'class': "SSPinSelectInset"
  });
  insetTwo.injectInside(insetOne);
  insetOne.injectInside(targetBorder);
  
  __shiftSpacePinSelect__ = targetBorder;
}

/*
  Function: SSPinMouseOverHandler
    A mouse over handler for pin events.
    
  Parameters:
    _evt - a DOM event.
*/
function SSPinMouseOverHandler (_evt) 
{
  var evt = new Event(_evt);
  var target = $(evt.target);

  if(!SSIsSSElement(target) &&
     !target.hasClass('SSPinSelect'))
  {
    __currentPinSelection__ = target;
    var pos = target.getPosition();
    var size = target.getSize().size;
  
    __shiftSpacePinSelect__.setStyles({
      left: pos.x-3,
      top: pos.y-3,
      width: size.x+3,
      height: size.y+3
    });

    __shiftSpacePinSelect__.injectInside(document.body);
  }
}

/*
  Function: SSPinMouseMoveHandler
    The pin handler that checks for mouse movement.
    
  Parameters:
    _evt - a window DOM event.
*/
function SSPinMouseMoveHandler(_evt) 
{
  if(__shiftSpacePinSelect__.getParent())
  {
    __shiftSpacePinSelect__.remove();
  }
}

/*
  Function: SSPinMouseClickHandler
    A pin handler.
    
  Parameters:
    _evt - a window event page.
*/
function SSPinMouseClickHandler(_evt) 
{
  var evt = new Event(_evt);
  evt.stop();
  if(__currentPinWidget__)
  {
    if(__shiftSpacePinSelect__.getParent()) __shiftSpacePinSelect__.remove();
    SSRemovePinEvents();
    __currentPinWidget__.userPinnedElement(__currentPinSelection__);
  }
}

/*
  Function: SSCheckPinReferences
    Check to see if there is a conflicting pin reference on the page already.
    
  Parameters:
    pinRef - a pin reference object.
*/
function SSCheckPinReferences(pinRef)
{
  var otherShifts = __allPinnedShifts__.copy().remove(pinRef.shift);
  var matchingShifts = otherShifts.filter(function(x) {
    var aPinRef = x.getPinRef();
    return ((aPinRef.relativeXPath == pinRef.relativeXPath) && 
            (aPinRef.ancestorId == pinRef.ancestorId));
  });

  // hide any shifts with matching paths
  matchingShifts.each(function(x) {
    x.hide();
  });
  
  return (matchingShifts.length > 0);
}

// stores direct references to the shift objects
var __allPinnedShifts__ = [];
/*
  Function: SSPinElement
    Pin an element to the page.
    
  Parameters:
    element - a DOM node.
    pinRef - a pin reference object.
*/
function SSPinElement(element, pinRef)
{
  // store this pinRef to ensure the same node doesn't get pinned
  if(!__allPinnedShifts__.contains(pinRef.shift)) __allPinnedShifts__.push(pinRef.shift);
  // make sure nobody else is targeting the same node
  SSCheckPinReferences(pinRef);
  
  var targetNode = $(ShiftSpacePin.toNode(pinRef));
  
  // pinRef has become active set targetElement and element properties
  $extend(pinRef, {
    'element': element,
    'targetElement': targetNode
  });
  
  if(!targetNode)
  {
    // throw an exception
    throw(__SSPinOpException__);
  }
  
  // store the styles
  pinRef.originalStyles = element.getStyles('float', 'width', 'height', 'position', 'display', 'top', 'left');
  pinRef.targetStyles = targetNode.getStyles('float', 'width', 'height', 'position', 'display', 'top', 'left');
  
  if(targetNode.getStyle('display') == 'inline')
  {
    var size = targetNode.getSize().size;
    pinRef.targetStyles.width = size.x;
    pinRef.targetStyles.height = size.y;
  }
  
  switch(pinRef.action)
  {
    case 'before':
      element.injectBefore(targetNode);
    break;
    
    case 'replace':
      targetNode.replaceWith(element);          
    break;
    
    case 'after':
      element.injectAfter(targetNode);
    break;
    
    case 'relative':
      var elPos = element.getPosition();
      var tgPos = targetNode.getPosition();
    
      // if no offset set it now
      if(!pinRef.offset)
      {
        var elpos = element.getPosition();
        var tpos = targetNode.getPosition();
        pinRef.offset = {x: elpos.x - tpos.x, y: elpos.y - tpos.y};
        pinRef.originalOffset = {x: elpos.x, y: elpos.y};
      }
      
      // hide the element while we do some node magic
      element.addClass('SSDisplayNone');
    
      // wrap the target node
      var wrapper = new Element('div', {
        'class': 'SSImageWrapper SSPositionRelative'
      });
      targetNode.replaceWith(wrapper);
      targetNode.injectInside(wrapper);
      
      // if the target node is an image we
      // want the wrapper node to display inline
      wrapper.setStyle('display', targetNode.getStyle('display'));

      var styles = targetNode.getStyles('width', 'height');
    
      // set the dimensions of the wrapper
      if( styles.width && styles.height != 'auto' )
      {
        wrapper.setStyle('width', styles.width);
      }
      else
      {
        wrapper.setStyle('width', targetNode.getSize().size.x);
      }
      
      if( styles.height && styles.height != 'auto' )
      {
        wrapper.setStyle('height', styles.height);
      }
      else
      {
        wrapper.setStyle('height', targetNode.getSize().size.y);
      }
    
      // override clicks in case the wrapper is inside of a link
      wrapper.addEvent('click', function(_evt) {
        var evt = new Event(_evt);
        evt.stop();
      });
      // store a reference to the wrapper
      pinRef.wrapper = wrapper;

      targetNode = wrapper;
    
      // inject it inside the parent of the target node
      element.injectInside(targetNode);
    
      // position absolute now
      if(element.getStyle('position') != 'absolute')
      {
        pinRef.cssPosition = element.getStyle('position');
        element.setStyle('position', 'absolute');
      }

      // set the position
      element.setStyles({
        left: pinRef.offset.x,
        top: pinRef.offset.y
      });
      
      // we're done show the element
      element.removeClass('SSDisplayNone');
    break;

    default:
    break;
  }
}

/*
  Function: SSUnpinElement
    Unpin an element from the page.
    
  Parameters:
    pinRef - a pin reference object.
*/
function SSUnpinElement(pinRef) 
{
  switch(pinRef.action) 
  {
    case 'relative':
      var pos = pinRef.element.getPosition();

      // get the parentElement
      var parentElement = pinRef.element.getParent();
      // take out the original node
      var targetNode = pinRef.targetElement.remove();
      // remove the pinned element from the page
      pinRef.element.remove();
      // replace the wrapper with the target
      parentElement.replaceWith(targetNode);
      
      var tpos = parentElement.getPosition();

      // restore the position of the element
      pinRef.element.setStyle('position', pinRef.cssPosition);
      
      if(pinRef.originalOffset)
      {
        var nx = pinRef.originalOffset.x;
        var ny = pinRef.originalOffset.y;
      }
      else
      {
        var nx = pos.x;
        var ny = pos.y;
      }

      pinRef.element.setStyles({
        left: nx,
        top: ny
      });

    break;

    case 'replace':
      // restore the original styles
      /*
      pinRef.element.setStyles({
        position: '',
        float: '',
        display: '',
        width: '',
        height: ''
      });
      */
    case 'before':
    case 'after':
      pinRef.element.replaceWith(pinRef.targetElement);
    break;

    default:
    break;
  }
}

/*
  Function: SSAttachPinEvents
    Attaches the mouse events to the window to handle Pin selection.
*/
function SSAttachPinEvents() 
{
  window.addEvent('mouseover', SSPinMouseOverHandler);
  window.addEvent('click', SSPinMouseClickHandler);
  __shiftSpacePinSelect__.addEvent('mousemove', SSPinMouseMoveHandler);
}

/*
  Function: SSRemovePinEvents
    Remove all pin selection listening events from the window.
*/
function SSRemovePinEvents() 
{
  window.removeEvent('mouseover', SSPinMouseOverHandler);
  window.removeEvent('click', SSPinMouseClickHandler);
  __shiftSpacePinSelect__.removeEvent('mousemove', SSPinMouseMoveHandler);
}

// hold the current active pin widget
var __currentPinWidget__ = null;
/*
  Function: SSStartPinSelection
    Start pin selection mode.
    
  Parameters:
    widget - the PinWidget object that started the pin selection operation.
*/
function SSStartPinSelection(widget) 
{
  __currentPinWidget__ = widget;
  // show the selection interface
  SSAttachPinEvents();
}

/*
  Function: SSStopPinSelection
    Stop handling pin selection.
*/
function SSStopPinSelection() 
{
  __currentPinWidget__ = null;
  if(__shiftSpacePinSelect__.getParent()) __shiftSpacePinSelect__.remove();
  SSRemovePinEvents();
}