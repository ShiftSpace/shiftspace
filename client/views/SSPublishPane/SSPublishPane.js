// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSFramedView
// ==/Builder==

/*
  Class: SSPublishPane
    The publish pane class. A singleton. Listens to all ShiftListView instances
    for selection notification.
*/
var SSPublishPane = new Class({

  Extends: SSView,
  name: "SSPublishPane",

  defaults: function() {
    return $merge(this.parent(), {
      multipleSelection: true
    });
  },
  
  
  initialize: function(el, options)
  {
    this.parent(el, options);

    SSAddObserver(this, "onShiftShare", this.onShiftShare.bind(this));
    SSAddObserver(this, "onShiftListViewShow", this.onShiftListViewShow.bind(this));
    SSAddObserver(this, "onShiftListViewHide", this.onShiftListViewHide.bind(this));
  },


  onShiftShare: function(shift)
  {
    this['open']();
    this.update(shift);
  },
  
  
  willHide: function()
  {
    var lv = this.currentListView();
    if(lv)
    {
      lv.uncheckAll(true);
    }
  },
  

  'open': function()
  {
    this.delegate().short();
    this.delegate().show();
    this.multiView().showViewByName(this.name);
    SSPostNotification("onPublishPaneOpen");
  },


  'close': function()
  {
    this.delegate().hide();
    SSPostNotification("onPublishPaneClose");
  },


  onShiftListViewShow: function(evt)
  {
    var listView = evt.listView;
    if(listView.checkedItems().length > 0)
    {
      this.setCurrentListView(listView);
      this.update();
      this['open']();
    }
  },


  onShiftListViewHide: function(evt)
  {
    var listView = evt.listView;
    if(listView == this.currentListView())
    {
      this['close']();
      this.setCurrentListView(null);
    }
  },
  
  
  setCurrentShift: function()
  {
    return this.__setCurrentShift;
  },
  
  
  setSetCurrentShift: function(setCurrentShift)
  {
    this.__setCurrentShift = setCurrentShift;
  },
  
  


  setCurrentListView: function(current)
  {
    this.__current = current;
  },
  
  
  currentListView: function()
  {
    return this.__current;
  },
  

  setDelegate: function(delegate)
  {
    this.__delegate = delegate;
  },
  
  
  delegate: function(delegate)
  {
    return this.__delegate;
  },
  

  isGroup: function(str)
  {
    return str[0] == '&';
  },


  isUser: function(str)
  {
    return str[0] == '@';
  },


  publishShifts: function(evt)
  {
    evt = new Event(evt);

    var selectedShifts = this.currentListView().checkedItemIds(),
        publishData = {};

    if(selectedShifts && selectedShifts.length > 0)
    {
      var isPublic = this.PublicCheckbox.getProperty("checked");

      if(isPublic)
      {
        publishData['private'] = false;
      }
      else
      {
        var targets = this.PublishTargets.getProperty("value").split(" ").map(String.trim).filter(Function.not(Function.eq("")));
        if(targets.length == 0)
        {
          alert("Please specify which user or group you wish to publish to.");
          return;
        }
        publishData.targets = targets;
      }

      var p = new Promise(
        selectedShifts.map(function(id) {
          return SSApp.post({
            resource: "shift",
            id: id,
            action: "publish",
            data: publishData,
            json: true
          });
        })
      );
      p.realize();
    }
  },
  
  
  attachEvents: function()
  {
    this.Cancel.addEvent("click", this['close'].bind(this));
    this.ChooseVisibility.addEvent('click', this.publishShifts.bind(this));

    this.ShiftPrivateStatusRadio.addEvent('click', function(evt){
      evt = new Event(evt);
      if(this.SSPPVisiblePublic.hasClass('SSPPPermit')){
        this.SSPPVisiblePublic.removeClass('SSPPPermit');
      }
      this.SSPPVisiblePrivate.addClass('SSPPPermit');
    }.bind(this));

    this.ShiftPublicStatusRadio.addEvent('click', function(evt) {
      evt = new Event(evt);
      if(this.SSPPVisiblePrivate.hasClass('SSPPPermit')){
        this.SSPPVisiblePrivate.removeClass('SSPPPermit');
      }
      this.SSPPVisiblePublic.addClass('SSPPPermit');
    }.bind(this));

    if(this.SecretLink) this.SecretLink.addEvent("click", this.showProxy.bind(this));
  },
  
  
  /*
    Function: update
      Update the display of the shift depending on the useres selections.
   */
  update: function(shift)
  {
    var publishData = shift.publishData;
    this.PublishTargets.setProperty("value", "");
    if(publishData.private)
    {
      this.ShiftPrivateStatusRadio.setProperty("checked", true);
    }
    else
    {
      this.ShiftPublicStatusRadio.setProperty("checked", true);
    }
    if(publishData.targets && publishData.targets.length > 0)
    {
      this.PublishTargets.setProperty("value", publishData.targets.join(" "));
    }
  },


  showProxy: function(evt)
  {
    var selectedShifts = this.currentListView().checkedItemIds();
    window.open(ShiftSpace.info().server.urlJoin("unsafe-proxy", selectedShifts[0]));
  },
  

  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  }
});