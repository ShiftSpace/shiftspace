function (doc)
{
  if(doc.type == "stream")
  {
    emit(doc._id, doc);
  }
}