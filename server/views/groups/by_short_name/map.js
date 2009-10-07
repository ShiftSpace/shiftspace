function (doc)
{
  if(doc.type == "stream" && doc.meta == "group")
  {
    emit(doc.shortName, doc);
  }
}