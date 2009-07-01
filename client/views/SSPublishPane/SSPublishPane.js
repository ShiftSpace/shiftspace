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
  }


});