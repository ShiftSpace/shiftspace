// ==Builder==
// @uiclass
// @required
// @package           ShiftSpaceCoreUI
// @dependencies      SandalphonCore
// ==/Builder==

/*
  Class: SSView
    The base class for representing JavaScript controlled user interface components
    in ShiftSpace. A SSView instance controls an element in the DOM. This allows us
    to abstract away the DOM and focus on the high level behavior of the component.

    SSView can be considered an abstract class, tho sometimes it is useful to use directly.
*/
var SSView = new Class({

  Implements: [Events, Options],
  name: 'SSView',
  
  defaults: function()
  {
    var temp = {
      context: null,
      generateElement: true,
      suppress: false,
      displayStyle: 'block'
    };
    return temp;
  },

  /*
    Function: _genId
      Generate an object id.  Used for debugging.  The instance is indentified by this in the global
      ShiftSpaceObjects hash.
  */
  __genId__: function()
  {
    return (this.name+(Math.round(Math.random()*1000000+(new Date()).getMilliseconds())));
  },

  /*
    Function: initialize
      Takes an element and controls it.

    Parameters:
      el - a HTML Element.
  */
  initialize: function(el, options)
  {
    // we are new and we are dirty
    this.setNeedsDisplay(true);
    
    // get the options first
    this.setOptions(this.defaults(), $merge((el && SSGetInlineOptions(el)) || {}, options));
    
    // remove them
    if(el) el.removeProperty('options');

    // generate an id
    this.__id = this.__genId__();
    this.setIsAwake(false);
    
    // add to global hash
    if(ShiftSpaceObjects) ShiftSpaceObjects.set(this.__id, this);
    
    this.__delegate = null;
    this.__outlets = new Hash();
    
    this.element = (el && $(el)) || (this.options.generateElement && new Element('div')) || null;
    
    if(this.element)
    {
      // store a back reference to this class
      SSSetControllerForNode(this, this.element);

      // add to global name look up dictionary
      if(ShiftSpaceNameTable && this.element.getProperty('id').search('generatedId') == -1)
      {
        ShiftSpaceNameTable.set(this.element.getProperty('id'), this);
      }
    }

    // Call setup or setupTest allowing classes to have two modes
    // For example, SSConsole lives in a IFrame under ShiftSpace
    // but not under the interface tool.
    if(typeof SandalphonToolMode != 'undefined' && this.setupTest)
    {
      this.setupTest();
    }
    else
    {
      this.setup();
    }
    
  },
  
  
  getContext: function()
  {
    return this.options.context;
  },
  
  /*
    Function: setup
      *abstract*
      Abstract function for initialization if you do not wish to customize
      initialization via initialize.
   */
  setup: function() {},
  
  /*
    __awake__ (private):
      Private method, handles view refreshing event chaining.
      
    Parameters:
      context - a window object or DOM element.
  */
  __awake__: function(context)
  {
  },
  
  /*
    Function: beforeAwake
       Called before the view is sent awake.
    
    Parameters:
       context - the context where this view was instantiated.
   */
  beforeAwake: function(context)
  {
    if(this.options.delegate)
    {
      this.setDelegate(SSControllerForNode($(this.options.delegate)));
    }
  },
  
  /*
    Function: awake
      Called after the outlets have been attached.
  */
  awake: function(context)
  {
  },
  
  /*
    Function: setIsAwake
      *private*
      Flag for setting awake state.

    Parameters:
      val - a boolean.
   */
  setIsAwake: function(val)
  {
    this.__isAwake__ = val;
  },
  
  /*
    Function: isAwake
      Returns whether this view has recieved awake from Sandalphon.

    Returns:
      A boolean.
   */
  isAwake: function()
  {
    return this.__isAwake__;
  },

  /*
    Function: getId
      Returns the id for this instance.

    Returns:
      The instance id as a string.
  */
  getId: function()
  {
    return this.__id;
  },
  
  /*
    Function: getName
      Return the name of this view. The name is generally set by the
      CSS id of the element that this view controls.

    Returns:
      A string.
   */
  getName: function()
  {
    return this.elId();
  },
  
  /*
    Function: elId
      Return the CSS id of the element that this view controls.

    Returns:
      A string.
   */
  elId: function()
  {
    return this.element.getProperty('id');
  },

  /*
    Function: setOutlets
      *private*
      Set the outlets hashmap (MooTools Hash or Object) of the view.
      
    Parameters:
      newOutlets - a hash map.
   */
  setOutlets: function(newOutlets)
  {
    this.__outlets = newOutlets;
  },

  /*
    Function: outlets
      Returns the outlets hashmap (MooTools Hash or Object) of the view.

    Returns:
      MooTools Hash or Object.
   */
  outlets: function()
  {
    return this.__outlets;
  },

  /*
    Function: addOutlet
      *private*
      Takes an element and adds an outlet to that element, or if the element
      has a controller (SSView), to that controller. Uses the element's CSS
      id for the outlet name if name not given. Not called directly,
      handled by Sandalphon.

    Parameters:
      element - a HTML DOM element
      name - a name to use for the outlet
   */
  addOutlet: function(element, name)
  {
    var outletKey = element.getProperty('outlet'), controller = this.controllerForNode(element);
    this.outlets().set(element.getProperty('id') || name, (controller || element));
  },

  /*
    Function: addOutletWithName
      *private*
      Add an outlet to controller with the specified name. Not called directly,
      handled by Sandalphon.

    Parameters:
      name - a string
      controller - a SSView or SSView subclass.
   */
  addOutletWithName: function(name, controller)
  {
    this.outlets().set(name, controller);
  },

  /*
    Function: mapOutletsToThis
      Convenience function for mapping outlets to this view. Properties will be
      added to the view matching the outlet name.
   */
  mapOutletsToThis: function()
  {
    this.outlets().each(function(object, name){ 
      this[name] = object;
    }.bind(this));
  },

  /*
    Function: setDelegate
      Set the delegate of this instance.

    Parameters:
      delegate - an Object.
  */
  setDelegate: function(delegate)
  {
    this.__delegate = delegate;
  },

  /*
    Function: delegate
      Returns the delegate for this instance.
  */
  delegate: function()
  {
    return this.__delegate;
  },

  /*
    Function: eventDispatch
      *abstract* *private*
      Event dispatching function.

    Parameters:
      evt - the browser event.

    See Also:
      <SSCell>, <SSListView>
   */
  eventDispatch: function(evt) {},

  /*
    Function: checkForMatch
      *private*
      Check to see if the node matches any of the nodes in a list of
      candidates.
   */
  checkForMatch: function(cands, node)
  {
    cands = $splat(cands);
    var len = cands.length;
    if(len == 0) return null;
    cands.each($msg('_ssgenId'));
    for(var i = 0; i < len; i++) { if(cands[i].isEqual(node)) return true; }
    return false;
  },

  /*
    Function: hitTest
      *private*
      Matches a target to see if it occured in an element pointed to by the selector test.

    Parameters:
      target - the HTML node where the event originated.
      selectorOfTest - the CSS selector to match against.

    See Also:
      <eventDispatch>, <SSCell>, <SSListView>
  */
  hitTest: function(target, selectorOfTest)
  {
    var parts = selectorOfTest.split(',');
    if(parts.length > 1)
    {
      return parts.map(function(selector) {
        return this.hitTest(target, selector);
      }.bind(this)).flatten().clean()[0];
    }

    var node = $(target);
    var matches = this.element.getElements(selectorOfTest);
    
    while(node && node != this.element)
    {
      if(this.checkForMatch(matches, node))
      {
        this.setCachedHit(node);
        return node;
      }
      node = node.getParent();
    }

    return null;
  },

  /*
    Function: setCachedHit
      *private*
      Used in conjunction with hitTest.  This is because hitTest may be slow, so you shouldn't have to call it twice.
      If there was a successful hit you should get it from cachedHit instead of calling hitTest again.

    See Also:
      <hitTest>, <cachedHit>
  */
  setCachedHit: function(node)
  {
    this.__cachedHit = node;
  },

  /*
    Function: cachedHit
      *private*
      Returns the hit match that was acquired in hitTest.

    Returns:
      An HTML Element.
  */
  cachedHit: function()
  {
    return this.__cachedHit;
  },

  /*
    Function: indexOfNode
      This function repairs the very broken behavior of node matching under GreaseMonkey. Because
      DOM nodes will be wrapped they will appear to be different even thought they are not. We
      work around this by automatically generating unique CSS ids for each element and using that
      for the match. Returns the index of the node if it is contained in the array, -1 otherwise.

    Parameters:
      elements - an array of DOM nodes.
      node - the DOM node to match.
     
    Returns:
      An integer.
   */
  indexOfNode: function(elements, node)
  {
    elements.each($msg('_ssgenId'));
    var len = elements.length;
    for(var i = 0; i < len; i++)
    {
      if(elements[i].isEqual(node)) return i;
    }
    return -1;
  },

  /*
    Function: controllerForNode
      Returns the view controller JS instance for an HTML Element.
      
    Parameters:
      node - a HTML DOM element.
  */
  controllerForNode: function(node)
  {
    // return the storage property
    return SSControllerForNode(node);
  },

  /*
    Function: show
      Used to show the interface associated with this instance.
  */
  show: function()
  {
    this.fireEvent('willShow', this);
    this.element.removeClass('SSDisplayNone');
    this.element.addClass('SSActive');
    this.willShow();
    this.fireEvent('show', this);
    
    this.__refresh__();
    this.subViews().each($msg('__refresh__'));
  },

  /*
    Function: willShow
      Called before the view is actually shown. If you want to customize
      this behavior remember to call this.parent() from your implementation
      of willShow.
   */
  willShow: function()
  {
    if(this.isVisible()) this.subViews().each($msg('willShow'));
  },

  /*
    Function: hide
      Used to hide the interface assocaited with this instance.
  */
  hide: function()
  {
    this.fireEvent('willHide', this);
    this.willHide();
    this.element.removeClass('SSActive');
    this.element.addClass('SSDisplayNone');
    this.fireEvent('hide', this);
  },
  
  /*
    Function: willHide
      Called before the view is actually hidden. If you want to customize
      this behavior remember to call this.parent() from your implementation
      of willHide.
   */
  willHide: function()
  {
    if(this.isVisible()) this.subViews().each($msg('willHide'), this);
  },

  /*
    Function: isVisible
      Returns whether the view is currently visible.

    Returns:
      A boolean.
   */
  isVisible: function()
  {
    var display = this.element.getStyle('display');
    var size = this.element.getSize();
    var node = this.element;
    if(display == 'none') return false;
    while(node.getParent())
    {
      node = node.getParent();
      display = node.getStyle('display');
      if(display == 'none') break;
    }
    return (display && display != 'none') || false;
  },
  
  /*
    Function: isHidden
      Returns whether the view is currently hidden.

    Returns:
      A boolean.
   */
  isHidden: function()
  {
    return !this.isVisible();
  },

  /*
    Function: destroy
      Used to destroy this instance as well as the interface associated with it.
  */
  destroy: function()
  {
    this.removeControllerForNode(this.element);
    this.element.destroy();
    delete this;
  },
  
  /*
    Function: __refresh__
      *private*
      Private function for refreshing the view. Should not be called.
      Call refresh instead.
      
    See Also:
      <refresh>
   */
  __refresh__: function(force)
  {
    if((this.isVisible() && this.needsDisplay()) || force)
    {
      this.refresh(force);
      this.subViews().each($msg('__refresh__', force));
    }
  },

  /*
    Function: refresh
      *abstract*
      To be implemented by subclasses.
  */
  refresh: function() {},
  
  /*
    Function: build
      *abstract* *deprecated*
      To be implemented by subclasses. Your user interface should be built
      here. In ShiftSpace 1.0 this is largely unecessary because of Sandalphon.
      This function should be considered deprecated.
  */
  build: function() {},
  
  /*
    Function: setNeedsDisplay
      Flag for setting whether this view is need of a refresh. If the view
      is visible this will cause a refresh right away. If the view is not
      visible the view will be refreshed when the user views it.

    Parameters:
      val - a boolean, generally true
   */
  setNeedsDisplay: function(val) { this.__needsDisplay = val; },
  
  /*
    Function: needsDisplay
      Return the needsDisplay status of this view.

    Returns:
      A boolean.
   */
  needsDisplay: function()
  {
    return this.__needsDisplay;
  },

  /*
    Function: localizationChanged
      Called on the view when the localization has changed.

    Parameters:
      newLocalization - the new language.
   */
  localizationChanged: function(newLocalization) { SSLog('localizationChanged'); },
  
  /*
    Function: onContextActivate
      Called when the context (Window) to which this view belongs has finished
      being activated.
   */
  onContextActivate: function(ctxt) { },
  
  /*
    Function: superView
      Returns the controller just above this view in the view hierarchy. Note
      that this means non-SSView controller DOM elements may sit between this
      view and it's superview.

    Returns:
      A SSView
   */
  superView: function()
  {
    var el = this.element.getParent('*[uiclass]'), superView;
    if(el)
    {
      var superView = SSControllerForNode(el);
    }
    else
    {
      var ctxt = this.getContext();
      if(ctxt && ctxt.__sscontextowner)
      {
        superView = ctxt.__sscontextowner;
      }
    }
    return superView;
  },
  
  /*
    Function: subViews
      Returns all controllers which have this view as the first parent view.

    Returns:
      An array of SSView instances.
  */
  subViews: function(el)
  {
    return (el || this.element).getElements('*[uiclass]').map(SSControllerForNode).filter(function(controller) {
      return (controller.isAwake && controller.isAwake() && controller.superView() == this);
    }, this);
  },
  
  /*
    Function: visibleSubViews
      Only returns the controllers which are visible to the user.
   */
  visibleSubViews: function(el)
  {
    return this.subViews(el).filter($msg('isVisible'));
  },
  
  /*
    Function: setIsLoaded
      Set the isLoaded flag.

    Parameters:
      val - a boolean.
   */
  setIsLoaded: function(val)
  {
    this.__isLoaded = val;
    if(val) this.fireEvent('load', this);
  },
  
  /*
    Function: isLoaded
      Return the value of the isLoaded flag.

    Returns:
      A boolean.
   */
  isLoaded: function()
  {
    return this.__isLoaded;
  },
  
  /*
    Function: isNotLoaded
      Complement of isLoaded.

    Returns:
      A boolean.
   */
  isNotLoaded: function()
  {
    return !this.isLoaded();
  }

});