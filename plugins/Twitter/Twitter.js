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
    this.setAuthenticated(false);
  },
  
  
  setUsername: function(username)
  {
    this.__username__ = username;
  },
  
  
  username: function()
  {
    return this.__username__;
  },
  
  
  setPassword: function(pass)
  {
    this.__password__ = pass;
  },
  
  
  password: function()
  {
    return this.__password__;
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
    console.log('submitAuthentication');
    var name = this.userInput.getProperty('value');
    var pass = this.passwordInput.getProperty('value');
    
    this.setUsername(name);
    this.setPassword(pass);
    
    // run a test to make sure that this user authenticates
    this.transact('verify_credentials', null, this.didAuthenticate.bind(this), this.authenticationFailed.bind(this));
    //this.transact('public_timeline', null, this.didAuthenticate.bind(this), this.authenticationFailed.bind(this));
  },
  
  
  didAuthenticate: function()
  {
    this.setAuthenticated(true);
    this.hideAuthenticationDialog();
    this.exitModal();
    alert("Authenticated!");
  },
  
  
  authenticationFailed: function()
  {
    this.hideAuthenticationDialog();
    this.exitModal();
    alert("Sorry, wrong user name anad password");
  },

  
  tweetShift: function(shiftId)
  {
    this.transact('update', {
      status: "Hello I just shifted " + shiftId
    }, this.onTweet.bind(this));
  },
  
  
  onTweet: function()
  {
    console.log('Your shift was tweeted!');
  },

  
  transact: function(method, parameters, callback, errcallback)
  {
    var params = parameters || {};
    
    var methodType = {
      'verify_credentials': 'GET',
      'public_timeline': 'GET',
      'update': 'POST'
    }[method] || 'GET';
    
    console.log(methodType);
    console.log(params);
    
    this.xmlHttpRequest({
      url: "http://www.twitter.com/statuses/"+method+".json",
      method: methodType,
      data: params,
      headers:
      {
        "Authorization": "Basic " + btoa(this.username() + ':' + this.password())
      },
      onload: function(rx)
      {
        console.log(rx.responseText);
        var json = Json.evaluate(rx.responseText);
        if(callback && $type(callback) == 'function') callback(json);
      }.bind(this),
      onerror: function(rx)
      {
        SSLog('Twitter plugin transaction (' + url + ') failed.', SSLogError);
        if(errcallback && $typepe(errcallback) == 'function') errcallback(rx);
      }.bind(this)
    });
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
        this.tweetShift(shiftId);
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