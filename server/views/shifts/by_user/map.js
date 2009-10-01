function(doc)
{
  if(doc.type == "shift")
  {
    emit(doc.createdBy, doc);
  }
}