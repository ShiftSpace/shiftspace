function(doc)
{
  if(doc.type == "shift")
  {
    emit(doc.href, doc);
  }
}