function (doc)
{
  if(doc.type == "stream")
  {
    emit(doc.createdBy, doc)
  }
}