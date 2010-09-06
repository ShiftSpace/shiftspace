var NameSpace = Space({
  setup: function(options) {
    // Your space code goes here
  }
});

var NameShift = Shift({
  setup: function(json) {
    this.element = this.template("shift").toElement();
    $(document.body).grab(this.element);
    this.setPosition(json.position);
    this.makeDraggable();
  }
});