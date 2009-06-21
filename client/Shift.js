// ==Builder==
// @required
// @export            ShiftSpaceShift as Shift
// @package           ShiftSpaceCore
// ==/Builder==

/*
  Class: ShiftSpace.Shift
    The base class for shifts.  Shifts can essentially be thought of as documents.  If you consider things from the MVC perspective
    the Shift is the View, the Space is the Controller.  When the model is modified via the interface you present in your shift
    (or space), in order for these changes to take, you will need to call the save method at key points.  This will sync
    the state of the shift with to the ShiftSpace database.  The design of the the Shift class is meant to be as declarative as possible.
    The key functions such as show, edit, hide, save, setup should not be called directly by you.  You simply implement the behavior
    you want when ShiftSpace calls these methods based on user interaction with the shift menu and the shift console.
*/
var ShiftSpaceShift = new Class({
  
  name: 'ShiftSpace.Shift',
  Implements: [Events, Options],

  getDefaults: function()
  {
    return {};
  },

  /*
    Function: initialize (private)
      Takes a json object and creates the shift.

    Parameters:
      _json - The JSON object that contains the properties the shift will have.
  */
  initialize: function(_json)
  {
    this.setOptions(this.getDefaults(), _json);

    var id = _json.id;
    var parentSpace;

    this.defaults = this.options;

    this.setId = function(aId) {
      if(id == null || id.substr(0, 8) == 'newShift') id = aId;
    };

    this.getId = function() {
      return id;
    };

    if(_json.id) this.setId(_json.id);
    this.setTitle(_json.summary || '');
    this.setup(_json);

    return this;
  },
  
  
  getParentSpace: function(attribute)
  {
    return SSSpaceForName(this.options.space);
  },

  /*
    Function: setup (abstract)
      To implemented by the subclass.  All initialization of your Shift instance should happen here.

    Parameters:
      json - an Object whose properties should be loaded by the instance.  This object contains a "location" property which is the mouse location.

    Example:
      (start code)
      setup: function(json)
      {
        this.build();
        this.attachEvents();

        var mainView = this.getMainView();
        if(json.position)
        {
          mainView.setStyles({
            left: json.position.x,
            top: json.position.y
          });
        }

        if(json.title)
        {
          this.setTitle(json.title);
        }
      }
      (end)
  */
  setup: function(json)
  {
  },

  /*
    Function: isNewShift
      Returns whether this shift is newly created or not.

    Returns:
      A boolean.
  */
  isNewShift: function()
  {
    return SSIsNewShift(this.getId());
  },

  /*
    Function: setFocusRegions
      Takes a variable list of DOM element that will trigger this
      shift to fire an onFocus event.
  */
  setFocusRegions: function()
  {
    var args = new Array(arguments);

    for(var i = 0; i < arguments.length; i++)
    {
      var aRegion = arguments[i];
      aRegion.addEvent('mousedown', function() {
        this.focus();
      }.bind(this));
    }
  },

  /*
    Function: edit
      The shift should present it's editing interface.  Puts the shift into editing mode.  Be sure to call this.parent()
      if you override this method.
  */
  edit: function() 
  {
    this.setIsBeingEdited(true);
  },

  /*
    Function: save
      Fires the onUpdate event for anyone who is listening. Passes a ref to this object as
      the event parameter.
  */
  save: function()
  {
    // We can use events here because if we do
    // a Shift cannot save in their initialize method
    this.getParentSpace().updateShift(this);
    this.fireEvent('onShiftSave', this.getId());
  },

  markDirty: function()
  {
    this.dirty = true;
  },

  /*
    Function: refresh (abstact)
      You should always provide some kind of refresh function
      so that your shift can correct itself for resize operations,
      window size changes, showing, hiding, etc.
  */
  refresh: function() {},

  /*
    Function: encode (abstract)
      To be implemented by the subclass. This method should return an object whose the properties
      accurately represent the state of this shift.  When shift is instantiated this same object
      will be passed to the new instance so that you may restore the state of the shift.

    Returns:
      A object whose properties represent the current state of the shift instance.

    Example:
      (start code)
      encode: function()
      {
        return {
          name: "John Smith",
          address: "1 Park Ave"
        };
      }
      (end)
  */
  encode: function()
  {
    return {};
  },

  /*
    Function: canShow
      A function which determines whether the shift can be shown.

    Returns:
      A boolean.
  */
  canShow : function()
  {
    return true;
  },

  /*
    Function: canHide
      A function which determines whether the shift can be hidden.

    Returns:
      A boolean.
  */
  canHide: function()
  {
    return true;
  },

  /*
    Function: destroy
      Destroys the shift.  This will remove the shift's main view from the DOM as well as erase
      the shift from the ShiftSpace DB.
  */
  destroy: function()
  {
    if(this.getMainView() && this.getMainView().getParent())
    {
      this.getMainView().dispose();
    }

    this.fireEvent('onShiftDestroy', this.getId());
  },

  _show: function()
  {

  },

  /*
    Function: show
      Make the shift visible.  If you want to add custom behavior by overriding this method sure to add a call to this.parent() as the first line in your new method.
  */
  show: function()
  {
    this.setIsVisible(true);
    var mainView = this.getMainView();

    if(mainView)
    {
      mainView.removeClass('SSDisplayNone');
    }

    this.refresh();
    this.fireEvent('onShiftShow', this.getId());
  },

  _hide: function()
  {

  },

  /*
    Function: hide
      Hide the shift.  If you want to add custom behavior by overriding this method be sure to call this.parent() as the first line in your new method.
  */
  hide: function(el)
  {
    this.setIsVisible(false);
    var mainView = this.getMainView();

    if(mainView)
    {
      mainView.addClass('SSDisplayNone');
    }

    this.fireEvent('onShiftHide', this.getId());
  },

  /*
    Function: manageElement
      Sets the main view of the shift.  This lets ShiftSpace now what the main display
      element of your Shift is.  This is required for proper display ordering.

    Parameters:
      el - A ShiftSpace.Element
  */
  manageElement: function(el)
  {
    if(el)
    {
      this.mainView = el;
      this.mainView.addEvent('mousedown', function() {
        this.focus();
      }.bind(this));
    }
    else
    {
      console.error('Error: Attempt to set mainView to null.');
    }
  },

  /*
    Function: focus
      Tell ShiftSpace we want to focus this shift.
  */
  focus: function() 
  {
    this.fireEvent('onShiftFocus', this.getId() );
  },

  /*
    Function: onFocus
      Do any updating of the shift's interface for focus events here.
  */
  onFocus: function() {},

  /*
    Function: unfocus
      Tell ShiftSpace we want to blur this shift.
  */
  blur : function() 
  {
    this.setIsBeingEdited(false);
    this.fireEvent('onShiftBlur', this.getId() );
  },

  /*
    Function: onBlur
      Do any updating of the shift's interface here.
  */
  onBlur: function() {},

  /*
    Function: getMainView
      Returns the main view of the shift.  Without this ShiftSpace cannot order the shift.

    Returns:
      <ShiftSpace.Element>
  */
  getMainView: function()
  {
    return this.mainView;
  },

  /*
    Function: mainViewIsVisible
      Returns whether the main view of the shift is visible or not.

    Returns:
      boolean
  */
  mainViewIsVisible: function()
  {
    return (this.mainView.getStyle('display') != 'none');
  },

  /*
    Function: setIsVisible (private)
     Set the internal private flag tracking whether this shift is visible or not.  You should not call this directly.

    Parameters:
      val - a boolean.
  */
  setIsVisible: function(val)
  {
    this.__isVisible = val;
  },

  /*
    Function: isVisible
      Returns whether this shift is visible or not.

    Returns:
      A boolean.
  */
  isVisible: function()
  {
    return  this.__isVisible;
  },

  /*
    Function: setIsBeingEdited (private)
      Sets the internal flag that tracks whether the shift is currently being edited or not.

    Parameters:
      val - a boolean.
  */
  setIsBeingEdited: function(val)
  {
    this.__isBeingEdited = val;
  },

  /*
    Function: isBeingEdited
      Returns whether this shift is currently being edited or not.

    Returns:
      A boolean.
  */
  isBeingEdited: function(val)
  {
    return this.__isBeingEdited;
  },

  getRegion: function()
  {
    var pos = this.getMainView().getPos();
    var size = this.getMainView().getSize().size;

    return {
      left : pos.x,
      right : pos.x + size.x,
      top : pos.y,
      bottom : pos.y + size.y
    };
  },

  /*
    Function: pin
      Pins an element of the shift to a node on the page.

    Parameters:
      element - the Element to be pinned.
      pinRef - A pinRef JSON object created by <Pin>

    See Also:
      <Pin>,
      <PinWidget>

    Example:
      (start code)
      this.pin($('cssId), ShiftSpace.Pin.toRef($('someOtherCSSId')));
      (end)
  */
  pin: function(element, pinRef)
  {
    // get the target
    var pinTarget = ShiftSpace.Pin.toNode(pinRef);

    if(pinTarget)
    {
      // valid pin ref
      this.setPinRef(pinRef);

      // store some styles from the pin target, if action is replace
      switch(pinRef.action)
      {
        case 'replace':
          // we want the width, height and flow of the original if replace
          var targetStyles = pinTarget.getStyles('width', 'height', 'float');
          this.setPinTargetStyles(targetStyles);
          element.setStyles(targetStyles);
        break;

        case 'relative':
        break;

        default:
        break;
      }

      // store the size before pinning
      this.setPinElementDimensions(element.getSize().size);

      // this is already pinned need to unpin first
      if(this.getPinElement())
      {
        this.unpin();
      }

      this.setPinTarget(pinTarget);
      this.setPinElement(element);

      // call ShiftSpace Pin API to pin this element
      pinRef.shift = this;
      SSPinElement(element, pinRef);
    }
    else
    {
      // Should throw an Exception ? - David
    }

    // fire a pin event
    this.fireEvent('pin', this);
  },

  /*
    Function: unPin
      Unpins an element of this shift from a element on the page.

    See Also:
      <Pin>,
      <PinWidget>
  */
  unpin: function()
  {
    // check to make sure there is an pinned element to restore
    if(this.getPinElement())
    {
      SSUnpinElement(this.getPinRef());

      // clear out these vars
      this.setPinTarget(null);
      this.setPinElement(null);
    }

    this.fireEvent('unpin', this);
  },

  /*
    Function: setPinElement (private)
      Set the element of the shift that will actually be pinned.

    Parameters:
      newEl - The element of the shift that will be pinned.
  */
  setPinElement: function(newEl)
  {
    this.pinElement = newEl;
  },

  /*
    Function: getPinElement (private)
      Returns the current element that is pinned.  This will return
      null if the shift is not currently pinned.

    Returns:
      A DOM node.
  */
  getPinElement: function()
  {
    return this.pinElement;
  },

  /*
    Function: setPinRef
      Set the current pinRef object. This is normally called automatically
      you should rarely if ever call this directly.

    Parameters:
      pinRef - Set the current pinRef object.
  */
  setPinRef: function(pinRef)
  {
    this.pinRef = pinRef;
  },

  /*
    Function: getPinRef
      Returns the set pinRef object (created by <Pin>) if this shift has one.
  */
  getPinRef: function()
  {
    return this.pinRef;
  },

  /*
    Function: getEncodablePinRef
      This returns a version of the pin reference object that is encodable.  This is necessary
      because we store dom node references in the pin reference and these should not
      get encoded on Shift save. Used to remove circular references that will break Json.toString().

    Returns:
      And encodable Object representation of the pin reference object.

    Example:
      (start code)
      encode: function()
      {
        return {
          title: this.getTitle(),
          color: this.getColor(),
          position: this.element.getPosition(),
          pinRef: this.getEncodablePinRef(this.getPinRef())
        };
      }
      (end)
  */
  getEncodablePinRef: function()
  {
    var pinRef = this.getPinRef();
    var temp = {};

    // don't attempt to encode element, targetElement, or wrapper properties
    for(var key in pinRef)
    {
      if(!['element','targetElement', 'wrapper', 'shift', 'originalStyles', 'targetStyles'].contains(key))
      {
        temp[key] = pinRef[key];
      }

      if(key == 'offset' && pinRef.action == 'relative')
      {
        // we need to get the latest offset
        temp['offset'] = {x: pinRef.element.offsetLeft, y: pinRef.element.offsetTop};
      }
    }

    return temp;
  },

  /*
    Function: setPinTarget (private)
      Sets the pin target.  This is the element on the page that has been targeted
      by the user.

    Parameters:
      pinTarget - A DOM node.
  */
  setPinTarget: function(pinTarget)
  {
    this.pinTarget = pinTarget;
  },

  /*
    Function: getPinTarget (private)
      Returns the current pin target if there is one.
  */
  getPinTarget: function()
  {
    return this.pinTarget;
  },

  /*
    Function: setPinTargetStyles
      When replacing a target node or being inserted before or after it is important
      to pick up some of the CSS dimensions of that target node.  In the case of replacing
      these styles need to be saved before the node is replaced and removed from the
      page DOM.

    Parameters:
      newStyles - A JSON object of saved CSS dimension styles.
  */
  setPinTargetStyles : function(newStyles)
  {
    this.targetStyles = newStyles;
  },

  /*
    Function: getPinTargetStyles
      Returns the JSON object of the target nodes CSS dimension styles.

    Returns:
      An Object.
  */
  getPinTargetStyles : function()
  {
    return this.targetStyles;
  },

  setPinElementStyles : function(newStyles)
  {
    this.pinElementStyles = newStyles;
  },

  getPinElementStyles: function()
  {
    return this.pinElementStyles;
  },

  setPinElementDimensions: function(size)
  {
    this.pinElementDimensions = size;
  },

  getPinElementDimensions: function(size)
  {
    return this.pinElementDimensions;
  },

  /*
    Function: isPinned
      Returns true if this shift is currently pinned.

    Returns:
      A boolean.
  */
  isPinned: function()
  {
    return (this.getPinTarget() != null);
  },

  /*
    Function: updateTitle
      Update the title of the shift. Implictly saves the shift.

    Parameters:
      newTitle - a new title (string).
  */
  updateTitle: function(newTitle)
  {
    if(newTitle && newTitle != this.getTitle())
    {
      this.setTitle(newTitle);
      this.save();
    }
  },

  /*
    Function: setTitle
      Used to set the current title of the shift.

    Parameters:
      newTitle - a new title (string).
  */
  setTitle: function(newTitle)
  {
    this.__title = newTitle;
  },

  /*
    Function: getTitle
      Returns the title of the shift.

    Returns:
      A string.
  */
  getTitle: function()
  {
    return (this.__title || this.defaultTitle());
  },

  /*
    Function: defaultTitle (abstract)
      To be implemented by subclasses.  Returns "Untitled" otherwise.

    Returns:
      A String.
  */
  defaultTitle: function()
  {
    return "Untitled";
  },

  /*
    Function: getAuthor
      Returns the display name of the user that authored this shift.

    See Also:
      <SSGetAuthorForShift>
  */
  getAuthor: function()
  {
    return SSGetAuthorForShift(this.getId());
  },

  /*
    Function: build (abstract)
      To be implemented by the subclass. Build the DOM for the shift.
  */
  build: function()
  {
  },

  /*
  */
  failedView: function()
  {
    // TODO: Show the failed view, if this shift can't be shown
  },

  errorView: function(err)
  {

  },

  /*
    Function: xmlhttpRequest
      Safe version of GM_xmlhttpRequest for shifts.

    Parameters:
      config - the same type of object that should be passed to GM_xmlhttpRequest.

    See Also:
      <SSXmlHttpRequest>
  */
  xmlhttpRequest: function(config)
  {
    SSXmlHttpRequest.safeCall(config);
  }
});
