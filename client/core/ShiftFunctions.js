// ==Builder==
// @optional
// @name              ShiftFunctions
// @package           Core
// ==/Builder==

var shifts = {};
var __focusedShiftId__ = null; // Holds the id of the currently focused shift
var __defaultShiftStatus__ = 1;

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
Function: SSSaveNewShift
  Creates a new entry for the shift on the server.

Parameters:
  shiftJson - a shift json object, delivered from Shift.encode

See Also:
  Shift.encode
*/
function SSSaveNewShift(shiftJson)
{
  SSLog('SSSaveNewShift', SSLogShift);
  var space = SSSpaceForName(shiftJson.space);

  // remove the filters from the json object
  var filters = shiftJson.filters;
  delete shiftJson.filters;

  var params = {
    href: window.location.href,
    space: shiftJson.space,
    summary: shiftJson.summary,
    content: escape(JSON.encode(shiftJson)),
    version: space.attributes.version,
    filters: JSON.encode(filters),
    status: SSGetDefaultShiftStatus() // TODO: this call is in the space ecosystem
  };

  SSLog('saving new shift!', SSLogSystem);
  SSServerCall.safeCall('shift.create', params, function(json) {
    SSLog('>>>>>>>>>>>>>>>>> SAVED new shift', SSLogSystem);
    if (!json.status)
    {
      console.error(json.message);
      return;
    }

    shiftJson.username = ShiftSpace.User.getUsername();
    shiftJson.created = 'Just posted';
    shiftJson.status = SSGetDefaultShiftStatus();
    shiftJson.href = window.location.href;

    // with the real value
    var shiftObj = space.getShift(shiftJson.id);
    shiftObj.setId(json.id);

    // unintern this id
    SSRemoveShift(shiftJson.id);
    // we just want to change the name, so don't delete
    space.unintern(shiftJson.id);

    if (SSFocusedShiftId() == shiftJson.id) 
    {
      SSSetFocusedShiftId(json.id);
    }
    
    shiftJson.id = json.id;
    shiftJson.content = JSON.encode(shiftJson);
    
    // intern local copy
    SSSetShift(shiftJson.id, shiftJson);
    // intern the space copy
    space.intern(shiftJson.id, shiftObj);

    // add and show the shift
    if(ShiftSpace.Console)
    {
      ShiftSpace.Console.show();
      ShiftSpace.Console.addShift(shiftJson, {isActive:true});
      ShiftSpace.Console.showShift(shiftJson.id);
    }

    // call onShiftSave
    space.onShiftSave(shiftJson.id);
    
    // fire an event with the real id
    SSLog('here we go!');
    SSFireEvent('onShiftSave', shiftJson.id);
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
function SSSaveShift(shiftJson) 
{
  SSLog('SSSaveShift', SSLogShift);
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
          type: __SSInvalidShiftIdError__,
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
      space: cshift.space,
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
    var username = ShiftSpace.User.getUsername();
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
  Function: SSGetShift
    Returns a shift by shift id.

  Parameters:
    shiftId - a shift id.
*/
function SSGetShift(shiftId)
{
  var theShift = shifts[shiftId];

  if(theShift)
  {
    return theShift;
  }

  return null;
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
  Function: SSSetShift
    Update the shift properties of a shift.

  Parameters:
    shiftId - a shift id.
*/
function SSSetShift(shiftId, shiftData)
{
  shifts[shiftId] = $merge(shifts[shiftId], shiftData);
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
  // fetch a content from the network;

  var params = { shiftIds: shiftId };
  SSServerCall.safeCall('shift.get', params, function(returnArray) {
    if(returnArray && returnArray[0])
    {
      var shiftObj = returnArray[0];
      SSLog('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++', SSLogForce);
      SSLog(shiftObj, SSLogForce);
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
  var params = { shiftIds: shiftIds.join(',') };
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
  return (SSGetShift(shiftId) && SSHasProperty(SSGetShift(shiftId), ('content')));
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
  shiftId - The ID of the shift to display.
*/
function SSShowShift(shiftId)
{
  SSLog('SSShowShift >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ' + SSShiftIsLoaded(shiftId));
  if(!SSShiftIsLoaded(shiftId) && !SSIsNewShift(shiftId))
  {
    SSLog('SSLoadShift');
    // first make sure that is loaded
    SSLoadShift(shiftId, SSShowShift.bind(ShiftSpace));
    return;
  }
  else
  {
    try
    {
      SSLog('Try showing shift!');
      // get the space and the shift
      var shift = SSGetShift(shiftId);

      // check to see if this is a known space
      if (ShiftSpace.info(shift.space).unknown)
      {
        if (confirm('Would you like to install the space ' + shift.space + '?'))
        {
          SSInstallSpace(shift.space, shiftId);
          return;
        }
      }

      var space = SSSpaceForShift(shiftId);

      // load the space first
      if(!space)
      {
        SSLog(shift);
        SSLog('space not loaded ' + shift.space + ', ' + shiftId);
        SSLoadSpace(shift.space);
        return;
      }

      // if the space is loaded check if this shift can be shown
      if(space)
      {
        if(!space.canShowShift(SSGetShiftContent(shiftId)))
        {
          throw new Error();
        }
      }

      // extract the shift content
      var shiftJson = SSGetShiftContent(shiftId);
      SSLog('extracted shift json');
      shiftJson.id = shiftId;

      // SSLog('foo -- - - -- - - --- - - -- - -- -- - -');
      // SSLog(shiftJson);
      // check to make sure the css is loaded first
      if(!space.cssIsLoaded())
      {
        //SSLog('css not loaded');
        space.addDeferredShift(shiftJson);
        return;
      }

      // fix legacy content
      shiftJson.legacy = shift.legacy;

      // FIXME: make into onShowShift hook - David
      if(SSHasResource('RecentlyViewedHelpers'))
      {
        SSAddRecentlyViewedShift(shiftId);
      }

      // wrap this in a try catch
      if(typeof ShiftSpaceSandBoxMode == 'undefined')
      {
        try
        {
          SSLog('showing the shift =======================================');
          SSSpaceForName(shift.space).showShift(shiftJson);
        }
        catch(err)
        {
          SSLog('Exception: ' + SSDescribeException(err));
          console.error(err);
        }
      }
      else
      {
        // in the sandbox we just want to see the damn error
        SSSpaceForName(shift.space).showShift(shiftJson);
      }

      SSFocusShift(shift.id);

      // call onShiftShow
      space.onShiftShow(shiftId);
    }
    catch(err)
    {
      SSLog('Could not show shift, ' + SSDescribeException(err), SSLogError);
      var params = {id:shiftId};
      SSServerCall.safeCall('shift.broken', params, function(result) {
        SSLog(result);
      });

      SSShowErrorWindow(shiftId);

      // probably need to do some kind of cleanup
      if(ShiftSpace.Console) ShiftSpace.Console.hideShift(shiftId);
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
  return __focusedShiftId__;
}

/*
  Function: SSSetFocusedShiftId
    Should never be called.

  Parameters:
    newId - a shift id.
*/
function SSSetFocusedShiftId(newId)
{
  __focusedShiftId__ = newId;
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
    SSLog('>>>>>>>>>>>>>>>>>>>>>>>> shiftId ' + shiftId);
    SSFireEvent('onShiftUpdate', shiftId);
  });
}

/*
  Function: SSSetDefaultShiftStatus
    Set the default shift status, the only valid values are 1 for public, 2 for private.

  Parameters:
    value - the new shift status value.
*/
function SSSetDefaultShiftStatus(value)
{
  if(value)
  {
    __defaultShiftStatus__ = value;
    SSSetPref('defaultShiftStatus', __defaultShiftStatus__);
  }
}

/*
  Function: SSGetDefaultShiftStatus
    Returns the default shift status.

  Parameters:
    checkPref - if the value should be grabbed directly via SSGetPref.

  Returns:
    Either 1 for public or 2 for private.
*/
function SSGetDefaultShiftStatus(checkPref)
{
  return (checkPref && SSGetPref('defaultShiftStatus', 1)) || __defaultShiftStatus__;
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
  if(!SSIsNewShift(shiftId))
  {
    var shift = SSGetShift(shiftId);
    var content = unescape(shift.content);

    // if it starts with a quote remove the extra quoting, became an issue when we don't preload shifts - David
    if(content[0] == '"')
    {
      content = content.substr(1, content.length-2);
    }

    // replace any spurious newlines or carriage returns
    if(content)
    {
      content = content.replace(/\n/g, '\\n');
      content = content.replace(/\r/g, '\\r');
    }
    
    // legacy content, strip surrounding parens
    if(content[0] == "(")
    {
      content = content.substr(1, content.length-2);
    }

    var obj = null;
    try
    {
      obj = JSON.decode(content);
    }
    catch(err)
    {
      SSLog('content for shift ' + shiftId +' failed to load', SSLogError);
      throw err;
    }

    return obj;
  }
  else
  {
    return {};
  }
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
  //SSLog(shifts[shiftId]);
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