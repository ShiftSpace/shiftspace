function (doc)
{
  if(doc.type == "event")
  {
    emit(doc.createdBy, doc);
  }
}