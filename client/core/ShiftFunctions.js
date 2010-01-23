// ==Builder==
// @name              ShiftFunctions
// @package           Core
// ==/Builder==

var __shifts = $H();
var __focusedShiftId = null;
var __defaultShiftStatus = 1;

function SSGetShift(id)
{
  var shift = SSApp.getDocument(id);
  if(shift) return shift;
  var p = SSLoadShift(id);
  return p;
}

/*
Function: SSInitShift
  Creates a new shift on the page.

Parameters:
  space - The name of the Space the Shift belongs to.
*/
var SSInitShift = function(space, options) 
{
  var tempId = 'newShift' + Math.round(Math.random(0, 1) * 1000000);
  var winSize = window.getSize();
  var position = (options && options.position && {x: options.position.x, y: options.position.y }) || 
                  {x: winSize.x/2, y: winSize.y/2};
  
  var shift = {
    _id: tempId,
    space: {name: space.attributes().name},
    userName: ShiftSpace.User.getUserName(),
    content: {position: position}
  };
  
  var shiftInstanceP = space.createShift(shift);
  
  $if(shiftInstanceP,
      function() 
      {
        SSApp.setDocument('global', shift);
        SSShowNewShift(space, shift);
      },
      function()
      {
        SSLog("There was an error creating the shift", SSLogError);
      }
    );
}.asPromise();

/*
  Function: SSShowNewShift
    Shows a new shift, different from showShift in that it immediately puts the shift in edit mode.

  Parameters:
    space - a space instance.
*/
var SSShowNewShift = function(space, shift)
{
  var id = shift._id;
  space.onShiftCreate(id);
  SSEditShift(space, id);
  SSFocusShift(space, id);
}.asPromise();

/*
Function: SSFocusShift
  Focuses a shift.

Parameter:
  space - a space instance.
  shiftId - a shift id.
*/
var SSFocusShift = function(space, shiftId)
{
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
  SSSetFocusedShiftId(shiftId);
  space.orderFront(shiftId);

  space.focusShift(shiftId);
  space.onShiftFocus(shiftId);

  SSScrollToShift(space, shiftId);
}.asPromise();

/*
Function: SSScrollToShift
  Scroll a shift into view.

Parameters:
  space - a space instance.
  shiftId - a shift id.
*/
function SSScrollToShift(space, shiftId)
{
  var mainView = space.mainViewForShift(shiftId);
  if(mainView && !SSIsNewShift(shiftId))
  {
    var pos = mainView.getPosition();
    var vsize = mainView.getSize();
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
        scrollFx.start(pos.x-25, pos.y-25);
      }
      else
      {
        window.start(pos.x-25, pos.y-25);
      }
    }
  }
}

/*
Function: SSBlurShift
  Blurs a shift.

Parameters:
  space - a space instance.
  shiftId - a shift id.
*/
var SSBlurShift = function(space, shiftId)
{
  space.blurShift(shiftId);
  space.onShiftBlur(shiftId);
}.asPromise();

/*
Function: SSDeleteShift
  Deletes a shift from the server.

Parameters:
  id - a shift id
*/
var SSDeleteShift = function(id) 
{
  var theShift = SSGetShift(id), spaceName = theShift.space.name;
  if(SSFocusedShiftId() == id) SSSetFocusedShiftId(null);
  var p = SSApp['delete']('shift', id);
  p.op(function(value) { 
    if(SSSpaceIsLoaded(spaceName))
    {
      var space = SSSpaceForName(spaceName);
      space.deleteShift(id);
      space.onShiftDelete(id);
    }
    SSPostNotification('onShiftDelete', id);
  });
  return p;
}.asPromise();

/*
Function: SSEditShift
  Edit a shift.

Parameters:
  space - a space instance.
  shiftId - a shift id.
*/
var SSEditShift = function(space, shiftId)
{
  var shift = SSGetShift(shiftId);
  if(SSUserCanEditShift(shiftId) || SSIsNewShift(shiftId))
  {
    var content = shift.content;
    SSFocusSpace(space, (content && content.position) || null);
    SSShowShift(space, shiftId);

    space.editShift(shiftId);
    space.onShiftEdit(shiftId);

    SSFocusShift(space, shiftId);
    SSPostNotification('onShiftEdit', shiftId);
  }
  else
  {
    window.alert("You do not have permission to edit this shift.");
  }
}.asPromise();


var SSLeaveEditShift = function(space, shiftId)
{
  var shift = SSGetShift(shiftId);
  if(!Promise.isPromise(shift) && space.hasShift(shiftId))
  {
    SSShowShift(space, shiftId);
  }
}.asPromise();

/*
Function: SSSaveNewShift
  Creates a new entry for the shift on the server.

Parameters:
  shift - a shift JSON object, delivered from Shift.encode

See Also:
  Shift.encode
*/
function SSSaveNewShift(shift)
{
  var space = SSSpaceForName(shift.space.name);

  var params = {
    href: window.location.href.split("#")[0],
    space: {name: shift.space.name, version: space.attributes().version},
    summary: shift.summary,
    content: shift
  };

  // remove _id and space from shift
  // TODO: might want to refactor this to be a little less hacky - David
  var oldId = shift._id;
  delete shift._id;
  delete shift.space;

  var p = SSApp.create('shift', params);
  $if(SSApp.noErr(p),
      function(noErr) {
        var newShift = p.value(),
            newId = newShift._id,
            instance = space.getShift(oldId);
        newShift.created = 'Just posted';

        // update the global cache
        SSApp.deleteFromCache(oldId, 'global');
        // swap the ids
        space.swap(oldId, newId);

        SSSetFocusedShiftId(newId);
        if(ShiftSpace.Console) ShiftSpace.Console.show();

        space.onShiftSave(newId);
        SSPostNotification('onNewShiftSave', newId);
        SSPostNotification('onShiftSave', newId);
      },
      function(err) {
      });
}

/*
Function: SSSaveShift
  Saves a shift's JSON object to the server.

Parameters:
  shift - a shift JSON object, delivered from Shift.encode.

See Also:
  Shift.encode
*/
function SSSaveShift(shift) 
{
  if(shift._id.substr(0, 8) == 'newShift') 
  {
    SSSaveNewShift(shift);
    return;
  }

  var space = SSSpaceForName(shift.space.name),
      params = {
        summary: shift.summary,
        content: shift,
        space: {name: shift.space.name, version: space.attributes().version}
      },
      id = shift._id;
  
  delete shift._id;
  delete shift.space;

  var p = SSApp.update('shift', id, params);
  $if(SSApp.noErr(p),
      function() {
        SSSpaceForName(shift.space.name).onShiftSave(p.get('id'));
      },
      function() {
      });
}
function SSSaveShiftById(shiftId)
{
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
  return SSGetShift(shiftId).createdBy;
}

function SSGetAuthorNameForShift(shiftId)
{
  return SSGetShift(shiftId).userName;
}

/*
Function: SSLoadShift
  Load a single shift from the network.

Parameters:
  shiftId - a shift id.
  callback - a callback handler.
*/
function SSLoadShift(id)
{
  var p = SSApp.get({resource:'shift', id:id});
  return p;
}

/*
Function: SSShowShift
  Displays a shift on the page.

Parameters:
  space - a space instance.
  shiftId - a shift id.

Returns:
  true if shift succesfully shown, false if error occured.
*/
var SSShowShift = function(space, shiftId)
{
  if(!space) return false;
  var shift = SSGetShift(shiftId);
  try
  {
    var controlp = space.showShift(shift);
    SSFocusShift(space, shiftId, controlp);
    return true;
  }
  catch(err)
  {
    SSLog(err, SSLogError);
    return false;
  }
}.asPromise();

/*
Function: SSHideShift
  Hides a shift from the page.

Parameters:
    space - a space instance.
    shiftId - a shift id.
*/
var SSHideShift = function(space, shiftId)
{
  space.hideShift(shiftId);
  space.onShiftHide(shiftId);
}.asPromise();

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

function SSFavoriteShift(id)
{
  return SSApp.post({
    resource: "shift",
    id: id,
    action: "favorite"
  });
}

function SSUnfavoriteShift(id)
{
  return SSApp.post({
    resource: "shift",
    id: id,
    action: "unfavorite"
  });
}

function SSPostComment(id, text)
{
  return SSApp.post({
    resource: "shift",
    id: id,
    action: "comment",
    data: {text:text},
    json: true
  });
}
