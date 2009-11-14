function (doc)
{
  if(doc.type == "stream")
  {
    emit(doc.uniqueName, doc);
  }
}