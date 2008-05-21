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

    registerPlugin(this);
    this.setup();
  },
  
  serverCall: function(method, params, callback)
  {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>> serverCall');
    serverCall('plugins.'+this.attributes.name+'.'+method, params, callback);
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
  menuForShift: function(shiftId) {},
  
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
  
  getShift: function(shiftId)
  {
    var temp = getShiftContent(shiftId);
    var copy = {};
    
    for(prop in temp)
    {
      copy[prop] = temp[prop];
    }
    copy.href = getUrlForShift(shiftId);
    
    return copy;
  },
  
  recentlyViewedShifts: function()
  {
    console.log(getRecentlyViewedShifts());
    return getRecentlyViewedShifts();
  }
  
});

ShiftSpace.Plugin.implement(new Events);

ShiftSpace.Plugin.types = new Hash(
{
  kMenuTypePlugin: "kMenuTypePlugin",
  kInterfaceTypePlugin: "kInterfaceTypePlugin"
});