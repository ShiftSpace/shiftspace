function (doc)
{
  if(doc.meta == "comment")
  {
    emit(doc.objectRef.split(":")[1], 1);
  }
}