/*
  Class: PinWidget
    A widget class that you can include on shift or space to allow for pinning functionality.
    The PinWidget class assumes that your delegate object has the following properties as methods.
    
    getPinWidgetButton() - returns a DOM node
    getPinWidgetAllowedActions() - returns an array of desired actions
    onPin() - a pinEvent handler
*/
var PinWidget = new Class({
  
  protocol: ['getPinWidgetButton', 'getPinWidgetAllowedActions', 'onPin'],
  
  /*
    Property:
      Takes an element that will represents the pin widget button and a callback
      function.  The callback will be made when the user has pinned a node on the
      page.  The element should be an appropriate tag with the the dimensions
      19px x 19px.
      
    Arguments:
      element - a DOM node.
      pinCallBack - a function.
      actions - an array of actions.  Valid values in this array are 'before', 'replace',
      'relative'.
  */
  initialize: function(element, pinCallBack, delegate)
  {
    this.element = element;
    this.callback = pinCallBack;
    
    // check to see if the delegate has the required properties
    /*
    if(!followsProtocol(delegate, protocol))
    {
      // throw an exception, bail
      return;
    }
    */
    
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
    this.element.addEvent('click', this.toggleSelection.bind(this));
    
    pinWidgets.push(this);
  },
  
  createMenu: function()
  {
    this.menu = new ShiftSpace.Element('div', {
      'class': "SSPinMenu"
    });
    
    this.before = new ShiftSpace.Element('div', {
      'class': "SSPinMenuTopItem before item"
    });
    this.before.setHTML("<div class='left'><div class='radio off'></div><span>Pin Before Element</span></div><div class='right'></div>");
    this.before.injectInside(this.menu);
    
    this.replace = new ShiftSpace.Element('div', {
      'class': "SSPinMenuItem replace item"
    });
    this.replace.setHTML("<div class='left'><div class='radio off'></div><span>Replace Element</span></div><div class='right'></div>");
    this.replace.injectInside(this.menu);
    
    this.after = new ShiftSpace.Element('div', {
      'class': "SSPinMenuItem after item"
    });
    this.after.setHTML("<div class='left'><div class='radio off'></div><span>After Element</span></div><div class='right'></div>");
    this.after.injectInside(this.menu);
        
    this.relative = new ShiftSpace.Element('div', {
      'class': "SSPinMenuItem relative item"
    });
    this.relative.setHTML("<div class='left'><div class='radio off'></div><span>Relative To Element</span></div><div class='right'></div>");
    this.relative.injectInside(this.menu);
    
    this.unpin = new ShiftSpace.Element('div', {
      'class': "SSPinMenuBottomItem unpin item"
    });
    this.unpin.setHTML("<div class='left'><div class='radio off'></div><span>Unpin</span></div><div class='right'></div>");
    this.unpin.injectInside(this.menu);    
    
    this.menu.setStyle('display', 'none');
    this.menu.injectInside(this.element.getParent());
    
    this.menu.addEvent('click', this.userSelectedPinAction.bind(this));
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
        if(this.iconImg.hasClass('pinned')) this.iconImg.removeClass('pinned');
      
        this.iconImg.addClass('select');
        startPinSelection(this);
      }
      else
      {
        // we are pinned
        if(this.pinnedElement) this.iconImg.addClass('pinned');
      
        this.iconImg.removeClass('select');
        stopPinSelection();
      }
    
      this.isSelecting = !this.isSelecting;
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
    
    if(!element)
    {
      this.isPinned = false;
    }
    else
    {
      this.isPinned = true;
    }
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
    
    // check to see if the pinned element has changed since last time
    var elementChanged = (this.lastPinned != this.pinnedElement);
    this.lastPinned = this.pinnedElement;
    
    // turn on the toggle
    target.getElement('.radio').removeClass('off');
    target.getElement('.radio').addClass('on');
    
    // this could probably be a little cleaner
    if(target.hasClass('unpin'))
    {

      this.callback({action: 'unpin'});
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
      this.callback(this.pinRef);
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