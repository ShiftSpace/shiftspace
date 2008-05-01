/*
  Class: Shift
  The base class for shifts.
*/
ShiftSpace.Shift = new Class({
  getDefaults: function()
  {
    return {};
  }, 
  
  /*
    Function : initialize
      Takes a json object and creates the shift.
      
    Parameter :
      json - The JSON object that contains the properties the shift will have.
      options - Extra options.
  */
  initialize: function(_json)
  {
    this.setOptions(this.getDefaults(), _json);
    
    // private id var
    var id = _json.id;
    // private parent shift var
    var parentSpace;

    // rename options to json
    this.defaults = this.options;
    
    // the above probably should privatized against people accidentally using the options property
    
    // These two functions prevent spoofing an id
    // The id can be set only at shift instantiation
    // and Shiftspace checks if id number is available
    // or whether or not it is already in use and if it
    // isn't it use, the json object must be equal to the
    // one in Shiftspace.
    // perhaps ID block should be part of a user session?
    
    /* ------------------- Private Getters/Setters ------------------- */
    this.setId = function( aId ) {
      if( id == null || id.substr(0, 8) == 'newShift')
      {
        id = aId;
      }
    }
    
    this.getId = function() {
      return id;
    }
    
    this.setParentSpace = function(_parentSpace) {
      if( parentSpace == null )
      {
        parentSpace = _parentSpace;
      }
    }
    
    this.getParentSpace = function() {
      return parentSpace;
    }
    /* ------------------- End Private Getters/Setters ----------------- */
    
    // set the id & parent space
    if( _json.id )
    {
      this.setId( _json.id );
    }
    if( this.options.parentSpace )
    {
      this.setParentSpace( this.options.parentSpace );
    }
    
    // listen for focus events on this shift
    this.addEvent( 'onFocus', this.userFocused.bind( this ) );
    
    // call setup
    this.setup(_json);

    return this;
  },
  
  setup: function(json) {},
  
  /*
    Function: setFocusRegions
      Takes a variable list of DOM element that will trigger this
      shift to fire an onFocus event.
  */
  setFocusRegions : function()
  {
    var args = new Array(arguments);

    for( var i = 0; i < arguments.length; i++ )
    {
      var aRegion = arguments[i];
      aRegion.addEvent('mousedown', function() {
       this.fireEvent('onFocus', this);
      }.bind(this));
    }
  },
  
  /*
    Function: edit
      The shift should present it's editing interface.
  */
  edit: function() {},

  /*
    Function : save
      Fires the onUpdate event for anyone who is listening. Passes a ref to this object as
      the event parameter.
  */
  save : function()
  {
    // We can use events here because if we do
    // a Shift cannot save in their initialize method
    this.getParentSpace().updateShift( this );
  },
  
  /*
    Function: refresh
      You should always provide some kind of refresh function
      so that your shift can correct itself for resize operations,
      window size changs, showing, hiding, etc.
  */
  refresh : function() {},
  
  /*
    Function : encode
      This returns a JSON object that contains the properties which were passed in at
      object creation.
      
    Returns :
      A object.
  */
  encode : function()
  {
    return {};
  },
  
  /*
    Function : canShow
      A function which determines whether the shift can be shown.
      
    Returns :
      A boolean.
  */
  canShow : function()
  {
    return true;
  },
  
  /*
    Function : canHide
      A function which determines whether the shift can be hidden.
      
    Returns :
      A boolean.
  */
  canHide : function()
  {
    return true;
  },
  
  /*
    Function : destroy
      Cleanup.
  */
  destroy : function()
  {
    this.element.remove();
  },

  /*
    Function : show
      Make the shift visible.
  */
  show : function(el)
  {
    // make sure the editing interface is hidden
    

    var mainView = this.getMainView();
    if( mainView )
    {
      mainView.removeClass('SSDisplayNone');
    }
    this.refresh();
  },
  
  
  /*
    Function : hide
      Hide the shift.
  */
  hide : function(el)
  {
    var mainView = this.getMainView();
    if( mainView )
    {
      mainView.addClass('SSDisplayNone');
    }
  },
  
  /*
    Function : manageElement
      Sets the main view of the shift.  This lets ShiftSpace now what the main display
      element of your Shift is.  This is required for proper display ordering.
      
    Parameters:
      el - A ShiftSpace.Element
  */
  manageElement : function( el )
  {
    if( el )
    {
      this.mainView = el;
      this.mainView.addEvent('mousedown', function() {
        this.fireEvent('onFocus', el);
      }.bind(this));
    }
    else
    {
      console.error('Error: Attempt to set mainView to null.');
    }
  },
  
  /*
    Function : userFocused
      Fires the focus event to notify the Space a shift was focused.
  */
  userFocused : function()
  {
    this.fireEvent('onShiftFocus', this );
  },
  
  /*
    Function : focus
      This gets called when this shift gets focused.
  */
  focus : function() {},
  
  /*
    Function: unfocus
      This gets 
  */
  blur : function() {},
  
  /*
    Function: getMainView
      Returns the main view of the shift.  Without this ShiftSpace cannot order the shift.
      
    Returns:
      ShiftSpace.Element
  */
  getMainView : function()
  {
    return this.mainView;
  },
  
  /*
    Function: mainViewIsVisible
      Returns whether the main view is visible or not.
      
    Returns:
      boolean
  */
  mainViewIsVisible : function()
  {
    // TODO: change for 1.2 - David
    return ( this.mainView.getStyle('display') != 'none' );
  },
  
  getRegion : function()
  {
    var pos = this.getMainView().getPos();
    var size = this.getMainView().getSize().size;
    
    return {
      left : pos.x,
      right : pos.x + size.x,
      top : pos.y,
      bottom : pos.y + size.y
    };
  },
  
  /*
    Function: pin
      Pins an element of the shift to a node on the page.
    
    Parameters:
      element - the Element to be pinned.
      pinRef - A pinRef JSON object created by ShiftSpace.Pin
      
    See Also:
      ShiftSpace.Pin
  */
  pin : function(element, _pinRef)
  {
    // we should probably copy this
    var pinRef = _pinRef;
    this.setPinRef(_pinRef);

    // get the target
    var pinTarget = ShiftSpace.Pin.toNode(pinRef);
    
    // store some styles from the pin target
    if(pinTarget && pinRef.action == 'replace') 
    {
      this.setPinTargetStyles(pinTarget.getStyles('width', 'height', 'float'));
    }
    
    // store the size before pinning
    this.setPinElementDimensions(element.getSize().size);

    // this is already pinned need to unpin first
    if(this.getPinElement())
    {
      // clears everything
      this.unpin();
    }
    
    // save stuff
    this.setPinTarget(pinTarget);
    this.setPinElement(element);
    
    // call ShiftSpace Pin API to pin this element
    pinElement(element, pinRef);
  },
  
  /*
    Function: unPin
      Unpins an element of this shift from a element on the page.
  */
  unpin : function()
  {
    // check to make sure there is an pinned element to restore
    if(this.getPinElement())
    {
      // restore the old node
      this.getPinElement().replaceWith(this.getPinTarget());
      
      // clear out these vars
      this.setPinTarget(null);
      this.setPinElement(null);
      this.setPinRef(null);
    }
  },
  
  /*
    Function: setPinElement
      Set the element of the shift that will actually be pinned.
      
    Parameters:
      newEl - The element of the shift that will be pinned.
  */
  setPinElement: function(newEl)
  {
    this.pinElement = newEl;
  },
  
  /*
    Function: getPinElement
      Returns the current element that is pinned.  This will return
      null if the shift is not currently pinned.
  */
  getPinElement: function()
  {
    return this.pinElement;
  },
  
  /*
    Function: setPinRef
      Set the current pinRef object. This is normally called automatically
      you should rarely if ever call this directly.
      
    Parameters:
      pinRef - Set the current pinRef object.
  */
  setPinRef : function(pinRef)
  {
    this.pinRef = pinRef
  },
  
  /*
    Function: getPinRef
      Returns the set pinRef object if this shift has one.
  */
  getPinRef : function()
  {
    // update the offset
    if(this.pinRef && this.pinRef.action == 'relative')
    {
      var elpos = this.getPinElement();
      var tpos = this.getPinTarget();
      
      this.pinRef.offset = {x: elpos.x - tpos.x, y: elpos.y - tpos.y};
    }
    
    return this.pinRef
  },
  
  /*
    Function: setPinTarget
      Sets the pin target.  This is the element on the page that has been targeted
      by the user.
      
    Parameters:
      pinTarget - A DOM node.
  */
  setPinTarget: function(pinTarget)
  {
    this.pinTarget = pinTarget;
  },
  
  /*
    Function: getPinTarget
      Returns the current pin target if there is one.
  */
  getPinTarget: function()
  {
    return this.pinTarget;
  },
  
  /*
    Function: setPinTargetStyles
      When replacing a target node or being inserted before or after it is important
      to pick up some of the CSS dimensions of that target node.  In the case of replacing
      these styles need to be saved before the node is replaced and removed from the
      page DOM.
      
    Parameters:
      newStyles - A JSON object of saved CSS dimension styles.
  */
  setPinTargetStyles : function(newStyles)
  {
    this.targetStyles = newStyles;
  },
  
  /*
    Function: getPinTargetStyles
      Returns the JSON object of the target nodes CSS dimension styles.
  */
  getPinTargetStyles : function()
  {
    return this.targetStyles;
  },
  
  setPinElementDimensions: function(size)
  {
    this.pinElementDimensions = size;
  },
  
  getPinElementDimensions: function(size)
  {
    return this.pinElementDimensions;
  },
  
  /*
    Function: isPinned
      Returns true if this shift is currently pinned.
  */
  isPinned : function()
  {
    return (this.getPinTarget() != null);
  },
  
  /*
    Function : build
      Build the DOM for the shift.
  */
  build : function()
  {
  }
});

ShiftSpace.Shift.implement( new Options );
ShiftSpace.Shift.implement( new Events );
