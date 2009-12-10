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

    SSAddObserver(this, "onShiftListViewShow", this.onShiftListViewShow.bind(this));
    SSAddObserver(this, "onShiftListViewHide", this.onShiftListViewHide.bind(this));
    SSAddObserver(this, "onShiftSelect", this.onShiftSelect.bind(this));
    SSAddObserver(this, 'onShiftDeselect', this.onShiftDeselect.bind(this));
  },
  
  
  willHide: function()
  {
    var lv = this.currentListView();
    if(lv)
    {
      lv.uncheckAll(true);
      this.setCurrentListView(null);
    }
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
  
  
  setCurrentListView: function(current)
  {
    this.__current = current;
  },
  
  
  currentListView: function()
  {
    return this.__current;
  },
  
  
  count: function()
  {
    return this.currentListView().checkedItemIndices().length;
  },
  
  
  onShiftSelect: function(evt)
  {
    if(!this.isVisible()) this['open']();
    this.setCurrentListView(evt.listView);
    this.update();
  },
  
  
  onShiftDeselect: function(evt)
  {
    this.setCurrentListView(evt.listView);
    if(this.count() == 0) this['close']();
    this.update();
  },
  
  
  setDelegate: function(delegate)
  {
    this.__delegate = delegate;
  },
  
  
  delegate: function(delegate)
  {
    return this.__delegate;
  },
  
  
  deleteShifts: function(evt)
  {
    evt = new Event(evt);
    var selectedShifts = this.currentListView().checkedItemIds();
    
    if(selectedShifts && selectedShifts.length > 0)
    {
      var len = selectedShifts.length;
      var str = (len != 1) ? "these shifts" : "this shift";
      if(!confirm("Are you sure you want to delete " + str + "? There is no undo")) return;
      var indices = this.currentListView().checkedItemIndices();
      this.currentListView().uncheck(indices);
      var p = new Promise(selectedShifts.map(SSDeleteShift));
      p.op(this['close'].bind(this));
      p.realize();
    }
  },
  
  
  saveShifts: function(evt)
  {
    evt = new Event(evt);
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

    var selectedShifts = this.currentListView().checkedItemIds();
    var publishData = {};

    if(selectedShifts && selectedShifts.length > 0)
    {
      var status = $A(this.StatusForm.ShiftStatusRadio).filter(function(radio) {
        return $(radio).getProperty("checked");
      }.bind(this));

      if(status.length > 0)
      {
        var status = status[0].getProperty("value");
        if(status == "public")
        {
          publishData.private = false;
        }
        else if(status == "private")
        {
          var targets = this.PublishTargets.getProperty("value").split(" ").map(String.trim).filter(Function.not(Function.eq("")));
          if(targets.length == 0)
          {
            alert("Please specify which user or group you wish to publish to.");
            return;
          }
          publishData.targets = targets;
        }
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
    this.DeleteShift.addEvent('click', this.deleteShifts.bind(this));
    this.SaveShift.addEvent('click', this.saveShifts.bind(this));
    this.PublishShift.addEvent('click', this.publishShifts.bind(this));

    this.ShiftPrivateStatusRadio.addEvent('click', function(evt){ 
      evt = new Event(evt);
      if(this.SSPPVisiblePublic.hasClass('SSPPPermit')){
        this.SSPPVisiblePublic.removeClass('SSPPPermit');
      }
      this.SSPPVisiblePrivate.addClass('SSPPPermit');
      SSLog('clicked public status!',SSLogForce);
      
      //trying something:
	    
    }.bind(this));

    this.ShiftPublicStatusRadio.addEvent('click', function(evt) {
      evt = new Event(evt);
      if(this.SSPPVisiblePrivate.hasClass('SSPPPermit')){
        this.SSPPVisiblePrivate.removeClass('SSPPPermit');
      }
      this.SSPPVisiblePublic.addClass('SSPPPermit');
      SSLog('clicked private status!', SSLogForce);
      
      //trying something:
	    
    }.bind(this));

    if(this.ShiftPermalink) this.ShiftPermalink.addEvent("click", this.showProxy.bind(this));
  },
  
  
  /*
    Function: update
      Update the display of the shift depending on the useres selections.
   */
  update: function()
  {
    if(this.count() == 1)
    {
      var publishData = this.currentListView().checkedItems()[0].publishData;

      // clear out the publish targets data
      this.PublishTargets.setProperty("value", "");
      
      this.element.getElement("#SSPublishPaneStatus label").removeClass('SSDisplayNone');
      if(publishData !== undefined && publishData.draft)
      {
        this.element.getElement("#SSPublishPaneStatus label b").set('text', 'Draft');
      }
      else
      {
        this.element.getElement("#SSPublishPaneStatus label b").set('text', 'Published');
      }
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
    }
    else if(this.count() > 1)
    {
      this.element.getElement("#SSPublishPaneStatus label").addClass('SSDisplayNone');
    }
  },


  showProxy: function(evt)
  {
    var selectedShifts = this.currentListView().checkedItemIds();
    window.open(ShiftSpace.info().server.urlJoin("proxy", selectedShifts[0]));
  },
  

  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  }

});