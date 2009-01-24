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
      sortable: false,
      lazy: false,
      multipleSelection: false,
      horizontal: false,
      cellSize: null
    });
  },
  

  initialize: function(el, options)
  {
    this.parent(el, options);
    
    this.__cellBeingEdited = -1;
    
    if(this.options.collection)
    {
      this.useCollection(this.options.collection);
    }
    else
    {
      this.setData([]);
    }
    
    this.initSortables();
    this.attachEvents();
  },
  
  
  setHasCollection: function(val)
  {
    this.__hasCollection = val;
  },
  
  
  hasCollection: function()
  {
    return this.__hasCollection;
  },
  
  
  initSortables: function()
  {
    if(this.options.sortable)
    {
      // destroy any previous sortables
      if(this.__sortables)
      {
        this.__sortables.detach();
        delete this.__sortables;
      }
      
      this.__sortables = new Sortables(this.element, {
        constrain: true,
        clone: true,
        snap: 4,
        revert: true,
        onStart: this.sortStart.bind(this),
        onSort: this.sortSort.bind(this),
        onComplete: this.sortComplete.bind(this)
      });
    }
  },
  
  
  sortStart: function(cellNode)
  {
    this.__sortStart = this.cellNodes().indexOf(cellNode)-1;
  },
  
  
  sortSort: function(cellNode)
  {
  },
  
  
  sortComplete: function(cellNode)
  {
    this.__move__(this.__sortStart, this.cellNodes().indexOf(cellNode));
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
      case(this.hitTest(target, 'li, > li *') != null):
        var hit = this.cachedHit();
        this.cell().lock((hit.get('tag') == 'li' && hit) || hit.getParent('li'));
        this.cell().eventDispatch(event, eventType);
        this.cell().unlock();
      break;
      
      default:
      break;
    }
    
    event.stop();
  },
  
  
  awake: function(context)
  {
    var cellNode = this.element.getElement('> .SSCell');
    
    if(cellNode)
    {
      this.setCell(SSControllerForNode(cellNode));
    }
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
    
    this.setIsDirty(true);
    
    this.refresh();
  },
  

  data: function()
  {
    if(this.__pendingCollection) this.checkPendingCollection();
    return this.__data;
  },
  
  
  getData: function()
  {
    return this.data();
  },
  
  
  checkPendingCollection: function()
  {
    var coll = SSCollectionForName(this.__pendingCollection);
    if(coll)
    {
      delete this.__pendingCollection;
      this.setData(coll);
    }
  },
  
  
  rawData: function()
  {
    var data = this.data();
    if(data.internal) return data.internal();
    return data;
  },
  
  
  count: function()
  {
    // TODO: not sure about the bounds checking in SSListView, this should probably be put into SSCollections - David
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
  

  query: function(index, arg)
  {
    if($type(arg) == 'string') return this.get(index)[arg];
    if($type(arg) == 'array')
    {
      var data = this.get(index);
      var result = {};
      arg.each(function(prop) {
        result[prop] = data[prop];
      });
      return result;
    }
    return null;
  },
  
  
  cellNodes: function()
  {
    return this.element.getElements('> li');
  },
  
  
  add: function(newItem, animate)
  {
    var delegate = this.delegate();
    
    // TODO: allow for add new item animation.
    
    this.data().push(newItem);
    this.refresh();
  },
  
  
  edit: function(index)
  {
    this.boundsCheck(index);
    
    var delegate = this.delegate();
    var canEdit = (delegate && delegate.canEdit && delegate.canEdit(index)) || true;
    
    if(canEdit)
    {
      if(!this.options.multipleSelection && this.cellBeingEdited() != -1) this.cancelEdit();
      
      var anim = (delegate && delegate.animationFor && delegate.animationFor({action:'edit', listView:this, index:index})) || false;
      
      var editModeForCell = function() {
        this.setCellBeingEdited(index);
        this.cell().lock(this.cellNodeForIndex(index));
        this.cell().edit();
        this.cell().unlock();
      }.bind(this);
      
      if(anim)
      {
        anim().chain(editModeForCell);
      }
      else
      {
        editModeForCell();
      }
    }
  },
  
  
  insert: function(cellData, index)
  {
    this.boundsCheck(index);
    this.__insert__(cellData, index);
    this.refresh();
  },
  
  
  __insert__: function(cellData, index)
  {
    if(this.data().insert)
    {
      this.data().insert(cellData, index);
    }
    else
    {
      this.data().splice(index, 0, cellData);
    }    
  },
  
  
  set: function(cellData, index)
  {
    this.boundsCheck(index);
    this.__set__(cellData, index);
    this.refresh();
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
    
    //this.refresh();
  },
  
  
  updateObject: function(sender)
  {
    var index = this.indexOf(sender);
    this.update(this.cell().getAllData(), index);
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
  
  
  move: function(fromIndex, toIndex)
  {
    this.boundsCheck(fromIndex);
    this.boundsCheck(toIndex);
    this.__move__(fromIndex, toIndex);
    this.refresh();
  },
  
  
  __move__: function(fromIndex, toIndex)
  {
    if(this.data().move)
    {
      this.data().move(fromIndex, toIndex);
    }
    else
    {
      var data = this.get(fromIndex);
      this.__remove__(fromIndex);
      this.__insert__(data, toIndex);
    }
  },
  
  
  remove: function(index)
  {
    this.boundsCheck(index);

    var delegate = this.delegate();
    var canRemove = (delegate && delegate.canRemove && delegate.canRemove(index)) || true;

    if(canRemove)
    {
      if(this.hasCollection())
      {
        this.getData().delete(index);
        return;
      }
      else
      {
        this.__remove__(index);
        this.onRemove(index);
      }
    }
  },
  
  
  onRemove: function(index)
  {
    var delegate = this.delegate();
    var anim = (delegate && delegate.animationFor && delegate.animationFor({action:'remove', listView:this, index:index})) || false;
    
    if(anim)
    {
      anim().chain(this.refresh.bind(this));
    }
    else
    {
      this.refresh();
    }
  },
  
  
  __remove__: function(index)
  {
    this.data().splice(index, 1);
  },
  
  
  removeObject: function(sender)
  {
    if(confirm("Are you sure that you want to delete this artwork? There is no undo."))
    {
      this.remove(this.indexOf(sender));
    }
  },
  
  
  editObject: function(sender)
  {
    var index = this.indexOf(sender);
    this.edit(index);
  },
  
  
  checkForUnsavedChanges: function(properties)
  {
    // grab the old values
    return false;
  },
  
  
  cancelEdit: function()
  {
    var cellBeingEdited = this.cellBeingEdited();
    
    console.log('cancelEdit');
    
    // check for unsaved changes
    if(cellBeingEdited != -1)
    {
      this.cell().lock(this.cellNodeForIndex(cellBeingEdited));
      this.cell().leaveEdit();
      this.cell().unlock();
      this.setCellBeingEdited(-1);
    }
  },
  
  
  canSelect: function(index)
  {
    if(this.delegate() && this.delegate().canSelect)
    {
      return this.delegate().canSelect(index);
    }
    return true;
  },
  
  
  refresh: function()
  {
    this.parent();
    
    if(!this.isVisible()) return;
    
    // check whether collection or array
    var len = ($type(this.data().length) == 'function' && this.data().length()) || this.data().length;
    
    if(len > 0 && this.cell())
    {
      // set the width programmatically if horizontal
      if(this.options.horizontal && this.options.cellSize)
      {
        var modifer = (this.options.cellModifier && this.options.cellModifier.x) || 0;
        this.element.setStyle('width', (this.options.cellSize.x*len)+modifer);
      }

      this.element.empty();
      this.data().each(function(x) {
        this.element.grab(this.cell().cloneWithData(x));
      }.bind(this));
      
      this.initSortables();
    }
    
    this.setIsDirty(false);
  },
  
  
  boundsCheck: function(index)
  {
    if(index < 0 || index >= this.count()) throw new SSListViewError.OutOfBounds(new Error(), index + " index is out bounds.");
  },
  
  
  cellNodeForIndex: function(index)
  {
    return this.cellNodes()[index];
  },
  
  
  indexOf: function(object)
  {
    if($memberof(object, 'SSCell'))
    {
      return this.indexOfCellNode(object.lockedElement());
    }
    return -1;
  },
  
  
  indexOfCellNode: function(cellNode)
  {
    return this.cellNodes().indexOf(cellNode);
  },
  
  
  onCellClick: function(cellNode)
  {
    var index = this.cellNodes().indexOf(cellNode);
    if(this.delegate() && this.delegate().userDidClickListItem)
    {
      this.delegate().userDidClickListItem(index);
    }
  },
  
  
  __addEventsToCollection__: function(coll)
  {
    coll.addEvent('onCreate', function(index) {
    });
    
    coll.addEvent('onDelete', function(index) {
      if(this.isVisible()) 
      {
        this.onRemove(index);
      }
    }.bind(this));
    
    coll.addEvent('onChange', function() {
      if(!this.isVisible()) this.setIsDirty(true);
    }.bind(this));
    
    coll.addEvent('onUpdate', function() {
    }.bind(this));
    
    coll.addEvent('onLoad', function() {
      this.setIsDirty(true);
      if(this.isVisible()) this.refresh();
    }.bind(this));
  },
  
  
  useCollection: function(collectionName)
  {
    var coll = SSCollectionForName(collectionName, this);
    this.setHasCollection(true);
    if(coll) 
    {
      this.__addEventsToCollection__(coll);
      this.setData(coll);
    }
    else
    {
      // not ready yet, controller loaded before collection
      this.__pendingCollection = collectionName;
    }
  },
  
  
  useCollectionWithFilter: function(collectionName, fn)
  {
    
  },
  
  
  setIsDirty: function(value)
  {
    this.__isDirty = value;
  },
  
  
  isDirty: function()
  {
    return this.__isDirty;
  },
  
  
  setCellBeingEdited: function(index)
  {
    this.__cellBeingEdited = index;
  },
  
  
  cellBeingEdited: function()
  {
    return this.__cellBeingEdited;
  }
  
});