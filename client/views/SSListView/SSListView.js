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
      cellSize: null,
      filter: null,
      addAt: 'bottom',
      leaveEditOnUpdate: false
    });
  },
  

  initialize: function(el, options)
  {
    this.parent(el, options);
    
    this.__cellBeingEdited = -1;
    
    this.setSuppressRefresh(false);
    
    if(this.options.filter) this.setFilter(this.options.filter);
    
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

/*
    Function: setFilter
      Sets the filter as a function.
      
    Parameters: 
      fn - A function.
      
    See Also: 
      getFilter
      filter
*/  
  setFilter: function(fn)
  {
    this.__filter = fn;
  },
  /*
    Function: getFilter
      Returns the current filter.
      
    Returns: 
      A function.
      
    See Also: 
      setFilter
      filter
  */
  getFilter: function()
  {
    return this.__filter;
  },
  
  /*
    Function: filter
      Returns true if the filter is set. 
      
    Parameters: 
      data - a row in a javascript array. //NOTE:The name data is a bit ambigious. rowData maybe? -Jusitn
        
    Returns:
      A boolean value
    
    See Also:
      setFilter
      getFilter
*/
  filter: function(data)
  {
    var filterFn = this.getFilter();
    
    if(filterFn)
    {
      return filterFn(data);
    }
    return false;
  },
  
  /*
    Function: setHasCollection
      Sets the hasCollection property.
      
    Parameters:
      val - a boolean value
      
    See Also: 
      hasCollection
  */
  setHasCollection: function(val)
  {
    this.__hasCollection = val;
  },
  
  /*
    Function: hasCollection
      Returns a the boolean value of hasCollection 
    
    Returns:
      A boolean value.
      
    See Also: 
      setHasCollection
  */
  hasCollection: function()
  {
    return this.__hasCollection;
  },
  
/*
    Function: initSortables (private)
      Called during intialize(). Creates a new sortable object.   
  
*/
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
        onStart: function(cellNode) {
          this.__sortables.clone.addClass('Clone');
          this.sortStart(cellNode);
        }.bind(this),
        onSort: this.sortSort.bind(this),
        onComplete: this.sortComplete.bind(this)
      });
    }
  },
  
/*
    Function: sortStart
      Sets the sortStart property to the index of a cell node. Determines the starting point for a sort.  
                  
    Parameters:
     cellNode - a cell's DOM node
*/
  sortStart: function(cellNode)
  {
    this.__sortStart = this.cellNodes().indexOf(cellNode)-1;
  },
  
  /*
    Function: sortSort (abstract)
      Sorts changed hooks.  
      
    Note: 
      This name needs to be change. sortChange?  -Justin
  */
  sortSort: function(cellNode)
  {
  },
  
  /*
    Function: sortComplete
      Calls the move function and sorts an array from sortStart to the passed cell node.
      
    Parameters:
     cellNode - a cell's DOM node. Determines where the sort ends. 
     
    See Also:
      move
  */
  sortComplete: function(cellNode)
  {
    this.__move__(this.__sortStart, this.cellNodes().indexOf(cellNode));
    this.fireEvent('onSortComplete');
  },
  
  /*
    Function: attatchEvents (private)
      Called by the initialize function.  Adds an event that calls eventDispatch on a click event. 
      
  */
  attachEvents: function()
  {
    this.element.addEvent('click', this.eventDispatch.bind(this));
  },
  
  /*
    Function: eventDispatch (private)
      Called on click event. 
  
    Parameters:
      _event - the event issueing the function. Always a "click" event. 
      eventType - //NOTE: I'm not sure what this argument means. -Justin
  */
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

/*
    Function: awake
      If a cell has content, set the cell's content to the assigned context.
      
    Parameters:
      context - The context a object was created for. Either a window, element, or iframe.
*/
  awake: function(context)
  {
    var cellNode = this.element.getElement('> .SSCell');
    if(cellNode)
    {
      this.setCell(SSControllerForNode(cellNode));
    }
  },
  
  /*
      Function: setCell
        Sets the cell class, and sets a delegate instance of the cell. 

      Parameters:
        cell - A cell class
        
      See also:
        cell
  */
  setCell: function(cell)
  {
    this.__cell = cell;
    cell.setDelegate(this);
    cell.element.dispose();
  },
  
  
  /*
      Function: cell
        Returns the cell class.

      Returns:
        A cell class
        
      See also:
        setCell
  */  
  cell: function()
  {
    return this.__cell;
  },
  /*
    Function: setData
      Sets the data property of the class. 
      
    Parameters:
      newData - A javascript array row.
      
    See Also:
      getData
      data
*/
  setData: function(newData)
  {
    this.__data = newData;
    //MARKED FOR DELETION - add.view method is never being used -Justin
    if(newData.addView)
    {
      newData.addView(this);
    }
    //END OF DELETION
  
    this.setNeedsDisplay(true);
  },
    /*
      Function: data
        Returns the data property. 
      
      Returns:
        A javascript array row. 

      See Also:
        setData
        getData
  */
  data: function()
  {
    if(this.__pendingCollection) this.checkPendingCollection();
    return this.__data;
  },
  
    /*
     Note:
      MARKED FOR DELETION: Redundant function, see data() above -Justin
  */
  getData: function()
  {
    return this.data();
  },
    /*
      Function: checkPendingCollection 
        If a pending collection exists, delete the current one and reassign it. 
        
    */
  checkPendingCollection: function()
  {
    var coll = SSCollectionForName(this.__pendingCollection);
    if(coll)
    {
      delete this.__pendingCollection;
      this.__addEventsToCollection__(coll);
      this.setData(coll);
    }
  },
  /*
      Function: rawData
        Returns the data property of the class.  
      
      Returns:
        A row in a javascript array. 
        
      Note:
        Internal is a possible future implementation. 
   */
  rawData: function()
  {
    var data = this.data();
    if(data.internal) return data.internal();
    return data;
  },
  
  /*
      Function: count
         //NOTE: See TODO in function. -Justin  
         
      Returns:
        The length of a row in a Javascript array. 
  */
  count: function()
  {
    // TODO: not sure about the bounds checking in SSListView, this should probably be put into SSCollections - David
    if($type(this.data().length) == 'function') return this.data().length();
    return this.data().length;
  },
  
  /*
      Function: find
        Returns a 0 if a row in a raw data array is found in a passed function, otherwise returns -1.
        
      Parameters:
        fn - A function
        
      Returns:
        An integer 
        
      See Also:
        findAll
  */
  find: function(fn)
  {
    var data = this.rawData();
    for(var i = 0, l = data.length; i < l; i++) if(fn(data[i])) return i;
    return -1;
  },
  
  /*
      Function: findAll
        Returns an array containing all of the found raw data rows in a passed function. 
      
      Parameters:
        fn - A function
        
      Returns:
        An array
    
      See Also:
        find   
  */
  findAll: function(fn)
  {
    var data = this.rawData();
    var result = [];
    for(var i = 0, l = data.length; i < l; i++) if(fn(data[i])) result.push[1];
    return result;
  },
  
  /*
      Function: query
        Accepts an index of a collection item and argument to search for in a function. Returns the argument value(s) in a string or array, othewise returns null. 
      
      Parameters:
        index - An integer. The index of an item in a collection.
        arg   - An argument of a function. 
        
      Returns:
        An string, array or null.
        
  */
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
  
  /*
    Function: cellNodes
      Returns all the listed cell nodes of an element.
      
    Returns:
      A group of list elements
*/
  cellNodes: function()
  {
    return this.element.getElements('> li');
  },
  
    /*
      Function: add
        Adds an object, that is specified with the newItem argument, to a collection. The _animate argument determines if an animation occurs during function call.
        
      Parameters:
        newItem  - a javascript object
        _animate - a boolean
  */
  add: function(newItem, _animate)
  {
    var animate = (_animate == null && true) || _animate;

    var delegate = this.delegate();
    var canAdd = (delegate && delegate.canAdd && delegate.canAdd(this)) || true;
    
    if(canAdd)
    {
      var addData = (delegate.dataFor && delegate.dataFor('add', this));
      
      if(this.hasCollection())
      {
        this.getData()['create']($merge(newItem, addData));
      }
      else
      {
        if(this.options.addAt == 'bottom') this.data().push(newItem);
        if(this.options.addAt == 'top') this.data().unshift(newItem);
        this.refresh();
      }
    }
  },
  
/*
    Function: onAdd (private)
      Callback event when a new Item is added to a collection. 
    
    Parameters:
      data - A row in a javascript array.
    
*/
  onAdd: function(data)
  {
    var delegate = this.delegate();
    var anim = (delegate &&
                delegate.animationFor && 
                delegate.animationFor({action:'add', listView:this, userData:data})) || false;
    
    if(anim)
    {
      var animData = anim();
      anim.animation().chain(function() {
        if(animData.cleanup) animData.cleanup();
        this.refresh(true);
      });
    }
    else
    {
      this.refresh(true);
    }
    
    this.fireEvent('onAdd', data);
  },
  /*
    Function: addObject
      Adds an object to a collection. The sender argument specifies the object to add. Intended to be used for event handling.
      
    Parameters:
      sender -  An HTML element. (SSCell)
      
    See Also:
      add
  */
  addObject: function(sender)
  {
    this.add(sender.dataForNewItem());
  },
  
  /*
    Function: edit
      Accepts the index of a cell in a collection and allows it to be edited (if permitted). The _animate argument determines if an animation occurs during function call.
      
    Parameters:
      index -  An integer. The index of an item in a collection
      _animate - A boolean value.
  
  */
  edit: function(index, _animate)
  {
    var animate = (_animate == null && true) || _animate;
    this.boundsCheck(index);
    
    var delegate = this.delegate();
    var canEdit = (delegate && delegate.canEdit && delegate.canEdit(index)) || true;
    
    if(canEdit)
    {
      if(!this.options.multipleSelection && this.cellBeingEdited() != -1)
      {
        animate = false;
        this.cancelEdit(this.cellBeingEdited(), false);
      }
      
      var anim = (animate && 
                  delegate && 
                  delegate.animationFor && 
                  delegate.animationFor({action:'edit', listView:this, index:index})) || false;
      
      var editModeForCell = function() {
        this.setCellBeingEdited(index);
        this.cell().lock(this.cellNodeForIndex(index));
        this.cell().edit();
        this.cell().unlock();
      }.bind(this);
      
      if(anim)
      {
        var animData = anim();
        animData.animation().chain(function() {
          if(animData.cleanup) animData.cleanup();
          editModeForCell();
        });
      }
      else
      {
        editModeForCell();
      }
    }
  },
  /*
    Function: insert
      Inserts data into a cell at a specified index and refreshes collection. 
      
    Parameters:
      cellData - An object.
      index - An integer. The index of an item in a collection.
*/  
  insert: function(cellData, index)
  {
    this.boundsCheck(index);
    this.__insert__(cellData, index);
    this.refresh();
  },
/*
    Function: __insert__  (private)
      Inserts data into a cell at a specified index.
      
    Parameters:
      cellData - An object.
      index - An integer. The index of an item in a collection.
*/s
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
  
  /*
    Function: get 
      Accepts an index of a collection item and performs a boundsCheck to make sure index is valid. Retreives the propeties of each data element, stores them in an array, and returns the array. 
      
    Parameters:
      index - An integer. 
      
    Returns: 
      An array. 
  */
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
  /*
    Function: get (private)
     Accepts the index of a colletion and calls the get method
    
    Parameters: 
      index - An integer.
*/
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
  
/*
    Function: update  
      Updates a collection's content with the passed cellData at the specified index. Accepts the current data, the index of the collection to update, and whether 
    
    Parameters:
      cellData - An object.
      index - An integer
      _noArrayUpdate - A boolean.
*/
  update: function(cellData, index, _noArrayUpdate)
  {
    this.boundsCheck(index);
    
    var noArrayUpdate = _noArrayUpdate || false;
    var delegate = this.delegate();
    var canUpdate = (delegate && delegate.canUpdate && delegate.canUpdate(index)) || true;
    
    if(canUpdate)
    {
      if(this.hasCollection())
      {
        if(!noArrayUpdate) this.getData().update(cellData, index);
      }
      else
      {
        if(!noArrayUpdate) this.__update__(cellData, index);
        this.onUpdate(index);
      }
    }

    if(this.options.leaveEditOnUpdate)
    {
      var canLeaveEdit = (this.canLeaveEdit && this.canLeaveEdit(index)) || true;
      if(canLeaveEdit) this.cell().leaveEdit();
    }
    
  },
  /*
    Function: updateObject 
      Accepts a SSCell object in a collection and updates it.
      
    Parameters:
      sender -  An HTML element. (SSCell)
  */
  
  updateObject: function(sender)
  {
    var index = this.indexOf(sender);
    this.update(this.cell().getAllData(), index);
  },
  
  /*
    Function: updateCellView 
      Accepts a cell's index in a collection array, and updates the cell's view with new cell data. 
      
    Parameters: 
      cellData - An Object.
      index - An Integer.
  */
  updateCellView: function(cellData, index)
  {
    this.cell().lock(this.cellNodeForIndex(index));
    this.cell().setData(cellData);
    this.cell().unlock();
  },
  
  /*
    Function: __update__ (private)
      Accepts cell data and a cell's index. Merges the new cell data with the existing data of a specified cell in a collection.
        
    Parameters: 
      cellData - An Object. 
      index -  An Integer. 
      
  */
  __update__: function(cellData, index)
  {
    var oldData =this.data()[index];
    this.__set__(oldData.merge(cellData), index);
  },
  
  /*
    Function: onUpdate 
      Accepts the index of cell in a collection, checks if an animaton should be applied, and refreshes it.
    
    Parameter: 
      index - An Integer. 
  */
  
  onUpdate: function(index)
  {
    //NOTE: animation support to be implemented -Justin
    var delegate = this.delegate();
    var anim = (delegate && 
                delegate.animationFor && 
                delegate.animationFor({action:'update', listView:this, index:index})) || false;
    
    if(anim)
    {
      anim().chain(this.refresh.bind(this));
    }
    else
    {
      this.refresh();
    }
  },
  
  /*
    Function: set
      Accepts cell data and a cell index, and applies the data to the specified cell after performing a bounds check.
      
    Parameters: 
      cellData - An object. 
      index -  An integer.
  */
  set: function(cellData, index)
  {
    this.boundsCheck(index);
    this.__set__(cellData, index);
  },
  
  /*
    Function: __set__ (private)
      Accepts cell data and a cell index, and applies the data to the specified cell.
    
    Parameters: 
      cellData - An object. 
      index -  An integer.
  */
  __set__: function(cellData, index)
  {
    this.data()[index] = cellData;
  },
  /*
    Function: move
      Checks the bounds for speciifed to and from indexes, and moves
    
    Parameters:
      fromIndex - An integer.
      toIndex - An integer.
    
  */
  move: function(fromIndex, toIndex)
  {
    this.boundsCheck(fromIndex);
    this.boundsCheck(toIndex);
    this.__move__(fromIndex, toIndex);
    this.refresh();
  },
  
  /*
      Function: __move__ (private)
          */    /*
      
      Parameters:
        fromIndex - An integer.
        toIndex - An integer.

  */
  
  
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
  

  /*
    Function: remove
      Accepts an cell index, 
      
    Parameter:
      index - An integer.
  */
    // TODO: animation support
  remove: function(index)
  {
    this.boundsCheck(index);

    var delegate = this.delegate();
    
    var canRemove = true;
    if(delegate && delegate.canRemove)
    {
      canRemove = delegate.canRemove({listView:this, index:index});
    } 

    if(canRemove)
    {
      if(this.hasCollection())
      {
        this.getData()['delete'](index);
        return;
      }
      else
      {
        this.__remove__(index);
        this.e(index);
      }
    }
  },
  /*
    Function: __remove__ (private)
      */    /*
    Parameters:
      index - An integer. 
  */
  
  __remove__: function(index)
  {
    this.data().splice(index, 1);
  },
  
  /*
    Function: removeObject
   */    /*
    
    Parameters:
      sender -  An HTML element. (SSCell)
  */
  
  removeObject: function(sender)
  {
    var index = this.indexOf(sender);
    this.remove(index);
  },
  
  
  onRemove: function(index)
  {
    var delegate = this.delegate();
    var anim = (delegate && 
                delegate.animationFor && 
                delegate.animationFor({action:'remove', listView:this, index:index})) || false;
    
    if(anim)
    {
      anim().chain(this.refresh.bind(this));
    }
    else
    {
      this.refresh();
    }
    
    this.fireEvent('onRemove', index);
  },
  
  
  editObject: function(sender)
  {
    var index = this.indexOf(sender);
    this.edit(index);
  },
  
  
  hideItem: function(index, _animate)
  {
    var animate = (_animate == null && true) || _animate;
    this.boundsCheck(index);
    
    var delegate = this.delegate();
    var canHide = (delegate && delegate.canHide && delegate.canHide(index)) || true;
    
    if(canHide)
    { 
      var anim = (animate && delegate && delegate.animationFor && delegate.animationFor({action:'hide', listView:this, index:index})) || false;
      
      if(anim)
      {
        var animData = anim();
        animData.animation().chain(function() {
          if(!this.suppressRefresh()) this.refresh();
          if(animData.cleanup) animData.cleanup();
        }.bind(this));
      }
      else
      {
        this.refresh();
      }
    }
  },


  hideObject: function(sender)
  {
    var index = this.indexOf(sender);
    this.hideItem(index);
  },
  
  
  checkForUnsavedChanges: function(properties)
  {
    // grab the old values
    return false;
  },
  
  
  cancelEdit: function(index, _animate)
  {
    var animate = (_animate == null && true) || _animate;
    var cellBeingEdited = this.cellBeingEdited();
    
    var delegate = this.delegate();
    var canLeaveEdit = (delegate && delegate.canLeaveEdit && delegate.canLeaveEdit(index)) || true;

    // check for unsaved changes
    if(cellBeingEdited != -1 && canLeaveEdit)
    {
      var anim = (animate && delegate && delegate.animationFor && delegate.animationFor({action:'leaveEdit', listView:this, index:index})) || false;
      
      var leaveEditModeForCell = function() {
        this.cell().lock(this.cellNodeForIndex(cellBeingEdited));
        this.cell().leaveEdit();
        this.cell().unlock();
        this.setCellBeingEdited(-1);
      }.bind(this);
      
      if(anim)
      {
        var animData = anim();
        animData.animation().chain(function() {
          if(animData.cleanup) animData.cleanup();
          leaveEditModeForCell();
        });
      }
      else
      {
        leaveEditModeForCell();
      }
    }
  },
  /*
    Function: canSelect
      Cancels edits to a passed SSCell object.
      
    Parameters:
      sender -  An HTML element. (SSCell)
      
    See Also:
      cancelEdit
  */
  cancelEditObject: function(sender)
  {
    var index = this.indexOf(sender);
    this.cancelEdit(index);
  },
  /*
    Function: canSelect
  */    /*
    Parameters:
      index - An integer.
  */
  canSelect: function(index)
  {
    if(this.delegate() && this.delegate().canSelect)
    {
      return this.delegate().canSelect(index);
    }
    return true;
  },
  /*
    Function: refresh
      Checks to see if refresh can be called, and calls reloadData. Setting the force paremeter to true bypasses the initial checks.
      
    Parameters:
      force - A Boolean.
  */
  
  refresh: function(force)
  {
    this.parent();
    
    // no data nothing to do
    if(!this.data()) return;
    
    // collection not yet loaded nothing to do
    if(this.__pendingCollection) return;
    
    // don't refresh if we're visible
    if(!this.isVisible() && !force) 
    {
      return;
    }

    if(this.hasCollection())
    {
      this.data().read(this.reloadData.bind(this));
    }
    else
    {
      this.reloadData();
    }
  },
  /*
    Function: reloadData (private)
      
  */    /*
  
  */
  
  reloadData: function()
  {
    // check whether collection or array
    var len = ($type(this.data().length) == 'function' && this.data().length()) || this.data().length;
    
    // empty on refresh
    this.element.empty();
    
    if(len > 0 && this.cell())
    {
      // set the width programmatically if horizontal
      if(this.options.horizontal && this.options.cellSize)
      {
        var modifer = (this.options.cellModifier && this.options.cellModifier.x) || 0;
        this.element.setStyle('width', (this.options.cellSize.x*len)+modifer);
      }
      
      this.data().each(function(x) {
        // TODO: make sure it pass the filter
        var filter = this.filter(x);
        var newCell = this.cell().cloneWithData(x);
        
        // store ref id
        if(x.id) newCell.store('refid', x.id);
        
        // hide it
        if(filter) newCell.addClass('SSDisplayNone');
        
        this.element.grab(newCell);
      }.bind(this));
      
      this.initSortables();
    }

    if(!this.__pendingCollection)
    {
      this.setNeedsDisplay(false);
    }
    
    this.fireEvent('onReloadData', this);
  },
  
  
  boundsCheck: function(index)
  {
    if(index < 0 || index >= this.count()) throw new SSListViewError.OutOfBounds(new Error(), index + " index is out bounds.");
  },
  /*
    Function: cellNodeForIndex
      Returns the SSCell object based on the passed index parameter.
    
    Parameters: 
      index - An integer.
  */
  cellNodeForIndex: function(index)
  {
    return this.cellNodes()[index];
  },
  /*
    Function: indexOf
      Returns the index of a SSCell objet that contains the passed object. If the object is not found in a SSCell, it returns -1.
    
    Parameters:
      object - An object.
  */
  
  indexOf: function(object)
  {
    if($memberof(object, 'SSCell'))
    {
      return this.indexOfCellNode(object.lockedElement());
    }
    return -1;
  },
  
  /*
    Function: indexOfCellNode 
      Returns the index of the passed cell node.
    
    Parameter:
      cellNode - a cell's DOM node
      
   */
   
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
    coll.addEvent('onCreate', function(data) {
      if(this.isVisible())
      {
        this.onAdd(data);
      }
    }.bind(this));
    
    coll.addEvent('onDelete', function(index) {
      if(this.isVisible()) 
      {
        this.onRemove(index);
      }
    }.bind(this));
    
    coll.addEvent('onChange', function() {
    }.bind(this));
    
    coll.addEvent('onUpdate', function() {
    }.bind(this));
    
    coll.addEvent('onLoad', function() {
    }.bind(this));
  },
  
  
  setSuppressRefresh: function(val)
  {
    this.__suppressRefresh = val;
  },
  
  
  suppressRefresh: function(val)
  {
    return this.__suppressRefresh;
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
  
  
  setCellBeingEdited: function(index)
  {
    this.__cellBeingEdited = index;
  },
  
  
  cellBeingEdited: function()
  {
    return this.__cellBeingEdited;
  },
  
  
  setNeedsDisplay: function(value)
  {
    this.parent(value);
    if(value && this.element && this.cell() && !this.isVisible())
    {
      this.element.empty();
    }
  }
  
});