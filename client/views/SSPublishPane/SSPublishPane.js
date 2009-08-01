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
    this.setSelectedShifts([]);
    SSAddObserver(this, "onShiftSelect", this.onShiftSelect.bind(this));
    SSAddObserver(this, 'onShiftDeselect', this.onShiftDeselect.bind(this));
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
    if(this.selectedShifts().length == 0)
    {
      this.hide();
    }
  },
  
  
  addShift: function(evt)
  {
    this.selectedShifts().push(evt);
  },
  
  
  removeShift: function(evt)
  {
    this.selectedShifts().pop();
  },
  
  
  setDelegate: function(delegate)
  {
    this.__delegate = delegate;
  },
  
  
  delegate: function(delegate)
  {
    return this.__delegate;
  },
  
  
  setTableView: function(tableView)
  {
    this.__tableView = tableView;
  },
  
  
  tableView: function()
  {
    return this.__tableView;
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
    var shiftIds = this.checkedShifts();
    var len = shiftIds.length;
    var str = (len != 1) ? "these shifts" : "this shift";
    if(!confirm("Are you sure you want to delete " + str + "? There is no undo")) return;
    shiftIds.each(SSDeleteShift);
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
  }


});