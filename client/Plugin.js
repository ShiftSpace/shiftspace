ShiftSpace.Plugin = new Class({
  
  attributes :
  {
    name : null,
    title : null,
    icon : null,
    css : null
  },
  
  initialize: function(json)
  {
    console.log('initialize Plugin');
    if(ShiftSpace.Plugin.types.hasKey(this.pluginType))
    {
      switch(this.pluginType)
      {
        case 'kMenuTypePlugin':
          //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> kMenuTypePlugin');
        break;
        case 'kInterfaceTypePlugin':
          //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> kInterfaceTypePlugin');
        break;
      }
    }
    else
    {
      console.error('Error: Invalid plugin type. ' + this.pluginType);
      return;
    }
    
    // do some stuff
    ShiftSpace.Console.addEvent('select' + this.attributes.name, this.menuForShift.bind(this));
    ShiftSpace.Console.addEvent('closeMenu', this.closeMenu.bind(this));

    SSRegisterPlugin(this);
    this.setup();
  },
  
  serverCall: function(method, params, callback)
  {
    serverCall.safeCall('plugins.'+this.attributes.name+'.'+method, params, callback);
  },
  
  setup: function(options) {},
  setInterfaceIsBuilt: function(val)
  {
    this.__interfaceIsBuilt__ = val;
  },
  interfaceIsBuilt: function()
  {
    return this.__interfaceIsBuilt__;
  },
  
  showInterface: function() {},
  buildInterface: function() {},
  menuIcon: function() {},
  menuIconForShift: function(shiftId) {},
  menuForShift: function(shiftId) 
  {
    
  },
  
  closeMenu: function() 
  {
    ShiftSpace.Console.hidePluginMenu();
  },
  
  /*
    Just a big blob of data for this plugin.
  */
  loadData: function(url)
  {
    // make a server call
    this.data = {};
    
    // register ourselves after our data is loaded

  },
  
  onDataLoad: function(data)
  {
    this.data = data;
  },
  
  onCssLoad: function()
  {
    this.fireEvent('load');
  },
  
  enterFullScreen: function() {
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
  
  
  exitFullScreen: function() {
    if(SSCanExitFullScreen() && ShiftSpaceIsHidden())
    {
      ShiftSpaceShow();
      return true;
    }
    else
    {
      return false;
    }
  },
  
  // this isn't good needs to be generalized
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
  
  
  getShifts: function(shiftIds, callBack)
  {
    SSGetShifts(shiftIds, callBack);
  },
  
  
  recentlyViewedShifts: function()
  {
    console.log(SSGetRecentlyViewedShifts());
    return SSGetRecentlyViewedShifts();
  },
  
  
  delayedMenu: function()
  {
    return {'delayed': true};
  }  
  
});

ShiftSpace.Plugin.implement(new Events);

ShiftSpace.Plugin.types = new Hash(
{
  kMenuTypePlugin: "kMenuTypePlugin",
  kInterfaceTypePlugin: "kInterfaceTypePlugin"
});