// ==Builder==
// @uiclass
// @customView
// @optional
// @name              ActionMenu
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var ActionMenu = new Class({
  
  Extends: SSView,
  
  initialize: function(el, options) 
  {
    this.parent(el);
    
    this.selected = [];
    this.menuBuilt = false;
    
    ShiftSpace.User.addEvent('onUserLogin', this.updateMenu.bind(this));
    ShiftSpace.User.addEvent('onUserLogout', this.updateMenu.bind(this));
    
    // Load the interface if not in Sandalphon
    if($type(SandalphonToolMode) == 'undefined')
    {
      SSLog('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++', SSLogForce);
      Sandalphon.load('/client/customViews/ActionMenu/ActionMenu.html', this.buildInterface.bind(this));
    }
  },
  
  
  awake: function(context)
  {
    // in Sandalphon tool mode we're not iframed, in ShiftSpace we are
    if((context == window && typeof SandalphonToolMode != 'undefined') ||
       (context == this.element.contentWindow && typeof SandalphonToolMode == 'undefined'))
    {
      this.linkButton = this.outlets().get('SSLinkToShiftButton');
      this.trailButton = this.outlets().get('SSTrailShiftButton');
      this.deliciousButton = this.outlets().get('SSDeliciousButton');
      this.twitterButton = this.outlets().get('SSTwitterButton');
      this.editButton = this.outlets().get('SSEditShiftButton');
      this.deleteButton = this.outlets().get('SSDeleteShiftButton');
      this.privacyButtons = this.outlets().get('privacy');
      this.batchPrivacy = this.outlets().get('SSSetBatchPrivacy');
      this.privateButton = this.outlets().get('SSSetShiftPrivateButton');
      this.publicButton = this.outlets().get('SSSetShiftPublicButton');
      
      // initialize the dropdown
      this.dropdown = this.outlets().get('privacy');
      this.dropdown.addEvent('click', this.updatePrivacyMenu.bind(this, [true]));

      this.attachEvents();
      this.initFx();
    }
  },
  
  
  initFx: function()
  {
    this.element.set('tween', {
      duration: 300,
      transition: Fx.Transitions.linear,
      onStart: function()
      {
        this.element.setStyle('height', 0);
        this.element.setStyle('overflow', 'hidden');
        this.element.setStyle('display', 'block');
      }.bind(this),
      onComplete: function()
      {
        this.element.setStyle('overflow', 'visible');
      }.bind(this)
    });
    
    /*
    $(this.doc.getElementById('scroller')).set('tween', {
      duration: 300,
      transition: Fx.Transitions.linear,
      onStart: function()
      {
        $(this.doc.getElementById('scroller')).setStyle('top', 0);
        $(this.doc.getElementById('scroller')).setStyle('position', 'absolute');
      }.bind(this),
      onComplete: function()
      {
        $(this.doc.getElementById('scroller')).setStyle('position', '');
        $(this.doc.getElementById('scroller')).addClass('withActions');
      }.bind(this)
    });
    */
  },
  
  
  buildMenu: function() 
  {
    this.attachEvents();
  },
  
  
  attachEvents: function()
  {
    this.linkButton.addEvent('click', this.linkToShift.bind(this));
    this.editButton.addEvent('click', this.editShift.bind(this));
    this.deleteButton.addEvent('click', this.deleteShifts.bind(this));
    this.trailButton.addEvent('click', this.trailShift.bind(this));
    //this.initTwitterButton();
    //this.initDeleteButton();
    
    // Privacy changes
    this.privateButton.addEvent('click', this.makePrivate.bind(this));
    this.publicButton.addEvent('click', this.makePublic.bind(this));
  },
  
  
  linkToShift: function()
  {
    // Link
    if(!this.linkButton.hasClass('disabled'))
    {
      window.open(ShiftSpace.info().server + 'sandbox?id=' + this.selected[0]);
    }
    this.clearAndHide();
  },
  
  
  editShift: function()
  {
    // Edit
    if(SSEditShift)
    {
      if(!this.editButton.hasClass('disabled'))
      {
        SSEditShift(this.selected[0]);
      }
      this.clearAndHide();
    }
  },
  
  
  deleteShifts: function()
  {
    // Delete
    if(SSDeleteShift)
    {
      if(!this.deleteButton.hasClass('disabled'))
      {
        var str = 'this shift';
        if(this.selected.length > 1)
        {
          str = 'these shifts';
        }
        if(confirm('Are you sure want to delete ' + str + '? There is no undo'))
        {
          this.selected.each(SSDeleteShift);
          this.selected = [];
        
          this.updateMenu();
          this.hideMenu();
        }
      }
      this.clearAndHide();
    }
  },
  
  
  trailShift: function()
  {
    if(plugins && plugins.attempt)
    {
      plugins.attempt({
        name: 'Trails', 
        method: 'newTrail', 
        args: this.selected[0],
        callback: null
      });
      this.clearAndHide();
    }
  },
  
  
  initDeliciousButton: function()
  {
    if(plugins && plugins.attempt)
    {
      this.deliciousButton.addEvent('click', function(_evt) {
        var evt = new Event(_evt);
      
        plugins.attempt({
          name: "Delicious", 
          method: 'showDeliciousWindow',
          args: this.selected[0],
          callback: null
        });
      }.bind(this));
    }
  },
  
  
  initTwitterButton: function()
  {
    if(plugins && plugins.attempt)
    {
      this.twitterButton.addEvent('click', function(_evt) {
        var evt = new Event(_evt);
      
        plugins.attempt({
          name: 'Twitter', 
          method: "show", 
          args: this.selected[0],
          callback: null 
        });
      }.bind(this));
    }
  },
  
  
  makePrivate: function()
  {
    if(this.privacyButtons.hasClass('toggleMenu') ||
       this.privacyButtons.hasClass('batchMenu'))
    {
      SSLog('makePrivate');
      // update the contents of the menu based on the current selections
      this.selected.each(function(shiftId) {
        SSSetShiftStatus(shiftId, 2);
      });
      
      this.clearAndHide();
    }
  },
  
  
  makePublic: function()
  {

    if(this.privacyButtons.hasClass('toggleMenu') ||
       this.privacyButtons.hasClass('batchMenu'))
    {
      SSLog('makePublic');
      // update the contents of the menu based on the current selections
      this.selected.each(function(shiftId) {
        SSSetShiftStatus(shiftId, 1);
      });
      
      this.clearAndHide();
    }
  },

  
  setIsVisible: function(val) 
  {
    this.__visible__ = val;
  },
  

  isVisible: function() 
  {
    return this.__visible__;
  },
  

  select: function(shiftId) 
  {
    this.selected.push(shiftId);
    SSLog('select');
    this.showMenu();
    this.updateMenu();
  },
  

  deselect: function(shiftId) 
  {
    this.selected.remove(shiftId);
    if (this.selected.length == 0) 
    {
      this.hideMenu();
    }
    else
    {
      this.updateMenu();
    }
  },
  

  showMenu: function() 
  {
    if(!this.isVisible())
    {
      this.setIsVisible(true);
      if (!this.menuBuilt) 
      {
        this.buildMenu();
        this.menuBuilt = true;
      }
      
      this.element.tween('height', 22);
      //$(this.doc.getElementById('scroller')).tween('top', 23);
    }
  },
  
  
  hideMenu: function() 
  {
    this.setIsVisible(false);
    this.updatePrivacyMenu();
    
    this.element.tween('height', 0);
    //$(this.doc.getElementById('scroller')).tween('top', 0);
  },

  
  updateMenu: function() 
  {
    if(this.isVisible())
    {
      // update the contents of the menu based on the current selections
      var selectedShifts = SSGetPageShifts(this.selected);
      if(selectedShifts && selectedShifts.length > 0)
      {
        var notTheLoggedInUser = function(x) {
          return x.username != ShiftSpace.User.getUsername();        
        };

        var usernames = selectedShifts.filter(notTheLoggedInUser);      
        if(usernames.length > 0)
        {
          this.disablePrivelegedButton();
        }
        else
        {
          this.enablePrivelegedButtons();
        }
        
        if(selectedShifts.length > 1)
        {
          this.linkButton.addClass('disabled')
          this.trailButton.addClass('disabled');
          this.editButton.addClass('disabled');
        }
        else
        {
          this.linkButton.removeClass('disabled');
          this.trailButton.removeClass('disabled');
          if(SSUserOwnsShift(this.selected[0])) this.editButton.removeClass('disabled');
        }
        
        if(selectedShifts.length >= 1 && 
          (this.privacyButtons.hasClass('toggleMenu') ||
           this.privacyButtons.hasClass('batchMenu'))) 
           this.updatePrivacyMenu();
           
        this.updatePrivacyButtons(selectedShifts);
      }
    }
  },
  
  
  updatePrivacyButtons: function(selectedShifts)
  {
    if(selectedShifts.length == 1)
    {
      var newTopLevelButton;
      if(selectedShifts[0].status == 1)
      {
        this.publicButton.addClass('selected');
        this.publicButton.addClass('first');
        this.privateButton.removeClass('selected');
        this.privateButton.removeClass('first');
        newTopLevelButton = this.publicButton;
      }
      else
      {
        this.publicButton.removeClass('selected');
        this.publicButton.removeClass('first');
        this.privateButton.addClass('selected');
        this.privateButton.addClass('first');
        newTopLevelButton = this.privateButton;
      }
      
      this.batchPrivacy.removeClass('first');
      this.batchPrivacy.removeClass('selected');
      
      newTopLevelButton.remove();
      newTopLevelButton.injectTop(this.privacyButtons);
    }
    else if(selectedShifts.length > 1)
    {
      this.privateButton.removeClass('first');
      this.privateButton.removeClass('selected');
      this.publicButton.removeClass('first');
      this.publicButton.removeClass('selected');
      
      this.batchPrivacy.remove();
      this.batchPrivacy.injectTop(this.privacyButtons);
      this.batchPrivacy.addClass('first');
      this.batchPrivacy.addClass('selected');
    }
  },
  

  enablePrivelegedButtons: function()
  {
    this.setDisabledPrivilegedButtons(false);
  },
  
  
  disablePrivelegedButton: function()
  {
    this.setDisabledPrivilegedButtons(true);
  },
  

  setDisabledPrivilegedButtons: function(disabled)
  {
    var method = (disabled == true && 'addClass') || (disabled == false  && 'removeClass') || null;
    
    if(!method) return;
    
    // logged in and owns all the selected shifts
    this.editButton[method]('disabled');
    this.deleteButton[method]('disabled');
    this.privacyButtons[method]('disabled');
    /*
    this.publicButton[method]('disabled');
    this.privateButton[method]('disabled');
    */
  },
  
  
  clearAndHide: function()
  {
    ShiftSpace.Console.clearSelections();
    this.selected = [];
    this.hideMenu();
  },
  

  updatePrivacyMenu: function(click) 
  {
    SSLog('updatePrivacyMenu');
    if(!this.privacyButtons.hasClass('disabled'))
    {
      if(this.selected.length == 1)
      {
        if(!this.privacyButtons.hasClass('toggleMenu'))
        {
          this.privacyButtons.removeClass('batchMenu');
          this.privacyButtons.addClass('toggleMenu')
        }
        else if(click)
        {
          this.privacyButtons.removeClass('toggleMenu');
        }
      }
      else if(this.selected.length > 1)
      {
        if(!this.privacyButtons.hasClass('batchMenu'))
        {
          this.privacyButtons.removeClass('toggleMenu');
          this.privacyButtons.addClass('batchMenu');
        }
        else if(click)
        {
          this.privacyButtons.removeClass('batchMenu');
        }
      }
      else
      {
        // no selections
        this.privacyButtons.removeClass('batchMenu');
        this.privacyButtons.removeClass('toggleMenu');
      }
    }
  }
  
});

// Add it the global UI class lookup
if(typeof ShiftSpaceUI != 'undefined')
{
  ShiftSpaceUI.ActionMenu = ActionMenu;
}