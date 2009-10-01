function(doc) {
  if(doc.type == "favorite")
  {
     var parts = doc._id.split(":");
     var shiftId = parts[2];
     emit(shiftId, 1);
  }
}