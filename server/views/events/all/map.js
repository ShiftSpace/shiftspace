function (doc)
{
  if(doc.type == "event")
  {
    emit(doc._id, doc);
  }
}