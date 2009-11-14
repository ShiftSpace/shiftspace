function (doc)
{
  if(doc.type == "user")
  {
    streams = doc.streams;
    for(var i = 0; i < streams.length; i++)
    {
      emit([stream[i], 0]);
    }
  }
  else if(doc.type == "event")
  {
    emit([doc.streamId, 1]);
  }
}