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
    SSAddObserver(this, "onShiftUncheck", this.onShiftUncheck.bind(this));
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


  onShiftUncheck: function(evt)
  {
    var lv = evt.listView,
        xs = lv.checkedItems();
    if(xs.length == 0)
    {
      this['close']();
    }
  },
  

  'open': function()
  {
    this.delegate().setHeight(270);
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
      var targets = this.currentTargets().join(" ");
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
    this.AddPublishTarget.addEvent("keyup", this.onKeyUp.bind(this));
    this.AddTarget.addEvent("click", this.addTarget.bind(this));
  },


  targetTypes: {
    "@": "user",
    "&": "group",
    "#": "tag"
  },

  
  onKeyUp: function(evt)
  {
    evt = new Event(evt);

    var target = $(evt.target),
        text = target.get("value").trim();

    if(text.length <= 1)
    {
      this.hideMatches();
      return;
    }

    if(this.currentMatches && this.currentMatches.length > 0)
    {
      var selected = this.autocomplete.getElement(".selected");
      if(!selected) return;
      if(evt.key == "down" && selected.getNext())
      {
        selected.removeClass("selected");
        selected.getNext().addClass("selected");
      }
      if(evt.key == "up" && selected.getPrevious())
      {
        selected.removeClass("selected");
        selected.getPrevious().addClass("selected");
      }
      if(evt.key == "enter")
      {
        var data = selected.retrieve("data");
        target.set("value", "@"+data.name);
        this.hideMatches();
      }
      evt.stop();
      return;
    }

    if(!this.autocomplete.getParent()) this.showMatches();

    var type = this.targetTypes[text[0]];
    text = text.tail(text.length-1);
    if(type && text != this.lastText)
    {
      this.updateMatches(SSAutocomplete(this.targetTypes[text[0]], text));
      this.lastText = text;
    }
  },


  showMatches: function(type)
  {
    var size = this.AddPublishTarget.getSize(),
        pos = this.AddPublishTarget.getPosition();
    this.element.getElement("#SSPublishPaneBody").grab(this.autocomplete);
    this.autocomplete.setStyles({
      left: pos.x,
      top: pos.y + size.y,
      width: size.x,
      "min-height": 20
    });
  },


  hideMatches: function()
  {
    this.currentMatches = null;
    this.autocomplete.dispose();
  },


  updateMatches: function(matches)
  {
    this.currentMatches = matches;
    this.autocomplete.empty();
    matches.each(function(x, i) {
      var el = new Element("div", {
        html: "<img></img><span></span>",
        'class': "autoResault"
      });
      if(i == 0) el.addClass("selected");
      if(x.gravatar)
      {
        el.getElement("img").set("src", x.gravatar);
      }
      else
      {
        el.getElement("img").dispose();
      }
      el.getElement("span").set("text", x.name);
      el.store("data", x);
      // watch for click
      this.autocomplete.grab(el);
    }, this);
  }.future(),
  
  /*
    Function: update
      Update the display of the shift depending on the user's selections.
   */
  update: function(shift)
  {
    var publishData = shift.publishData;
    this.AddPublishTarget.setProperty("value", "");
    this.setCurrentShiftId(shift._id);

    if(shift.userName != ShiftSpace.User.getUserName())
    {
      this.SSPublishPaneHeader.addClass("SSDisplayNone");
      this.SSPPVisibleEverybody.addClass("SSDisplayNone");
      this.SecretLink.set("text", "Get public link");
      this.ChooseVisibility.addClass("SSDisplayNone");
      this.SendMessage.removeClass("SSDisplayNone");
    }
    else
    {
      this.SSPublishPaneHeader.removeClass("SSDisplayNone");
      this.SSPPVisibleEverybody.removeClass("SSDisplayNone");
      this.SecretLink.set("text", "Get secret link");
      this.ChooseVisibility.removeClass("SSDisplayNone");
      this.SendMessage.addClass("SSDisplayNone");
    }
    
    if(publishData['private'])
    {
      this.PublicCheckbox.setProperty("checked", false);
      this.StatusForm.getElement("strong").set("text", "Private shift");
    }
    else
    {
      this.PublicCheckbox.setProperty("checked", true);
      this.StatusForm.getElement("strong").set("text", "Public shift");
    }
    
    if(publishData.targets && publishData.targets.length > 0)
    {
      this.AddPublishTarget.setProperty("value", publishData.targets.join(" "));
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
  },


  addTarget: function(evt)
  {
    this.PublishTargets.grab(this.createTarget(this.AddPublishTarget.get("value").trim()));
    this.AddPublishTarget.set("value", "");
    this.hideMatches();
  },


  createTarget: function(target)
  {
    var type = this.targetTypes[target[0]],
    el = new Element("span", {
      "text": target,
      "class": "SSPPTagsroundedCorners SSPPTag SSPPTag" + type.capitalize(),
      "events": {
        "click": this.deleteTarget.bind(this)
      }
    });
    el.store("target", target);
    return el;
  },


  createTargets: function(targets)
  {
    return tags.map(this.createTargets.bind(this));
  },


  deleteTarget: function(evt)
  {
    $(evt.target).dispose();
  },


  currentTargets: function()
  {
    return this.PublishTargets.getElements(".SSPPTag").map(function(el) {
      return el.retrieve("target");
    });
  }
});