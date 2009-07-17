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


function SSCreateStream(displayName, uniqueName, objectRef, isPrivate, meta, callback)
{ 
  SSStreamCall('event.createstream', {
    stream_name: displayName,
    unique_name: uniqueName,
    object_ref: objectRef,
    private: isPrivate,
    meta: meta
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


function SSGetStreams(objectRef, meta, callback)
{
  SSStreamCall('event.getstreams', {
    object_ref: objectRef,
    meta: meta
  }, callback);
}


function SSGetStreamsByMeta(meta, callback) {
  SSStreamCall('event.getstreamsbymeta', {
    meta: meta
  }, callback);
}


function SSFindStreams(objectRef, callback)
{
  SSStreamCall('event.findstreams', {
    object_ref: objectRef
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


function SSPostEventToStream(streamId, displayString, createdBy, createdByName, objectRef, hasReadStatus, callback)
{
  SSStreamCall('event.post', {
    stream_id: streamId,
    display_string: displayString,
    created_by: createdBy,
    created_by_name: createdByName,
    object_ref: objectRef,
    has_read_status: hasReadStatus
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
