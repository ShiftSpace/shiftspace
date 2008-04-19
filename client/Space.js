/*
  Class: Space
    The base class for spaces.
*/
ShiftSpace.Space = new Class({
  attributes : {},
  
  /*
    Function : initialize
      The you can set the default shift constructor
  */
  initialize: function( shiftClass ) 
  {
    this.shiftClass = shiftClass;
    
    // set the interface built flag
    this.interfaceBuilt = false;
    
    // the shifts array
    this.shifts = {};

    // is visible flag
    this.setIsVisible(false);

    var valid = true;

    if(!this.shiftClass)
    {
      valid = false;
      console.error( 'Error: You did not specify a Shift Class for this Space.' );
    }

    // Error checking for Developers, probably should just replace with defaults
    if( !this.attributes.name )
    {
      valid = false;
      console.error( 'Error: This Space does not define a name attribute.' );
    }
    if( !this.attributes.icon )
    {
      valid = false;
      console.error( 'Error: This Space does not have an icon.' );
    }

    if( valid )
    {
      registerSpace( this, this.attributes );
    }
    else
    {
      var name = this.attributes.name || '';
      console.error( 'Error: The  ' + name + ' is not valid and will not be instantiated.' );
    }
    
    this.setup();
    
    return this;
  },
  
  setup: function() {},
  
  interfaceIsBuilt : function()
  {
    return this.interfaceBuilt;
  },
  
  setInterfaceIsBuilt : function(val)
  {
    return this.interfaceBuilt = val;
  },
  
  onCssLoad : function()
  {
  },
  
  show : function()
  {
    this.showInterface();
  },
  
  hide : function()
  {
    this.hideInterface();
    this.shifts.each(function(aShift){aShift.hide()});
  },
  
  setIsVisible: function(val)
  {
    this._isVisible = val;
  },
  
  isVisible: function()
  {
    return this._isVisible;
  },
  
  showInterface : function() 
  {
    if(!this.interfaceIsBuilt())
    {
      this.buildInterface();
      this.setInterfaceIsBuilt(true);
    }
  },
  
  hideInterface : function() {},
  buildInterface : function() {},
  
  /*
    Function: getName
      Returns the name of the shift.
  */
  getName : function()
  {
    return this.attributes.name;
  },
  
  /*
    Function : addShift
    
    Parameters :
      Takes a shift JSON object and creates and attaches event handlers.
  */
  addShift : function( aShift )
  {
    // add a backreference
    aShift.parentSpace = this;

    // create the new shift
    var newShift = new this.shiftClass( aShift );
    
    // listen for shift updates
    newShift.addEvent( 'onUpdate', this.updateShift.bind( this ) );
    // Set up events that console will listen to
    newShift.addEvent( 'onShiftShow', function( shiftId ) {
      this.fireEvent( 'onShiftShow', shiftId );
    }.bind( this ) );
    newShift.addEvent( 'onShiftHide', function( shiftId ) { 
      this.fireEvent( 'onShiftHide', shiftId );
    }.bind( this ) );
    newShift.addEvent( 'onShiftDestroy', function( shiftId ) { 
      this.fireEvent( 'onShiftDestroy', shiftId );
    }.bind( this ) );
    newShift.addEvent( 'onShiftFocus', function( aShift ) {
      focusShift( aShift.getId() );
    }.bind( this ));
    
    this.shifts[newShift.getId()] = newShift;
    
    return newShift;
  },
  
  /*
    Function : createShift
      Create a new shift.
      
    Parameters :
      newShiftJson - The JSON for the new shift.
      
    Returns:
      The new Shift object.
  */
  createShift : function( newShiftJson )
  {
    var newShift = this.addShift( newShiftJson );
    this.fireEvent( 'onCreateShift', { space : this, shift : newShift } );
    return newShift;
  },
  
  /*
    Function : deleteShift
      Delete a shift.
      
    Parameters :
      shiftId - The id of the shift.
  */
  deleteShift : function( shiftId )
  {
    // destroy the shift
    if (this.shifts[shiftId]) {
        this.shifts[shiftId].destroy();
        delete this.shifts[shiftId];
    }
    
    this.fireEvent( 'onDeleteShift', shiftId );
  },
  
  /*
    Function: editShift
      Tell the shift to go into edit mode.
  */
  editShift : function( shiftId )
  {
    this.shifts[shiftId].edit();
  },

  /*
    Function : updateShift
    
    Parameters :
      aShift - The shift instance to update.
  */
  updateShift : function( aShift ) 
  {
    // notify other object such as the console
    var shiftJson = aShift.encode();
    shiftJson.id = aShift.getId();
    shiftJson.space = this.attributes.name;
    shiftJson.username = ShiftSpace.user.getUsername();
    this.fireEvent('onShiftUpdate', shiftJson);
  },
  
  /*
    Function : showShift
    
    Parameters :
      shiftId - The JSON representing the shift to show.
      
    Returns :
      An actual Shift object.
  */
  showShift : function( aShift ) 
  {
    if($type(aShift) != 'object')
    {
      console.error("showShift called with non-object. Perhaps you passed a shift id accidentally");
      return;
    }

    // get the shift
    var cShift = this.shifts[aShift.id];
    
    if( !cShift )
    {
      // add the shift if we don't have it already
      cShift = this.addShift( aShift );
      var cShift = this.shifts[aShift.id];
    }
    
    if( cShift.canShow() )
    {
      // blur the old shift
      if(this.getCurrentShift() &&
         cShift != this.getCurrentShift())
      {
        this.getCurrentShift().blur();
      }
      
      this.setCurrentShift(cShift);
      
      // show the new shift and focus it
      cShift.show();
      // focus the shift
      cShift.focus();
    }
    
    // set the currentShift
    
    return cShift;
  },
  
  /*
    Function : hideShift
    
    Parameters
  */
  hideShift : function( shiftId ) 
  {
    var cShift = this.shifts[shiftId];
    
    if( cShift )
    {
      if( cShift.canHide() ) cShift.hide();
    }
    else
    {
      console.error( "Shift " + shiftId + " does not exist in this the " + this.getName() + " space." );
    }
  },
  
  
  /*
    Function: setValue
      Set a value with GM_setValue
    
    Parameters:
      key - the key of the value to set.
      value - the value itself.
  */
  setValue : function( key, value ) {
    return setValue(this.getName() + '.' + key, value);
  },
  
  
  /*
    Function: getValue
      Retrieve a value with GM_setValue
    
    Parameters:
      key - the key of the value to retrieve.
      defaultValue - returned if the key hasn't been set before.
  */
  getValue : function( key, defaultValue ) {
    return getValue(this.getName() + '.' + key, defaultValue);
  },
  
  /*
    Function: orderFront
      Move a shift back in the display order.  This is generally called by ShiftSpace.
      +
    Parameters:
      shiftId - the id of the Shift.
  */
  orderFront : function( shiftId, layer )
  {
    if(this.shifts[shiftId].getMainView()) this.shifts[shiftId].getMainView().setStyle('zIndex', 99);
  },
  
  /*
    Function: orderBack
      Move a shift front in the display order.
      
    Parameters:
      shiftId - the id of the Shift.
  */
  orderBack : function( shiftId, layer )
  {
    if(this.shifts[shiftId].getMainView()) this.shifts[shiftId].getMainView().setStyle('zIndex', 1);
  },
  
  setDepth: function( shiftId, depth )
  {
    if(this.shifts[shiftId].getMainView()) this.shifts[shiftId].getMainView().setStyle('zIndex', depth);
  },
  
  /*
    Function: regionIsObscured
      Checks to see if any of the visible shifts are obscuring the region.
  */
  regionIsObscured : function( region )
  {
    var len = this.shifts.length;
    for(var i = 0; i < len; i++ ) 
    {
      var aShift = this.shifts[i];
      
      if(aShift.mainViewIsVisible())
      {
        var sregion = aShift.getRegion();
        
        // check to see if any point of the region falls within this shift
        if ( !( sregion.left > region.right
            || sregion.right < region.left
            || sregion.top > region.bottom
            || sregion.bottom < region.top
            ) )
        {
          return true;
        }
      }
    }
    return false;
  },
  
  /*
    Function: setCurrentShift
      Set the current shift.
  */
  setCurrentShift : function(newShift)
  {
    this.currentShift = newShift;
  },
  
  /*
    Function: getCurrentShift
      Set the current shift.
  */
  getCurrentShift : function()
  {
    return this.currentShift;
  },
  
  focusShift : function(shiftId)
  {
    if(this.getCurrentShift() &&
       this.getCurrentShift() != this.shifts[shiftId])
    {
      this.getCurrentShift().blur();
    }
    this.setCurrentShift(this.shifts[shiftId]);
    this.getCurrentShift().focus();
  },
  
  onShiftCreate : function(shiftId) {},
  onShiftSave : function(shiftId) {},
  onShiftDelete : function(shiftId) {},
  onShiftShow : function(shiftId) {},
  onShiftHide : function(shiftId) {},
  onShiftFocus : function(shiftId) {},
  
  setValue : function(key, value)
  {
    setValue(this.attributes.name + "." + key, value);
  },
  
  getValue : function(key)
  {
    return getValue(this.attributes.name + "." + key);
  },
  
  mainViewForShift: function(shiftId)
  {
    return this.shifts[shiftId].getMainView();
  }
});

ShiftSpace.Space.implement( new Options );
ShiftSpace.Space.implement( new Events );