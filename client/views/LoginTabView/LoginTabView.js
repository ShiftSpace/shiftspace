// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSTabView
// ==/Builder==

var LoginTabView = new Class({
  Extends: SSTabView,
  name: "LoginTabView",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSAddObserver(this, "onSync", this.onSync.bind(this));
    SSAddObserver(this, "onUserLogin", this.onLogin.bind(this));
    SSAddObserver(this, 'onUserLoginFailed', this.handleLoginFailed.bind(this));
    SSAddObserver(this, "onUserLogout", this.onLogout.bind(this));
    SSAddObserver(this, 'onUserJoinFailed', this.handleJoinFailed.bind(this));
  },
  

  awake: function()
  {
    this.mapOutletsToThis();
    this.initLoginForm();
    this.initSignUpForm();
  },


  afterAwake: function()
  {
    if(ShiftSpaceUser.isLoggedIn() && !this.loginHandled()) this.handleLogin();
  },
  
  
  show: function()
  {
    this.parent();
    this.emptyLoginForm();
  },
  
  
  setLoginHandled: function(value)
  {
    this.__loginHandled = value;
  },
  
  
  loginHandled: function()
  {
    return this.__loginHandled;
  },
  
  
  initLoginForm: function()
  {
    this.SSLoginFormSubmit.addEvent('click', this.handleLoginFormSubmit.bind(this));
    this.SSLoginForm.addEvent('submit', function(evt) {
      evt = new Event(evt);
      evt.preventDefault();
      this.handleLoginFormSubmit();
    }.bind(this));
  },
  
  
  emptyLoginForm: function()
  {
    this.SSLoginFormUsername.setProperty('value', '');
    this.SSLoginFormPassword.setProperty('value', '');
    this.SSLoginFormMessage.set('text', '');
  },


  handleLoginFormSubmit: function()
  {
    this.SSLoginFormMessage.set('text', '');
    ShiftSpaceUser.login({
      userName: this.SSLoginFormUsername.getProperty('value'),
      password: this.SSLoginFormPassword.getProperty('value')
    }, this.loginFormSubmitCallback.bind(this));
  },


  loginFormSubmitCallback: function(response)
  {
    this.fireEvent('onUserLogin');
  },
  
  
  handleLogin: function()
  {
    
  },


  handleLoginFailed: function(err)
  {
    this.SSLoginFormMessage.set('text', err.error);
  },

  
  handleJoinFailed: function(err)
  {
    this.SSSignUpFormMessage.set('text', err.error);
  },


  initSignUpForm: function()
  {
    this.SSSignUpFormSubmit.addEvent('click', this.handleSignUpFormSubmit.bind(this));
    this.SSSignUpForm.addEvent('submit', function(evt) {
      evt = new Event(evt);
      evt.preventDefault();
      this.handleSignUpFormSubmit();
    }.bind(this));
  },


  handleSignUpFormSubmit: function()
  {
    this.SSSignUpFormMessage.set('text', '');
    var joinInput = {
      userName: this.SSSignUpFormUsername.getProperty('value'),
      email: this.SSSignUpFormEmail.getProperty('value'),
      password: this.SSSignUpFormPassword.getProperty('value'),
      passwordVerify: this.SSSignUpFormConfirmPassword.getProperty('value')
    };

    var p = ShiftSpaceUser.join(joinInput);
    $if(SSApp.noErr(p),
        this.signUpFormSubmitCallback.bind(null, [p]));
  },


  signUpFormSubmitCallback: function(userData)
  {
    this.MainTabView.selectTabByName('AllShiftsView');
  }.asPromise(),
  

  onSync: function()
  {
  },
  
  
  onLogin: function()
  {
    this.setLoginHandled(true);
    this.emptyLoginForm();
  },
  
  
  onLogout: function()
  {
    this.setLoginHandled(false);
    this.emptyLoginForm();
  }
});