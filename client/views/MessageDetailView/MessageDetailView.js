// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var MessageDetailView = new Class({

  Extends: SSView,
  name: "MessageDetailView",

  initialize: function(el, options)
  {
    this.parent(el, options);

    SSAddObserver(this, 'onShowMessage', this.showMessage.bind(this));
    SSAddObserver(this, 'onHideMessage', this['close'].bind(this));
  },


  showMessage: function(message)
  {
    
  },


  'open': function()
  {
    this.delegate().show();
    this.multiView().showViewByName(this.name);
  },


  'close': function()
  {
    this.delegate().hide();
  },
  

  attachEvents: function()
  {
    
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  },


  currentMessage: function()
  {
    return this.__currentMessage;
  },
  
  
  setCurrentmessage: function(currentMessage)
  {
    this.__currentMessage = currentMessage;
  }

});