function(doc)
{
  if(doc.type == 'user')
  {
    var ret = new Document();
    ret.add(doc.userName, {field:"userName"});
    ret.add(doc.displayName, {field:"displayName"});
    return ret;
  }
  return null;
}