window.addEvent('domready', function() {
  var theShift = ${shift};
  theShift = $merge(theShift, {id:'${shiftId}'});
  ${space}.setCssLoaded(true);
  ${space}.showShift(theShift);
  ${space}.orderFront('${shiftId}');
});
