// ==Builder==
// @required
// @package           Core
// @dependencies      RemoteFunctions
// ==/Builder==

function SSGetAllFeeds(callback)
{
  SSStreamCall('event.feed', {}, callback);
}


function SSGetFeed(streamId, callback)
{
  SSStreamCall('event.onefeed', {stream_id:streamId}, callback);
}


function SSCreateStream(displayName, uniqueName, objectRef, isPrivate, meta, superStream, callback)
{ 
  SSStreamCall('event.createstream', {
    stream_name: displayName,
    unique_name: uniqueName || "",
    object_ref: objectRef,
    private: isPrivate ? 1 : 0,
    meta: meta,
    superstream: superStream ? 1 : 0
  }, callback);
}


function SSSetStreamPermission(streamId, userId, level, callback)
{
  SSStreamCall('event.setstreampermissions', {
    stream_id: streamId,
    user_id: userId,
    level: level
  }, callback);
}


function SSFindStreams(meta, objectRef, callback)
{
  SSStreamCall('event.findstreams', {
    meta: meta || "",
    object_ref: objectRef || ""
  }, callback);
}

function SSFindStreamByUniqueName(uniqueName, callback)
{
  SSStreamCall('event.findstreambyuniquename', {
    unique_name: uniqueName
  }, callback);
}

function SSFindEvents(objectRef, callback)
{
  SSStreamCall('event.findevents', {
    object_ref: objectRef
  }, callback);
}


function SSSubscriptionsForLoggedInUser(callback)
{
  SSStreamCall('event.subscriptions', null, callback);
}


function SSSubscribeLoggedInUser(streamId, callback)
{
  SSStreamCall('event.subscribe', {
    stream_id: streamId
  }, callback);
}


function SSUnsubscribeLoggedInUser(streamId, callback)
{
  SSStreamCall('event.unsubscribe', {
    stream_id: streamId
  }, callback);
}


function SSPostEventToStream(streamId, displayString, createdBy, createdByName, objectRef, hasReadStatus, url, callback)
{
  SSStreamCall('event.post', {
    stream_id: streamId,
    display_string: displayString,
    created_by: createdBy,
    created_by_name: createdByName,
    object_ref: objectRef,
    url: url,
    has_read_status: hasReadStatus ? 1 : 0
  }, callback);
}


function SSMarkEventReadForLoggedInUser(eventId, callback)
{
  SSStreamCall('event.markread', {
    event_id: eventId
  }, callback);
}


function SSMarkEventUneadForLoggedInUser(eventId, callback)
{
  SSStreamCall('event.markunread', {
    event_id: eventId
  }, callback);
}


function SSDeleteEvent(eventId, callback)
{
  SSStreamCall('event.deleteevent', {
    event_id: eventId
  }, callback);
}


function SSFindStreamsWithEvents(objectRef, callback)
{
  SSStreamCall('event.findstreamswithevent', {
    object_ref: objectRef
  }, callback);
}


function SSStreamCall(method, params, callback)
{
  SSServerCall(method, params, callback);
}
