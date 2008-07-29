var TheirViewSpace = ShiftSpace.Space.extend({
    attributes: {
        name: 'TheirView',
        icon: 'TheirView.png',
		title: 'TheirView'
    }
});

var TheirViewShift = ShiftSpace.Shift.extend({
	initialize: function(json) {
		this.parent(json);
		this.build(json);
	},
	build: function(json) {
		console.log("build function");
		return true;
	},
});

var TheirView = new TheirViewSpace(TheirViewShift);

// load style
// load javascript

console.log("http://www.theirview.org/webservice.php/action=css.theirview/");
console.log("http://theirview.shansi.paul.geek.nz/webservice.php/action=javascript.blocks/");
