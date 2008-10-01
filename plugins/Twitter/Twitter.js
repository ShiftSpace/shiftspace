var TwitterPlugin = ShiftSpace.Plugin.extend({

  pluginType: ShiftSpace.Plugin.types.get('kInterfaceTypePlugin'),

  attributes:
  {
    name: 'Twitter',
    title: null,
    icon: null,
    css: 'Twitter.css',
    version: 0.1
  },
  

  setup: function()
  {
    console.log('Setting up Twitter plugin');
  },
  
  
  onCssLoad: function()
  {
    this.buildInterface();
  },
  
  
  setAuthenticated: function(value)
  {
    this.__authenticated__ = value;
  },
  
  
  isAuthenticated: function()
  {
    return this.__authenticated__;
  },
  
  
  authenticate: function()
  {
    console.log('authenticate');
    // put ShiftSpace in modal mode
    this.enterModal();
    this.showAuthenticationdialog();
  },
  
  
  didAuthenticate: function()
  {
    console.log('didAuthenticate');
  },

  
  showAuthenticationdialog: function()
  {
    this.authenticateDialog.removeClass('SSDisplayNone');
  },

  
  show: function(shiftId)
  {
    console.log('show ' + shiftId);
    if(ShiftSpace.User.isLoggedIn())
    {
      if(this.isAuthenticated())
      {
        
      }
      else
      {
        this.authenticate();
      }
    }
    else
    {
      alert('You must be signed in order to send this shift to twitter.');
    }
  },
  
  
  hide: function()
  {
    console.log('hide');
  },
  

  buildInterface: function()
  {
    this.buildAuthententicateDialog();
    this.buildTweetDialog();
  },
  
  
  buildAuthententicateDialog: function()
  {
    this.authenticateDialog = new ShiftSpace.Element('div', {
      id: "SSTwitterPluginAuthenticateDialog", 
      'class': "SSTwitterPluginDialog SSDisplayNone"
    });
    
    this.authenticateDialog.injectInside(document.body);
  },
  
  
  buildTweetDialog: function()
  {
    this.tweetDialog = new ShiftSpace.Element('div', {
      id: "SSTwitterPluginTweetDialog", 
      'class': "SSTwitterPluginDialog SSDisplayNone"
    });
    
    this.tweetDialog.injectInside(document.body);
  },
  
});

var Twitter = new TwitterPlugin();
ShiftSpace.__externals__.Twitter = Twitter; // For Safari & Firefox 3.1