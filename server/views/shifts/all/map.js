function (doc) {
  if(doc.type == "shift")
  {
    emit(doc._id, doc);
  }
}