function(doc)
{
  if(doc.type == "user")
  {
    emit(doc.userName, doc);
  }
}