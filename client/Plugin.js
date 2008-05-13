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

    // load data & register
    this.loadData();
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
    registerPlugin(this);
  },
  
  onDataLoad: function(data)
  {
    this.data = data;
  },
  
  onCssLoad: function()
  {
  },
  
  /*
    Function : getMenuItems
      Return the items you want to appear in the console plugin menu when the user
      clicks your plugin icon.  You should return a hash with two properties, actions
      and items.  The actions should be another hash of the menu item and it's associated action.
      The items should be any plugin items which are attached to the shift with the id.
    
    Parameter: shiftId
      The id of the shift that the plugin was selected on.
  */
  getMenuItems : function(shiftId) {},
  
  /*
    Save a row
  */
  saveObject : function() {},
  
  /*
    Delete a row
  */
  deleteObject : function() {},
  
  /*
    Update a row
  */
  updateObject : function() {},
  
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
  }
  
});

ShiftSpace.Plugin.implement(new Events);

ShiftSpace.Plugin.types = new Hash(
{
  kMenuTypePlugin: "kMenuTypePlugin",
  kInterfaceTypePlugin: "kInterfaceTypePlugin"
});