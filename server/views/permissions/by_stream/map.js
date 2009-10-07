function (doc)
{
  if(doc.type == "permission")
  {
    emit(doc.streamId, doc);
  }
}