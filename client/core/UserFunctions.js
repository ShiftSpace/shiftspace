// ==Builder==
// @optional
// @name              UserFunctions
// @package           Core
// ==/Builder==


/*
  Function: SSUserForShift
    Returns the username for a shift.

  Parameters:
    shiftId - a shift id.

  Returns:
    The shift author's username as a string.
*/
function SSUserForShift(shiftId)
{
  return SSGetShift(shiftId).username;
}

/*
  Function: SSUserOwnsShift
    Used to check whether the currently logged in user authored a shift.

  Parameters:
    shiftId - a shift id.

  Returns:
    true or false.
*/
function SSUserOwnsShift(shiftId)
{
  return (SSUserForShift(shiftId) == ShiftSpace.User.getUsername());
}

/*
  Function: SSUserCanEditShift
    Used to check whether a user has permission to edit a shift.

  Parameters:
    shiftId - a shift id.

  Returns:
    true or false.
*/
function SSUserCanEditShift(shiftId)
{
  return (ShiftSpace.User.isLoggedIn() &&
          SSUserOwnsShift(shiftId));
}