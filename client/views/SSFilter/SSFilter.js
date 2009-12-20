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
    SSAddObserver(this, "onToggleFilter", this.toggle.bind(this));
  },


  toggle: function(evt)
  {
    if(this.isVisible())
    {
      this.hide(evt);
    }
    else
    {
      this.show(evt);
    }
  },
  
  
  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
    if(this.options.listView)
    {
      this.setCurrentListView(ShiftSpaceNameTable[this.options.listView]);
    }
  },


  show: function(evt)
  {
    this.parent();
    if(this.element.getParent() != null) this.element.dispose();
    this.element.inject(evt.listView.element, "before");
  },


  hide: function()
  {
    this.parent();
    this.element.dispose();
    var lv = this.currentListView();
    if(lv)
    {
      lv.setFilterMode(false);
      lv.reloadData();
    }
  },


  attachEvents: function()
  {
    this.SSFilterQuery.addEvent("keyup", this.handleKey.bind(this));
    this.SSFilterBy.addEvent("change", this.fetch.bind(this));
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
    // TODO: ignore non-character keys (shift, option, command, control) - David
    $clear(this.currentTimer());
    var query = this.SSFilterQuery.get("value").trim();
    if(query != "")
    {
      this.setCurrentTimer(this.fetch.delay(1000, this));
    }
    else
    {
      this.currentListView().setFilterMode(false);
      this.currentListView().reloadData();
    }
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

    var type = this.SSFilterBy.get("value"),
        value = this.SSFilterQuery.get("value").trim(),
        table = this.currentListView().table(),
        url = table.resource().read;

    if(!value) return;

    query = {};
    query[type] = value;

    // REFACTOR: a bit on the hacky side, but I just want to get it working - David
    var datap = SSApp.getUrl(url, {filter: true, query: JSON.encode(query)});
    this.currentListView().setFilterMode(true);
    var controlp = this.currentListView().setData(datap);
    this.currentListView().__reloadData__(controlp);
  },
  

  onShiftListViewShow: function(evt)
  {
  },


  onShiftListViewHide: function(evt)
  {
  }

});