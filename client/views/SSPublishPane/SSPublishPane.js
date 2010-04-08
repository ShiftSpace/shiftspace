// ==Builder==
// @uiclass
// @package           ShiftSpaceUI
// @dependencies      SSFramedView
// ==/Builder==

/*
  Class: SSPublishPane
    The publish pane class. A singleton. Listens to all ShiftListView instances
    for selection notification.
*/
var SSPublishPane = new Class({

  Extends: SSView,
  name: "SSPublishPane",

  defaults: function() {
    return $merge(this.parent(), {
      multipleSelection: true
    });
  },
  
  
  initialize: function(el, options)
  {
    this.parent(el, options);

    SSAddObserver(this, "onShiftShare", this.onShiftShare.bind(this));
    SSAddObserver(this, "onShiftCheck", this.onShiftCheck.bind(this));
    SSAddObserver(this, "onShiftListViewWillHide", this.onShiftListViewWillHide.bind(this));

    this.createMatchesList();
  },


  createMatchesList: function()
  {
    this.autocomplete = new Element("div", {
      "id": "PublishTargetAutocomplete"
    });
  },


  onShiftShare: function(shift)
  {
    this['open']();
    this.update(shift);
  },


  onShiftCheck: function(evt)
  {
    var lv = evt.listView,
        xs = lv.checkedItems();
    if(xs.length > 1)
    {
      this['close']();
    }
  },
  

  'open': function()
  {
    this.delegate().short();
    this.delegate().show();
    this.multiView().showViewByName(this.name);
    SSPostNotification("onPublishPaneOpen");
  },


  'close': function()
  {
    this.delegate().hide();
    SSPostNotification("onPublishPaneClose");
  },
  

  onShiftListViewWillHide: function(evt)
  {
    this['close']();
  },
  
  
  currentShiftId: function()
  {
    return this.__currentShiftId;
  },
  
  
  setCurrentShiftId: function(currentShiftId)
  {
    this.__currentShiftId = currentShiftId;
  },


  setDelegate: function(delegate)
  {
    this.__delegate = delegate;
  },
  
  
  delegate: function(delegate)
  {
    return this.__delegate;
  },
  
  /*
    Function: isGroup
      *private*
      Check if a string is a group string. For auto-completion
      of publish input field.

    Parameters:
      str - a string

    Returns:
      A boolean.   
  */
  isGroup: function(str)
  {
    return str[0] == '&';
  },

  /*
    Function: isUser
      *private*
      Check if a string is a user string. For auto-completion
      of publish input field.

    Parameters:
      str - a string

    Returns:
      A boolean.
  */
  isUser: function(str)
  {
    return str[0] == '@';
  },

  /*
     Function: publishShift
       Publishes the currently selected shift.
  */
  publishShift: function(evt)
  {
    evt = new Event(evt);
    var publishData = {},
        shiftId = this.currentShiftId(),
        isPublic = this.PublicCheckbox.getProperty("checked");

    if(isPublic)
    {
      publishData['private'] = false;
    }
    else
    {
      var targets = this.PublishTargets.getProperty("value").split(" ").map(String.trim).filter($not($eq("")));
      if(targets.length == 0)
      {
        alert("Please specify which user or group you wish to publish to.");
        return;
      }
      publishData.targets = targets;
    }

    var p = SSApp.post({
      resource: "shift",
      id: shiftId,
      action: "publish",
      data: publishData,
      json: true
    });
    p.realize();
  },
  
  
  attachEvents: function()
  {
    this.Cancel.addEvent("click", this['close'].bind(this));
    this.ChooseVisibility.addEvent('click', this.publishShift.bind(this));
    if(this.SecretLink) this.SecretLink.addEvent("click", this.showProxy.bind(this));
    this.PublishTargets.addEvent("keyup", this.autoComplete.bind(this));
  },


  autoComplete: function(evt)
  {
    evt = new Event(evt);
    var target = evt.target,
        text = target.get("value");

    if(text.length == 0)
    {
      this.hideMatches();
      return;
    }

    this.showMatches();
    switch(text[0])
    {
      case '@':
        break;
      case '&':
        break;
      case '#':
        break;
      default:
        break;
    }
  },


  showMatches: function()
  {
    var size = this.PublishTargets.getSize(),
        pos = this.PublishTargets.getPosition();
    this.element.getElement("#SSPublishPaneBody").grab(this.autocomplete);
    this.autocomplete.setStyles({
      left: pos.x,
      top: pos.y + size.y,
      width: size.x,
      height: 20
    });
  },


  hideMatches: function()
  {
    this.autocomplete.dispose();
  },


  updateMatches: function(matches)
  {
  },
  
  /*
    Function: update
      Update the display of the shift depending on the useres selections.
   */
  update: function(shift)
  {
    var publishData = shift.publishData;
    this.PublishTargets.setProperty("value", "");
    this.setCurrentShiftId(shift._id);
    if(publishData['private'])
    {
      this.PublicCheckbox.setProperty("checked", false);
    }
    else
    {
      this.PublicCheckbox.setProperty("checked", true);
    }
    if(publishData.targets && publishData.targets.length > 0)
    {
      this.PublishTargets.setProperty("value", publishData.targets.join(" "));
    }
  },

  /*
    Function: showProxy
      Opens the proxy page.
  */
  showProxy: function(evt)
  {
    window.open(ShiftSpace.info().server.urlJoin("unsafe-proxy", this.currentShiftId()));
  },
  

  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  }
});