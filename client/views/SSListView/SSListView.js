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
  /*
    Class: SSListView
      SSListView controls the display of Collection content within the console. 
      
  */

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
  
  
  setPageControl: function(pageControl)
  {
    this.__pageControl = pageControl;
  },
  
  
  pageControl: function()
  {
    return this.__pageControl;
  },
  
  
  dataIsReady: function()
  {
    if(this.hasCollection())
    {
      return (this.data() && !this.data().isUnread()) || false;
    }
    else
    {
      return true;
    }
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
  filter: function(data, index)
  {
    var filterFn = this.getFilter();
    
    if(filterFn)
    {
      return filterFn(data, index);
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
    this.__sortStart = this.cellNodes().indexOf(cellNode);
  },
  
  /*
    Function: sortSort (abstract)
      Sorts changed hooks.  
      
    Note: 
      This name needs to be change. sortChange?  -Justin
  */
  sortSort: function(cellNode)
  {
    this.__sortCurrent = this.cellNodes().indexOf(cellNode);
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
    this.__sortEnd = this.cellNodes().indexOf(cellNode);
    
    this.fireEvent('onSortComplete');
    
    if(this.__sortStart != undefined &&
       this.__sortEnd != undefined &&
       this.__sortStart != this.__sortEnd)
    {
      this.fireEvent('onOrderChange', {
        listView: this, 
        start: this.__sortStart, 
        end: this.__sortEnd
      });
    }
    
    // clear the state vars
    this.__sortStart = undefined;
    this.__sortCurrent = undefined;
    this.__sortEnd = undefined;
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
        Sets the cell object, and sets a delegate instance of the cell. 

      Parameters:
        cell - A cell object.
        
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
        Returns the cell object.

      Returns:
        A cell ojbecct
        
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
        index - the index of a SSCell object
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
        options - an object, can contain animate boolean as well as atIndex value.
  */
  add: function(newItem, options)
  {
    var animate = ((!options || options.animate == null) && true) || options.animate;

    var delegate = this.delegate();
    var canAdd = (delegate && delegate.canAdd && delegate.canAdd(this)) || true;
    
    if(canAdd)
    {
      // grab extra data, not completely sure why we need this here - David
      var addData = (delegate && delegate.dataFor && delegate.dataFor('add', this));
      
      if(this.hasCollection())
      {
        this.data()['create']($merge(newItem, addData), {
          userData:
          {
            atIndex: (options && options.atIndex)
          }
        });
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
  onAdd: function(data, userData)
  {
    // leave editing a cell if it's being edited
    if(this.cellBeingEdited() != -1)
    {
      this.cancelEdit(this.cellBeingEdited(), false);
    }
    
    var filtered = false;
    if(userData && userData.atIndex != null) filtered = this.filter(data, userData.atIndex);

    var delegate = this.delegate();
    var anim = (!filtered &&
                delegate &&
                delegate.animationFor && 
                delegate.animationFor({action:'add', listView:this, userData:data})) || false;
    
    if(anim)
    {
      var animData = anim();
      animData.animation(function() {
        // refreshing content
        if(animData.cleanup)
        {
          animData.cleanup();
        }
        this.refresh(true);
      }.bind(this));
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
  addObject: function(sender, options)
  {
    this.add(sender.dataForNewItem(), options);
  },
  
  /*
    Function: edit
      Accepts the index of a cell in a collection and allows it to be edited (if permitted). The _animate argument determines if an animation occurs during function call.
      
    Parameters:
      index - the index of a SSCell object. 
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
        }.bind(this));
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
        index - the index of a SSCell object
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
        index - the index of a SSCell object. 
  */
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
      Accepts an index of cell in a collection  and performs a boundsCheck to make sure the index is valid. Retreives the propeties of each data element, stores them in an array, and returns the array. 
      
    Parameters:
      index - the index of a SSCell object. 
      
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
     Accepts the index of cell in a colletion and calls the returns the cells data in an array.
     
    Parameters: 
      index - the index of a SSCell object.
      
    Returns:
      An array
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
        index - the index of a SSCell object
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
        if(!noArrayUpdate) this.data().update(cellData, index);
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
      index - the index of a SSCell object.
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
      index - the index of a SSCell object. 
      
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
      index - the index of a SSCell object. 
      
    //NOTE: animation support to be implemented -Justin
  */
  onUpdate: function(index)
  {

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
      index - the index of a SSCell object.
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
      index - the index of a SSCell object.
  */
  __set__: function(cellData, index)
  {
    this.data()[index] = cellData;
  },
  
  
  /*
    Function: remove
      Accepts an cell index, and removes the cell from the collection
      
    Parameter:
      index - the index of a SSCell object.
      
    See Also:
      removeObject
      
    //NOTE: ability to remove a cell with and without using collections needs to be redesigned.
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
        this.data()['delete'](index);
        return;
      }
      else
      {
        this.__remove__(index);
      }
    }
  },
  
  /*
    Function: __remove__ (private)
      Accepts a cell's index and removes it from the array.
      
    Parameters:
      index - the index of a SSCell object. 
  */
  __remove__: function(index)
  {
    this.data().splice(index, 1);
  },
  
  /*
    Function: removeObject
      Accepts a cell element and removes it from a collection.
    
    Parameters:
      sender -  An HTML element. (SSCell)
      
    See Also:
      remove
  */
  removeObject: function(sender)
  {
    var index = this.indexOf(sender);
    this.remove(index);
  },
  
  /*
    Function: onRemove (private)
      Checks to see if an animation should be applied after removing a cell, and then calls refresh.
    
    Parameters:
      index - the index of a SSCell object.
      
    //NOTE: animation support to be implemented -Justin
  */
  onRemove: function(index)
  {
    var delegate = this.delegate();
    var anim = (delegate && 
                delegate.animationFor && 
                delegate.animationFor({action:'remove', listView:this, index:index})) || false;
                
    // check if we need to reset cellBeingEdited
    if(index == this.cellBeingEdited())
    {
      this.setCellBeingEdited(-1);
    }
    
    if(anim)
    {
      var animData = anim();
      animData.animation().chain(function() {
        if(animData.cleanup) animData.cleanup();
        this.refresh();
      }.bind(this));
    }
    else
    {
      this.refresh();
    }
    
    this.fireEvent('onRemove', index);
  },
  
  /*
    Function: editObject
      Accepts a cell element and allows that cell to be edited.
    
    Parameters:
      sender -  An HTML element. (SSCell)
  */
  editObject: function(sender)
  {
    var index = this.indexOf(sender);
    this.edit(index);
  },
  
  /*
    Function: hideItem
      Hides the specified cell within a collection, and checks to see if animation should occur during hiding. Calls the refresh function to perform filtering of hidden items. Accepts a cell index and a boolean that determines whether animation occurs.  
    
    Parameters:
      index - the index of a SSCell object.
      _animate - A boolean.
  */
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
  
  /*
    Function: hideObject
      Accepts a cell object and hides it by passsing it to hideItem
    
    Parameters:
      sender -  An HTML element. (SSCell)
    
    See Also:
      hideItem
    
    //NOTE:  Shouldn't this function have an _animate parameter?  -Justin
  */
  hideObject: function(sender)
  {
    var index = this.indexOf(sender);
    this.hideItem(index);
  },

  /*
    Function: checkForUnsavedChanges 
      //Note: Needs work  
  */
  checkForUnsavedChanges: function(properties)
  {
    // grab the old values
    return false;
  },

  /*
    Function: cancelEdit
      Cancels Accepts a cell index and a boolean that determines if animation occurs.
      
    Parameters:
      index - the index of a SSCell object.
      _animate - A boolean.
  */
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
          leaveEditModeForCell();
          if(animData.cleanup) animData.cleanup();
        }.bind(this));
      }
      else
      {
        leaveEditModeForCell();
      }
    }
  },
  
  /*
    Function: cancelEditObject
      Cancels edits to a passed SSCell object.
      
    Parameters:
      sender -  An HTML element. (SSCell)
      
    See Also:
      cancelEdit
      
    //NOTE:  Shouldn't this function have an _animate parameter to send to cancelEdit?  -Justin
  */
  cancelEditObject: function(sender)
  {
    var index = this.indexOf(sender);
    this.cancelEdit(index);
  },
  
  /*
    Function: canSelect
      Checks the delagate of a cell specified by the index argument.  If a delegate exists, it returns whether the cell is set as selectable. Returns true by default.
      
    Parameters:
      index - the index of a SSCell object.
      
    Returns:
      An Boolean
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
  
  newCellForItemData: function(itemData, index)
  {
    var filtered = this.filter(itemData, index);
    var newCell = this.cell().cloneWithData(itemData);
    if(itemData.id) newCell.store('refid', itemData.id);
    if(filtered) newCell.addClass('SSDisplayNone');
    return newCell;
  },
  
  /*
    Function: reloadData (private)
      Called by refresh(). Checks the length of the current collection data, and clears the currently loaded collection data.  If the collection array contains data, it resizes the elements and applies set filters. If the collection is not pending, the content is displayed. 
  */
  reloadData: function()
  {
    // check whether collection or array
    var len = ($type(this.data().length) == 'function' && this.data().length()) || this.data().length;
    
    // empty on refresh
    this.element.empty();
    
    if(len > 0 && this.cell())
    {
      var perPage = (this.pageControl() && this.pageControl().perPage()) || len;
      
      // set the width programmatically if horizontal
      if(this.options.horizontal && this.options.cellSize)
      {
        var modifer = (this.options.cellModifier && this.options.cellModifier.x) || 0;
        this.element.setStyle('width', (this.options.cellSize.x*perPage)+modifer);
      }
      
      var cells = this.data().map(this.newCellForItemData.bind(this));
      cells.each(function(cell) {
        this.element.grab(cell)
      }.bind(this));
      
      this.initSortables();
    }

    if(!this.__pendingCollection)
    {
      this.setNeedsDisplay(false);
    }

    if(this.pageControl()) this.pageControl().initializeInterface();
    
    this.fireEvent('onReloadData', this);
  },
  /*
    Function: boundsCheck
      Tests to see if the passed index is within the bounds of the SSCollection array. Throws a SSListViewError message if the index is out of bounds. 
    
    Parameters:
      index - the index of a SSCell object 
  */
  boundsCheck: function(index)
  {
    if(index < 0 || index >= this.count()) throw new SSListViewError.OutOfBounds(new Error(), index + " index is out bounds.");
  },
  
  /*
    Function: cellNodeForIndex
      Returns the SSCell object based on the passed index parameter.
    
    Parameters: 
      index - the index of a SSCell object.
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
      
    Returns:
      A cell node index or -1.
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
      
    Returns:
      The index of a cell node
      
  */
  indexOfCellNode: function(cellNode)
  {
    return this.cellNodes().indexOf(cellNode);
  },
  
  /*
    Function: onCellClick 
      Accepts a cell node and sets a userDidClickListItem delegate with the index of the passed cell node.
      
    Parameter:
      cellNode - A cell's DOM node
      
  */
  onCellClick: function(cellNode)
  {
    var index = this.cellNodes().indexOf(cellNode);
    if(this.delegate() && this.delegate().userDidClickListItem)
    {
      this.delegate().userDidClickListItem(index);
    }
  },
  
  /*
    Function: __addEventsToCollection__ (private)
      Adds events to a collection. 
      
    Parameters:  
      coll - A SSCollection object.
  */
  __addEventsToCollection__: function(coll)
  {
    coll.addEvent('onCreate', function(event) {
      if(this.isVisible())
      {
        this.onAdd(event.data, event.userData);
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
  
  /*
    Function: setSuppressRefresh
      Sets the suppressRefresh property to the passed boolean. If true, it prevents a refresh from occuring.
      
    Parameter:
      val - A boolean value.
  */
  setSuppressRefresh: function(val)
  {
    this.__suppressRefresh = val;
  },
  
  /*
    Function: suppressRefresh
      Returns the supressRefresh property.
     
    Parameter:
      val - A boolean value.
      
    Returns:
      A boolean value
      
   //NOTE: function just returns a property value, no need for a "val" parameter. - Justin 
  */
  suppressRefresh: function(val)
  {
    return this.__suppressRefresh;
  },
  
  /*
    Function: useCollection 
      Accepts a collection name and checks to see if it's valid. If the collection exists, the events and data are applied to the collection. Otherwise, it is set as a pending collection.
      
    Parameters: 
      collectionName - A string, the name of a collection
  */
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
  
  /*
    Function: setCellBeingEdited
      Accepts an index of a cell, and sets the __cellBeingEdited property value to that index.  Used to identify which cell is currently being edited by a user.
      
    Parameters:
      index - the index of a SSCell object.
  */
  setCellBeingEdited: function(index)
  {
    this.__cellBeingEdited = index;
  },

  /*
    Function: cellBeingEdited
      Returns the __cellBeingEdited property value.
  */
  cellBeingEdited: function()
  {
    return this.__cellBeingEdited;
  },

  /*
    Function: setNeedsDisplay
      Sets whether the display should be set for the ListView content.  When set to true, the SSListView is cleared.
      
    Parameter: 
      value - A boolean value.
  */
  setNeedsDisplay: function(value)
  {
    this.parent(value);
    if(value && this.element && this.cell() && !this.isVisible())
    {
      this.element.empty();
    }
  }
  
});