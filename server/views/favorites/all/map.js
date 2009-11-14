function (doc) {
  if(doc.type == "favorite") {
    emit(doc._id, doc);
  }
}