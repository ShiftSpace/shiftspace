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

  
  currentMessage: function()
  {
    return this.__currentMessage;
  },
  
  
  setCurrentMessage: function(currentMessage)
  {
    this.__currentMessage = currentMessage;
  },


  showMessage: function(message)
  {
    this.setCurrentMessage(message);
    SSTemplate(this.element.getElement(".header"), message);
    switch(message.meta)
    {
      case 'comment':
        this.MessageBodyMultiView.showViewByName("CommentSubView");
        break;
      case 'invite':
        this.MessageBodyMultiView.showViewByName("InviteSubView");
        break;
      case 'follow':
        this.MessageBodyMultiView.showViewByName("FollowSubView");
        break;
      case 'share':
        this.MessageBodyMultiView.showViewByName("ShareSubView");
      default:
        break;
    }
    SSTemplate(this.element.getElement(".body div.SSSubView.SSActive"), message);
    this.open();
  },


  'open': function()
  {
    this.delegate().tall();
    this.delegate().show();
    this.multiView().showViewByName(this.name);
  },


  'close': function()
  {
    this.delegate().hide();
  },
  

  attachEvents: function()
  {
    this.MDVJoinGroup.addEvent("click", function(evt) {
      var p = SSJoinGroup(this.currentMessage().content._id);
      p.realize();
    }.bind(this));

    this.MDVGroupDetails.addEvent("click", function(evt) {
      //SSPostNotification("onShowGroup", SSGroupInfo(this.currentMessage().content._id));
    }.bind(this));

    this.MDVShowShift.addEvent("click", function(evt) {
      evt = new Event(evt);
      var data = this.currentMessage().content,
          id = data._id,
          href = data.href;
      SSSetValue("__currentShift", {id: id, href: href});
      window.open(href);
    }.bind(this));
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  }
});