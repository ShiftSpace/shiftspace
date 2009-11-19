function(doc) {
  if(doc.type == 'shift') {
    var ret = new Document();
    ret.add(doc.createdBy, {field:"createdBy"});
    ret.add(doc.href, {field:"href"});
    ret.add(doc.summary, {field:"summary"});
    ret.add(doc.domain, {field:"domain"});
    ret.add(doc.publishData.dbs.join(" "), {field:"dbs"});
    ret.add(doc.publishData['private'], {field:"private"});
    ret.add(doc.publishData.draft, {field:"draft"});
    ret.add(Date.parse(doc.created), {field:"created"});
    ret.add(Date.parse(doc.modified), {field:"modified"});
    return ret;
  }
  return null;
}