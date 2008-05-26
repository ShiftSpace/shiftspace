/*
  Class: PinWidget
    A widget class that you can include on shift or space to allow for pinning functionality.
    The PinWidget class assumes that your delegate object has the following properties as methods.
    
    getPinWidgetButton() - returns a DOM node
    getPinWidgetAllowedActions() - returns an array of desired actions
    onPin() - a pinEvent handler
*/
var PinWidget = new Class({
  
  protocol: ['getPinRef', 'getPinWidgetButton', 'getPinWidgetAllowedActions', 'onPin', 'isPinned'],
  
  /*
    Property:
      Takes an element that will represents the pin widget button and a callback
      function.  The callback will be made when the user has pinned a node on the
      page.  The element should be an appropriate tag with the the dimensions
      19px x 19px.
      
    Arguments:
      
  */
  initialize: function(delegate)
  {
    this.delegate = delegate;
    
    var message = implementsProtocol(this.protocol, delegate);
    if(!message.result)
    {
      console.error('Error: delegate does not implement PinWidget protocol. Missing ' + message.missing.join(', ') + '.');
    }
    
    this.element = delegate.getPinWidgetButton();

    // check to see if the delegate has the required properties
    /*
    if(!followsProtocol(delegate, protocol))
    {
      // throw an exception, bail
      return;
    }
    */
    
    this.isPinned = false;
    
    // inser the pin widget into the element
    this.element.addClass('SSPinWidget');
    this.menuIsVisible = false;
    
    // create an image and stick in it there
    this.iconImg = new ShiftSpace.Element('img', {
      'class': 'normal',
      'src': server + 'images/ShiftMenu/blank.png'
    });
    this.iconImg.injectInside(this.element);

    this.createMenu();
    this.setMenuItems();
    
    this.element.addEvent('click', this.toggleSelection.bind(this));
    
    // check to see if the delegate is already pinned
    this.delegate.addEvent('pin', this.delegateWasPinned.bind(this));
    this.delegate.addEvent('unpin', this.delegateWasUnpinned.bind(this));
    
    pinWidgets.push(this);
  },
  
  delegateWasPinned: function()
  {
    var pinRef = this.delegate.getPinRef();
    var targetNode = ShiftSpace.Pin.toNode(pinRef);

    if(targetNode != this.getPinnedElement())
    {
      this.setPinnedElement(targetNode);
      this.isPinned = true;
      this.updateMenu(pinRef.action)
      this.refresh();
    }
  },
  
  delegateWasUnpinned: function()
  {
    this.setPinnedElement(null);
    this.isPinned = false;
    this.refresh();
  },
  
  capitalize: function(str)
  {
    return str.charAt(0).toUpperCase()+str.substr(1, str.length-1);
  },
  
  createMenu: function()
  {
    this.menu = new ShiftSpace.Element('div', {
      'class': "SSPinMenu"
    });

    // build the menu
    
    // the top item
    this.menuTopItem = new ShiftSpace.Element('div', {
      'class': "SSPinMenuTopItem item"
    });
    this.menuTopItem.setHTML("<div class='SSLeft'><div class='radio off'></div><span></span></div><div class='SSRight'></div>");
    this.menuTopItem.injectInside(this.menu);
    
    // don't add this one, we'll clone it
    this.menuItem = new ShiftSpace.Element('div', {
      'class': "SSPinMenuItem item"
    });
    this.menuItem.setHTML("<div class='SSLeft'><div class='radio off'></div><span></span></div><div class='SSRight'></div>");
    
    // add the bottom items, always unpin
    this.menuBottomItem = new ShiftSpace.Element('div', {
      'class': "SSPinMenuBottomItem item"
    });
    this.menuBottomItem.setHTML("<div class='SSLeft'><div class='radio off'></div><span>Unpin</span></div><div class='SSRight'></div>");
    this.menuBottomItem.injectInside(this.menu);    
    
    // hide the menu
    this.menu.setStyle('display', 'none');

    // add menu to the parent note of the delegate's pin widget button
    this.menu.injectInside(this.element.getParent());
    
    this.menu.addEvent('click', this.userSelectedPinAction.bind(this));
  },
  
  setMenuItems: function()
  {
    var actions = this.delegate.getPinWidgetAllowedActions();
    
    // first make sure the menu is big enough
    var menuItemsToAdd = actions.length - 1;
    for(var i = 0; i < menuItemsToAdd; i++)
    {
      this.menuItem.clone(true).injectBefore(this.menuBottomItem);
    }
    
    // set the first menu item
    this.menuTopItem.addClass(actions[0]);
    this.menuTopItem.getElement('span').setText(actions[0].capitalize());
    
    // add the rest
    for(var i = 0; i < this.menu.getElements('.SSPinMenuItem').length; i++)
    {
      var item = this.menu.getElements('.SSPinMenuItem')[i];
      item.addClass(actions[i+1]);
      item.getElement('span').setText(actions[i+1].capitalize());
    }
    
    // set the last item
    this.menuBottomItem.addClass('unpin');
    this.menuBottomItem.getElement('span').setText('Unpin');
  },
  
  updateMenu: function(action)
  {
    var target = this.menu.getElement('.'+action);
    
    // turn off any of the other ones
    target.getParent().getElements('.radio').removeClass('on');
    target.getParent().getElements('.radio').addClass('off');
    
    // turn on the toggle
    if(action != 'unpin')
    {
      target.getElement('.radio').removeClass('off');
      target.getElement('.radio').addClass('on');
    }
  },
  
  toggleSelection: function(_evt)
  {
    var evt = new Event(_evt);
    evt.stopPropagation();
    
    // check to see if the element is alread pinned
    if(this.isPinned)
    {
      if(this.menu.getStyle('display') == 'none')
      {
        this.showMenu();
      }
      else
      {
        this.hideMenu();
      }
    }
    else
    {
      // check to see if we are in selecting mode
      if(!this.isSelecting)
      {
        this.isSelecting = true;
        
        // start selecting
        this.iconImg.addClass('select');
        startPinSelection(this);
      }
      else
      {
        this.isSelecting = false;
        
        // stop selecting
        this.iconImg.removeClass('select');
        stopPinSelection();
      }
    }
  },

  cancelPin: function()
  {
    
  },
  
  showMenu: function(_evt)
  { 
    var position = this.element.getPosition();
    var size = this.element.getSize().size;
    
    this.element.addClass('SSPinWidgetMenuOpen');
    
    this.menu.setStyles({
      left: this.element.offsetLeft - 12,
      top: this.element.offsetTop + size.y - 3,
      display: 'block'
    });
    
    // check for pin reference
    if(this.delegate.getPinRef() && this.delegate.isPinned())
    {
      this.updateMenu(this.delegate.getPinRef().action);
    }
  },
  
  hideMenu: function(_evt)
  {
    this.element.removeClass('SSPinWidgetActive');
    this.element.removeClass('SSPinWidgetMenuOpen');
    this.menu.setStyle('display', 'none');

    // remove styles 
    this.iconImg.removeClass('select');
    this.element.removeClass('SSPinWidgetMenuOpen');
    this.setPinnedElement(null);
  },
  
  userPinnedElement: function(element)
  {
    this.setPinnedElement(element)
    this.showMenu();
  },
  
  setPinnedElement: function(element)
  {
    // user selected node
    this.isSelecting = false;
    this.pinnedElement = element;
  },

  getPinnedElement: function(element)
  {
    return this.pinnedElement;
  },
  
  userSelectedPinAction: function(_evt)
  {
    var evt = new Event(_evt);
    var target = $(evt.target);
    
    while(!target.hasClass('item'))
    {
      target = target.getParent();
    }
    
    var action = null;
    
    if(target.hasClass('before')) 
    {
      action = 'before';
    }
    if(target.hasClass('replace'))
    {
      action = 'replace'
    }
    if(target.hasClass('after'))
    {
      action = 'after';
    }
    if(target.hasClass('relative'))
    {
      action = 'relative';
    }
    if(target.hasClass('unpin'))
    {
      action = 'unpin';
    }
    
    // store this for menu display
    this.pinAction = action;
    
    // check to see if the pinned element has changed since last time
    var elementChanged = (this.lastPinned != this.pinnedElement);
    this.lastPinned = this.pinnedElement;
    
    // update the menu
    this.updateMenu(action);
    
    // this could probably be a little cleaner
    if(target.hasClass('unpin'))
    {
      this.delegate.onPin({action: 'unpin'});
      
      this.iconImg.removeClass('pinned');
      this.isPinned = false;
    }
    else
    {
      this.iconImg.removeClass('select');
      this.iconImg.addClass('pinned');
      
      // if the element didn't change use the old pin ref
      // and just change the action
      if(!elementChanged)
      {
        this.pinRef.action = action;
      }
      else
      {
        this.pinRef = ShiftSpace.Pin.toRef(this.pinnedElement, action);
      }

      // store the shift element that is pinned
      this.delegate.onPin(this.pinRef);

      this.iconImg.addClass('pinned');
      this.isPinned = true;
    }
    
    // hide the menu
    this.hideMenu();
  },
  
  refresh: function()
  {
    if(!this.getPinnedElement())
    {
      this.menu.setStyle('display', 'none');
      this.iconImg.removeClass('select');
      this.iconImg.removeClass('pinned');
    }
    else
    {
      this.iconImg.removeClass('select');
      this.iconImg.addClass('pinned');
    }
    
    if(!this.menu.getStyle('display') == 'none') 
    {
      // update the menu spot
    }
  }
});
ShiftSpace.PinWidget = PinWidget;