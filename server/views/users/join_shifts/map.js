function(doc)
{
  if(doc.type == "user")
  {
    emit([doc._id, 0], doc);
  }
  else if(doc.type == "shift")
  {
    emit([doc.createdBy, 1], doc);
  }
}