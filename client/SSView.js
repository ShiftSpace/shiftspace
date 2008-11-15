// ==Builder==
// @required
// @name	            SSView
// @package           ShiftSpaceCoreUI
// @dependencies      SandalphonCore
// ==/Builder==

var SSView = new Class({

  name: 'SSView',

  Implements: [Events, Options],
  
  defaults: function()
  {
    return {
      context: document.window
    };
  },

  /*
    Function: _genId
      Generate an object id.  Used for debugging.  The instance is indentified by this in the global
      ShiftSpace.Objects hash.
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
    // get the options first
    this.setOptions(this.defaults(), options);
    
    // generate an id
    this.__id__ = this._genId();
    this.setIsAwake(false);

    // add to global hash
    if(ShiftSpace.Objects) ShiftSpace.Objects.set(this.__id__, this);

    // check if we are prebuilt
    this.__prebuilt__ = (el && true) || false;
    this.__ssviewcontrollers__ = [];
    this.__delegate__ = null;
    this.__outlets__ = new Hash();

    this.element = (el && $(el)) || (new Element('div'));
    
    // NOTE: the following breaks tables, so we should avoid it for now - David
    //this.element.setProperty('class', 'ShiftSpaceElement '+this.element.getProperty('class'));

    // store a back reference to this class
    SSSetControllerForNode(this, this.element);

    // We need to build this class via code
    if(!this.__prebuilt__)
    {
      this.build();
    }

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
    
    // add to global name look up dictionary
    if(ShiftSpace.NameTable && this.element.getProperty('id').search('generatedId') == -1)
    {
      ShiftSpace.NameTable.set(this.element.getProperty('id'), this);
    }
  },
  
  
  getContext: function()
  {
    return this.options.context;
  },
  
  
  setup: function() {},
  
  /*
    Function: awake
      Called after the outlets have been attached.
  */
  awake: function()
  {
    SSLog(this.getId() + " awake, outlets " + JSON.encode(this.outlets().getKeys()));
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
    return this.__id__;
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
    SSLog('Setting name ' + name + ' for ' + outlet);
    this.outlets().set(name, outlet);
  },


  /*
    Function: setDelegate
      Set the delegate of this instance.

    Parameters:
      delegate - an Object.
  */
  setDelegate: function(delegate)
  {
    this.__delegate__ = delegate;
  },

  /*
    Function: delegate
      Returns the delegate for this instance.
  */
  delegate: function()
  {
    return this.__delegate__;
  },


  eventDispatch: function(evt)
  {

  },


  checkForMatch: function(_cands, node)
  {
    if(_cands.length == 0) return null;

    var cands = (_cands instanceof Array && _cands) || [_cands];

    var len = cands.length;
    for(var i = 0; i < len; i++)
    {
      if(cands[i] == node) return true;
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
    var node = target;
    var matches = this.element._getElements(selectorOfTest);

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
    this.__cachedHit__ = node;
  },

  /*
    Function: cachedHit
      Returns the hit match that was acquired in hitTest.

    Returns:
      An HTML Element.
  */
  cachedHit: function()
  {
    return this.__cachedHit__;
  },


  indexOfNode: function(array, node)
  {
    var len = array.length;
    for(var i = 0; i < len; i++)
    {
      if(array[i] == node) return i;
    }
    return -1;
  },


  /*
    Function: controllerForNode
      Returns the view controller JS instance for an HTML Element.
  */
  controllerForNode: function(node)
  {
    //SSLog(('controllerForNode ' + node);
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
    this.element.addClass('SSActive');
    this.element.removeClass('SSDisplayNone');
  },

  /*
    Function: hide
      Used to hide the interface assocaited with this instance.
  */
  hide: function()
  {
    this.element.removeClass('SSActive');
    this.element.addClass('SSDisplayNone');
  },

  isVisible: function()
  {
    return (this.element.getStyle('display') != 'none');
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
    Function: refresh (abstract)
      To be implemented by subclasses.
  */
  refresh: function()
  {

  },

  /*
    Function: build (abstract)
      To be implemented by subclasses.
  */
  build: function()
  {

  },


  localizationChanged: function(newLocalization)
  {
    SSLog('localizationChanged');
  }

});

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSView = SSView;
}