var Actions = new Class({
  
  initialize: function() {
    this.selected = [];
    this.menuBuilt = false;
  },
  
  buildMenu: function() {
    this.doc = ShiftSpace.Console.frame.contentWindow.document;
    this.el = this.doc.getElementById('actions');
    this.el.innerHTML = 
      '<div class="group">' +
        '<a href="#" class="first button favorite"></a>' +
        '<a href="#" class="button link"></a>' +
        '<a href="#" class="button trails"></a>' +
        '<br class="clear" />' +
      '</div>' +
      '<div class="group">' +
        '<div id="privacy" class="dropdown first">' +
          '<a href="#" class="first option public">Public</a>' +
          '<a href="#" class="option private selected">Private</a>' +
        '</div>' +
        '<a href="#" class="button edit"></a>' +
        '<a href="#" class="button delete"></a>' +
        '<br class="clear" />' +
      '</div>' +
      '<br class="clear" />';
    this.dropdown = ShiftSpace._$(this.el).getElementsByClassName('dropdown')[0];
    this.dropdown = $(this.dropdown);
    this.dropdown.addEvent('click', this.clickPrivacy.bind(this));
  },
  
  select: function(shiftId) {
    this.selected.push(shiftId);
    this.showMenu();
  },
  
  deselect: function(shiftId) {
    this.selected.remove(shiftId);
    if (this.selected.length == 0) {
      this.hideMenu();
    }
  },
  
  showMenu: function() {
    if (!this.menuBuilt) {
      this.buildMenu();
      this.menuBuilt = true;
    }
    this.el.setStyle('display', 'block');
  },
  
  hideMenu: function() {
    this.el.setStyle('display', 'none');
  },
  
  clickPrivacy: function() {
    this.dropdown.toggleClass('dropdown-open');
  }
  
});

ShiftSpace.Actions = new Actions();
