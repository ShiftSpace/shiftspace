// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSTabView
// ==/Builder==

var SettingsTabView = new Class({
  Extends: SSTabView,
  name: "SettingsTabView",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSAddObserver(this, "onSync", this.onSync.bind(this));
    SSAddObserver(this, "onUserLogin", this.onUserLogin.bind(this));
    SSAddObserver(this, "onUserJoin", this.onUserLogin.bind(this));
    SSAddObserver(this, 'onSpaceInstall', this.onSpaceInstall.bind(this));
    SSAddObserver(this, "onUserLogout", this.onUserLogout.bind(this));
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.initSelectLanguage();
    this.initInstalledSpacesListView();
    this.clearInstalledButton.addEvent('click', function(evt) {
      evt = new Event(evt);
      SSUninstallAllSpaces();
    });
  },


  afterAwake: function()
  {
    // NOTE - can't use options because Sandalphon doesn't yet support adding delegates
    // which come from inside an iframe - David 10/27/09
    this.SSInstalledSpaces.setDelegate(this);
    if(ShiftSpaceUser.isLoggedIn()) this.onUserLogin();
  },


  onUserLogin: function(user)
  {
    this.updateInstalledSpaces();
  },


  onUserLogout: function(json)
  {
    this.updateInstalledSpaces();
  },
  
  
  initSelectLanguage: function()
  {
    this.SSSelectLanguage.addEvent('change', function(evt) {
      evt = new Event(evt);
      SSLoadLocalizedStrings($(evt.target).getProperty('value'));
    }.bind(this));
  },
  
  
  initInstalledSpacesListView: function()
  {
    if(this.SSInstallSpace)
    {
      this.SSInstallSpace.addEvent('click', function(evt) {
        evt = new Event(evt);
        this.installSpace(this.SSInstallSpaceField.getProperty('value'));
      }.bind(this));
    }
    this.SSInstalledSpaces = this.SSInstalledSpaces;
  },
  
  
  onSync: function()
  {
    this.updateInstalledSpaces();
  },
  
  
  installSpace:function(spaceName)
  {
    SSInstallSpace(spaceName);
  },
  
  
  onSpaceInstall: function()
  {
    this.updateInstalledSpaces();
    this.refreshInstalledSpaces();
  },
  
  
  updateInstalledSpaces: function()
  {
    this.SSInstalledSpaces.setData(SSSpacesByPosition());
    this.SSInstalledSpaces.refresh();
  },
  
  
  refreshInstalledSpaces: function()
  {
    this.SSInstalledSpaces.refresh(true);
  },
  
  
  canRemove: function(sender)
  {
    var canRemove = false;
    switch(sender.listView)
    {
      case this.SSInstalledSpaces:
        this.uninstallSpace(sender.index);
        canRemove = true;
        break;
      default:
        SSLog('No matching list view', SSLogForce);
        break;
    }
    
    return canRemove;
  },
  
  
  uninstallSpace: function(index)
  {
    var spaces = SSSpacesByPosition(), spaceToRemove = spaces[index];
    SSUninstallSpace(spaceToRemove.name);
  }
});