function (doc)
{
  if(doc.meta == "comment")
  {
    emit(doc.createdBy, doc);
  }
}