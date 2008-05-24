var Console = new Class({
  
  initialize: function(options) {
    this.shiftCount = 0;
    this.buildFrame();
  },
    
  /*
  
  Function: buildFrame
  Build the iframe that will hold the console.
  
  */
  buildFrame: function() {
    
    this.frame = new ShiftSpace.Element('iframe', {
      id: 'ShiftSpaceConsole',
      styles: {
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 150,
        overflow: 'hidden',
        'z-index': 1000001
      },
      events: {
        load: function() {
          // store a ref for convenience
          this.doc = this.frame.contentDocument;
          // create the model shift
          this.createShiftEntryModel();
          
          // load the style for document
          this.loadStyle();
          
          this.buildNotifier();
        }.bind(this)
      }
    });
    this.frame.injectInside(document.body);
    
    this.resizer = new ShiftSpace.Element('div', {
      'id': 'SSShiftConsoleResizer',
      'styles': 
      {
        position: 'fixed',
        bottom: 142,
        left: 25,
        height: 11,
        cursor: 'ns-resize',
        'z-index': 1000000
      }
    });
    this.resizer.injectInside(document.body);
    
    this.resizer.makeDraggable({
      limit: {
        x: [25, 25]
      },
      onStart: function() {
        this.startDrag = this.resizer.getPosition().y;
        this.startHeight = this.frame.getSize().size.y;
        // to prevent things from dropping into the iframe.
        this.resizeMask = new ShiftSpace.Element('div', {
          styles: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: window.getWidth(),
            height: window.getHeight(),
            'z-index': 1000001,
            cursor: 'ns-resize'
          }
        });
        this.resizeMask.injectInside(document.body);
      }.bind(this),
      onDrag: function() {
        var dy = this.resizer.getPosition().y - this.startDrag;
        this.frame.setStyle('height', this.startHeight - dy);
        this.refresh();
      }.bind(this),
      onComplete: function() {
        this.resizeMask.remove();
      }.bind(this)
    });
  },
    
  buildNotifier: function() {

    this.notifier = new ShiftSpace.Element('div', {
      styles: {
        position: 'fixed',
        bottom: -32,
        left: 31,
        background: 'transparent url(' + server + 'images/Console/notifier-bg.png) no-repeat',
        width: 30,
        height: 32
      }
    });
    
    // make the console resizable
    this.frame.makeResizable({
      handle: this.notifier,
      modifiers: {x: null, y:'top'}
    });
        
    var img = new ShiftSpace.Element('img', {
      src: server + 'images/Console/notifier-icon.png',
      alt: 'ShiftSpace'
    });
    img.injectInside(this.notifier);
    this.notifier.injectInside(document.body);
    
    this.notifierFx = new Fx.Style(this.notifier, 'bottom', {
      duration: 800,
      transition: Fx.Transitions.Quad.easeOut
    });

    this.notifier = new ShiftSpace.Element('div', {
      styles: {
        position: 'fixed',
        bottom: -32,
        left: 31,
        background: 'transparent url(' + server + 'images/Console/notifier-bg.png) no-repeat',
        width: 30,
        height: 32
      }
    });

    var img = new ShiftSpace.Element('img', {
      src: server + 'images/Console/notifier-icon.png',
      alt: 'ShiftSpace'
    });
    img.injectInside(this.notifier);
    this.notifier.injectInside(document.body);

    this.notifierFx = new Fx.Style(this.notifier, 'bottom', {
      duration: 800,
      transition: Fx.Transitions.Quad.easeOut
    });

    // Call private console is ready function
    consoleIsReady();
  },
    
  /*
  
  Function: buildPluginMenu
  Builds the plug-in menu for the console.
  
  */
  buildPluginMenu: function()
  {
    // the tab connecting the icon to the menu
    this.pluginMenuTab = $(this.doc.createElement('div'));
    this.pluginMenuTab.setProperty('id', "SSConsolePluginMenuTab");
    this.pluginMenuTabIcon = $(this.doc.createElement('div'));
    this.pluginMenuTabIcon.addClass('SSPluginMenuTabIcon SSUserSelectNone');
    this.pluginMenuTabIcon.injectInside(this.pluginMenuTab);
    
    this.pluginMenu = $(this.doc.createElement('div'));
    this.pluginMenu.setProperty('id', 'SSConsolePluginMenu');
    this.pluginMenu.addClass('SSMenu SSUserSelectNone');
    
    this.topItem = $(this.doc.createElement('div'));
    this.topItem.addClass('SSMenuTopItem');
    this.topItem.addClass('item');
    this.topItem.setHTML("<div class='SSLeft'><span>Top Item</span></div><div class='SSRight'></div>");
    
    this.middleItem = $(this.doc.createElement('div'));
    this.middleItem.addClass('SSMenuItem');
    this.middleItem.addClass('item');
    this.middleItem.setHTML("<div class='SSLeft'><span>Middle Item</span></div><div class='SSRight'></div>");
    
    this.menuItemModel = this.middleItem.clone(true);
    
    this.bottomItem = $(this.doc.createElement('div'));
    this.bottomItem.addClass('SSMenuBottomItem');
    this.bottomItem.addClass('item');
    this.bottomItem.setHTML("<div class='SSLeft'><span>Bottom Item</span></div><div class='SSRight'></div>");
    
    this.topItem.injectInside(this.pluginMenu);
    this.middleItem.injectInside(this.pluginMenu);
    this.bottomItem.injectInside(this.pluginMenu);
    
    this.pluginMenuTab.addClass('SSDisplayNone');
    this.pluginMenu.addClass('SSDisplayNone');

    this.pluginMenuTab.injectInside(this.doc.body);
    this.pluginMenu.injectInside(this.doc.body);
    
    // handle closing the plugin menu if anything else gets clicked
    $(this.doc.body).addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      var target = $(evt.target);
      
      if(!target.hasClass('plugin') &&
         !$(this.pluginMenu).hasChild(target))
      {
        this.hidePluginMenu();
      }
    }.bind(this));
    
    loadStyle('styles/ShiftSpace.css', null, this.frame );
  },
  
  /*
    Function: setPluginMenuItems
      Set the items for the plugin menu.
  */
  setPluginMenuItems: function(shiftId, itemsAndActions)
  {
    if(!itemsAndActions.delayed)
    {
      // remove all the menu items
      $(this.pluginMenu).getElements('.SSMenuItem').each(function(x) {x.remove();});

      for(var i = 0; i < itemsAndActions.length; i++)
      {
        var txt = itemsAndActions[i].text;
        var cb = itemsAndActions[i].callback;
      
        //console.log(cb);
      
        if(i == 0)
        {
          this.pluginMenu.getElement('.SSMenuTopItem span').setText(txt);
          this.topItem.removeEvents();
          this.topItem.addEvent('click', cb.bind(null, shiftId));
        }
        else if(i == itemsAndActions.length-1)
        {
          this.pluginMenu.getElement('.SSMenuBottomItem span').setText(txt);
          this.bottomItem.removeEvents();
          this.bottomItem.addEvent('click', cb.bind(null, shiftId));
        }
        else
        {
          var newItem = this.menuItemModel.clone(true);
        
          newItem.getElement('span').setText(txt);
          newItem.removeEvents();
          newItem.addEvent('click', cb.bind(null, shiftId));

          newItem.injectBefore(this.pluginMenu.getElement('.SSMenuBottomItem'));
        }
      }
    }
    else
    {
      // remove all the menu items
      $(this.pluginMenu).getElements('.SSMenuItem').each(function(x) {x.remove();});
      
      // show a loading menu
      this.pluginMenu.getElement('.SSMenuTopItem span').setText("One moment");
      this.topItem.removeEvents();
      this.pluginMenu.getElement('.SSMenuBottomItem span').setText("loading...");
      this.bottomItem.removeEvents();
    }
  },
  
  pluginLoaded: function(plugin)
  {
    // better
  },
  
  plugInActionForItem: function(item)
  {
    // better
  },
  
  /*
    Function: showPluginMenu
      Show the plugin menu.
  */
  showPluginMenu: function(plugin, anchor)
  {
    var pos = $(anchor).getPosition([$(this.doc.getElementById('scroller'))]);
    var size = $(anchor).getSize().size;
    
    var pluginMenu = $(this.pluginMenu);
    var pluginMenuTab = $(this.pluginMenuTab);
    var pluginMenuTabIcon = $(this.pluginMenuTabIcon)
    
    pluginMenuTabIcon.addClass(plugin.menuIcon());

    pluginMenuTab.setStyles({
      left: pos.x-3,
      top: pos.y-3
    });
    pluginMenu.setStyles({
      left: pos.x-13, 
      top: pos.y + size.y
    });
    
    pluginMenu.removeClass('SSDisplayNone');
    pluginMenuTab.removeClass('SSDisplayNone');
  },
  
  /*
    Function: hidePluginMenu
      Hide the plugin menu.
  */
  hidePluginMenu: function()
  {
    this.pluginMenu.addClass('SSDisplayNone');
    this.pluginMenuTab.addClass('SSDisplayNone');
  },
  
  showNotifier: function() {
    if (this.cancelNotifier) {
      if (pendingShifts) {
        pendingShifts = 0;
        loadShifts();
      }
    } else {
      this.notifierFx.start(-32, 0).chain(function() {
        if (pendingShifts) {
          pendingShifts = 0;
          loadShifts();
        }
        this.hideNotifier.delay(3000, this);
      }.bind(this));
    }
    this.hideNotifier.delay(3000, this);
  },
  
  hideNotifier: function() {
    if (!this.cancelNotifier) {
      this.cancelNotifier = true;
      this.notifierFx.start(0, -32);
    }
  },
  
  
  /*
    Function : loadStyle
      Load the style for console.
  */
  loadStyle: function() {
    // TODO - Fix loadStyle to accept target frame to do this crap
    /* Load console styles */
    loadStyle('styles/Console.css', function() {
      this.buildContents();
      /* Load all plugin styles */
      for(plugin in installedPlugins)
      {
        loadStyle('plugins/'+plugin+'/'+plugin+'.css', null, this.frame );
      }
      loadStyle('styles/ShiftSpace.css', this.buildPluginMenu.bind(this), this.frame );
    }.bind(this), this.frame );
  },
  
  /*
  
  Function: buildContents
  Builds the console area.
  
  */
  buildContents: function() {
    var content = $(this.doc.createElement('div'));
    content.setAttribute('id', 'console');
    content.setHTML('<div class="outer"><div class="inner">' +
                    '<div id="top"><div id="tabs" class="SSUserSelectNone">' +
                    '<div id="controls">' +
                    '<div class="button auth"><div class="image"></div></div>' +
                    '<div class="button bugs"><div class="image"></div></div>' +
                    '<div class="button hide"><div class="image"></div></div>' +
                    '<br class="clear" />' +
                    '</div>' +
                    '<br class="clear" />' +
                    '</div></div></div></div>' +
                    '<div class="left"><div class="right">' +
                    '<div id="bottom"><div id="scroller"></div></div>' +
                    '</div></div>');
    content.injectInside(this.doc.body);
    
    var controls = $(this.doc.getElementById('controls'));
    var auth = controls.getElement('.auth');
    auth.addEvent('mouseover', function() {
      auth.addClass('hover');
    });
    auth.addEvent('mouseout', function() {
      auth.removeClass('hover');
    });
    auth.addEvent('click', function() {
      if (ShiftSpace.user.getUsername()) {
        ShiftSpace.user.logout();
      } else {
        this.showTab('login');
      }
      this.setupAuthControl();
    }.bind(this));
    this.setupAuthControl();
    
    this.addTab('shifts', '0 shifts');
    this.addTab('settings', 'Settings', 'icon-settings.gif');
    if (!ShiftSpace.user.getUsername()) {
      this.addTab('login', 'Login');
    }
    this.buildLogin();
    this.buildSettings();
    this.showTab('shifts');
  },
  
  setupAuthControl: function() {
    var controls = $(this.doc.getElementById('controls'));
    var auth = controls.getElement('.auth');
    if (ShiftSpace.user.getUsername()) {
      auth.removeClass('login');
      auth.addClass('logout');
      auth.setAttribute('title', 'Logout');
    } else {
      auth.removeClass('logout');
      auth.addClass('login');
      auth.setAttribute('title', 'Login');
    }
  },
  
  buildSettings: function() {
    var settingsDiv = this.getTab('settings');
    
    /* Install a Space */
    var installSpace = new Element('input', {
      type: "text"
    });
    installSpace.injectInside(settingsDiv);
    
    var installSpaceButton = new Element('input', {
      type: "button"
    });
    
    installSpaceButton.addEvent('click', function() {
      ShiftSpace.installSpace(installSpace.getProperty('value'));
    });
    
    installSpaceButton.setProperty('value', 'Install Space');
    installSpaceButton.injectInside(settingsDiv);
    
    /* Uninstall a Space */
    var uninstallSpace = new Element('input', {
      type: "text"
    });
    uninstallSpace.injectInside(settingsDiv);
    
    var uninstallSpaceButton = new Element('input', {
      type: "button"
    });
    
    uninstallSpaceButton.addEvent('click', function() {
      ShiftSpace.uninstallSpace(uninstallSpace.getProperty('value'));
    });
    
    uninstallSpaceButton.setProperty('value', 'Uninstall Space');
    uninstallSpaceButton.injectInside(settingsDiv);
    
    var spaceListLabel = new Element('h');
    spaceListLabel.setText('Installed Spaces');
    spaceListLabel.injectInside(settingsDiv);

    var spaceList = new Element('ul', {
      'class': "ConsoleSettingsSpaceList"
    });

    // make the installed space list
    for(space in installed)
    {
      var listItem = new Element('li', {
        'class': "ConsoleSettingsSpaceListItem"
      });
      listItem.setText(space);
      listItem.injectInside(spaceList);
    }
    spaceList.injectInside(settingsDiv);
  },
  
  addTab: function(id, label, icon) {
    var br = this.doc.getElementById('tabs').getElementsByTagName('br')[1];
    var tab = $(this.doc.createElement('div'));
    tab.setAttribute('id', 'tab-' + id);
    tab.className = 'tab';
    var inner = $(this.doc.createElement('div'));
    inner.className = 'tab-inner';
    
    if (typeof icon != 'undefined') {
      var labelNode = $(this.doc.createElement('div'));
      labelNode.setHTML(label);
      labelNode.setStyles({
        background: 'transparent url(' + server + 'images/Console/' + icon + ') no-repeat 0 3px',
        padding: '0 0 0 18px'
      });
      labelNode.injectInside(inner);
    } else {
      inner.setHTML(label);
    }
    
    inner.injectInside(tab);
    tab.injectBefore(br);
    tab.addEvent('click', this.clickTab.bind(this));
    
    return this.addPane(id);
  },
  
  addPane: function(id) {
    if (!this.doc.getElementById(id)) {
      var content = $(this.doc.createElement('div'));
      content.setAttribute('id', id);
      content.className = 'content';
      content.injectInside(this.doc.getElementById('scroller'));
      return content;
    }
    return $(this.doc.getElementById(id));
  },
  
  getTab: function(tabname) {
    return $(this.doc.getElementById(tabname));
  },
  
  clickTab: function(e) {
    var id = e.currentTarget.getAttribute('id').substr(4);
    this.showTab(id);
  },
  
  showTab: function(id) {
    var body = $(this.doc.body);
    var tab = body.getElement('#tabs .active');
    // close the plugin menu if open
    if(this.pluginMenu && !$(this.pluginMenu).hasClass('SSDisplayNone')) this.pluginMenu.addClass('SSDisplayNone');
    if (tab) {
      tab.removeClass('active');
    }
    var content = body.getElement('#scroller .active');
    if (content) {
      content.removeClass('active');
    }
    $(this.doc.getElementById('tab-' + id)).addClass('active');
    $(this.doc.getElementById(id)).addClass('active');
  },
  
  removeTab: function(id) {
    var tab = $(this.doc.getElementById('tab-' + id));
    tab.remove();
  },
  
  buildLogin: function() {
    this.addPane('login');
    var sections = this.createSubSections('login', ['Login', 'Sign up']);
    sections[0].setHTML('<form action="http://shiftspace.org/login" method="post">' +
                        '<div class="form-column">' +
                        '<label for="username">Username</label>' +
                        '<input type="text" name="username" id="username" class="text" />' +
                        '<label for="password">Password</label>' +
                        '<input type="password" name="password" id="password" class="text float-left" />' +
                        '<input type="submit" value="Login" class="button float-left" />' +
                        '<br class="clear" />' +
                        '</div>' +
                        '<br class="clear" />' +
                        '<div id="login_response" class="response"></div>' +
                        '</form>');
    sections[0].getElement('form').addEvent('submit', function(e) {
      new Event(e).preventDefault();
      var credentials = {
        username: this.doc.getElementById('username').value,
        password: this.doc.getElementById('password').value
      };
      ShiftSpace.user.login(credentials, this.handleLogin.bind(this));
    }.bind(this));
    sections[1].setHTML('<form action="http://shiftspace.org/join" method="post">' +
                        '<div class="form-column">' +
                        '<label for="join_username">Username</label>' +
                        '<input type="text" name="username" id="join_username" class="text" />' +
                        '<label for="email">E-mail address</label>' +
                        '<input type="text" name="email" id="email" class="text" />' +
                        '</div><div class="form-column">' +
                        '<label for="join_password">Password</label>' +
                        '<input type="password" name="password" id="join_password" class="text" />' +
                        '<label for="password_again">Password again</label>' +
                        '<input type="password" name="password_again" id="password_again" class="text float-left" />' +
                        '<input type="submit" value="Sign up" class="button float-left" />' +
                        '<br class="clear" />' +
                        '</div>' +
                        '<br class="clear" />' +
                        '<div id="join_response" class="response"></div>' +
                        '</form>');
    sections[1].getElement('form').addEvent('submit', function(e) {
      //console.log('submit');
      new Event(e).preventDefault();
      var joinInput = {
        username: this.doc.getElementById('join_username').value,
        email: this.doc.getElementById('email').value,
        password: this.doc.getElementById('join_password').value,
        password_again: this.doc.getElementById('password_again').value
      };
      ShiftSpace.user.join(joinInput, this.handleJoin.bind(this));
    }.bind(this));
  },
  
  buildWelcome: function() {
    var pane = this.addPane('welcome');
    pane.setHTML('Welcome!');
  },
  
  handleLogin: function(json) {
    if (json.status) {
      this.showTab('shifts');
      this.removeTab('login');
      this.setupAuthControl();
      this.resetLogin();
    } else {
      this.showResponse('login_response', json.message);
    }
  },
  
  handleJoin: function(json) {
    if (json.status) {
      this.buildWelcome();
      this.showTab('welcome');
      this.removeTab('login');
      this.setupAuthControl();
      this.resetJoin();
    } else {
      this.showResponse('join_response', json.message);
    }
  },
  
  resetLogin: function() {
    $(this.doc.getElementById('username')).value = '';
    $(this.doc.getElementById('password')).value = '';
    $(this.doc.getElementById('login_response')).setHTML('');
  },
  
  resetJoin: function() {
    $(this.doc.getElementById('join_username')).value = '';
    $(this.doc.getElementById('email')).value = '';
    $(this.doc.getElementById('join_password')).value = '';
    $(this.doc.getElementById('password_again')).value = '';
    $(this.doc.getElementById('join_response')).setHTML('');
  },
  
  showResponse: function(target, message) {
    if (this.frame.getSize().size.y < 175) {
      this.frame.setStyle('height', 175);
      this.refresh();
    }
    $(this.doc.getElementById(target)).setHTML(message);
  },
  
  createSubSections: function(target, sections) {
    var tabs = '';
    var content = '';
    var nodes = [];
    
    for (var i = 0; i < sections.length; i++) {
      var activeTab = (i == 0) ? ' subtab-active' : '';
      var activeSection = (i == 0) ? ' subsection-active' : '';
      tabs += '<div id="subtab-' + target + i + '" class="subtab' + activeTab + '">' + sections[i] + '</div>';
      content += '<div id="subsection-' + target + i + '" class="subsection' + activeSection + '"></div>';
    }
    
    var holder = $(this.doc.getElementById(target));
    holder.setHTML('<div class="subtabs">' +
                   '<div class="subtabs-inner">' + tabs + '</div>' +
                   '</div>' +
                   '<div class="subsections">' + content + '</div>' +
                   '<br class="clear" />');
    holder.getElements('.subtab').each(function(subtab) {
      subtab.addEvent('click', function(e) {
        var active = holder.getElement('.subtab-active');
        if (active) {
          active.removeClass('subtab-active');
        }
        var above = holder.getElement('.subtab-above');
        if (above) {
          above.removeClass('subtab-above');
        }
        var subsection = holder.getElement('.subsection-active');
        if (subsection) {
          subsection.removeClass('subsection-active');
        }
        $(e.currentTarget).addClass('subtab-active');
        if (e.currentTarget.previousSibling) {
          $(e.currentTarget.previousSibling).addClass('subtab-above');
        }
        var id = e.currentTarget.getAttribute('id').substr(7);
        holder.getElement('#subsection-' + id).addClass('subsection-active'); 
      });
    });
    return holder.getElements('.subsection');
  },
  
  
  /*
  
  Function: refresh
  Resize the content area.
  
  */
  refresh: function() {
    if (!this.doc || !this.doc.getElementById('top')) {
      // Need to wait a moment longer while things are being built
      if(this.resize) setTimeout(this.resize.bind(this), 50);
    } else {
      var top = $(this.doc.getElementById('top').parentNode);
      var bottom = $(this.doc.getElementById('bottom'));
      bottom.setStyle('height', this.frame.getSize().size.y -
                                top.getSize().size.y);
    }
    this.resizer.setStyle('width', window.getWidth() - 50);
    this.notifierFx.stop();
    this.notifierFx.set(this.frame.getSize().size.y - 4);
  },
  
  
  /*
  
  Function: show
  Show the console.
  
  */
  show: function() {
      this.cancelNotifier = true;
      this.frame.setStyle('display', 'block');
      this.refresh();
      if (pendingShifts > 0) {
          pendingShifts = 0;
          loadShifts();
      }
  },
  
  
  /*
  
  Function: hide
  Hide the console.
  
  */
  hide: function() {
    this.frame.setStyle('display', 'none');
    this.notifierFx.set(-32);
    
    this.hidePluginMenu();
  },
  
  isVisible: function() 
  {
    return (this.frame.getStyle('display') == 'block');
  },
  
  
  /*
  
  Function: loadShifts
  Adds a collection of shifts to the console
      
  Parameters:
      shifts - An object containing the shifts to be added, keyed by shiftId
  
  */
  addShifts: function(shifts) {
    for (var shiftId in shifts) {
      var shift = shifts[shiftId];
      this.addShift(shift);
    }
  },
  
  showShift: function(id) {
    var el = $(this.doc.getElementById('shifts')).getElement('#' + id);
    if(el) 
    {
      el.addClass('active');
      el.addClass('SSUserSelectNone');
      el.getElement('.summaryEdit').addClass('SSDisplayNone');
      el.getElement('.summaryView').removeClass('SSDisplayNone');
    }
  },

  hideShift: function(id) {
    var el = $(this.doc.getElementById('shifts')).getElement('#' + id);
    if(el)
    {
      el.removeClass('active');
      el.addClass('SSUserSelectNone');
      el.getElement('.summaryEdit').addClass('SSDisplayNone');
      el.getElement('.summaryView').removeClass('SSDisplayNone');
    }
  },
  
  updateShift: function(shiftJson) {
    //console.log('updateshift');
    //console.log(shiftJson);
    var entry = $(this.doc.getElementById('shifts')).getElement('#' + shiftJson.id);
    entry.getElement('.summary').getElement('.summaryView').setHTML(shiftJson.summary);
    entry.getElement('.user').setHTML(shiftJson.username);
  },
  
  
  /*
  
  Function: addShift
  Adds a shift to the console.
  
  */
  addShift: function(aShift, isActive) {
    // clone a model shift
    var newEntry = $(this.modelShiftEntry.clone(true));
    
    var controls = newEntry.getElement('.controls');
    
    var icon = ShiftSpace.info(aShift.space).icon;
    var img = newEntry.getElement('.expander img');
    
    newEntry.setProperty('id', aShift.id);
    newEntry.getElement('.spaceTitle').setHTML(aShift.space);
    newEntry.getElement('.spaceTitle').setStyle('background', 'transparent url(' + icon + ') no-repeat 3px 1px');
    newEntry.getElement('.summary').getElement('.summaryView').setHTML(aShift.summary);
    newEntry.getElement('.summary').getElement('.summaryEdit').setProperty('value', aShift.summary);
    newEntry.getElement('.user').setHTML(aShift.username);
    
    newEntry.getElement('.SSPermaLink').setProperty('href', ShiftSpace.info().server+'sandbox?id=' + aShift.id);
    
    newEntry.addEvent('mouseover', function() {
      if (!newEntry.hasClass('active') && !newEntry.hasClass('expanded')) 
      {
        newEntry.addClass('hover');
      }
    });
    
    newEntry.addEvent('mouseout', function() {
        newEntry.removeClass('hover');
    });
    
    // Show this shift on click
    newEntry.addEvent('click', function() {
      if (!newEntry.hasClass('active')) 
      {
        ShiftSpace.showShift(aShift.id);
        newEntry.addClass('active');
      } 
      else 
      {
        ShiftSpace.hideShift(aShift.id);
        newEntry.removeClass('active');
      }
    });
    
    var slideFx = new Fx.Slide($(controls), {
        duration: 250
    });
    slideFx.hide();
    
    newEntry.getElement('.expander').addEvent('click', function(e) {
      var event = new Event(e);
      event.stop();
      slideFx.toggle();
      if (!newEntry.hasClass('expanded')) 
      {
        newEntry.addClass('expanded');
        newEntry.removeClass('hover');
        newEntry.getElement('.expander img').setProperty('src', server + 'images/Console/arrow-open.gif');
      } 
      else 
      {
        newEntry.removeClass('expanded');
        newEntry.addClass('hover');
        newEntry.getElement('.expander img').setProperty('src', server + 'images/Console/arrow-close.gif')
      }
    });
    
    controls.addEvent('click', function(e) {
      var event = new Event(e);
      event.stopPropagation();
    });
    
    newEntry.getElement('.controls a.delete').addEvent('click', function(e) {
      var event = new Event(e);
      event.preventDefault();
      if (confirm('Are you sure you want to delete that? There is no undo.')) 
      {
        deleteShift(aShift.id);
      }
    });
    
    // Shift Editing from console
    newEntry.getElement('.controls a.edit').addEvent('click', function(e) {
      var event = new Event(e);
      event.preventDefault();
      ShiftSpace.showShift(aShift.id);
      editShift(aShift.id);
      
      if(SSUserCanEditShift(aShift.id))
      {
        newEntry.removeClass('SSUserSelectNone');
        newEntry.getElement('.summaryView').addClass('SSDisplayNone');
        newEntry.getElement('.summaryEdit').removeClass('SSDisplayNone');
      }
    });
    
    // Event for the title edit input field
    newEntry.getElement('.summaryEdit').addEvent('keyup', function(_evt) {
      var evt = new Event(_evt);
      if(evt.key == 'enter')
      {
        console.log('Update shift!');
        newEntry.getElement('.summaryView').setHTML($(evt.target).getProperty('value'));
        this.showShift(aShift.id);
        // defined in Core - David
        updateTitleOfShift(aShift.id, evt.target.getProperty('value'));
      }
    }.bind(this));
    newEntry.getElement('.summaryEdit').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      evt.stop();
    });
    
    // check for the plugin type
    // TODO: remove this closure - David
    for(plugin in installedPlugins)
    {
      if(plugins[plugin])
      {
        var pluginDiv = $(this.doc.createElement('div'));
        pluginDiv.addClass('plugin');
        pluginDiv.addClass('pg'+plugin); // tag with plugin name

        pluginDiv.addClass(plugins[plugin].menuIconForShift(aShift.id));
        pluginDiv.addEvent('click', function(_evt) {
          var evt = new Event(_evt);
          var target = evt.target;
          // prevent the click from triggering item selection in console
          evt.stop();

          console.log('addEvent!');

          // in case it's delayed
          var cb = function(menuItems) {
            this.setPluginMenuItems(aShift.id, menuItems);
          }.bind(this);
          this.setPluginMenuItems(aShift.id, plugins[plugin].menuForShift(aShift.id, cb));

          this.showPluginMenu(plugins[plugin], target);
        }.bind(this));
        
        pluginDiv.inject(newEntry.getElement('.pluginIcons'));
      }
      else
      {
        // defer loading this item
        console.log('========================================== Deferred load for ' + aShift.id);
      }
    }
    
    // add it
    if (isActive) 
    {
      newEntry.injectTop($(this.doc.getElementById('shifts')));
      newEntry.addClass('active');
    } 
    else 
    {
      newEntry.injectInside($(this.doc.getElementById('shifts')));
    }
    
    this.shiftCount++;
    this.updateCount();
  },
  
  updateCount : function()
  {
    var doc = this.frame.contentDocument;
    var shiftTab = $(doc.getElementById('tab-shifts')).getElement('.tab-inner');
    shiftTab.setHTML(this.shiftCount + " shifts");
  },
  
  removeShift: function(shiftId) {
    $(this.doc.getElementById('shifts')).getElement('#' + shiftId).remove();
    this.shiftCount--;
    this.updateCount();
  },
  
  createShiftEntryModel: function() {
    var shiftEntry = $(this.doc.createElement('div'));
    shiftEntry.className = 'entry SSUserSelectNone';
    
    // ---------------- Expander ----------------------- //
    var expanderDiv = $(this.doc.createElement('div'));
    expanderDiv.className = 'expander column';
    
    var expanderImg = $(this.doc.createElement('img'));
    expanderImg.setProperty('src', server + 'images/Console/arrow.gif');
    expanderImg.injectInside(expanderDiv);
    
    // ------------------ Space ------------------------- //
    var spaceDiv = $(this.doc.createElement('div'));
    spaceDiv.className = 'space column';
    
    spaceTitle = $(this.doc.createElement('div'));
    spaceTitle.className = 'spaceTitle';
    spaceTitle.injectInside(spaceDiv);
    
    // ------------------- Plugins ------------------------- //
    var plugins = $(this.doc.createElement('div'));
    plugins.addClass('pluginIcons');
    plugins.injectInside(spaceDiv);
    
    // ------------------- Summary ------------------------- //
    var summaryDiv = $(this.doc.createElement('div'));
    summaryDiv.className = 'summary column';

    var summaryView = $(this.doc.createElement('span'));
    summaryView.setProperty('type', 'text');
    summaryView.setProperty('class', 'summaryView');
    summaryView.injectInside(summaryDiv);

    var summaryEdit = $(this.doc.createElement('input'));
    summaryEdit.setProperty('type', 'text');
    summaryEdit.addClass('summaryEdit');
    summaryEdit.addClass('SSDisplayNone');
    summaryEdit.injectInside(summaryDiv);
    
    // ------------------- User ---------------------------- //
    var userDiv = $(this.doc.createElement('div'));
    userDiv.className = 'user column';
    
    // ------------------- Posted -------------------------- //
    var postedDiv = $(this.doc.createElement('div'));
    postedDiv.className = 'posted cell';
    postedDiv.setHTML('Just posted');
    
    // ------------------- Clear --------------------------- //
    var clear = $(this.doc.createElement('div'));
    clear.className = 'clear';
    
    // ------------------- Controls ------------------------ //
    var controls = $(this.doc.createElement('div'));
    controls.className = 'controls';
    // check to see if the the user matches
    var controlOptions = 'Currently, all you can do is <a href="#delete" class="delete">delete this shift</a> or <a href="#edit" class="edit">edit this shift</a>, <a target="new" class="SSPermaLink">permalink</a>';
    controls.innerHTML = controlOptions;
    
    // -------------------- Build the entry ---------------- //
    expanderDiv.injectInside(shiftEntry);
    spaceDiv.injectInside(shiftEntry);
    summaryDiv.injectInside(shiftEntry);
    userDiv.injectInside(shiftEntry);
    postedDiv.injectInside(shiftEntry);
    clear.injectInside(shiftEntry);
    controls.injectInside(shiftEntry);
    
    // store the model
    this.modelShiftEntry = shiftEntry;
  },
  
  createLogInForm : function()
  {
    
  }
  
});

// add events to the console
Console.implement(new Events);

ShiftSpace.Console = new Console();