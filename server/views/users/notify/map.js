function(doc)
{
  if(doc.type == "user")
  {
    for(var i = 0; i < doc.notify.length; i++)
    {
      emit(doc.notify[i], doc._id);
    }
  }
}