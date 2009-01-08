// ==Builder==
// @uiclass
// @optional
// @name              SSListView
// @package           ShiftSpaceCoreUI
// @dependencies      SSView, SSCell
// ==/Builder==

// ==============
// = Exceptions =
// ==============

var SSListViewError = SSException;

SSListViewError.OutOfBounds = new Class({
  name:"SSListViewError.OutOfBounds",
  Extends: SSListViewError,
  Implements: SSExceptionPrinter
});

// ====================
// = Class Definition =
// ====================

var SSListView = new Class({
  name: "SSListView",
  
  Extends: SSView,
  
  defaults: function()
  {
    return $merge(this.parent(), {
      cell: null,
      reorderable: false
    });
  },
  

  initialize: function(el, options)
  {
    this.parent(el, options);
    this.attachEvents();
  },
  
  
  attachEvents: function()
  {
    this.element.addEvent('click', this.eventDispatch.bind(this));
  },
  
  
  eventDispatch: function(_event, eventType)
  {
    var event = new Event(_event);
    var target = event.target;
    
    switch(true)
    {
      case(this.hitTest(target, '> li *') != null):
        this.cell().lock(this.cachedHit().getParent('li'));
        this.cell().eventDispatch(event, eventType);
        this.cell().unlock();
      break;
      
      default:
      break;
    }
  },
  
  
  awake: function(context)
  {
    this.setCell(SSControllerForNode(this.element.getElement('> .SSCell')));
  },
  
  
  setCell: function(cell)
  {
    this.__cell = cell;
    cell.setDelegate(this);
    cell.element.dispose();
  },
  
  
  cell: function()
  {
    return this.__cell;
  },
  
  
  setData: function(newData)
  {
    this.__data = newData;
    
    if(newData.addView)
    {
      newData.addView(this);
    }
    
    this.refresh();
  },
  

  data: function()
  {
    return this.__data;
  },
  
  
  rawData: function()
  {
    var data = this.data();
    if(data.internal) return data.internal();
    return data;
  },
  
  
  count: function()
  {
    if($type(this.data().length) == 'function') return this.data().length();
    return this.data().length;
  },
  
  
  find: function(fn)
  {
    var data = this.rawData();
    for(var i = 0, l = data.length; i < l; i++) if(fn(data[i])) return i;
    return -1;
  },
  
  
  findAll: function(fn)
  {
    var data = this.rawData();
    var result = [];
    for(var i = 0, l = data.length; i < l; i++) if(fn(data[i])) result.push[1];
    return result;
  },
  
  
  cellNodes: function()
  {
    return this.element.getElements('> li');
  },
  
  
  add: function(newItem)
  {
    // update the data
    this.data().push(newItem);
    this.refresh();
  },
  
  
  edit: function(index)
  {
    this.boundsCheck(index);
    
    var canEdit = true;
    if(this.delegate() && this.delegate().canEdit)
    {
      canEdit = this.data().canEdit(index);
    }

    if(canEdit)
    {
      this.cell().edit(this.cellNodeForIndex(index));
    }
  },
  
  
  insert: function(cellData, index)
  {
    this.boundsCheck(index);
    
    if(this.data().insert)
    {
      this.data().insert(cellData, index);
    }
    else
    {
      this.data().splice(index, 0, cellData);
    }
    this.refresh();
  },
  
  
  set: function(cellData, index)
  {
    this.boundsCheck(index);
    this.__set__(cellData, index);
  },
  
  
  __set__: function(cellData, index)
  {
    if(this.data().set)
    {
      this.data().set(cellData, index);
    }
    else
    {
      this.data()[index] = cellData;
    }
  },
  
  
  get: function(index)
  {
    this.boundsCheck(index);
    
    var copy = {};
    var data = this.__get__(index);
    for(prop in data)
    {
      copy[prop] = data[prop];
    }
    return copy;
  },
  

  __get__: function(index)
  {
    if(this.data().get)
    {
      return this.data().get(index);
    }
    else
    {
      return this.data()[index];
    }
  },
  

  update: function(cellData, index)
  {
    this.boundsCheck(index);
    
    var oldData = this.get(index);
    this.set($merge(oldData, cellData), index);
  },
  

  __update__: function(cellData, index)
  {
    var oldData;
    if(this.data().get)
    {
      oldData = this.data().get(index);
    }
    else
    {
      oldData = this.data()[index];
    }
    this.__set__(oldData.merge(cellData));
  },
  
  
  move: function(from, to)
  {
    this.boundsCheck(from);
    this.boundsCheck(to);
    
    var data = this.data();
  },
  
  
  swap: function(fromIndex, toIndex)
  {
    
  },
  
  
  remove: function(index)
  {
    this.boundsCheck(index);
    
    if(this.data().remove)
    {
      this.data().remove(index);
    }
    else
    {
      this.data().splice(index, 1);
    }
    this.refresh();
  },
  
  
  removeObject: function(object, equalFn)
  {
    
  },
  
  
  canSelect: function(cell)
  {
    return true;
  },
  
  
  refresh: function()
  {
    this.parent();
    
    this.element.empty();
    
    if(this.data().length > 0)
    {
      this.data().each(function(x) {
        this.element.grab(this.cell().cloneWithData(x));
      }.bind(this));
    }
  },
  
  
  boundsCheck: function(index)
  {
    if(index < 0 || index >= this.count()) throw new SSListViewError.OutOfBounds(new Error(), index + " index is out bounds.");
  },
  
  
  cellNodeForIndex: function(index)
  {
    this.boundsCheck(index);
    return this.element.getElements('> li')[index];
  }
  
});