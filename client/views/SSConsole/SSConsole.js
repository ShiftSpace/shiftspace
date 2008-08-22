var SSConsole = new Class({
  
  name: "SSConsole",
  
  Extends: SSView,
  

  initialize: function(el, options)
  {
    this.parent(el, options);
  },
  

  awake: function()
  {
    this.parent();
    
    // test setting outlets to controllers
    if(this.outlets().get('AllShiftsView'))
    {
      this.outlets().get('AllShiftsView').setDelegate(this);
    }
    
    // test login form outlet
    if(this.outlets().get('SSLoginFormSubmit'))
    {
      this.outlets().get('SSLoginFormSubmit').addEvent('click', function(_evt) {
        
        var evt = new Event(_evt);
        var username = this.outlets().get('SSLoginFormUsername').getProperty('value');
        var password = this.outlets().get('SSLoginFormPassword').getProperty('value');

        console.log('Login the user ' + username + ', ' + password);

        var credentials = {
          username: username,
          password: password
        };

        new Request({
          type: 'post',
          url: __ssserver__ + '/dev/shiftspace.php?method=user.login',
          data: credentials,
          onComplete: function(responseText, reponseXml)
          {
            console.log('Logged in!');
          }.bind(this),
          onFailure: function()
          {
            console.error('Oops login failed!');
          }.bind(this)
        }).send();
        
      }.bind(this));
    }
    
    // test login form outlet
    if(this.outlets().get('SSSignUpFormSubmit'))
    {
      this.outlets().get('SSSignUpFormSubmit').addEvent('click', function(_evt) {
        var evt = new Event(_evt);
        var username = this.outlets().get('SSSignUpFormUsername').getProperty('value');
        var email = this.outlets().get('SSSignUpFormEmail').getProperty('value');
        var password = this.outlets().get('SSSignUpFormPassword').getProperty('value');
        var confirmPassword = this.outlets().get('SSSignUpFormPassword').getProperty('value');
        console.log('Sing up the user ' + username + ', ' + email + ', ' + password + ', ' + confirmPassword);
      }.bind(this));
    }
  },
  
  
  awakeDelayed: function()
  {
    // test outlets in iframes
    this.outlets().get('cool').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      console.log('cool button clicked!');
    });
  },
  
  
  userClickedRow: function(data)
  {
    console.log('SSConsole userClickedRow >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ' + data);
  },
  
  
  canSelectRow: function(data)
  {
    
  },
  
  
  canSelectColumn: function(data)
  {
    
  }
  
});

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSConsole = SSConsole;
}