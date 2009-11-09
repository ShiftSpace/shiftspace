// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSListView
// ==/Builder==

var ShiftListView = new Class({

  Extends: SSListView, 
  name: "ShiftListView",
  
  
  defaults: function()
  {
    return $merge(this.parent(), {
      byHref: true,
      byDomain: false,
      byFollowing: false,
      byGroups: false
    });
  },

  
  initialize: function(el, options)
  {
    this.parent(el, options);
    el.addEvent('scroll', this.onScroll.bind(this));
    SSAddObserver(this, 'onNewShiftSave', this.onCreate.bind(this));
  },
  
  
  onScroll: function(evt)
  {
    var scroll = this.element.getScroll(),
        scrollSize = this.element.getScrollSize(),
        size = this.element.getSize();
    if(scroll.y == 0) this.onScrollTop();
    if(scrollSize.y == (scroll.y + size.y)) this.onScrollBottom();
  },
  
  
  onScrollTop: function()
  {
    SSLog("onScrollTop", SSLogForce);
  },
  
  
  onScrollBottom: function()
  {
    SSLog("onScrollBottom", SSLogForce);
    this.__reloadData__(this.table().read({start:this.count()}));
  },
  
  
  willShow: function()
  {
    SSPostNotification("onShiftListViewShow", {listView:this});
  },


  willHide: function()
  {
    SSPostNotification("onShiftListViewHide", {listView:this});
  },
  
  
  onRowSelect: function(idx)
  {
    this.parent(idx);
    var shift = this.data()[idx];
    SSShowShift(SSSpaceForName(shift.space.name), shift._id);
  },
  

  onRowDeselect: function(idx)
  {
    var shift = this.data()[idx];
    SSHideShift(SSSpaceForName(shift.space.name), shift._id);
  },
  
  
  onCreate: function(id)
  {
    this.refresh();
    if(this.isVisible())
    {
      var idx = this.find(function(x) { return x._id == id; });
      this.cell().lock(this.cellNodeForIndex(idx));
      this.cell().check();
      this.cell().unlock();
    }
  },
  
  
  onDelete: function(ack)
  {
    this.refresh();
  },
  
  
  check: function(indices)
  {
    indices = $splat(indices);
    var cell = this.cell();
    indices.each(function(idx, i) {
      var cellNode = this.cellNodeForIndex(idx);
      cell.lock(cellNode);
      cell.check();
      cell.unlock();
    }, this);
  },
  
  
  uncheck: function(indices)
  {
    var indices = $splat(indices);
    var cell = this.cell();
    indices.each(function(idx, i) {
      var cellNode = this.cellNodeForIndex(idx);
      cell.lock(cellNode);
      cell.uncheck();
      cell.unlock();
    }, this);
  },
  
  
  checkedItemIndices: function()
  {
    var indices = [];
    this.cellNodes().each(function(el, i) {
      if(el.getElement('input[type=checkbox]').getProperty("checked")) indices.push(i);
    });
    return indices
  },


  checkedItems: function()
  {
    return this.checkedItemIndices().map(this.data().asFn());
  },


  checkedItemIds: function()
  {
    return this.checkedItemIndices().map(Function.comp(this.data().asFn(), Function.acc("_id")));
  },
  
  
  onReloadData: function()
  {
    if(!__mainCssLoaded)
    {
      SSAddObserver(this, 'onMainCssLoad', function() {
        RoundedImage.init(".ShiftListView .ShiftListViewCell img.gravatar", new Window(this.element.getWindow()), document);
      });
    }
    else
    {
      RoundedImage.init(".ShiftListView .ShiftListViewCell img.gravatar", new Window(this.element.getWindow()), document);
    }
  }
});