// ==Builder==
// @required
// ==/Builder==

function SSGetAllFeeds(callback)
{
}

function SSGetFeed(streamId, callback)
{
  
}

function SSCreateStream(callback)
{
  SSStreamCall('event.createstream', callback);
}

function SSSetStreamPermission(streamId, userId, level, callback)
{
  SSStreamCall('event.setstreampermissions', {
    stream_id: streamId,
    user_id: userId,
    level: level
  }, callback);
}

function SSFindStreams(ref, callback)
{
  SSStreamCall('event.findstreams', {
    object_ref: ref
  }, callback);
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

