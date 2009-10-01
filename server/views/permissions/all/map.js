function (doc)
{
  if(doc.type == 'permission')
  {
    emit(doc._id, doc);
  }
}