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
    console.log('====================================================== STARTING UP');
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
    
    if( _json.summary )
    {
      this.setTitle(_json.summary);
    }
    
    console.log('======================================== CALLING SETUP ' + this.getParentSpace().attributes.name);
    
    // call setup
    this.setup(_json);
    
    // TODO: should pin if it's possible to pin - David

    return this;
  },
  
  setup: function(json) 
  {
  },
  
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
        this.focus();
      }.bind(this));
    }
  },
  
  /*
    Function: edit
      The shift should present it's editing interface.
  */
  edit: function() {
    this.setIsBeingEdited(true);
  },

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
    this.fireEvent('onShiftSave', this.getId());
  },
  
  markDirty: function()
  {
    this.dirty = true;
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
    if(this.getMainView() && this.getMainView().getParent())
    {
      this.getMainView().remove();
    }

    this.fireEvent('onShiftDestroy', this.getId());
  },

  _show: function()
  {
    
  },

  /*
    Function : show
      Make the shift visible.
  */
  show : function(el)
  {
    this.setIsVisible(true);
    var mainView = this.getMainView();
    
    if( mainView )
    {
      mainView.removeClass('SSDisplayNone');
    }
    
    this.refresh();
    

    this.fireEvent('onShiftShow', this.getId());
  },
  
  _hide : function()
  {
    
  },
  
  /*
    Function : hide
      Hide the shift.
  */
  hide : function(el)
  {
    this.setIsVisible(false);
    var mainView = this.getMainView();

    if( mainView )
    {
      mainView.addClass('SSDisplayNone');
    }
    
    this.fireEvent('onShiftHide', this.getId());
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
        this.focus();
      }.bind(this));
    }
    else
    {
      console.error('Error: Attempt to set mainView to null.');
    }
  },
  
  /*
    Function : focus
      Tell ShiftSpace we want to focus this shift.
  */
  focus : function() {
    this.fireEvent('onShiftFocus', this.getId() );
  },
  
  /*
    Function: onFocus
      Do any updating of the shift's interface here.
  */
  onFocus: function() {},
  
  /*
    Function: unfocus
      Tell ShiftSpace we want to blur this shift.
  */
  blur : function() {
    this.setIsBeingEdited(false);
    this.fireEvent('onShiftBlur', this.getId() );
  },
  
  /*
    Function: onBlur
      Do any updating of the shift's interface here.
  */
  onBlur: function() {},
  
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
  
  setIsVisible: function(val)
  {
    this.__isVisible__ = val;
  },
  
  isVisible: function()
  {
    return  this.__isVisible__;
  },
  
  setIsBeingEdited: function(val)
  {
    this.__isBeingEdited__ = val;
  },
  
  isBeingEdited: function(val)
  {
    return this.__isBeingEdited__;
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
  pin : function(element, pinRef)
  {
    // get the target
    var pinTarget = ShiftSpace.Pin.toNode(pinRef);

    if(pinTarget)
    {
      // valid pin ref
      this.setPinRef(pinRef);

      // store some styles from the pin target, if action is replace
      switch(pinRef.action)
      {
        case 'replace':
          // we want the width, height and flow of the original if replace
          var targetStyles = pinTarget.getStyles('width', 'height', 'float');
          this.setPinTargetStyles(targetStyles);
          element.setStyles(targetStyles);
        break;
        
        case 'relative':
        break;
        
        default:
        break;
      }
    
      // store the size before pinning
      this.setPinElementDimensions(element.getSize().size);

      // this is already pinned need to unpin first
      if(this.getPinElement())
      {
        // clears everything
        this.unpin();
      }
    
      this.setPinTarget(pinTarget);
      this.setPinElement(element);
    
      // call ShiftSpace Pin API to pin this element
      pinRef.shift = this;
      pinElement(element, pinRef);
    }
    else
    {
      // Should throw an Exception ? - David
    }
    
    // fire a pin event
    this.fireEvent('pin', this);
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
      unpinElement(this.getPinRef());
      
      // clear out these vars
      this.setPinTarget(null);
      this.setPinElement(null);
    }
    
    this.fireEvent('unpin', this);
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
    return this.pinRef
  },
  
  /*
    Function: getEncodablePinRef
      This returns a version of the pin reference object that is encodable.  This is necessary
      because we store dom node references in the pin reference and these should not
      get encoded on Shift save.
      
    Returns:
      And encodable JSON representation of the pin reference object.
  */
  getEncodablePinRef: function()
  {
    var pinRef = this.getPinRef();
    var temp = {};
    
    // don't attempt to encode element, targetElement, or wrapper properties
    for(var key in pinRef)
    {
      if(!['element','targetElement', 'wrapper', 'shift', 'originalStyles', 'targetStyles'].contains(key))
      {
        temp[key] = pinRef[key];
      }
      
      if(key == 'offset' && pinRef.action == 'relative')
      {
        // we need to get the latest offset
        temp['offset'] = {x: pinRef.element.offsetLeft, y: pinRef.element.offsetTop};
      }
    }
    
    return temp;
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
  
  setPinElementStyles : function(newStyles)
  {
    this.pinElementStyles = newStyles;
  },
  
  getPinElementStyles: function()
  {
    return this.pinElementStyles;
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
  
  updateTitle: function(newTitle)
  {
    if(newTitle && newTitle != this.getTitle())
    {
      this.setTitle(newTitle);
      this.save();
    }
  },
  
  setTitle : function(newTitle)
  {
    this.__title__ = newTitle;
  },
  
  getTitle: function()
  {
    return this.__title__;
  },
  
  /*
    Function : build
      Build the DOM for the shift.
  */
  build : function()
  {
  },
  
  /*
  */
  failedView: function()
  {
    // TODO: Show the failed view, if this shift can't be shown
  },
  
  errorView: function(err)
  {
    
  },
  
  xmlHttpRequest: function(config)
  {
    SSXmlHttpRequest.safeCall(config);
  }
});

ShiftSpace.Shift.implement( new Options );
ShiftSpace.Shift.implement( new Events );
