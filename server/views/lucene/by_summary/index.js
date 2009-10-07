function(doc)
{
  if(doc.type == 'shift')
  {
    var ret = new Document();
    ret.add(doc.summary, {field:"summary"});
    return ret;
  }
  return null;
}