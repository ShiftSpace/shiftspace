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
    this.element.removeClass('SSDisplayNone');
    this.resize();
  },
  
  
  resize: function()
  {
    var context = this.contentWindow();
    var body = context.$(this.contentDocument().body);
    this.element.setStyles({
      height: body.offsetHeight
    });
  },
  
  
  hide: function()
  {
    this.element.addClass('SSDisplayNone');
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
    
    newSpaceOrder.each(function(newSpacePos) {
      spaces[newSpacePos.name].position = newSpacePos.position;
    });
    
    SSSetInstalledSpaces(spaces);
  },
  
  
  onInterfaceLoad: function(ui)
  {
    this.parent(ui);
    this.element.setProperty('id', 'SpaceMenu');
    this.element.addClass('SSDisplayNone');
  },
  
  
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
    SSLog('newShift!', SSLogForce);
    SSLog(data.index, SSLogForce);
    SSInitShift(SSSpaceForPosition(data.index).name);
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