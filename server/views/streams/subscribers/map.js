function (doc)
{
  if(doc.type == "user")
  {
    var streams = doc.streams;
    for(var i = 0; i < streams.length; i++)
    {
      emit(streams[i], doc);
    }
  }
}