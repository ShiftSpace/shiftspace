// ======================
// = FullScreen Support =
// ======================

var __isHidden__ = false;
var __shiftSpaceState__ = new Hash();

/*
  Function: SSSetHidden
    Sets the private hidden variable.

  Parameters:
    val - sets a boolean value.
*/
function SSSetHidden(val)
{
  __isHidden__ = val;
}

/*
  Function: ShiftSpaceIsHidden
    Returns whether ShiftSpace is hidden, that is in full screen mode.

  Parameters:
    return a boolean.
*/
function ShiftSpaceIsHidden()
{
  return __isHidden__;
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
  __shiftSpaceState__.empty();

  if(ShiftSpace.Console)
  {
    __shiftSpaceState__.set('consoleVisible', ShiftSpace.Console.isVisible());
  }
  __shiftSpaceState__.set('focusedShiftId', SSFocusedShiftId());

  // go through each space and close it down, and sleep it
  if(ShiftSpace.Console) ShiftSpace.Console.hide();

  // hide the spaces
  for(var space in spaces)
  {
    spaces[space].saveState();

    if(spaces[space].isVisible())
    {
      spaces[space].hide();
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
  if(ShiftSpace.Console && __shiftSpaceState__.get('consoleVisible'))
  {
    ShiftSpace.Console.show();
  }
  if(__shiftSpaceState__.get('focusedShiftId'))
  {
    SSFocusShift(__shiftSpaceState__.get('focusedShiftId'));
  }

  // restore the spaces
  for(var space in spaces)
  {
    spaces[space].restoreState();
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
  
  __modalDiv__.addEvent('click', function(_evt) {
    var evt = new Event(_evt);
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
