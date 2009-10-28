function (doc)
{
  if(doc.type == "shift")
  {
    emit(doc.domain, 1);
  }
}