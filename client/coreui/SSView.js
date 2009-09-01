// ==Builder==
// @uiclass
// @required
// @package           ShiftSpaceCoreUI
// @dependencies      SandalphonCore
// ==/Builder==


var SSView = new Class({

  name: 'SSView',

  Implements: [Events, Options],
  
  defaults: function()
  {
    var temp = {
      context: null,
      generateElement: true,
      suppress: false
    };
    return temp;
  },

  /*
    Function: _genId
      Generate an object id.  Used for debugging.  The instance is indentified by this in the global
      ShiftSpaceObjects hash.
  */
  _genId: function()
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
    this.__id = this._genId();
    this.setIsAwake(false);
    
    // add to global hash
    if(ShiftSpaceObjects) ShiftSpaceObjects.set(this.__id, this);
    
    // check if we are prebuilt
    //this.__prebuilt__ = (el && true) || false; // NOT IMPLEMENTED - David
    this.__ssviewcontrollers__ = [];
    this.__delegate = null;
    this.__outlets__ = new Hash();
    
    this.element = (el && $(el)) || (this.options.generateElement && new Element('div')) || null;
    
    if(this.element)
    {
      // NOTE: the following breaks tables, so we should avoid it for now - David
      //this.element.setProperty('class', 'ShiftSpaceElement '+this.element.getProperty('class'));

      // store a back reference to this class
      SSSetControllerForNode(this, this.element);

      // add to global name look up dictionary
      if(ShiftSpaceNameTable && this.element.getProperty('id').search('generatedId') == -1)
      {
        ShiftSpaceNameTable.set(this.element.getProperty('id'), this);
      }
    }

    // We need to build this class via code - NOT IMPLEMENTED - David
    /*
    if(!this.__prebuilt__)
    {
      this.build();
    }
    */

    this.__subviews__ = [];

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
  
  
  setup: function() {},
  
  
  /*
    __awake__ (private):
      Private method, handles view refreshing event chaining.
      
    Parameters:
      context - a window object or DOM element.
  */
  __awake__: function(context)
  {
    var superview = this.getSuperView(context);
    if(superview) 
    {
      superview.addEvent('onRefresh', function() {
        if(!this.needsDisplay()) return;
        this.refreshAndFire();
      }.bind(this));
    }
  },
  
  
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
  
  
  setIsAwake: function(val)
  {
    this.__isAwake__ = val;
  },
  
  
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
  
  
  getName: function()
  {
    return this.elId();
  },
  
  
  elId: function()
  {
    return this.element.getProperty('id');
  },


  setOutlets: function(newOutlets)
  {
    this.__outlets__ = newOutlets;
  },


  outlets: function()
  {
    return this.__outlets__;
  },


  addOutlet: function(element)
  {
    var outletKey = element.getProperty('outlet');
    // check if there is a controller
    var controller = this.controllerForNode(element);
    this.outlets().set(element.getProperty('id'), (controller || element));
  },


  addOutletWithName: function(name, outlet)
  {
    this.outlets().set(name, outlet);
  },
  
  
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


  eventDispatch: function(evt)
  {
    
  },


  checkForMatch: function(_cands, node)
  {
    if(_cands.length == 0) return null;

    var cands = (_cands instanceof Array && _cands) || [_cands];
    cands.each($msg('_ssgenId'));

    var len = cands.length;
    for(var i = 0; i < len; i++)
    {
      if(cands[i].isEqual(node)) return true;
    }

    return false;
  },


  /*
    Function: hitTest
      Matches a target to see if it occured in an element pointed to by the selector test.

    Parameters:
      target - the HTML node where the event originated.
      selectorOfTest - the CSS selector to match against.
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
      Used in conjunction with hitTest.  This is because hitTest may be slow, so you shouldn't have to call it twice.
      If there was a successful hit you should get it from cachedHit instead of calling hitTest again.

    See Also:
      hitTest, cachedHit
  */
  setCachedHit: function(node)
  {
    this.__cachedHit = node;
  },

  /*
    Function: cachedHit
      Returns the hit match that was acquired in hitTest.

    Returns:
      An HTML Element.
  */
  cachedHit: function()
  {
    return this.__cachedHit;
  },


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
  */
  controllerForNode: function(node)
  {
    // return the storage property
    return SSControllerForNode(node);
  },

  // will probably be refactored
  addControllerForNode: function(node, controllerClass)
  {
    // instantiate and store
    this.__ssviewcontrollers__.push(new controllerClass(node));
  },

  // will probably be refactored
  removeControllerForNode: function(node)
  {
    // get the controller
    var controller = SSControllerForNode(node);
    if(controller)
    {
      // clear out the storage
      SSSetControllerForNode(null, node);

      if(this.__ssviewcontrollers__.contains(controller))
      {
        // remove from internal array
        this.__ssviewcontrollers__.remove(controller);
      }
    }
  },

  /*
    Function: show
      Used to show the interface associated with this instance.
  */
  show: function()
  {
    this.fireEvent('willShow', this);
    this.element.addClass('SSActive');
    this.element.removeClass('SSDisplayNone');
    if(this.isVisible() && this.needsDisplay()) this.refreshAndFire();
    this.fireEvent('show', this);
  },
  

  /*
    Function: hide
      Used to hide the interface assocaited with this instance.
  */
  hide: function()
  {
    this.fireEvent('willHide', this);
    this.element.removeClass('SSActive');
    this.element.addClass('SSDisplayNone');
    this.fireEvent('hide', this);
  },
  

  isVisible: function()
  {
    return ['block', 'inline'].contains(this.element.getStyle('display'));
  },
  
  
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
  
  
  getSuperView: function(context)
  {
    var parent = this.element.getParent('*[uiclass]');
    if(parent) return SSControllerForNode(parent);
    return null;
  },
  

  /*
    Function: refresh (abstract)
      To be implemented by subclasses.
  */
  refresh: function()
  {
    
  },
  
  
  refreshAndFire: function()
  {
    this.refresh();
    this.fireEvent('onRefresh');
  },

  /*
    Function: build (abstract)
      To be implemented by subclasses.
  */
  build: function()
  {

  },
  
  
  setNeedsDisplay: function(val)
  {
    this.__needsDisplay = val;
  },
  
  
  needsDisplay: function()
  {
    return this.__needsDisplay;
  },


  localizationChanged: function(newLocalization)
  {
    SSLog('localizationChanged');
  },
  
  
  onContextActivate: function(ctxt)
  {
    
  },
  
  
  subViews: function()
  {
    return this.element.getElements('*[uiclass]').map(SSControllerForNode);
  },
  
  
  visibleSubViews: function()
  {
    return this.subViews().filter($msg('isVisible'));
  },
  
  
  setIsLoaded: function(val)
  {
    this.__isLoaded = val;
    if(val) this.fireEvent('load', this);
  },
  
  
  isLoaded: function()
  {
    return this.__isLoaded;
  },
  
  
  isNotLoaded: function()
  {
    return !this.isLoaded();
  }

});