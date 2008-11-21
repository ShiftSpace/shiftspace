// ==Builder==
// @optional
// @name              ShiftFunctions
// @package           Core
// ==/Builder==

/*
Function: SSInitShift
  Creates a new shift on the page.

Parameters:
  space - The name of the Space the Shift belongs to.
*/
function SSInitShift(spaceName, options) 
{
  SSLog('spaceName: ' + spaceName);
  if (!installed[spaceName]) 
  {
    SSLog('Space ' + spaceName + ' does not exist.', SSLogError);
    return;
  }

  var tempId = 'newShift' + Math.round(Math.random(0, 1) * 1000000);
  while (SSGetShift(tempId)) 
  {
    tempId = 'newShift' + Math.round(Math.random(0, 1) * 1000000);
  }

  var _position = (options && options.position && { x: options.position.x, y: options.position.y }) || null;
  var shiftJson = {
    id: tempId,
    space: spaceName,
    username: ShiftSpace.User.getUsername(),
    position: _position
  };
  //SSLog(shiftJson);

  SSSetShift(tempId, shiftJson);

  SSLog('+++++++++++++++++++++++++++++++++++++++++++++++');
  SSLog(SSSpaceForName(spaceName));
  SSLog('calling create shift');
  
  var noError = SSSpaceForName(spaceName).createShift(shiftJson);
  
  SSLog('noError : ' + noError);
  
  if(noError)
  {
    //SSLog('tempId:' + tempId);
    SSShowNewShift(tempId);
  }
  else
  {
    console.error("There was an error creating the shift");
  }
}

/*
  Function: SSShowNewShift
    Shows a new shift, different from showShift in that it immediately puts the shift in edit mode.

  Parameters:
    shiftId - a shift id.
*/
function SSShowNewShift(shiftId)
{
  var space = SSSpaceForShift(shiftId);

  // call onShiftCreate
  SSLog('SSShowNewShift');
  SSShowShift(shiftId); // TODO: remove - David
  SSLog('calling onShiftCreate');
  space.onShiftCreate(shiftId);
  SSEditShift(shiftId);
  SSFocusShift(shiftId, false);
}

/*
Function: SSFocusShift
  Focuses a shift.

Parameter:
  shiftId - the id of the shift.
*/
function SSFocusShift(shiftId)
{
  var shift = SSGetShift(shiftId);
  var space = SSSpaceForShift(shiftId);
  var lastFocusedShift = SSFocusedShiftId();

  // unfocus the last shift
  if (lastFocusedShift &&
      SSGetShift(lastFocusedShift) &&
      lastFocusedShift != shiftId)
  {
    var lastSpace = SSSpaceForShift(lastFocusedShift);
    if(lastSpace.getShift(lastFocusedShift))
    {
      lastSpace.getShift(lastFocusedShift).blur();
      lastSpace.orderBack(lastFocusedShift);
    }
  }
  SSSetFocusedShiftId(shift.id);
  space.orderFront(shift.id);

  // call
  space.focusShift(shiftId);
  space.onShiftFocus(shiftId);

  // scroll the window if necessary
  var mainView = space.mainViewForShift(shiftId);

  if(mainView && !SSIsNewShift(shiftId))
  {
    var pos = mainView.getPosition();
    var vsize = mainView.getSize();
    //var viewPort = window.getSize().viewPort; // window.getViewPort();
    var viewPort = window.getSize();
    var windowScroll = window.getScroll();

    var leftScroll = (windowScroll.x > pos.x-25);
    var rightScroll = (windowScroll.x < pos.x-25);
    var downScroll = (windowScroll.y < pos.y-25);
    var upScroll = (windowScroll.y > pos.y-25);

    if(pos.x > viewPort.x+windowScroll.x ||
       pos.y > viewPort.y+windowScroll.y ||
       pos.x < windowScroll.x ||
       pos.y < windowScroll.y)
    {
      var scrollFx = new Fx.Scroll(window, {
        duration: 1000,
        transition: Fx.Transitions.Cubic.easeIn
      });

      if(!window.webkit)
      {
        scrollFx.scrollTo(pos.x-25, pos.y-25);
      }
      else
      {
        window.scrollTo(pos.x-25, pos.y-25);
      }
    }
  }
  else
  {
    //SSLog('+++++++++++++++++++++++++++++++++++++++ NO MAIN VIEW');
  }
}

/*
  Function: SSBlurShift
    Blurs a shift.

  Parameters:
    shiftId - a shift id.
*/
function SSBlurShift(shiftId)
{
  // create a blur event so console gets updated
  var space = SSSpaceForShift(shiftId);
  space.blurShift(shiftId);
  space.onShiftBlur(shiftId);
}

/*
  Function: SSRemoveShift
    Remove a shift from the internal array.

  Parameters:
    shiftId - a shift id.
*/
function SSRemoveShift(shiftId)
{
  delete shifts[shiftId];
}

/*
Function: SSDeleteShift
  Deletes a shift from the server.

Parameters:
  shiftId - a shift id.
*/
function SSDeleteShift(shiftId) 
{
  var space = SSSpaceForShift(shiftId);

  // don't assume the space is loaded
  if(space) space.deleteShift(shiftId);

  if(SSFocusedShiftId() == shiftId)
  {
    SSSetFocusedShiftId(null);
  }

  var params = {
    id: shiftId
  };

  SSServerCall('shift.delete', params, function(json) {
    if (!json.status) 
    {
      console.error(json.message);
      return;
    }
    if(ShiftSpace.Console) ShiftSpace.Console.removeShift(shiftId);
    // don't assume the space is loaded
    if(space) space.onShiftDelete(shiftId);
    SSRemoveShift(shiftId);
  });
}

/*
 Function: SSEditShift
   Edit a shift.

 Parameters:
   shiftId - a shift id.
 */
function SSEditShift(shiftId)
{
 // make sure shift content is either loaded or that it is a newly created shift (thus no content)
 if(!SSShiftIsLoaded(shiftId) && !SSIsNewShift(shiftId))
 {
   // first make sure that is loaded
   SSLoadShift(shiftId, editShift.bind(ShiftSpace));
   return;
 }
 else
 {
   var space = SSSpaceForShift(shiftId);
   var user = SSUserForShift(shiftId);
   var shift = SSGetShift(shiftId);

   // load the space first
   if(!space)
   {
     SSLoadSpace(shift.space, function() {
       SSEditShift(shiftId);
     });
     return;
   }

   // if the space is loaded check if this shift can be shown
   if(space)
   {
     if(!space.canShowShift(SSGetShiftContent(shiftId)))
     {
       // bail
       return;
     }
   }

   // add a deferred shift edit if the css is not yet loaded
   if(space && !space.cssIsLoaded())
   {
     space.addDeferredEdit(shiftId);
     return;
   }

   // if the user has permissions, edit the shift
   if(SSUserCanEditShift(shiftId))
   {
     var shiftJson = SSGetShiftContent(shiftId);

     // show the interface
     SSFocusSpace(space, (shiftJson && shiftJson.position) || null);

     // show the shift first, this way edit and show are both atomic - David
     SSShowShift(shiftId);

     // then edit it
     space.editShift(shiftId);
     space.onShiftEdit(shiftId);

     // focus the shift
     SSFocusShift(shiftId);

     SSFireEvent('onShiftEdit', shiftId);
   }
   else
   {
     window.alert("You do not have permission to edit this shift.");
   }
 }
}

/*
  Function: SSSaveShift
    Saves a shift's JSON object to the server.

  Parameters:
    shiftJson - a shiftJson object, delivered from Shift.encode.

  See Also:
    Shift.encode
*/
function SSSaveShift(shiftJson) 
{
  //SSLog('saveShift');
  //SSLog(shiftJson);

  // if new skip to SSSaveNewShift
  if (shiftJson.id.substr(0, 8) == 'newShift') {
    SSSaveNewShift.safeCall(shiftJson);
    return;
  }

  var filters = shiftJson.filters;
  delete shiftJson.filters;

  var space = SSSpaceForName(shiftJson.space);
  var params = {
    id: shiftJson.id, // TODO: handle this in a more secure way
    summary: shiftJson.summary,
    content: escape(JSON.encode(shiftJson)), // MERGE: for 0.5 - David
    version: space.attributes.version,
    username: ShiftSpace.User.getUsername(),
    filters: JSON.encode(filters)
  };

  // if a legacy shift is getting updated, we should update the space name
  var shift = SSGetShift(shiftJson.id);
  if(shift.legacy)
  {
    params.space = space.attributes.name;
  }

  SSServerCall.safeCall('shift.update', params, function(json) {
    SSLog('returned shift.update! ' + JSON.encode(json));
    if (!json.status) {
      console.error(json.message);
      return;
    }
    if(ShiftSpace.Console) ShiftSpace.Console.updateShift(shiftJson);
    // call onShiftSave
    SSSpaceForName(shiftJson.space).onShiftSave(shiftJson.id);
  });
}
