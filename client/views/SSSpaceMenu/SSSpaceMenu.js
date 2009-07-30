// ==Builder==
// @uiclass
// @package           ShiftSpaceCoreUI
// @dependencies      SSFramedView
// ==/Builder==

var SSSpaceMenu = new Class({
  
  Extends: SSFramedView,
  name: 'SSSpaceMenu',


  initialize: function(el, options)
  {
    this.parent(el, options);

    SSAddObserver(this, 'onUserLogin', this.handleLogin.bind(this));
    SSAddObserver(this, 'onUserLogout', this.handleLogout.bind(this));
    
    SSAddObserver(this, 'onSpaceInstall', this.update.bind(this));
    SSAddObserver(this, 'onSpaceUninstall', this.update.bind(this));
    
    SSAddObserver(this, 'showSpaceMenu', this.show.bind(this));
    SSAddObserver(this, 'hideSpaceMenu', this.hide.bind(this));
    
    SSAddObserver(this, 'onSync', this.handleSync.bind(this));
  },
  
  
  show: function()
  {
    SSLog('show SSSpaceMenu', SSLogForce);
    this.element.removeClass('SSDisplayNone');
    this.resize();
    SSPostNotification('onSpaceMenuShow', this);
  },
  
  
  resize: function()
  {
    var context = this.contentWindow();
    var body = context.$(this.contentDocument().body);
    var ul = $(this.contentWindow().$('SpaceMenuList'));
    
    if(ul)
    {
      SSLog('resize space menu ' + ul.getSize().y, SSLogForce);
      this.element.setStyles({
        height: ul.getSize().y + 4
      });
    }
  },
  
  
  hide: function()
  {
    this.element.addClass('SSDisplayNone');
    SSPostNotification('onSpaceMenuHide', this);
  },
  
  
  handleLogin: function()
  {
  },
  
  
  handleLogout: function()
  {
  },
  
  
  handleSync: function()
  {
  },
  
  
  onSpaceSort: function()
  {
    var spaces = SSInstalledSpaces();
    var listItems = this.SpaceMenuList.cellNodes();
    
    var newSpaceOrder = listItems.map(function(el) {
      return {
        name:el.getElement('.name').get('text'), 
        position: listItems.indexOf(el)
      };
    });
  
    var newOrder = newSpaceOrder.map(function(obj) {
      return obj.name;
    });
    
    var oldOrder = [];
    $H(spaces).each(function(space) {
      return oldOrder[space.position] = space.name;
    });
    
    newSpaceOrder.each(function(newSpacePos) {
      spaces[newSpacePos.name].position = newSpacePos.position;
    });

   if(!newOrder.isEqual(oldOrder)) SSSetInstalledSpaces(spaces);
  },
  
  
  onInterfaceLoad: function(ui)
  {
    this.parent(ui);
    this.element.setProperty('id', 'SpaceMenu');
    this.element.addClass('SSDisplayNone');
  }.asPromise(),
  
  
  onContextActivate: function(context)
  {
    if(context == this.element.contentWindow)
    {
      this.mapOutletsToThis();
    }
  },
  

  attachEvents: function()
  {
    this.SpaceMenuList.addEvent('onSortComplete', this.onSpaceSort.bind(this));
    this.SpaceMenuList.addEvent('onRowClick', this.newShift.bind(this));
    this.SpaceMenuList.addEvent('onReload', this.resize.bind(this));
  },
  
  
  newShift: function(data)
  {
    if(ShiftSpace.User.isLoggedIn())
    {
      SSInitShift(SSSpaceForPosition(data.index).name);
    }
    else
    {
      alert("You must be logged in to create shifts!");
    }
    this.hide();
  },
  
  
  update: function()
  {
    var spaces = SSSpacesByPosition();

    this.SpaceMenuList.setData(spaces);
    this.SpaceMenuList.refresh();

    if(this.isVisible()) this.resize();
  },

  
  buildInterface: function()
  {
    this.parent();
    this.update();
    this.attachEvents();
    this.setIsLoaded(true);
  },
  
  
  localizationChanged: function()
  {
    
  }
});