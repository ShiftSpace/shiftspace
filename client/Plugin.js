// ==Builder==
// @required
// @name              Plugin
// @package           System
// ==/Builder==

/*
  Class: ShiftSpace.Plugin
    Abstract class interface for plugin.  Currently only used Trails.
*/
ShiftSpace.Plugin = new Class({
  
  attributes:
  {
    name: null,
    title: null,
    icon: null,
    css: null
  },
  
  /*
    Function: initialize (private)
      Initializes the plugin. Implicitly calls SSRegisterPlugin as well as subclass's setup method.
  */
  initialize: function(json)
  {
    if(ShiftSpace.Plugin.types.has(this.pluginType))
    {
      switch(this.pluginType)
      {
        case 'kMenuTypePlugin':
        break;
        case 'kInterfaceTypePlugin':
        break;
      }
    }
    else
    {
      console.error('Error: Invalid plugin type. ' + this.pluginType);
      return;
    }
    
    // do some stuff
    if(ShiftSpace.Console)
    {
      ShiftSpace.Console.addEvent('select' + this.attributes.name, this.menuForShift.bind(this));
      ShiftSpace.Console.addEvent('closeMenu', this.closeMenu.bind(this));
    }

    SSRegisterPlugin(this);
    this.setup();
  },
  
  /*
    Function: serverCall
      Allows a plugin to make a server call.
      
    Parameters:
      method - the method name to call.
      params - the url parameters to be passed in.
      callback - the function to called when server call is complete.
  */
  serverCall: function(method, params, callback)
  {
    serverCall.safeCall('plugins.'+this.attributes.name+'.'+method, params, callback);
  },
  

  xmlHttpRequest: function(request)
  {
    SSXmlHttpRequest.safeCall(request);
  },
  
  /*
    Function: setInterfaceIsBuilt (private)
      Set the internal flag tracking whether the interface has been constructed yet.
      
    Parameters:
      val - a boolean.
  */
  setInterfaceIsBuilt: function(val)
  {
    this.__interfaceIsBuilt__ = val;
  },

  /*
    Function: interfaceIsBuilt (private)
      Returns the value of the internal flag tracking whether the plugin interface has been constructed.
    
    Returns:
      a boolean.
  */
  interfaceIsBuilt: function()
  {
    return this.__interfaceIsBuilt__;
  },
  
  /*
    Function: setup (abstract)
      To be implemented by subclasses.
  */
  setup: function(options) {},
  
  /*
    Function: showInterface (private)
      Show the plugin interface.
  */
  showInterface: function() {},
  
  /*
    Function: hideInterface (private)
      To be implemented by subclasses.
  */
  hideInterface: function() {},
  
  /*
    Function: buildInterface (abstract)
      To be implemented by subclasses.
  */
  buildInterface: function() {},
  
  /*
    Function: menuIcon (abstract)
      Not yet implemented
  */
  menuIcon: function() {},
  
  /*
    Function: menuIconForShift (abstract)
      Returns the icon for a shift.
      
    Parameters:
      shiftId - a shift id.
  */
  menuIconForShift: function(shiftId) {},
  
  /*
    Function: menuForShift
      Return a menu for a shift.
      
    Parameters:
      shiftId - a shift id.
  */
  menuForShift: function(shiftId) {},
  
  /*
    Function: closeMenu
      Close the plugin menu.
  */
  closeMenu: function() 
  {
    ShiftSpace.Console.hidePluginMenu();
  },
  
  /*
    Function: onCssLoad
      not implemented yet.
  */
  onCssLoad: function()
  {
    this.fireEvent('load');
  },
  
  /*
    Function: enterFullScreen
      Used to put the plugin in full screen mode.
  */
  enterFullScreen: function() 
  {
    if(SSCanGoFullScreen() && !ShiftSpaceIsHidden())
    {
      ShiftSpaceHide();
      return true;
    }
    else
    {
      // can't go full screen
      return false;
    }
  },
  
  /*
    Function: exitFullScreen
      Used when the plugin should exit full screen mode.
  */
  exitFullScreen: function() 
  {
    if(SSCanExitFullScreen() && ShiftSpaceIsHidden())
    {
      SSLog('ShiftSpaceShow');
      ShiftSpaceShow();
      return true;
    }
    else
    {
      return false;
    }
  },
  
  /*
    Function: getShift
      Grab shift data for a shift.
      
    Parameters:
      shiftId - a shift id.
      
    Returns:
      A copy of the shift's properties.
  */
  getShift: function(shiftId)
  {
    // heh, no reason to copy now SSGetShiftData returns a copy
    var temp = SSGetShiftData(shiftId);
    var copy = {};
    
    for(var prop in temp)
    {
      copy[prop] = temp[prop];
    }
    copy.href = SSGetUrlForShift(shiftId);
    
    return copy;
  },
  
  /*
    Function: SSGetShifts
      Returns an array of shift properties
      
    Parameters:
      shiftIds - an array of ids.
      callBack - a function to be called when the shifts have been grabbed.
      errorHandler - a function to be called if the operation fails.
  */
  getShifts: function(shiftIds, callBack, errorHandler)
  {
    SSGetShifts(shiftIds, callBack, (errorHandler || this.errorHandler.bind(this)));
  },
  
  /*
    Function: errorHandler (abstract)
      Default error handler for ShiftSpace.Plugin.error.
      
    Parameters:
      error - an error Object.
  */
  errorHandler: function(error)
  {
    console.error("Error: Plugin call to getShifts failed, " + error.message);
  },
  
  /*
    Function: recentlyViewedShifts
      Returns a hash of recently viewed shifts.
    
    Parameters:
      callback - a function to be called when the recently viewed shifts has been returned.
  */
  recentlyViewedShifts: function(callback)
  {
    return SSGetRecentlyViewedShifts(callback);
  },
  
  /*
    Function: delayedMenu
      Returns whether the menu is of the delayed typed.
      
    Returns:
      A javascript object with a delayed property set to true.
  */
  delayedMenu: function()
  {
    return {'delayed': true};
  },
  
  
  loadStyle: function(filename, callback, frame)
  {
    // pass through
    SSLoadStyle.safeCall(['plugins', this.attributes.name, filename].join('/'), callback, frame);
  },
  

  enterModal: function()
  {
    SSEnterModal(this);
  },
  
  
  exitModal: function()
  {
    SSExitModal(this);
  }
  
});

ShiftSpace.Plugin.types = $H(
{
  kMenuTypePlugin: "kMenuTypePlugin",
  kInterfaceTypePlugin: "kInterfaceTypePlugin"
});

ShiftSpace.Plugin.implement(new Events);