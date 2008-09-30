var Actions = new Class({
  
  initialize: function() {
    this.selected = [];
    this.menuBuilt = false;
    
    ShiftSpace.User.addEvent('onUserLogin', this.updateMenu.bind(this));
    ShiftSpace.User.addEvent('onUserLogout', this.updateMenu.bind(this));
  },
  
  buildMenu: function() {
    this.doc = ShiftSpace.Console.frame.contentWindow.document;
    this.el = $(this.doc.getElementById('actions'));
    this.el.addClass('SSUserSelectNone');
    //'<a id="SSMakeShiftPrivateButton" href="#" class="option private selected">Private</a>' +
    this.el.innerHTML = 
      '<div class="group">' +
        '<a title="Permalink for selected shift" id="SSLinkToShiftButton" href="#" class="first button link"></a>' +
        '<a title="Trail selected shift" id="SSTrailShiftButton" href="#" class="button trails"></a>' +
        '<a title="Post to Delicious" id="SSDeliciousButton" href="#" class="button delicious"></a>' +
        '<br class="clear" />' +
      '</div>' +
      '<div class="group">' +
        '<div title="Set private/public status of selected shifts" id="privacy" class="dropdown first">' +
          '<a id="SSSetBatchPrivacy" style="padding-left:4px" href="#" class="first option">Set privacy</a>' +
          '<a id="SSSetShiftPublicButton" href="#" class="option public selected">Public</a>' +
          '<a id="SSSetShiftPrivateButton" href="#" class="option private">Private</a>' +
        '</div>' +
        '<a title="Edit selected shift" id="SSEditShiftButton" href="#" class="button edit"></a>' +
        '<a title="Delete selected shift" id="SSDeleteShiftButton" href="#" class="button delete"></a>' +
        '<br class="clear" />' +
      '</div>' +
      '<br class="clear" />';

    //this.favoriteButton = $(this.doc.getElementById('SSFavoriteShiftButton'));
    this.linkButton = $(this.doc.getElementById('SSLinkToShiftButton'));
    this.trailButton = $(this.doc.getElementById('SSTrailShiftButton'));
    this.deliciousButton = $(this.doc.getElementById('SSDeliciousButton'));
    this.editButton = $(this.doc.getElementById('SSEditShiftButton'));
    this.deleteButton = $(this.doc.getElementById('SSDeleteShiftButton'));
    this.privacyButtons = $(this.doc.getElementById('privacy'));
    this.batchPrivacy = $(this.doc.getElementById('SSSetBatchPrivacy'));
    this.privateButton = $(this.doc.getElementById('SSSetShiftPrivateButton'));
    this.publicButton = $(this.doc.getElementById('SSSetShiftPublicButton'));
    
    this.dropdown = _$(this.el).getElementsByClassName('dropdown')[0];
    this.dropdown = $(this.dropdown);
    this.dropdown.addEvent('click', this.updatePrivacyMenu.bind(this, [true]));
    
    /*
    this.privacyOptions = this.dropdown.clone();
    this.privacyOptions.setAttribute('id', 'privacyOptions');
    this.privacyOptions.setStyle('left', this.dropdown.getSize().x);
    this.privacyOptions.setStyle('top', this.dropdown.getSize().y);
    this.privacyOptions.inject(this.dropdown.parentNode);
    */
    
    this.attachEvents();

  },
  
  
  attachEvents: function()
  {
    // Favorite
    /*
    this.favoriteButton.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if(!evt.target.hasClass('disabled'))
      {
        //SSFavoriteShif(this.selected.getFirst());
      }
    }.bind(this));
    */
    
    // Link
    this.linkButton.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if(!$(evt.target).hasClass('disabled'))
      {
        window.open(ShiftSpace.info().server + 'sandbox?id=' + this.selected[0]);
      }
      this.clearAndHide();
    }.bind(this));
    
    // Edit
    this.editButton.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if(!$(evt.target).hasClass('disabled'))
      {
        editShift(this.selected[0]);
      }
      this.clearAndHide();
    }.bind(this));
    
    // Delete
    this.deleteButton.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if(!$(evt.target).hasClass('disabled'))
      {
        var str = 'this shift';
        if(this.selected.length > 1)
        {
          str = 'these shifts';
        }
        if(confirm('Are you sure want to delete ' + str + '? There is no undo'))
        {
          this.selected.each(deleteShift);
          this.selected = [];
          
          this.updateMenu();
          this.hideMenu();
        }
      }
      this.clearAndHide();
    }.bind(this));
    
    // Trail
    this.trailButton.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      
      plugins.attempt({
        name: 'Trails', 
        method: 'newTrail', 
        args: this.selected[0],
        callback: null
      });
      this.clearAndHide();
    }.bind(this));
    
    this.deliciousButton.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      
      plugins.attempt({
        name: "Delicious", 
        method: 'showDeliciousWindow',
        args: this.selected[0],
        callback: null
      });
    });
    
    // Privacy changes
    this.privateButton.addEvent('click', this.makePrivate.bind(this));
    this.publicButton.addEvent('click', this.makePublic.bind(this));
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

  
  setIsVisible: function(val) {
    this.__visible__ = val;
  },
  

  isVisible: function() {
    return this.__visible__;
  },
  

  select: function(shiftId) {
    this.selected.push(shiftId);
    SSLog('select');
    this.showMenu();
    this.updateMenu();
  },
  

  deselect: function(shiftId) {
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
  

  showMenu: function() {
    if(!this.isVisible())
    {
      this.setIsVisible(true);
      if (!this.menuBuilt) {
        this.buildMenu();
        this.menuBuilt = true;
      }
      
      var showFx = this.el.effects({
        duration: 300,
        transition: Fx.Transitions.linear,
        onStart: function()
        {
          this.el.setStyle('height', 0);
          this.el.setStyle('overflow', 'hidden');
          this.el.setStyle('display', 'block');
        }.bind(this),
        onComplete: function()
        {
          this.el.setStyle('overflow', 'visible');
        }.bind(this)
      });
      
      var consoleFx = $(this.doc.getElementById('scroller')).effects({
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
      
      showFx.start({
        height: [0, 22]
      });
      consoleFx.start({
        top: [0, 23]
      });
    }
  },
  
  
  hideMenu: function() 
  {
    this.setIsVisible(false);
    this.updatePrivacyMenu();
    
    var showFx = this.el.effects({
      duration: 300,
      transition: Fx.Transitions.linear,
      onStart: function()
      {
        this.el.setStyle('overflow', 'hidden');
      }.bind(this),
      onComplete: function()
      {
        this.el.setStyle('overflow', '');
        this.el.setStyle('display', 'none');
      }.bind(this)
    });
    
    var consoleFx = $(this.doc.getElementById('scroller')).effects({
      duration: 300,
      transition: Fx.Transitions.linear,
      onComplete: function()
      {
        $(this.doc.getElementById('scroller')).removeClass('withActions');
      }.bind(this)
    });
    
    showFx.start({
      height: [22, 0]
    });
    consoleFx.start({
      top: [23, 0]
    });
  },

  
  updateMenu: function() {
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

ShiftSpace.Actions = new Actions();
