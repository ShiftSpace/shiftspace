// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var SSFilter = new Class({

  Extends: SSView,
  name: "SSFilter",

  initialize: function(el, options)
  {
    this.parent(el, options);
    SSAddObserver(this, "onShiftListViewShow", this.onShiftListViewShow.bind(this));
    SSAddObserver(this, "onShiftListViewHide", this.onShiftListViewHide.bind(this));
  },
  
  
  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  },


  attachEvents: function()
  {
    this.SSFilterQuery.addEvent("keyup", this.handleKey.bind(this));
  },


  setQuery: function(str)
  {
    this.__query = str;
  },


  query: function()
  {
    return this.__query;
  },


  handleKey: function(evt)
  {
    evt = new Event(evt);
    // TODO: ignore non-character keys - David
    $clear(this.currentTimer());
    this.setCurrentTimer(this.fetch.delay(1000, this));
  },


  currentTimer: function()
  {
    return this.__currentTimer;
  },
  
  
  setCurrentTimer: function(currentTimer)
  {
    this.__currentTimer = currentTimer;
  },


  currentListView: function()
  {
    return this.__currentListView;
  },
  
  
  setCurrentListView: function(currentListView)
  {
    this.__currentListView = currentListView;
  },


  fetch: function()
  {
    // how to know what content a paginated view fetches?
    // needs to be part of the table probably
    SSLog("Fetch", this.SSFilterQuery.get("value"), SSLogForce);
  },
  

  onShiftListViewShow: function(evt)
  {
  },


  onShiftListViewHide: function(evt)
  {
  }

});