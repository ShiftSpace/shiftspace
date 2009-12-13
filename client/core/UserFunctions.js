// ==Builder==
// @name              UserFunctions
// @package           Core
// ==/Builder==

// Private variable and function for controlling user authentication
var username = false;

function setUsername(_username) {
  username = _username;
}

/*
  Function: SSUserForShift
    Returns the username for a shift.

  Parameters:
    shiftId - a shift id.

  Returns:
    The shift author's username as a string.
*/
function SSUserForShift(id)
{
  return SSGetShift(id).get('userName');
}

/*
  Function: SSUserOwnsShift
    Used to check whether the currently logged in user authored a shift.

  Parameters:
    shiftId - a shift id.

  Returns:
    true or false.
*/
function SSUserOwnsShift(id)
{
  return (SSGetShift(id).createdBy == ShiftSpace.User.getId());
}

/*
  Function: SSUserCanEditShift
    Used to check whether a user has permission to edit a shift.

  Parameters:
    shiftId - a shift id.

  Returns:
    true or false.
*/
function SSUserCanEditShift(id)
{
  return (ShiftSpace.User.isLoggedIn() && SSUserOwnsShift(id));
}


function SSFollowUser(userName)
{
  return SSApp.post({
    "resource": "user",
    "id": userName,
    "action":"follow"
  });
}


function SSUnfollowUser(userName)
{
  return SSApp.post({
    "resource": "user",
    "id": userName,
    "action": "unfollow"
  });
}


function SSUserInfo(userName)
{
  return SSApp.get({
    resource: 'user',
    id: userName,
    action: 'info'
  });
}


function SSCreateGroup(groupData)
{
  return SSApp.create("group", groupData);
}


function SSInviteUsersToGroup(groupId, userIds)
{
  return SSApp.post({
    resource: 'group',
    id: groupId,
    action: 'inviteusers',
    data: {
      users: JSON.encode(userIds)
    }
  });
}

function SSJoinGroup(groupId)
{
  return SSApp.post({
    resource: 'group',
    id: groupId,
    action: 'join'
  });
}