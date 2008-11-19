// ==Builder==
// @required
// @name              ShiftMenu
// @package           ShiftSpaceUI
// @dependencies      ShiftSpaceElement, EventProxy
// ==/Builder==

/*
  Class: ShiftMenu
    A singleton Class that represents the ShiftMenu. It is used to create new shifts.
*/
var ShiftMenu = new Class({
  
  /*
    Function: initialize
      Initializes the shift menu.
  */
  initialize: function(options) 
  {
    this.menuVisible = false;
    this.spaceButtons = {};
    
    // we want to know about install and uninstall events
    SSAddEvent('onSpaceInstall', this.addSpace.bind(this));
    SSAddEvent('onSpaceUninstall', this.removeSpace.bind(this));
  },
  
  /*
    Function: buildMenu
      Construct the shift menu interface.
  */
  buildMenu: function() 
  {
    this.element = new ShiftSpace.Element('div', {
      id: 'SS_ShiftMenu',
      styles: {
        display: 'none'
      }
    });
    this.element.addEvent('mouseover', function() {
      this.element.style.display = 'block';
      this.element.addClass('hover');
    }.bind(this));
    this.element.addEvent('mouseout', function() {
      this.element.removeClass('hover');
    }.bind(this));
    
    var container = new ShiftSpace.Element('div', {
      'class': 'container',
      styles: {
        width: (26 * SSSpacesCount())
      }
    }).injectInside(this.element);
    this.element.injectInside(document.body);
    
    new ShiftSpace.Element('br', {
      styles: {
        clear: 'both'
      }
    }).injectInside(container);
    
    for (var spaceName in installed) {
      this.addSpace(spaceName);
    }
  },
  
  /*
    Function: addSpace
      Add a new space icon to the menu.
      
    Parameters:
      spaceName - the name of Space as a string.
  */
  addSpace: function(spaceName) 
  {
    // TODO: we need the icon to not be separate from the space so that we can do incremental loading.
    SSLog('adding space ' + spaceName);
    var spaceAttrs = ShiftSpace.info(spaceName);
    var container = this.element.firstChild;
    var clear = container.getElementsByTagName('br')[0];
    var button = new ShiftSpace.Element('div', {
      'class': 'button',
      'title': spaceAttrs.title
    });
    
    var icon = new ShiftSpace.Element('img', {
      src: spaceAttrs.icon
    });
    icon.injectInside(button);
    button.injectBefore(clear);
    this.spaceButtons[spaceName] = button;
    
    icon.addEvent('mouseover', function() {
      button.addClass('hover');
    });
    
    icon.addEvent('mouseout', function() {
      button.removeClass('hover');
    });
    
    icon.addEvent('click', function(e) {
      if (!ShiftSpace.User.isLoggedIn()) {
        window.alert('Sorry, you must be signed in to create new shifts.');
        this.hide(true);
        return;
      }
      if (SSCheckForUpdates()) {
        return;
      }
      var event = new Event(e);
      if(!SSSpaceForName(spaceName))
      {
        // we need to load the space first
        SSLoadSpace(spaceName, function() {
          SSInitShift(spaceName, {position:{x: event.page.x, y:event.page.y}});
        });
      }
      else
      {
        // just show it
        SSInitShift(spaceName, {position:{x: event.page.x, y:event.page.y}});
      }
      this.hide(true);
    }.bind(this));
  },
  
  /*
    Function: removeSpace
      Remove a space icon from the menu.
      
    Parameters:
      spaceName - a space name as a string.
  */
  removeSpace: function(spaceName) 
  {
    this.spaceButtons[spaceName].remove();
  },
  
  /*
    Function: show
      Show the menu.
      
    Parameters:
      x - the current x mouse location.
      y - the current y mouse location.
  */
  show: function(x, y) 
  {
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
  
  /*
    Function: hide
      hide the menu.
      
    Parameters:
      forceHide - a boolean to force hide the menu.
  */
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
