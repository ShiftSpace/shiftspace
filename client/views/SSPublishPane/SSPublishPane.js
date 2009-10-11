// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSView
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

  
  onShiftListViewShow: function(evt)
  {
    //SSLog("onShiftListViewShow", evt.listView.getName(), SSLogForce);
  },


  onShiftListViewHide: function(evt)
  {
    //SSLog("onShiftListViewHide", evt.listView.getName(), SSLogForce);
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
    if(!this.isVisible()) this.show();
    this.setCurrentListView(evt.listView);
    this.update();
  },
  
  
  onShiftDeselect: function(evt)
  {
    this.setCurrentListView(evt.listView);
    if(this.count() == 0) this.hide();
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
  
  
  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
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
      var p = new Promise(selectedShifts.map(SSDeleteShift));
      p.realize();
    }
  },
  
  
  saveShifts: function(evt)
  {
    evt = new Event(evt);
  },
  
  
  publishShifts: function(evt)
  {
    evt = new Event(evt);
    var selectedShifts = this.currentListView().checkedItemIds();
    if(selectedShifts && selectedShifts.length > 0)
    {
      var p = new Promise(
	selectedShifts.map(function(id) {
	  return SSApp.post({
	    resource: "shift",
	    id: id,
	    action: "publish",
	    data: {private: false},
	    json: true
	  })    
	})
      );
      p.realize();
    }
  },
  
  
  attachEvents: function()
  {
    SSLog('attachEvents', SSLogForce);
    this.DeleteShift.addEvent('click', this.deleteShifts.bind(this));
    this.SaveShift.addEvent('click', this.saveShifts.bind(this));
    this.PublishShift.addEvent('click', this.publishShifts.bind(this));
    this.ShiftPrivateStatusRadio.addEvent('click', function(_evt){ 
        var evt = new Event(_evt);
        if(this.SSPPVisiblePublic.hasClass('SSPPPermit')){
            this.SSPPVisiblePublic.removeClass('SSPPPermit');
        }
        this.SSPPVisiblePrivate.addClass('SSPPPermit');
        SSLog('clicked public status!',SSLogForce);
    }.bind(this));
    this.ShiftPublicStatusRadio.addEvent('click', function(_evt) {
        var evt = new Event(_evt);
        if(this.SSPPVisiblePrivate.hasClass('SSPPPermit')){
            this.SSPPVisiblePrivate.removeClass('SSPPPermit');
        }
        this.SSPPVisiblePublic.addClass('SSPPPermit');
        SSLog('clicked private status!', SSLogForce);
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
      this.element.getElement("#SSPublishPaneStatus label").removeClass('SSDisplayNone');
      if(publishData.draft)
      {
        this.element.getElement("#SSPublishPaneStatus label b").set('text', 'Draft');
      }
      else
      {
        this.element.getElement("#SSPublishPaneStatus label b").set('text', 'Published');
      }
    }
    else if(this.count() > 1)
    {
      this.element.getElement("#SSPublishPaneStatus label").addClass('SSDisplayNone');
    }
  },
  
  
  optionsForResource: function(resource)
  {
    return {byHref:window.location.href.split("#")[0]};
  },


  showProxy: function(evt)
  {
    var selectedShifts = this.currentListView().checkedItemIds();
    window.open(ShiftSpace.info().server.urlJoin("proxy", selectedShifts[0]));
  }
});