// ==Builder==
// @uiclass
// @customView
// @optional
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

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
    this.setSelectedShifts($H());
    SSAddObserver(this, "onShiftSelect", this.onShiftSelect.bind(this));
    SSAddObserver(this, 'onShiftDeselect', this.onShiftDeselect.bind(this));
  },
  
  
  setCurrentListView: function(current)
  {
    this.__current = current.getName();
  },
  
  
  currentListView: function()
  {
    return this.__current;
  },
  
  
  count: function()
  {
    if(!this.selectedShifts()[this.currentListView()]) return 0;
    return this.selectedShifts()[this.currentListView()].length;
  },
  
  
  setSelectedShifts: function(ary)
  {
    this.__selectedShifts = ary;
  },
  
  
  selectedShifts: function()
  {
    return this.__selectedShifts;
  },
  
  
  onShiftSelect: function(evt)
  {
    if(!this.isVisible()) this.show();
    this.addShift(evt);
  },
  
  
  onShiftDeselect: function(evt)
  {
    this.removeShift(evt);
    if(this.selectedShifts()[evt.listView.getName()].length == 0) this.hide();
  },
  
  
  addShift: function(evt)
  {
    this.setCurrentListView(evt.listView);
    var listViewName = evt.listView.getName();
    var selectedShifts = this.selectedShifts();
    var listViewSelectedShifts = selectedShifts[listViewName];
    if(!listViewSelectedShifts) selectedShifts[listViewName] = [];
    selectedShifts[listViewName].push(evt.index);
    this.update();
  },
  
  
  removeShift: function(evt)
  {
    this.setCurrentListView(evt.listView);
    var listViewName = evt.listView.getName();
    this.selectedShifts()[listViewName].erase(evt.index);
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
  
  
  checkedShifts: function()
  {
    return $getf(this, 'delegate', 'checkedShifts').bind(this.delegate())();
  },
  
  
  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  },

  
  deleteShifts: function(evt)
  {
    evt = new Event(evt);
    var listView = ShiftSpace.Console.visibleListView();
    var listViewName = listView.getName();
    var selectedShifts = this.selectedShifts()[listViewName];
    
    if(selectedShifts && selectedShifts.length > 0)
    {
      var len = selectedShifts.length;
      var str = (len != 1) ? "these shifts" : "this shift";
      if(!confirm("Are you sure you want to delete " + str + "? There is no undo")) return;
      return new Promise(listView.get(selectedShifts).map(SSDeleteShift));
    }
  },
  
  
  saveShifts: function(evt)
  {
    evt = new Event(evt);
    var shifts = this.checkedShifts();
  },
  
  
  publishShifts: function(evt)
  {
    evt = new Event(evt);
    var shifts = this.checkedShifts();
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
  },
  
  
  update: function()
  {
    if(this.count() == 1)
    {
      var selectedIdx = this.selectedShifts()[this.currentListView()][0];
      var listView = ShiftSpaceNameTable[this.currentListView()];
      var publishData = listView.get(selectedIdx).publishData;
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
    return {};
  }

});