// ==Builder==
// @export            ShiftSpaceSpace as Space
// @package           ShiftSpaceCore
// ==/Builder==

/*
  Class: ShiftSpace.Space
    The base class for spaces.  A Space is essentially an extension to the ShiftSpace architecture.  You can think of ShiftSpace
    as a kind of simple operating system and windowing interface.  ShiftSpace doesn't actually know much about individual spaces.
    A Space is a kind of document controller, the documents being the shifts it manages. Some spaces need a cross document interface,
    such as SourceShift, while others, such as Notes, present only the interface provided by the document itself.  The API for
    spaces can handle both types.  Refer to the source code of Notes and SourceShift to see their differences.

    Most of the methods here get called automatically.  For example, you should rarely if ever, call the showShift method directly.
    Users should be in control of whether a shift is visible or not.  In general the user of ShiftSpace is in control of the experience
    not the developer.  To get a better understanding of this please refer to the ShiftSpace tutorial.
*/
var ShiftSpaceSpace = new Class({
  Implements: [Events, Options],
  name: 'ShiftSpace.Space',

  /*
    Function : initialize (private)
      Initialize the space.  Sets internala state variables as well as calls SSRegisterSpace.  Also call the subclass
      setup method.
  */
  initialize: function(shiftClass)
  {
    var self = this;
    shiftClass.implement({
      getParentSpace: function() { return self; }
    });
    
    this.shiftClass = shiftClass;

    // set the interface built flag
    this.__interfaceBuilt = false;
    this.__state = new Hash();

    // the shifts array
    this.__shifts = {};

    // is visible flag
    this.setIsVisible(false);

    var valid = true;

    if(!this.shiftClass)
    {
      valid = false;
      SSLog('You did not specify a Shift Class for this Space.', SSLogError);
    }

    if(!valid)
    {
      var name = this.attributes().name || '';
      SSLog('The  ' + name + ' is not valid and will not be instantiated.', SSLogError);
    }
    else
    {
      this.setup();
    }

    if(typeof SSAddObserver != 'undefined') SSAddObserver(this, "saveShift", this.__saveShift__.bind(this));

    return this;
  },

  url: function()
  {
    return SSURLForSpace(this.attributes().name);
  },
  
  /*
    Function: getId
      *private*
      For the observer/notification center protocol.
  */
  getId: function()
  {
    return this.attributes().name;
  },

  genUUID: function() {
    return SSGenUUID();
  },

  /*
    Function: setup (abstract)
      To be implemented by subclasses.
  */
  setup: function() {},

  /*
    Function: interfaceIsBuilt
      Returns whether the interface of the space has been built yet.
  */
  interfaceIsBuilt : function()
  {
    return this.__interfaceBuilt;
  },

  /*
    Function: setInterfaceIsBuilt (private)
      Set the private interface built flag.

    Parameters:
      val - a boolean.
  */
  setInterfaceIsBuilt : function(val)
  {
    return this.__interfaceBuilt = val;
  },

  /*
    Function: show (private)
      Show the space. Simple calls Space.showInterface

    See Also:
      Space.showInterface
  */
  show : function()
  {
    this.showInterface();
  },

  /*
    Function: hide
      Hide the space's interface is there is one.

    See Also:
      Space.hideInterface
  */
  hide : function()
  {
    this.hideInterface();

    for(var shift in this.__shifts)
    {
      if(this.__shifts[shift].isVisible())
      {
        this.__shifts[shift].hide();
      }
    }
  },

  /*
    Function: setIsVisible
      Setter for internal flag about whether the Space and/or it's shifts are visible.

    Parameters:
      val - a boolean.
  */
  setIsVisible: function(val)
  {
    this.__isVisible = val;
  },

  /*
    Function: isVisible
      Returns value of internal flag about wheter the Space's interface or any of its shifts are visible.

    Returns:
      A boolean.
  */
  isVisible: function()
  {
    var visibleShifts = false;
    for(var shift in this.__shifts)
    {
      if(this.__shifts[shift].isVisible())
      {
        visibleShifts = true;
        continue;
      }
    }
    return this.__isVisible || visibleShifts;
  },

  shiftIsVisible: function(id)
  {
    var shift = this.__shifts[id];
    return shift && shift.isVisible();
  },

  /*
    Function: showInterface
      Show the space interface.  This can be overriden if necessary but you must remember to call this.parent()
      from your overriding method.

    Parameters:
      position (optional) - the x/y position of the mouse.
  */
  showInterface: function(position)
  {
    if(!this.interfaceIsBuilt() )
    {
      this.buildInterface();
      this.setInterfaceIsBuilt(true);
    }
  },

  /*
    Function: hideInterface
      Hide the interface of the space.  If there are any unsaved shifts they will be destroyed. Can be overriden, remember to call
      this.parent() from your overriding method.
  */
  hideInterface: function()
  {
    // remove any unsaved shifts
    var unsavedShifts = [];

    for(var shift in this.__shifts)
    {
      if(shift.search('newShift') != -1)
      {
        unsavedShifts.push(this.__shifts[shift]);
        delete this.__shifts[shift];
      }
    }

    unsavedShifts.each(function(x) {
      x.destroy();
    });
  },

  /*
    Function: buildInterface (abstract)
      subclass should implement this if they want to present a custom interface.

    Example:
      (start code)
      build: function()
      {
        var this.element = new ShiftSpace.Element('div', {
          'class':'MyCSSClass'
        });
        var this.title = new ShiftSpace.Element('span', {
          'class':'MyCSSSpanClass'
        });
        this.title.setText('MyTitle');
        this.title.injectInside(this.element);

        this.setMainView(this.element);
      }
      (end)
  */
  buildInterface: function() {},

  /*
    Function: getName
      Returns the name of the shift.

    Returns:
      The name of the space as a string.
  */
  getName: function()
  {
    return this.attributes().name;
  },

  /*
    Function: addShift (private)
      Adds a shift to an internal array.  Implicity creates a new instance of a shift based on the
      contents of the passed in Object.

    Parameters:
      aShift - shift JSON object.
      ui (optional) - markup for the shift interface as a string.

    Returns:
      The internal shift instance.
  */
  addShift: function(aShift)
  {
    // create the new shift
    try
    {
      var newShift = new this.shiftClass(aShift);
    }
    catch(exc)
    {
      throw exc;
    }

    // listen for shift updates
    newShift.addEvent('onUpdate', this.updateShift.bind(this));
    // Set up events that console will listen to
    newShift.addEvent('onShiftShow', function(shiftId) {
      this.onShiftShow(shiftId);
      this.fireEvent('onShiftShow', shiftId);
    }.bind(this));
    newShift.addEvent('onShiftHide', function(shiftId) {
      this.onShiftHide(shiftId);
      this.fireEvent('onShiftHide', shiftId);
    }.bind(this));
    newShift.addEvent('onShiftDestroy', function(shiftId) {
      this.onShiftDestroy(shiftId);
      this.fireEvent('onShiftDestroy', shiftId);
    }.bind(this));
    newShift.addEvent('onShiftFocus', function(shiftId) {
      this.onShiftFocus(shiftId);
      this.fireEvent('onShiftFocus', shiftId);
    }.bind(this));
    newShift.addEvent('onShiftBlur', function(shiftId) {
      this.onShiftBlur(shiftId);
      this.fireEvent('onShiftBlur', shiftId);
    }.bind(this));
    newShift.addEvent('onShiftSave', function(shiftId) {
      this.onShiftSave(shiftId);
      this.fireEvent('onShiftSave', shiftId);
    }.bind(this));

    this.__shifts[newShift.getId()] = newShift;
    return newShift;
  }.future(),

  /*
    Function: allocateNewShift
      Used when it necessary to kick off shift allocation from with in a Space
      and not from the ShiftMenu.  ImageSwap uses this.
  */
  allocateNewShift: function()
  {
    if(typeof SSInitShift != 'undefined') SSInitShift(this.getName(), {});
  },

  /*
    Function : createShift (private)
      Create a new shift.

    Parameters :
      newShift - The data for the new shift.

    Returns:
      The new Shift object.
  */
  createShift: function(newShift)
  {
    var shift = this.addShift(newShift);
    // return the shift immediately or a promise if there's a ui
    this.fireEvent('onCreateShift', {
      space: self, 
      shift: newShift
    });
    return shift;
  },
  
  /*
    Function : deleteShift
      Delete a shift from the internal array.  Implicity calls SSDeleteShift which will remove this
      shift from the ShiftSpace DB.

    Parameters :
      shiftId - The id of the shift.
  */
  deleteShift: function(shiftId)
  {
    // destroy the shift
    if (this.__shifts[shiftId])
    {
      this.__shifts[shiftId].destroy();
      delete this.__shifts[shiftId];
    }
    this.fireEvent('onDeleteShift', shiftId);
  },
  
  unintern: function(shiftId)
  {
    delete this.__shifts[shiftId];
  },
  
  intern: function(shiftId, shift)
  {
    this.__shifts[shiftId] = shift;
  },

  swap: function(oldId, newId)
  {
    var shift = this.__shifts[oldId];
    this.unintern(oldId);
    shift.setId(newId);
    this.intern(newId, shift);
  },

  /*
    Function: editShift
      Tell the shift to go into edit mode.

    Parameters:
      shiftId - a shift id.
  */
  editShift: function(shiftId)
  {
    var theShift = this.__shifts[shiftId];
    if(!theShift.isBeingEdited())
    {
      theShift.__edit__();
      theShift.edit();
      theShift.__editAfter__();
    }
  },


  editExitShift: function(shiftId)
  {
    var theShift = this.__shifts[shiftId];
    if(theShift.isBeingEdited())
    {
      theShift.__editExit__();
      theShift.editExit();
      theShift.__editExitAfter__();
    }
  },

  /*
    Function: __saveShift__
      *private*
      Implementaiton detail, do notuse. Internally called by ShiftSpace when
      save events are generated by ShiftSpace core interface elements such
      as the publish pane or the quick buttons in the notifier view.
  */
  __saveShift__: function(id)
  {
    if(this.__shifts[id])
    {
      this.updateShift(this.__shifts[id]);
    }
  },

  saveCurrentShift: function()
  {
    var cshift = this.getCurrentShift();
    if(cshift) this.updateShift(cshift);
  },

  /*
    Function: updateShift
      Update a shift.  Implicity calls the SSUpdateShift in Core to update the ShiftSpace DB.

    Parameters:
      aShift - The shift instance to update.
  */
  updateShift: function(aShift)
  {
    var shift = aShift.encode();
    // REFACTOR: adding _id and space for introspection purposes, not sure about this tho - David
    shift._id = aShift.getId();
    shift.space = {name: this.attributes().name, version: this.attributes().version};
    this.fireEvent('onShiftUpdate', shift);
  },

  /*
    Function: canShowShift (abstract)
      Check if the shift json can be shown.  This method returns true unless you override it.

    Parameters:
      shiftJson - a shift JSON object

    Returns:
      A boolean.
  */
  canShowShift: function(shiftJson)
  {
    return true;
  },

  /*
    Function : showShift
      Show a shift.  If a corresponding internal instance does not exist it will be created.

    Parameters :
      aShift - The JSON representing the shift to show.

    Returns :
      An _ACTUAL_ Shift JSON, _NOT_ an Shift id.
  */
  showShift: function(aShift)
  {
    var cShift = this.__shifts[aShift._id]; // check for a real shift instance
    if(!cShift)
    {
      try
      {
        cShift = this.addShift(aShift); // create a real shift instance
      }
      catch(exc)
      {
        SSLog(exc);
      }
    }
    if(cShift.canShow())
    {
      if(this.getCurrentShift() && cShift != this.getCurrentShift()) this.getCurrentShift().onBlur();
      this.setCurrentShift(cShift);
      cShift.__show__();
      if(cShift.isNewShift() && cShift.showNew)
      {
        cShift.showNew();
      }
      else
      {
        cShift.show();
      }
      cShift.__showAfter__();
      this.onShiftShow(cShift.getId());
      cShift.onFocus();
    }
  },

  /*
    Function: hideShift
      Hides a shift.

    Parameters:
      shiftId - a shift id.
  */
  hideShift: function(shiftId)
  {
    var cShift = this.__shifts[shiftId];
    if(cShift)
    {
      if(cShift.canHide() && cShift.isVisible())
      {
        cShift.__hide__();
        cShift.hide();
        cShift.__hideAfter__();
      }
    }
    else
    {
      SSLog("Shift " + shiftId + " does not exist in this the " + this.getName() + " space.", SSLogError);
    }
    // check to see if there are no visible shifts, if not, hide the space interface
    var visibleShifts = false;
    for(var shift in this.__shifts)
    {
      if(this.__shifts[shift].isVisible())
      {
        visibleShifts = true;
        continue;
      }
    }
    if(!visibleShifts) this.hideInterface();
  },

  /*
    Function: orderFront
      Move a shift back in the display order.  This is generally called by ShiftSpace.

    Parameters:
      shiftId - the id of the Shift.
      layer - not yet implemented.
  */
  orderFront: function(shiftId, layer)
  {
    var mv = this.__shifts[shiftId].getMainView();
    if(mv && !mv.hasClass('SSUnordered'))
    {
      mv.setStyle('zIndex', 10000);
    }
  },

  /*
    Function: orderBack
      Move a shift front in the display order.

    Parameters:
      shiftId - the id of the Shift.
      layer - not yet implemented.
  */
  orderBack: function(shiftId, layer)
  {
    var mv = this.__shifts[shiftId].getMainView();
    if(mv && !mv.hasClass('SSUnordered'))
    {
      mv.setStyle('zIndex', 9999);
    }
  },

  /*
    Function: setDepth
      Not yet implemented.
  */
  setDepth: function(shiftId, depth)
  {
    var mv = this.__shifts[shiftId].getMainView();
    if(mv && !mv.hasClass('SSUnordered'))
    {
      mv.setStyle('zIndex', depth);
    }
  },

  /*
    Function: setCurrentShift (private)
      Set the current shift object.

    Parameters:
      newShift - an internal shift instance.
  */
  setCurrentShift: function(newShift)
  {
    this.__currentShift = newShift;
  },

  /*
    Function: setCurrentShiftById
      Same as Space.setCurrentShift but can use an id instead.

    Parameters:
      shiftId - a shift id.
  */
  setCurrentShiftById: function(shiftId)
  {
    this.setCurrentShift(this.__shifts[shiftId]);
  },

  /*
    Function: getCurrentShift
      Get the current shift.

    Returns:
      The current focused shift instance.
  */
  getCurrentShift: function()
  {
    return this.__currentShift;
  },

  /*
    Function: getShift
      Returns a shift instance from the internal hash.

    Parameters:
      shiftId - a shift id.

    Returns:
      A Shift instance.
  */
  getShift: function(shiftId)
  {
    return this.__shifts[shiftId];
  },

  /*
    Function: hasShift
      Return boolean whether the space has loaded this
      a particular shift.

    Parameters:
      shiftId - a shift id.

    Returns:
      A boolean value.
  */
  hasShift: function(shiftId)
  {
    return this.getShift(shiftId) != null;
  },

  /*
    Function: focusShift
      Focus a shift.  Implicitly calls Space.setCurrentShift.

    Parameters:
      shiftId - a shift id.
  */
  focusShift: function(shiftId)
  {
    this.setCurrentShift(this.__shifts[shiftId]);
    this.getCurrentShift().onFocus();
  },

  /*
    Function: blurShift
      Blur a shift. If the shift is being edited it will be taken out of editing mode.

    Parameters:
      shiftId - a shift id.
  */
  blurShift: function(shiftId)
  {
    var theShift = this.__shifts[shiftId];
    theShift.__blur__();
    theShift.blur();
    theShift.__blurAfter__();
    theShift.setIsBeingEdited(false);
  },

  /*
    Function: onShiftPrepare (abstract)
      Called before a shift will be shown.

    Parameters:
      shiftId - a shift id.
  */
  onShiftPrepare: function(shiftId) {},

  /*
    Function: onShiftCreate (abstract)
      Called after a shift has been created.

    Parameters:
      shiftId - a shift id.
  */
  onShiftCreate: function(shiftId) {},

  /*
    Function: onShiftEdit (abstract)
      Called after a shift has been edited.

    Parameters:
      shiftId - a shift id.
  */
  onShiftEdit: function(shiftId) {},

  /*
    Function: onShiftSave (abstract)
      Called after a shift has been saved.

    Parameters:
      shiftId - a shift id.
  */
  onShiftSave: function(shiftId) {},

  /*
    Function: onShiftDelete (abstract)
      Called after a shift has been deleted.

    Parameters:
      shiftId - a shift id.
  */
  onShiftDelete: function(shiftId) {},

  /*
    Function: onShiftDestroy (abstract)
      Called after a shift has been destroyed.

    Parameters:
      shiftId - a shift id.
  */
  onShiftDestroy: function(shiftId) {},

  /*
    Function: onShiftShow (abstract)
      Called after shift has been shown.

    Parameters:
      shiftId - a shift id.
  */
  onShiftShow: function(shiftId) {},

  /*
    Function: onShiftHide (abstract)
      Called after a shift has been hidden.

    Parameters:
      shiftId - a shift id.
  */
  onShiftHide: function(shiftId) {},

  /*
    Function: onShiftFocus (abstract)
      Called after a shift has been focused.

    Parameters:
      shiftId - a shift id.
  */
  onShiftFocus: function(shiftId) {},

  /*
    Function: onShiftBlur (abstract)
      Called after a shift has been blurred.

    Parameters:
      shiftId - a shift id.
  */
  onShiftBlur: function(shiftId) {},

  /*
    Function: setValue
      Safe wrapper around GM_setValue for spaces.

    Parameters:
      key - a string. The actual key is "spaceName.key"
      value - a value to be set.
  */
  setValue: function(key, value)
  {
    SSSetValue.safeCall(null, this.attributes().name + "." + key, value);
  },

  /*
    Function: getValue
      Safe wrapper around GM_getValue

    Parameters:
      key - returns a key. The real key is "spaceName.key".
      defaultValue - a default value is the key doesn't exist.
      callback - a callback function.
  */
  getValue: function(key, defaultValue, callback)
  {
    SSGetValue.safeCall(
      null,
      this.attributes().name + '.' + key,
      defaultValue,
      callback
    );
  },

  /*
    Function: updateTitleOfShift (private)
      Update the title of a shift, if appropriate.

    Parameters:
      shiftId - a shift id.
      title - a new title <string>.
  */
  updateTitleOfShift: function(shiftId, title)
  {
    this.__shifts[shiftId].updateTitle(title);
  },

  /*
    Function: mainViewForShift (private)
      Returns the main view DOM node of the shift.

    Parameters:
      shiftId - a shift id.

    Returns:
      A DOM node.
  */
  mainViewForShift: function(shiftId)
  {
    return this.__shifts[shiftId].getMainView();
  },

  /*
    Function: saveState (private)
      Saves the state of the space. For the moment just saves the currently visible shifts.
      Normally used when a plugin takes over the entire current browser viewport.
  */
  saveState: function()
  {
    // empty the state
    this.__state.empty();

    var visibleShifts = [];
    for(var shift in this.__shifts)
    {
      if(this.__shifts[shift].isVisible())
      {
        visibleShifts.push(this.__shifts[shift]);
      }
    }
    this.__state.set('visibleShifts', visibleShifts);
  },

  /*
    Function: restoreState (private)
      Restores the state of the space. Normally used when a plugin has relinquished the
      browser's current viewport.
  */
  restoreState: function()
  {
    this.__state.get('visibleShifts').each(function(x) { x.show(); });
  },

  /*
    Function: isNewShift
      Used to check whether a shift is unsaved.

    Parameters:
      shiftId - a shift id.
  */
  isNewShift: function(shiftId)
  {
    return SSIsNewShift(shiftId);
  },
  
  /*
    Function: setPreference
      Set a preference for the space.

    Parameters:
      key - the string key to store the value under.
      value - the value to store.
   */
  setPreference: function(key, value)
  {
    ShiftSpace.User.setPreference(this.attributes().name+'.'+key, value);
  },
  
  /*
    Function: getPreference
      Get a preference for a space.

    Parameters:
      key - the string 
   */
  getPreference: function(key, defaultValue, callback)
  {
    ShiftSpace.User.getPreference.safeCall(
      ShiftSpace.User,
      this.attributes().name+'.'+key,
      defaultValue,
      callback
    );
  },

  /*
    Function: xmlHttpRequest
      Make a remote request from a space. The url must be defined in the space's
      attrs.json file. Refer to the MooTools Request documentation for usage.

    Parameters:
      options - refer to the MooTools documentation for a description.
   */
  xmlHttpRequest: function(options)
  {
    var attrs = this.attributes(),
        req = new Request(options),
        url = options.url;
    if(attrs.permissions.contains(url))
    {
      req.send.bind(req).safeCall();
    }
    else
    {
      SSLog([url, "not declared in attrs.json permissions list for", attrs.name, "space."].join(""), SSLogError);
    }
  },


  getUserName: function()
  {
    return ShiftSpace.User.getUserName();
  },


  getUserId: function()
  {
    return ShiftSpace.User.getId();
  },


  template: function(name, context)
  {
    return ($get(this.attributes(), "ui", name, "template"))(context || {});
  },

  
  addStyle: function(frame, cssText) {
    SSAddStyle(cssText, {frame: frame});
  }
});