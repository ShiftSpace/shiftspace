// ==Builder==
// @optional
// @export            ShiftSpacePinWidget as PinWidget
// @name              PinWidget
// @package           Pinning
// @dependencies      PinHelpers, ShiftSpaceElement
// ==/Builder==

/*
  Class: PinWidget
    A widget class that you can include on shift or space to allow for pinning functionality.  You should make use of this class if your shifts require complex targeting of HTML elements on the page.  If you space requires being embedded the HTML document or replacing an element HTML element in the document, PinWidget is designed for you.  You do not interact with the PinWidget directly.  You simply implement the delegate protocol defined by this class and everything happens automatically.
    The PinWidget class assumes that your delegate object has the following properties as methods.

    getPinRef - returns the pin reference object associated with the delegate.
    getPinWidgetButton() - returns a DOM node. This should be the DOM node where you want the PinWidget button to live.  For an example, examine the source for the Notes space.
    getPinWidgetAllowedActions() - returns an array of desired actions: before, after, replace, relative.
    onPin() - a pinEvent handler.

  Example:
    (start code)
    build: function()
    {
      // ... some interface building code ..

      var pinWidgetDiv = new ShiftSpace.Element('div', {
        'class':'MyShiftPinWidgetDiv'
      });

      this.pinWidget = new PinWidget(this);
    },

    getPinWidgetButton: function()
    {
      return this.pinWidgetDiv;
    },

    getPinWidgetButtonAllowedActions: function()
    {
      return ['before', 'after', 'replace];
    },

    onPin: function(pinRef)
    {
      if(pinRef.action == 'unpin')
      {
        this.unpin();
      }
      else
      {
        this.pin(this.element, pinRef);
      }
    }
    (end)
*/
var ShiftSpacePinWidget = new Class({

  protocol: ['getPinRef', 'getPinWidgetButton', 'getPinWidgetAllowedActions', 'onPin', 'isPinned'],

  /*
    Function: initialize
      Takes an element that will represents the pin widget button and a callback
      function.  The callback will be made when the user has pinned a node on the
      page.  The element should be an appropriate tag with the the dimensions
      19px x 19px.

    Parameters:
      delegate - the delegate of this PinWidget.  Normally this either a <ShiftSpace.Space> instance or a <ShiftSpace.Shift> instance.  In either case the delegate should implement all of the methods defined in the PinWidget delegate protocol defined above.
  */
  initialize: function(delegate)
  {
    this.delegate = delegate;

    var message = SSImplementsProtocol(this.protocol, delegate);
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
    this.iconImg = new SSElement('img', {
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

    __pinWidgets__.push(this);
  },

  /*
    Function: delegateWasPinned (private)
      Called when the delegate fires a pin event.
  */
  delegateWasPinned: function()
  {
    var pinRef = this.delegate.getPinRef();
    var targetNode = ShiftSpacePin.toNode(pinRef);

    if(targetNode != this.getPinnedElement())
    {
      this.setPinnedElement(targetNode);
      this.isPinned = true;
      this.updateMenu(pinRef.action);
      this.refresh();
    }
  },

  /*
    Function: delegateWasUnpinned (private)
      Called when the delegate fires a unpin event.
  */
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

  /*
    Function: createMenu (private)
      Creates the pinning selection menu.
  */
  createMenu: function()
  {
    this.menu = new SSElement('div', {
      'class': "SSPinMenu"
    });

    // build the menu

    // the top item
    this.menuTopItem = new SSElement('div', {
      'class': "SSPinMenuTopItem item"
    });
    this.menuTopItem.set('html', "<div class='SSLeft'><div class='radio off'></div><span></span></div><div class='SSRight'></div>");
    this.menuTopItem.injectInside(this.menu);

    // don't add this one, we'll clone it
    this.menuItem = new SSElement('div', {
      'class': "SSPinMenuItem item"
    });
    this.menuItem.set('html', "<div class='SSLeft'><div class='radio off'></div><span></span></div><div class='SSRight'></div>");

    // add the bottom items, always unpin
    this.menuBottomItem = new SSElement('div', {
      'class': "SSPinMenuBottomItem item"
    });
    this.menuBottomItem.set('html', "<div class='SSLeft'><div class='radio off'></div><span>Unpin</span></div><div class='SSRight'></div>");
    this.menuBottomItem.injectInside(this.menu);

    // hide the menu
    this.menu.setStyle('display', 'none');

    // add menu to the parent note of the delegate's pin widget button
    this.menu.injectInside(this.element.getParent());

    this.menu.addEvent('click', this.userSelectedPinAction.bind(this));
  },

  /*
    Function: setMenuItems (private)
      Sets the pin widgets menu items based on the allowed actions specified by the delegate.
  */
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
    this.menuTopItem.getElement('span').set('text', actions[0].capitalize());

    // add the rest
    for(i = 0; i < this.menu.getElements('.SSPinMenuItem').length; i++)
    {
      var item = this.menu.getElements('.SSPinMenuItem')[i];
      item.addClass(actions[i+1]);
      item.getElement('span').set('text', actions[i+1].capitalize());
    }

    // set the last item
    this.menuBottomItem.addClass('unpin');
    this.menuBottomItem.getElement('span').set('text', 'Unpin');
  },

  /*
    Function: updateMenu (private)
      Refresh the pin selection menu.
  */
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

  /*
    Function: toggleSelection (private)
      Toggles the pin selection mode. There are three, a) node selection mode, b) menu selection mode, c) pinned mode.

    Parameters:
      _evt - a DOM event.
  */
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
        SSStartPinSelection(this);
      }
      else
      {
        this.isSelecting = false;

        // stop selecting
        this.iconImg.removeClass('select');
        SSStopPinSelection();
      }
    }
  },

  /*
    Function: showMenu (private)
      Shows the pin selection options menu.

    Parameters:
      _evt - a DOM event.
  */
  showMenu: function(_evt)
  {
    var position = this.element.getPosition();
    var size = this.element.getSize();

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

  /*
    Function: hideMenu (private)
      Hides the pin selectin option menu.

    Parameters:
      _evt - a DOM event.
  */
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

  /*
    Function: userPinnedElement (private)
      User pinned the element.  This should never be called directly, ShiftSpace Core handles this.  Implicity show the pin selection option menu.

    Parameters:
      element - a DOM node.
  */
  userPinnedElement: function(element)
  {
    this.setPinnedElement(element);
    this.showMenu();
  },

  /*
    Function: setPinnedElement (private)
      Sets an internal reference to a pinned element.

    Parameters:
      element - a DOM node.
  */
  setPinnedElement: function(element)
  {
    // user selected node
    this.isSelecting = false;
    this.pinnedElement = element;
  },

  /*
    Function: getPinnedElement (private)
      Returns the pinned element. You should not call this directly.

    Parameters:
      element - a DOM node.
  */
  getPinnedElement: function(element)
  {
    return this.pinnedElement;
  },

  /*
    Function: userSelectedPinAction (private)
      Event handler that called when the user selects an option from the pin selection option menu.

    Parameters:
      _evt - a DOM event.
  */
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
      action = 'replace';
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
        this.pinRef = ShiftSpacePin.toRef(this.pinnedElement, action);
      }

      // store the shift element that is pinned
      this.delegate.onPin(this.pinRef);

      this.iconImg.addClass('pinned');
      this.isPinned = true;
    }

    // hide the menu
    this.hideMenu();
  },

  /*
    Function: refresh (private)
      Called the refresh the appearance of the pin widget.
  */
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