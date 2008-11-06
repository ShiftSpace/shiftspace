// Set up event handlers, these should not be tied into core
window.addEvent('keydown', keyDownHandler.bind(this));
window.addEvent('keyup', keyUpHandler.bind(this));
window.addEvent('keypress', keyPressHandler.bind(this));
window.addEvent('mousemove', mouseMoveHandler.bind(this));

// Used by keyboard handlers to maintain state information
var keyState = {};

/*

keyDownHandler
Handles keydown events.

*/
function keyDownHandler(_event) 
{
  var event = new Event(_event);
  var now = new Date();

  //SSLog('keyDownHandler');

  // Try to prevent accidental shift+space activation by requiring a 500ms
  //   lull since the last keypress
  if (keyState.keyDownTime &&
      now.getTime() - keyState.keyDownTime < 500)
  {
    keyState.keyDownTime = now.getTime();
    return false;
  }

  if (event.code != 16)
  {
    // Remember when last non-shift keypress occurred
    keyState.keyDownTime = now.getTime();
  }
  else if (!keyState.shiftPressed)
  {
    // Remember that shift is down
    keyState.shiftPressed = true;
    // Show the menu if the user is signed in
    if (ShiftSpace.ShiftMenu)
    {
      keyState.shiftMenuShown = true;
      ShiftSpace.ShiftMenu.show(keyState.x, keyState.y);
    }
  }

  // If shift is down and any key other than space is pressed,
  // then definately shiftspace should not be invocated
  // unless shift is let go and pressed again
  if (keyState.shiftPressed &&
    event.key != 'space' &&
    event.code != 16)
  {
    keyState.ignoreSubsequentSpaces = true;

    if (keyState.shiftMenuShown)
    {
      keyState.shiftMenuShown = false;
      ShiftSpace.ShiftMenu.hide();
    }
  }

  // Check for shift + space keyboard press
  if (!keyState.ignoreSubsequentSpaces &&
    event.key == 'space' &&
    event.shift)
  {
    //SSLog('space pressed');
    // Make sure a keypress event doesn't fire
    keyState.cancelKeyPress = true;

    /*
    // Blur any focused inputs
    var inputs = document.getElementsByTagName('input');
    .merge(document.getElementsByTagName('textarea'))
    .merge(document.getElementsByTagName('select'));
    inputs.each(function(input) {
      input.blur();
    });
    */

    // Toggle the console on and off
    if (keyState.consoleShown)
    {
      keyState.consoleShown = false;
      //SSLog('hide console!');
      if(ShiftSpace.Console) ShiftSpace.Console.hide();
    }
    else
    {
      // Check to see if there's a newer release available
      // There's probably a better place to put this call.
      if (SSCheckForUpdates()) {
        return;
      }
      //SSLog('show console!');
      keyState.consoleShown = true;
      if(ShiftSpace.Console) ShiftSpace.Console.show();
    }

  }
};


/*

keyDownHandler
Handles keyup events.

*/
function keyUpHandler(_event) 
{
  var event = new Event(_event);
  // If the user is letting go of the shift key, hide the menu and reset
  if (event.code == 16) 
  {
    keyState.shiftPressed = false;
    keyState.ignoreSubsequentSpaces = false;
    ShiftSpace.ShiftMenu.hide();
  }
}


/*

keyPressHandler
Handles keypress events.

*/
function keyPressHandler(event) 
{
  // Cancel if a keydown already picked up the shift + space
  if (keyState.cancelKeyPress) 
  {
    keyState.cancelKeyPress = false;
    event = new Event(event);
    event.stopPropagation();
    event.preventDefault();
  }
}


function mouseMoveHandler(e) 
{
  var event = new Event(e);
  keyState.x = event.page.x;
  keyState.y = event.page.y;

  if (event.shift) 
  {
    ShiftSpace.ShiftMenu.show(keyState.x, keyState.y);
  } 
  else if (ShiftSpace.ShiftMenu) 
  {
    ShiftSpace.ShiftMenu.hide();
  }
}