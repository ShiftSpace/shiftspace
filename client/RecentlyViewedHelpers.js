// ==Builder==
// @optional
// @name              RecentlyViewedHelpers
// @package           Trails
// @dependencies      TrailsPlugin
// ==/Builder==

/*
  Function: SSAddRecentlyViewedShift
    Add a recently viewed shift.

  Parameters:
    shiftId - a shift id
*/
function SSAddRecentlyViewedShift(shiftId)
{
  // store a reference to this
  // TODO: only add these if the user is logged in
  if(ShiftSpace.User.isLoggedIn() && !SSIsNewShift(shiftId))
  {
    getValue.safeCallWithResult(ShiftSpace.User.getUsername()+'.recentlyViewedShifts', null, null, function(recentlyViewedShifts) {
      // simply mark the ids
      recentlyViewedShifts.unshift(shiftId);
      // store the recently viewed shifts
      setValue(ShiftSpace.User.getUsername() + '.recentlyViewedShifts', recentlyViewedShifts);
    });
  }
}

/*
  Function: SSGetRecentlyViewedShifts
    Returns a hash of recently viewed shifts.  The shifts are hashed by
    their id.  Each id points to a Javascript object that has the metadata
    for that particular shift.

  Parameters:
    callback - a function to be called when the operation is complete.  A callback is necessary since plugins have access.
*/
function SSGetRecentlyViewedShifts(callback)
{
  // array of shifts on the currently viewed url
  var localShifts = {};
  // array of shifts living on other urls
  var remoteShifts = [];

  // grab the local shifs and generate an array of remote shifts
  getValue.safeCallWithResult(ShiftSpace.User.getUsername()+'.recentlyViewedShifts', null, null, function(recentlyViewedShifts) {
    var len = recentlyViewedShifts.length;

    len.times(function(i) {
      var shiftId = recentlyViewedShifts[i];
      if(SSGetShift(shiftId))
      {
        localShifts[shiftId] = SSGetShiftData(shiftId);
      }
      else
      {
        remoteShifts.push(shiftId);
      }
    });

    if(remoteShifts.length > 0)
    {
      SSLoadShifts(remoteShifts, function(remoteShiftsArray) {
        // convert array into hash
        var theRemoteShifts = {};
        remoteShiftsArray.each(function(shift) {
          theRemoteShifts[shift.id] = shift;
        });
        // merge local and remote
        callback($merge(localShifts, theRemoteShifts));
      });
    }
    else
    {
      callback(localShifts);
    };
  });
}