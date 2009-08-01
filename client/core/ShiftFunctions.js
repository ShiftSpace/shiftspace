// ==Builder==
// @optional
// @name              ShiftFunctions
// @package           Core
// ==/Builder==

var __shifts = $H();
var __focusedShiftId = null; // Holds the id of the currently focused shift
var __defaultShiftStatus = 1;

function SSSetShift(id, shift)
{
  __shifts[id] = shift;
}

function SSGetShift(id)
{
  return __shifts[id];
}

function SSUninternShift(id)
{
  delete __shifts[id];
}

/*
Function: SSInitShift
  Creates a new shift on the page.

Parameters:
  space - The name of the Space the Shift belongs to.
*/
function SSInitShift(spaceName, options) 
{
  if(!SSSpaceIsLoaded(spaceName))
  {
    SSLoadSpace(spaceName, SSInitShift.bind(null, [spaceName, options]));
    return;
  }
  
  if (!SSURLForSpace(spaceName)) 
  {
    SSLog('Space ' + spaceName + ' does not exist.', SSLogError);
    return;
  }
  
  var tempId = 'newShift' + Math.round(Math.random(0, 1) * 1000000);
  var winSize = window.getSize();
  var position = (options && options.position && {x: options.position.x, y: options.position.y }) || 
                  {x: winSize.x/2, y: winSize.y/2};
                  
  var shift = {
    _id: tempId,
    space: {name: spaceName},
    username: ShiftSpace.User.getUserName(),
    content: {position: position}
  };

  var noError = SSSpaceForName(spaceName).createShift(shift);
  
  if(noError)
  {
    SSSetShift(tempId, shift);
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
function SSFocusShift(id)
{
  var shift = SSGetShift(id);
  var space = SSSpaceForShift(id);
  var lastFocusedShift = SSFocusedShiftId();

  // unfocus the last shift
  if (lastFocusedShift &&
      SSGetShift(lastFocusedShift) &&
      lastFocusedShift != id)
  {
    var lastSpace = SSSpaceForShift(lastFocusedShift);
    if(lastSpace.getShift(lastFocusedShift))
    {
      lastSpace.getShift(lastFocusedShift).blur();
      lastSpace.orderBack(lastFocusedShift);
    }
  }
  SSSetFocusedShiftId(id);
  space.orderFront(id);

  // call
  space.focusShift(id);
  space.onShiftFocus(id);

  // scroll the window if necessary
  var mainView = space.mainViewForShift(id);

  // TODO: move the windowing logic elsewhere - David 7/31/09
  if(mainView && !SSIsNewShift(id))
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
Function: SSDeleteShift
  Deletes a shift from the server.

Parameters:
  shiftId - a shift id.
*/
function SSDeleteShift(shiftId) 
{
  if(SSShiftIsLoaded(shiftId))
  {
    var space = SSSpaceForShift(shiftId);    
    space.deleteShift(shiftId);
  }

  if(SSFocusedShiftId() == shiftId)
  {
    SSSetFocusedShiftId(null);
  }

  var params = {
    id: shiftId
  };

  SSServerCall('shift.delete', params, function(json) {
    SSLog('deleting shift', SSLogForce);
    SSLog(json, SSLogForce);
    if (json.error) 
    {
      console.error(json.message);
      return;
    }
    SSPostNotification('onShiftDelete', shiftId);
    // don't assume the space is loaded
    if(space) space.onShiftDelete(shiftId);
    SSUnloadShift(shiftId);
  });
}

/*
 Function: SSEditShift
   Edit a shift.

 Parameters:
   shiftId - a shift id.
 */
function SSEditShift(id)
{
 // make sure shift content is either loaded or that it is a newly created shift (thus no content)
 if(!SSShiftIsLoaded(id) && !SSIsNewShift(id))
 {
   // first make sure that is loaded
   SSLoadShift(id, editShift.bind(ShiftSpace));
   return;
 }
 else
 {
   var space = SSSpaceForShift(id);
   var user = SSUserForShift(id);
   var shift = SSGetShift(id);

   // load the space first
   if(!space)
   {
     SSLoadSpace(shift.space.name, function() {
       SSEditShift(id);
     });
     return;
   }

   // if the space is loaded check if this shift can be shown
   if(space)
   {
     if(!space.canShowShift(SSGetShiftContent(id)))
     {
       // bail
       return;
     }
   }

   // add a deferred shift edit if the css is not yet loaded
   if(space && !space.cssIsLoaded())
   {
     space.addDeferredEdit(id);
     return;
   }

   // if the user has permissions, edit the shift
   if(SSUserCanEditShift(id))
   {
     var shiftJson = SSGetShiftContent(id);

     // show the interface
     SSFocusSpace(space, (shiftJson && shiftJson.position) || null);

     // show the shift first, this way edit and show are both atomic - David
     SSShowShift(id);

     // then edit it
     space.editShift(id);
     space.onShiftEdit(id);

     // focus the shift
     SSFocusShift(id);

     SSPostNotification('onShiftEdit', id);
   }
   else
   {
     window.alert("You do not have permission to edit this shift.");
   }
 }
}

/*
Function: SSSaveNewShift
  Creates a new entry for the shift on the server.

Parameters:
  shiftJson - a shift json object, delivered from Shift.encode

See Also:
  Shift.encode
*/
function SSSaveNewShift(shift)
{
  var space = SSSpaceForName(shift.space.name);

  var params = {
    href: window.location.href,
    space: {name: shiftJson.space, version: space.attributes().version},
    summary: shiftJson.summary,
    content: shiftJson
  };
  
  var p = SSApp.create('shift', params);
  $if(SSApp.noErr(p),
      function() {
        var newShift = p.value();
        var newId = newShift._id;
        var oldId = shift._id;
        
        newShift.created = 'Just posted';
        
        var instance = space.getShift(oldId);
        instance.setId(newId);
        
        SSSetFocusedShiftId(newId);
        
        if(ShiftSpace.Console)
        {
          ShiftSpace.Console.show();
          ShiftSpace.Console.showShift(newId);
        }
        
        space.onShiftSave(newId);
        SSPostNotification('onShiftSave', newId);
      });
}

/*
  Function: SSSaveShift
    Saves a shift's JSON object to the server.

  Parameters:
    shiftJson - a shiftJson object, delivered from Shift.encode.

  See Also:
    Shift.encode
*/
function SSSaveShift(shift) 
{
  if (shift._id.substr(0, 8) == 'newShift') 
  {
    SSSaveNewShift(shift);
    return;
  }

  var space = SSSpaceForName(shift.space.name);
  var params = {
    summary: shift.summary,
    content: shift,
    space: {name: shift.space.name, version: space.attributes().version}
  };

  var p = SSApp.update('shift', shift._id, params);
  $if(SSApp.noErr(p),
      function() {
        ShiftSpace.Console.updateShift(p);
        SSSpaceForName(shift.space.name).onShiftSave(p.get('id'));
      });
}

/*
  Function: SSGetShifts
    Similar to SSLoadShifts, probably should be merged.  Only used by plugins.

  Parameters:
    shiftIds - an array of shift ids.
    callBack - a callback function.
    errorHandler - a error handling function.
*/
function SSGetShifts(shiftIds, callBack, errorHandler)
{
  var newShiftIds = [];
  var finalJson = {};

  newShiftIds = shiftIds;

  // put these together
  var params = { shiftIds: newShiftIds.join(',') };

  SSServerCall.safeCall('shift.get', params, function(json) {
    if(json.contains(null))
    {
      if(errorHandler && $type(errorHandler) == 'function')
      {
        errorHandler({
          type: __SSInvalidShiftIdError,
          message: "one or more invalid shift ids to SSGetShift"
        });
      }
    }
    else
    {
      // should probably filter out any uncessary data
      json.each(function(x) {
        finalJson[x.id] = x;
      });

      if(callBack) callBack(finalJson);
    }
  });
}

function SSGetPageShifts(shiftIds)
{
  var result = [];
  for(var i = 0; i < shiftIds.length; i++)
  {
    var cshift = SSGetShift(shiftIds[i]);
    var copy = {
      username: cshift.username,
      space: cshift.space.name,
      status: cshift.status
    };
    result.push(copy);
  }
  return result;
}


/*
  Function: SSGetPageShiftIdsForUser
    Gets all the shifts ids on the current page for the logged in user.

  Returns:
    An array of shift ids.
*/
function SSGetPageShiftIdsForUser()
{
  var shiftIds = [];

  if(ShiftSpace.User.isLoggedIn())
  {
    var username = ShiftSpace.User.getUserName();
    var allShifts = SSAllShifts();
    for(shiftId in allShifts)
    {
      if(SSUserForShift(shiftId) == username)
      {
        shiftIds.push(shiftId);
      }
    }
  }

  return shiftIds;
}

/*
Function: SSAllShiftIdsForSpace
  Returns all shift ids on the current url for a particular Space.

Parameters:
  spaceName - the name of the Space as a string.
*/
function SSAllShiftIdsForSpace(spaceName)
{
  var shiftsForSpace = [];
  var allShifts = SSAllShifts();
  for(shiftId in allShifts)
  {
    if(SSSpaceNameForShift(shiftId) == spaceName)
    {
      shiftsForSpace.push(shiftId);
    }
  }
  return shiftsForSpace;
}

/*
  Function: SSGetAuthorForShift
    Returns the username of the Shift owner as a string.

  Parameters:
    shiftId - a shift id.

  Returns:
    A user name as a string.
*/
function SSGetAuthorForShift(shiftId)
{
  return SSGetShift(shiftId).username;
}

/*
Function: SSGetShiftData
  Returns a copy of the shift data.

Parameters:
  shiftId - a shift id.

Returns:
  An copy of the shift's properties.
*/
function SSGetShiftData(shiftId)
{
  var shift = SSGetShift(shiftId);
  return {
    id : shift.id,
    title : shift.summary,
    summary: shift.summary,
    space: shift.space,
    href : shift.href,
    username : shift.username
  };
}


/*
  Function: SSLoadShift
    Load a single shift from the network.

  Parameters:
    shiftId - a shift id.
    callback - a callback handler.
*/
function SSLoadShift(shiftId, callback)
{
  var params = { shiftIds: shiftId };
  SSServerCall.safeCall('shift.get', params, function(returnArray) {
    if(returnArray.data && returnArray.data[0])
    {
      var shiftObj = returnArray.data[0];
      SSSetShift(shiftObj.id, shiftObj);

      if(callback && $type(callback) == 'function')
      {
        callback(shiftObj.id);
      }
    }
  });
}

/*
  Function: SSLoadShifts
    Same as SSLoadShift except handles an array of shift id.

  Parameters:
    shiftIds - an array of shift ids.
    callback - a callback handler.
*/
function SSLoadShifts(shiftIds, callback)
{
  // fetch a content from the network;
  var params = {shiftIds: shiftIds.join(',')};
  SSServerCall.safeCall('shift.get', params, function(_returnArray) {
    var returnArray = _returnArray;

    if(returnArray && returnArray.length > 0)
    {
      // filter out null shifts
      returnArray = returnArray.filter(function(x) { return x != null; });

      // update internal array
      returnArray.each(function (shiftObj) {
        SSSetShift(shiftObj.id, shiftObj);
      });

      if(callback && $type(callback) == 'function')
      {
        callback(returnArray);
      }
    }
  });
}

/*
  Function: SSShiftIsLoaded
    Check to see if the shift has it's content loaded yet.

  Parameters:
    shiftId - a shift id.

  Returns:
    a boolean value.
*/
function SSShiftIsLoaded(shiftId)
{
  return (SSGetShift(shiftId) && SSHasProperty(SSGetShift(shiftId), 'content'));
}

/*
  Function: SSUpdateTitleOfShift
    Tell the space to the update the title of the shift if necessary.

  Parameters:
    shiftId - a shift id.
    title - the new title.
*/
function SSUpdateTitleOfShift(shiftId, title)
{
  SSSpaceForShift(shiftId).updateTitleOfShift(shiftId, title);
  SSShowShift(shiftId);
}

/*
Function: SSShowShift
  Displays a shift on the page.

Parameters:
  id - The id of the shift to display.
*/
function SSShowShift(id)
{
  if(!SSShiftIsLoaded(id) && !SSIsNewShift(id))
  {
    // first make sure that is loaded
    SSLoadShift(id, SSShowShift.bind(ShiftSpace));
    return;
  }
  else
  {
    try
    {
      // get the space and the shift
      var shift = SSGetShift(id);
      
      // check to see if this is a known space
      if (ShiftSpace.info(shift.space.name).unknown)
      {
        if (confirm('Would you like to install the space ' + shift.space + '?'))
        {
          SSInstallSpace(shift.space.name, id);
          return;
        }
      }

      var space = SSSpaceForShift(id);

      // load the space first
      if(!space)
      {
        SSLoadSpace(shift.space.name);
        return;
      }

      // if the space is loaded check if this shift can be shown
      if(space)
      {
        if(!space.canShowShift(SSGetShiftContent(id)))
        {
          throw new Error();
        }
      }

      // extract the shift content
      var shiftJson = SSGetShiftContent(id);
      shiftJson._id = id;

      // check to make sure the css is loaded first
      if(!space.cssIsLoaded())
      {
        space.addDeferredShift(shiftJson);
        return;
      }

      // wrap this in a try catch
      if(typeof ShiftSpaceSandBoxMode == 'undefined')
      {
        try
        {
          SSSpaceForName(shift.space.name).showShift(shiftJson);
        }
        catch(err)
        {
          console.error(err);
        }
      }
      else
      {
        // in the sandbox we just want to see the damn error
        SSSpaceForName(shift.space.name).showShift(shiftJson);
      }

      SSFocusShift(id);
      space.onShiftShow(id);
    }
    catch(err)
    {
      SSLog(err, SSLogForce);
    }
  }
}

/*

Function: SSHideShift
  Hides a shift from the page.

Parameters:
    shiftId - The ID of the shift to hide.

*/
function SSHideShift(shiftId)
{
  var shift = SSGetShift(shiftId);
  var space = SSSpaceForShift(shiftId);

  space.hideShift(shiftId);
  space.onShiftHide(shiftId);
}

/*
  Function: SSAllShifts
    Returns the private shifts variable.
    
  Returns:
    The internal hash table of all currently loaed shifts.
*/
function SSAllShifts()
{
  return shifts;
}

/*
  Function: SSFocusedShiftId
    Returns the current focused shift's id.

  Returns:
    a shift id.
*/
function SSFocusedShiftId()
{
  return __focusedShiftId;
}

/*
  Function: SSSetFocusedShiftId
    Should never be called.

  Parameters:
    newId - a shift id.
*/
function SSSetFocusedShiftId(newId)
{
  __focusedShiftId = newId;
}

/*
  Function: SSSetShiftStatus
    Sets the shift public private status.

  Parameters:
    shiftId - a shift id.
    newStatus - the status.
*/
function SSSetShiftStatus(shiftId, newStatus) 
{
  SSGetShift(shiftId).status = newStatus;
  var params = {
    id: shiftId,
    status: newStatus
  };
  SSServerCall('shift.update', params, function() {
    SSPostNotification('onShiftUpdate', shiftId);
  });
}


/*
  Function: SSGetShiftContent
    Returns the actual content of shift.  The content is the actual
    representation of the shift as defined by the encode method of the
    originating Shift class.

  Parameters:
    shiftId - a shift id.

  Returns:
    A Javascript object with the shifts's properties.
*/
function SSGetShiftContent(shiftId)
{
  return SSGetShift(shiftId).content;
}

/*
  Function: SSGetUrlForShift
    Returns the url of a shift.

  Parameters:
    shiftId - a shift id.

  Returns:
    A url as a string.
*/
function SSGetUrlForShift(shiftId)
{
  return SSGetShift(shiftId).href;
}

/*
  Function: SSIsNewShift
    Used to check whether a shift is newly created and unsaved.

  Parameters:
    shiftId - a shift id.
*/
function SSIsNewShift(shiftId)
{
  return (shiftId.search('newShift') != -1);
}
