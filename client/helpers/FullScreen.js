// ==Builder==
// @name              FullScreen
// @package           UtilitiesExtras
// @dependencies      ShiftSpaceElement
// ==/Builder==

// ======================
// = FullScreen Support =
// ======================

var __isHidden = false;
var __shiftSpaceState = new Hash();

/*
  Function: SSSetHidden
    Sets the private hidden variable.

  Parameters:
    val - sets a boolean value.
*/
function SSSetHidden(val)
{
  __isHidden = val;
}

/*
  Function: ShiftSpaceIsHidden
    Returns whether ShiftSpace is hidden, that is in full screen mode.

  Parameters:
    return a boolean.
*/
function ShiftSpaceIsHidden()
{
  return __isHidden;
}

/*
  Function: ShiftSpaceHide
    Hide ShiftSpace for fullscreen mode.
*/
function ShiftSpaceHide()
{
  // set the private hidden var
  // used to control the appearance of the ShiftMenu
  SSSetHidden(true);

  // remove all the previous state vars
  __shiftSpaceState.empty();

  if(ShiftSpace.Console)
  {
    __shiftSpaceState.set('consoleVisible', ShiftSpace.Console.isVisible());
  }
  __shiftSpaceState.set('focusedShiftId', SSFocusedShiftId());

  // go through each space and close it down, and sleep it
  if(ShiftSpace.Console) ShiftSpace.Console.hide();

  // hide the spaces
  for(var space in spaces)
  {
    var theSpace = SSSpaceForName(space);
    theSpace.saveState();

    if(theSpace.isVisible())
    {
      theSpace.hide();
    }
  }
}

/*
  Function: ShiftSpaceShow
    Show ShiftSpace, normally used when exiting fullscreen mode.
*/
function ShiftSpaceShow()
{
  // set the private hidden var
  // used to control the appearance of the ShiftMenu
  SSSetHidden(false);

  // restore ShiftSpace
  if(ShiftSpace.Console && __shiftSpaceState.get('consoleVisible'))
  {
    ShiftSpace.Console.show();
  }
  if(__shiftSpaceState.get('focusedShiftId'))
  {
    SSFocusShift(__shiftSpaceState.get('focusedShiftId'));
  }

  // restore the spaces
  for(var space in spaces)
  {
    SSSpaceForName(space).restoreState();
  }
}

/*
  Function: SSCanGoFullScreen
    Returns wether ShiftSpace can lose the fullscreen mode.

  Parameters:
    Returns a boolean.
*/
function SSCanGoFullScreen()
{
  return true;
}

/*
  Function: SSCanExitFullScreen
    Return whther ShiftSpace is ready to return to full screen mode.

  Returns:
    A boolean.
*/
function SSCanExitFullScreen()
{
  return true;
}

var __modalDiv__;
var __modalDelegate__;
function SSCreateModalDiv()
{
  __modalDiv__ = new ShiftSpace.Element('div', {
    id: "SSModalDiv"
  });
  
  __modalDiv__.addEvent('click', function(evt) {
    evt = new Event(evt);
    // TODO: deal with modal delegates here - David
  });
}


function SSEnterModal(delegate)
{
  // add the modal div to the dom
  __modalDiv__.injectInside(document.body);
  
  if(delegate)
  {
    __modalDelegate__ = delegate;
  }
}


function SSExitModal()
{
  // remove the modal div from the dom
  __modalDiv__.remove();
  __modalDelegate__ = null;
}
