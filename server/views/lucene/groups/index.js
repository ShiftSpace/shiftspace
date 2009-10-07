function(doc)
{
  if(doc.type == 'stream' && doc.meta == 'group')
  {
    var ret = new Document();
    ret.add(doc.displayName, {field:"displayName"});
    ret.add(doc.shortName, {field:"shortName"});
    ret.add(doc.description, {field:"description"});
    return ret;
  }
  return null;
}