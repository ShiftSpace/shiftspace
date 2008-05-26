var ShiftMenu = new Class({
  
  initialize: function(options) {
    this.menuVisible = false;
  },
  
  buildMenu: function() {
    this.element = new ShiftSpace.Element('div', {
      id: 'SS_ShiftMenu'
    });
    this.element.addEvent('mouseover', function() {
      this.element.addClass('hover');
    }.bind(this));
    this.element.addEvent('mouseout', function() {
      this.element.removeClass('hover');
    }.bind(this));
    
    var container = new ShiftSpace.Element('div', {
      'class': 'container',
      styles: {
        width: (26 * spaces.length)
      }
    }).injectInside(this.element);
    this.element.injectInside(document.body);
    
    for (var spaceName in spaces) {
      this.setupSpace(spaceName);
    }
    
    new ShiftSpace.Element('br', {
      styles: {
        clear: 'both'
      }
    }).injectInside(container);
  },
  
  setupSpace: function(spaceName) {
    var spaceAttrs = ShiftSpace.info(spaceName);
    var container = this.element.firstChild;
    var button = new ShiftSpace.Element('div', {
      'class': 'button',
      'title': spaceAttrs.title
    });
    var icon = new ShiftSpace.Element('img', {
      src: spaceAttrs.icon
    });
    icon.injectInside(button);
    button.injectInside(container);
    icon.addEvent('mouseover', function() {
      button.addClass('hover');
    });
    icon.addEvent('mouseout', function() {
      button.removeClass('hover');
    });
    icon.addEvent('click', function(e) {
      if (!ShiftSpace.user.isLoggedIn()) {
        alert('Sorry, you must be signed in to create new shifts.');
        this.hide(true);
        return;
      }
      var event = new Event(e);
      initShift(spaceName, {position:{x: event.page.x, y:event.page.y}});
      this.hide(true);
    }.bind(this));
  },
  
  show: function(x, y) {
    if (!this.element) 
    {
      return;
    }
    if (!this.menuVisible && !ShiftSpaceIsHidden()) 
    {
      this.menuVisible = true;
      this.element.setStyles({
        left: (x + 10) + 'px',
        top: (y - 5) + 'px',
        display: 'block'
      });
    }
  },
  
  hide: function(forceHide) {
    if (!this.element) {
      return;
    }
    if (forceHide || !this.element.hasClass('hover')) {
      this.menuVisible = false;
      this.element.setStyle('display', 'none');
    }
  }
  
});

ShiftSpace.ShiftMenu = new ShiftMenu();
