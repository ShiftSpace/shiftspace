function (doc)
{
  if(doc.type == "stream" &&
     doc.meta == "comments")
  {
    var parts = doc.objectRef.split(":");
    if(parts[0] == "shift") emit(parts[1], doc);
  }
}