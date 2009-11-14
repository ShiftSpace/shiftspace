function (doc)
{
  if(doc.type == "permission")
  {
    emit([doc.userId, doc.streamId], doc);
  }
}