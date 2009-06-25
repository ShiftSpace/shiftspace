// ==Builder==
// @required
// ==/Builder==

function SSGetAllStreams(callback)
{
}

function SSGetStream(streamId, callback)
{
  
}

function SSCreateStream(callback)
{
  
}

function SSSetStreamPermission(streamId, userId, level, callback)
{
  
}

function SSFindStreams(ref, callback)
{
  
}

function SSSubscriptionsForLoggedInUser(callback)
{
  
}

function SSSubscribeLoggedInUser(streamId, callback)
{
  
}

function SSUnsubscribeLoggedInUser(streamId, callback)
{
  
}

function SSPostEventToStream(streamId, displayString, ref, hasReadStatus, callback)
{
  
}

function SSMarkEventReadForLoggedInUser(eventId, callback)
{
  
}

function SSMarkEventUneadForLoggedInUser(eventId, callback)
{
  
}

function SSStreamCall(method, params, callback)
{
  SSServerCall(method, params, callback);
}

