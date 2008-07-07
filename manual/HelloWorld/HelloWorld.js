var HelloWorldSpace = ShiftSpace.Space.extend({
  attributes: {
    name: 'HelloWorld',
    icon: 'HelloWorld.png'
  }
});

var HelloWorldShift = ShiftSpace.Shift.extend({
  setup: function(json) {
    this.message = json.message || "Hello World!";
    this.build(json);
    this.save();
    this.manageElement(this.element);
  }, // Note the comma that separates the two methods

  build: function(json) {
    this.element = new ShiftSpace.Element('div');
    this.element.appendText(this.message);
    this.element.setStyles({
      'font': '12px verdana, sans-serif',
      'position': 'absolute',
      'padding': '5px 10px 5px 10px',
      'color': '#FFF',
      'background-color': '#F63B02',
      'left': json.position.x,
      'top': json.position.y
    });	
    this.element.injectInside(document.body);
    this.element.makeDraggable({
      'onComplete': function() {
        this.save();
      }.bind(this)
    });
    this.element.addEvent('dblclick', this.changeMessage.bind(this));
  },

  changeMessage: function() {
    var msg = prompt("Please enter a new message:", this.message);
    this.message = msg;
    this.element.setHTML(msg);
    this.save();
  },

  encode: function() {
    var pos = this.element.getPosition();
    return {
      summary : this.message,
      message : this.message,
      position : pos
    };
  }

});

var HelloWorld = new HelloWorldSpace(HelloWorldShift);