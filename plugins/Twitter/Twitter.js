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
    this.attachEvents();
  },
  
  
  attachEvents: function()
  {
    this.cancelAuthButton.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      this.hideAuthenticationDialog();
      this.exitModal();
    }.bind(this));
    
    this.authButton.addEvent('click', this.submitAuthentication.bind(this));
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
  
  
  submitAuthentication: function()
  {
    var name = this.userInput.getProperty('value');
    var pass = this.passwordInput.getProperty('value');
    
    console.log('submitAuthentication');
    console.log(name);
    console.log(pass);
    
    this.xmlHttpRequest({
      url: 'http://twitter.com/statuses/friends_timeline.json',
      method: 'GET',
      headers:
      {
        "Authorization": "Basic " + btoa(name + ':' + pass)
      },
      onload: function(rx)
      {
        console.log('Authorized');
        console.log(rx);
      }.bind(this),
      onerror: function(rx)
      {
        console.log('Oops');
        console.log(rx);
      }.bind(this)
    });
  },
  
  
  didAuthenticate: function()
  {
    console.log('didAuthenticate');
  },

  
  showAuthenticationdialog: function()
  {
    this.authenticateDialog.removeClass('SSDisplayNone');
  },
  
  
  hideAuthenticationDialog: function()
  {
    this.authenticateDialog.addClass('SSDisplayNone');
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

    this.userLabel = new ShiftSpace.Element('div', {
      id: 'SSTwitterPluginAuthenticateUserLabel', 
    });
    this.userLabel.setText('User name:');

    this.userInput = new ShiftSpace.Element('input', {
      id: "SSTwitterPluginAuthenticateUserInput",
      type: "text"
    });

    this.passwordLabel = new ShiftSpace.Element('div', {
      id: "SSTwitterPluginAuthenticatePasswordLabel"
    });
    this.passwordLabel.setText('Password:');
    
    this.passwordInput = new ShiftSpace.Element('input', {
      id: "SSTwitterPluginAuthenticatePasswordInput",
      type: 'password'
    });
    
    this.authButton = new ShiftSpace.Element('input', {
      id: "SSTwitterPluginAuthenticateSubmitButton",
      type: "button",
      value: "Authenticate"
    });
    
    this.cancelAuthButton = new ShiftSpace.Element('input', {
      id: "SSTwitterPluginAuthenticateCancelButton",
      type: "button",
      value: "Cancel"
    });
    
    this.userLabel.injectInside(this.authenticateDialog);
    this.userInput.injectInside(this.authenticateDialog);
    this.passwordLabel.injectInside(this.authenticateDialog);
    this.passwordInput.injectInside(this.authenticateDialog);
    this.authButton.injectInside(this.authenticateDialog);
    this.cancelAuthButton.injectInside(this.authenticateDialog);
    
    this.authenticateDialog.injectInside(document.body);
  },
  
  
  buildTweetDialog: function()
  {
    this.tweetDialog = new ShiftSpace.Element('div', {
      id: "SSTwitterPluginTweetDialog", 
      'class': "SSTwitterPluginDialog SSDisplayNone"
    });
    
    this.tweetDialog.injectInside(document.body);
  }
  
});

var Twitter = new TwitterPlugin();
ShiftSpace.__externals__.Twitter = Twitter; // For Safari & Firefox 3.1