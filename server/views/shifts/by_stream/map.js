function (doc)
{
  if(doc.type == "shift")
  {
    var streams = doc.publishData.streams;
    for(var i = 0; i < streams.length; i++)
    {
      emit(streams[i], doc);
    }
  }
}