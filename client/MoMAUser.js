// ==Builder==
// @optional
// @name              MoMAUser
// @package           MoMA
// ==/Builder==

/*
  Class: User
    A an object wrapping the current ShiftSpace User.  Use this class to check the user's display
    name as well as checking if the user is logged in or out.
*/
var MoMAUserClass = new Class({
  
  Implements: Events,
  
  Extends: ShiftSpaceUser,
  
  initialize: function()
  {
    this.parent();
    this.clearData();
  },
  
  
  syncData: function(data)
  {
    this.setUsername(data.username);
    this.setId(data.id);
    this.setEmail(data.email);
    this.setPhone(data.phone);
    this.setPhoneValidated(data.phone_validated);
    this.setPreview(data.preview);
  },
  
  
  clearData: function()
  {
    this.__username = null;
    this.__userId = null;
    this.__email = null;
    this.__phone = null;
    this.__phoneValidated = null;
    this.__preview = null;
  },
  
  
  setId: function(id)
  {
    this.__userId = id;
  },
  
  
  getId: function()
  {
    return this.__userId;
  },
  
  
  setPreview: function(val)
  {
    this.__preview = val;
  },
  
  
  preview: function()
  {
    return this.__preview;
  },
  
  
  setPerspective: function(perspective)
  {
    this.__perspective = perspective;
  },
  
  
  perspective: function()
  {
    return this.__perspective;
  },
  
  
  setPhone: function(phone)
  {
    if(phone != '' && phone != 'NULL' && phone != null)
    {
      this.__phone = phone;
    }
    else 
    {
      this.__phone = '';
    }
  },
  
  
  phone: function()
  {
    return this.__phone;
  },
  
  
  setPhoneValidated: function(value)
  {
    this.__phoneValidated = value;
  },
  
  
  phoneValidated: function()
  {
    return this.__phoneValidated;
  },
  

  /*
    Function: isLoggedIn
      Checks whether there is a logged in user.
      
    Returns:
      A boolean.
  */
  isLoggedIn: function(showErrorAlert) 
  {
    return (this.getId() != null);
  },

  
  validatePhone: function(_callback) 
  {
    var callback = _callback;
    SSServerCall('user.validate_phone', null, function(json) {
      if(callback) callback(json);
      this.fireEvent('onUserValidatePhone', json);
    }.bind(this));
  },
  
  
  validatePhoneComplete: function(passcode, _callback)
  {
    var callback = _callback;
    SSServerCall('user.validate_phone_complete', {key:passcode}, function(json) {
      if(callback) callback(json);
      this.fireEvent('onUserValidatePhoneComplete', json);
    }.bind(this));
  },
  
  
  bookmarksByPhone: function(phone, _callback)
  {
    var callback = _callback;
    SSServerCall('user.bookmarks_by_phone', {phone:phone}, function(json) {
      if(callback) callback(json);
      this.fireEvent('onBookmarksByPhoneComplete', json);
    }.bind(this));
  }
});

var MoMAUser = new MoMAUserClass();
