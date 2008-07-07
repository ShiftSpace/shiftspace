var Console = new Class({
  
  initialize: function(options) {
    this.shiftCount = 0;
    //console.log('Console buildFrame');
    this.buildFrame();
  },
    
  /*
  
  Function: buildFrame
  Build the iframe that will hold the console.
  
  */
  buildFrame: function() {
    //var consoleHeight = getValue('console.height', 150);
    var consoleHeight = 150;
    this.frame = new ShiftSpace.Iframe({
      id: 'ShiftSpaceConsole',
      addCover: false,
      styles: 
      {
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: consoleHeight,
        overflow: 'hidden',
        'z-index': 1000001
      },
      onload: function() 
      {
        //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>> frame loaded');
        // store a ref for convenience
        this.doc = this.frame.contentDocument;
        
        //console.log('createShiftEntryModel');
        // create the model shift
        this.createShiftEntryModel();
        //console.log('done createShiftEntryModel');

        // load the style for document
        //console.log('load console frame style');
        this.loadStyle();

        this.doc.addEventListener('keydown',  keyDownHandler.bind(ShiftSpace), false);
        this.doc.addEventListener('keyup',    keyUpHandler.bind(ShiftSpace), false);
        this.doc.addEventListener('keypress', keyPressHandler.bind(ShiftSpace), false);

      }.bind(this)
    });
    //console.log('frame injecting');
    this.frame.injectInside(document.body);
    //console.log('finished frame injecting');
    
    //console.log('creating resizer');
    this.resizer = new ShiftSpace.Element('div', {
      'id': 'SSShiftConsoleResizer',
      'styles': 
      {
        position: 'fixed',
        /*bottom: getValue('console.height', 150) - 8,*/
        bottom: 142,
        left: 25,
        height: 11,
        cursor: 'ns-resize',
        'z-index': 1000002
      }
    });
    //console.log('injecting resizer');
    this.resizer.injectInside(document.body);
    //console.log('done injecting resizer');
    
    //console.log('test resizer getStyle top: ' + this.resizer.getStyle('top'));

    //console.log('making resizer draggable');
    this.resizer.makeDraggable({
      limit: 
      {
        x: [25, 25]
      },
      onStart: function() 
      {
        this.startDrag = this.resizer.getPosition().y;
        this.startHeight = this.frame.getSize().size.y;
        // to prevent things from dropping into the iframe.
        this.resizeMask = new ShiftSpace.Element('div', {
          styles: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            'z-index': 1000001,
            cursor: 'ns-resize'
          }
        });
        this.resizeMask.injectInside(document.body);
      }.bind(this),
      
      onDrag: function() 
      {
        var dy = this.resizer.getPosition().y - this.startDrag;
        this.frame.setStyle('height', this.startHeight - dy);
        this.refresh();
      }.bind(this),
      
      onComplete: function() {
        this.resizeMask.remove();
        //setValue('console.height', parseInt(this.frame.getStyle('height')));
      }.bind(this)
      
    });
    //console.log('frame built');
  },
    
  buildNotifier: function() {

    this.notifier = new ShiftSpace.Element('div', {
      'class': 'SSConsoleNotifier'
    });
    
    // make the console resizable
    this.frame.makeResizable({
      handle: this.notifier,
      modifiers: {x: null, y:'top'}
    });
        
    var img = new ShiftSpace.Element('img', {
      src: server + 'images/Console/notifier-icon.png',
      alt: 'ShiftSpace',
      styles: {
        cursor: 'pointer'
      }
    });
    img.injectInside(this.notifier);
    this.notifier.injectInside(document.body);
    
    img.addEvent('click', function() {
      if (!this.isVisible()) {
        this.show();
      } else if (parseInt(this.frame.getStyle('height')) == 0) {
        //this.frame.setStyle('height', getValue('console.height', 150));
        this.frame.setStyle('height', 150);
        this.refresh();
      } else {
        this.minimize();
      }
    }.bind(this));
    
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
    this.pluginMenuTab = new ShiftSpace.Element('div');
    this.pluginMenuTab.setProperty('id', "SSConsolePluginMenuTab");
    this.pluginMenuTabIcon = new ShiftSpace.Element('div');
    this.pluginMenuTabIcon.addClass('SSPluginMenuTabIcon SSUserSelectNone');
    this.pluginMenuTabIcon.injectInside(this.pluginMenuTab);
    
    this.pluginMenu = new ShiftSpace.Element('div');
    this.pluginMenu.setProperty('id', 'SSConsolePluginMenu');
    this.pluginMenu.addClass('SSMenu SSUserSelectNone');
    
    this.topItem = new ShiftSpace.Element('div');
    this.topItem.addClass('SSMenuTopItem');
    this.topItem.addClass('item');
    this.topItem.setHTML("<div class='SSLeft'><span>Top Item</span></div><div class='SSRight'></div>");
    
    this.middleItem = new ShiftSpace.Element('div');
    this.middleItem.addClass('SSMenuItem');
    this.middleItem.addClass('item');
    this.middleItem.setHTML("<div class='SSLeft'><span>Middle Item</span></div><div class='SSRight'></div>");
    
    this.menuItemModel = this.middleItem.clone(true);
    
    this.bottomItem = new ShiftSpace.Element('div');
    this.bottomItem.addClass('SSMenuBottomItem');
    this.bottomItem.addClass('item');
    this.bottomItem.setHTML("<div class='SSLeft'><span>Bottom Item</span></div><div class='SSRight'></div>");
    
    this.topItem.injectInside(this.pluginMenu);
    this.middleItem.injectInside(this.pluginMenu);
    this.bottomItem.injectInside(this.pluginMenu);
    
    this.pluginMenuTab.addClass('SSDisplayNone');
    this.pluginMenu.addClass('SSDisplayNone');

    this.pluginMenuTab.injectInside(document.body);
    this.pluginMenu.injectInside(document.body);
    
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
  setPluginMenuItems: function(shiftId, _itemsAndActions)
  {
    var itemsAndActions = _itemsAndActions;
    
    console.log('itemsAndActions');
    console.log(itemsAndActions);
    
    if(!itemsAndActions.delayed)
    {
      // remove all the menu items
      $(this.pluginMenu).getElements('.SSMenuItem').each(function(x) {x.remove();});

      for(var i = 0; i < itemsAndActions.length; i++)
      {
        // default enabled to true
        var cia = $merge({enabled:true}, itemsAndActions[i]);
        
        var txt = cia.text;
        var cb = cia.callback;
        var enabled = cia.enabled;
      
        var span;
        if(i == 0)
        {
          span = this.pluginMenu.getElement('.SSMenuTopItem span');
          
          this.topItem.removeEvents();
          this.topItem.addEvent('click', cb.bind(null, shiftId));
        }
        else if(i == itemsAndActions.length-1)
        {
          span = this.pluginMenu.getElement('.SSMenuBottomItem span');

          this.bottomItem.removeEvents();
          this.bottomItem.addEvent('click', cb.bind(null, shiftId));
        }
        else
        {
          var newItem = this.menuItemModel.clone(true);
        
          span = newItem.getElement('span');

          newItem.removeEvents();
          newItem.addEvent('click', cb.bind(null, shiftId));
          newItem.injectBefore(this.pluginMenu.getElement('.SSMenuBottomItem'));
        }
        
        span.setText(txt);
        if(!enabled) 
        {
          span.addClass('SSDisabledMenuItem');
        }
        else
        {
          span.removeClass('SSDisabledMenuItem');
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
    var framePos = this.frame.getPosition();
    var frameSize = this.frame.getSize().size;
    var size = $(anchor).getSize().size;
    
    var pluginMenu = $(this.pluginMenu);
    var pluginMenuTab = $(this.pluginMenuTab);
    var pluginMenuTabIcon = $(this.pluginMenuTabIcon)
    
    pluginMenuTabIcon.addClass(plugin.menuIcon());

    pluginMenuTab.setStyles({
      left: pos.x-3,
      /*top: pos.y-3+framePos.y*/
      bottom: frameSize.y-pos.y+2-19
    });
    pluginMenu.setStyles({
      left: pos.x-60, 
      bottom: frameSize.y-pos.y+2
    });
    
    pluginMenu.removeClass('SSDisplayNone');
    pluginMenuTab.removeClass('SSDisplayNone');
  },
  
  showPluginMenuForShift: function(plugin, shiftId)
  {
    var target = _$(this.doc.getElementById(shiftId)).getElementByClassName('pg' + plugin);
    // in case it's delayed
    var cb = function(menuItems) {
      this.setPluginMenuItems(shiftId, menuItems);
    }.bind(this);
    this.setPluginMenuItems(shiftId, plugins[plugin].menuForShift(shiftId, cb));
    this.showPluginMenu(plugins[plugin], target);
  },
  
  /*
    Function: hidePluginMenu
      Hide the plugin menu.
  */
  hidePluginMenu: function()
  {
    if(this.pluginMenu) this.pluginMenu.addClass('SSDisplayNone');
    if(this.pluginMenuTab) this.pluginMenuTab.addClass('SSDisplayNone');
  },
  
  showNotifier: function() 
  {
    //console.log('-------------------------------- showNotifier');
    if (this.cancelNotifier) 
    {
      if (SSPendingShifts()) 
      {
        //console.log('time to load shifts');
        SSSetPendingShifts(0);
        loadShifts();
      }
    } 
    else 
    {
      //console.log('start animation for notifier');
      this.notifierFx.start(-32, 0).chain(function() {
        if (SSPendingShifts()) 
        {
          SSSetPendingShifts(0);
          loadShifts();
        }
        this.hideNotifier.delay(3000, this);
      }.bind(this));
    }
    this.hideNotifier.delay(3000, this);
    console.log('----------------------------------- exit show notifier');
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
      this.buildNotifier();
      this.buildContents();
      /* Load all plugin styles */
      for(var plugin in installedPlugins)
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
    //console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< LOADED BUILD CONTENTS');

    var content = $(this.doc.createElement('div'));
    content.setAttribute('id', 'console');
    content.setHTML('<div class="outer"><div class="inner">' +
                    '<div id="top"><div id="tabs" class="SSUserSelectNone">' +
                    '<div id="controls">' +
                    '<div id="auth" class="button auth"><div class="image"></div></div>' +
                    '<div id="bugs" class="button bugs"><div class="image" title="File a bug report"></div></div>' +
                    '<div id="hide" class="button hide"><div class="image" title="Minimize console"></div></div>' +
                    '<br class="clear" />' +
                    '</div>' +
                    '<br class="clear" />' +
                    '</div></div></div></div>' +
                    '<div class="left"><div class="right">' +
                    '<div id="bottom"><div id="scroller"></div></div>' +
                    '</div></div>');
    content.injectInside(this.doc.body);
    
    //console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< BASICS DONE');
    
    var controls = $(this.doc.getElementById('controls'));
    //console.log('got controls');
    
    var auth = $(this.doc.getElementById('auth'));
    auth.addEvent('mouseover', function() {
      auth.addClass('hover');
    });
    auth.addEvent('mouseout', function() {
      auth.removeClass('hover');
    });
    auth.addEvent('click', function(_evt) {
      if (ShiftSpace.user.getUsername()) {
        ShiftSpace.user.logout();
      } else {
        //console.log('SHOW TAB');
        this.showTab('login');
      }
      //console.log('setup auth control');
      this.setupAuthControl();
    }.bind(this));
    //console.log("auth init'ed");
    this.setupAuthControl();
    //console.log('auth setup');
    
    var bugReport = $(this.doc.getElementById('bugs'));
    bugReport.addEvent('mouseover', function() {
      bugReport.addClass('hover');
    });
    bugReport.addEvent('mouseout', function() {
      bugReport.removeClass('hover');
    });
    bugReport.addEvent('click', function() {
      window.open('http://metatron.shiftspace.org/trac/newticket');
    });
    
    var hide = $(this.doc.getElementById('hide'));
    hide.addEvent('mouseover', function() {
      hide.addClass('hover');
    });
    hide.addEvent('mouseout', function() {
      hide.removeClass('hover');
    });
    hide.addEvent('click', function() {
      hide.removeClass('hover');
      this.minimize();
    }.bind(this));
    
    //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> TABS');
    this.addTab('shifts', '0 shifts');
    this.addTab('settings', 'Settings', 'icon-settings.gif');
    if (!ShiftSpace.user.getUsername()) {
      this.addTab('login', 'Login');
    }
    //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> LOGIN');
    this.buildLogin();
    //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SETTINGS');
    this.buildSettings();
    //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SHOW TAB');
    this.showTab('shifts');
    
    //console.log('contents built');
  },
  
  setupAuthControl: function() {
    console.log('setupAuthControl');
    var controls = $(this.doc.getElementById('controls'));
    var auth = $(this.doc.getElementById('auth'));
    if (!auth) {
      return;
    }
    //console.log('auth about to setup');
    if (ShiftSpace.user.getUsername()) {
      auth.removeClass('login');
      auth.addClass('logout');
      auth.setAttribute('title', 'Logout');
    } else {
      auth.removeClass('logout');
      auth.addClass('login');
      auth.setAttribute('title', 'Login');
    }
    //console.log('auth setup done');
  },
  
  buildSettings: function() {
    var sections = this.createSubSections('settings', ['General', 'Spaces', 'Account']);
    $(sections[0]).setHTML('<div class="form-column">' +
                        '<div class="input"><div id="default_privacy" class="checkbox"></div>' +
                        '<div class="label">Set my shifts public by default</div>' +
                        '<br class="clear" /></div>' +
                        '<div class="input"><label for="server-input">Server address:</label>' +
                        '<input type="text" name="server" value="' + server + '" id="server-input" size="40" class="text" />' +
                        '</div><br class="clear" />');
                        
    //console.log('buildSettings - done setting html');
    
    $(SSGetElementByClass('form-column', sections[0])).setStyle('padding-top', 20);
    
    //console.log('form style set');
    
    var checkboxes = SSGetElementsByClass('checkbox', this.doc.body);
    checkboxes.each(function(checkbox) {
      $(checkbox).addEvent('click', function() {
        if (checkbox.hasClass('checked')) 
        {
          checkbox.removeClass('checked');
        } 
        else 
        {
          checkbox.addClass('checked');
        }
      });
      
      $(checkbox.nextSibling).addEvent('click', function() {
        checkbox.fireEvent('click');
      });
    });
    
    var serverInput = $(this.doc.getElementById('server-input'));
    serverInput.addEvent('change', function() {
      var newServer = serverInput.value;
      if (newServer.substr(newServer.length - 2, 1) != '/') {
        newServer = newServer + '/';
      }
      if (newServer.substr(0, 7) != 'http://' &&
          newServer.substr(0, 8) != 'https://') {
        newServer = 'http://' + newServer;
      }
      serverInput.value = newServer;
      GM_xmlhttpRequest({
        method: 'GET',
        url: serverInput.value + 'shiftspace.php?method=version',
        onload: function(rx) {
          if (rx.responseText == version) {
            setValue('server', serverInput.value);
          } else {
            alert('Sorry, that server address returned an invalid response.');
            serverInput.value = server;
            console.log(rx.responseText);
          }
        }
      });
    });
    
    $(sections[1]).setHTML('<form action="' + server + 'shiftspace.php">' +
                        '<label for="install-space">Install a space</label>' +
                        '<input type="text" name="space" id="install-space" class="text" size="40" />' +
                        '<input type="submit" value="Install" class="submit" />' +
                        '</form>');
    $(sections[1]).setStyles({
      padding: '10px 20px'
    });
    var form = sections[1].getElementsByTagName('form')[0];
    
    //console.log('buildSettings - done with form ' + form);
    
    for (var space in installed) 
    {
      var newSpace = this.installedSpace(space);
      //console.log('newSpace ' + newSpace);
      $(newSpace).injectBefore(form);
    }
    
    //console.log('buildSettings - added spaces');
    
    form.addEvent('submit', function(e) {
      new Event(e).preventDefault();
      var spaceInput = this.doc.getElementById('install-space');
      var space = spaceInput.value;
      if (space == '') return;

      var spaceURL = server + 'spaces/' + space + '/' + space + '.js';
      loadFile(spaceURL, function(r) {
        var source = r.responseText.replace(/\s/g, ' ');
        var matches = source.match(/attributes.+?(\{.+?\})/);
        if (!matches) {
          window.alert('Error, could not load space "' + space + '". Space names are case-sensitive, so check that you\'ve capitalized the space name correctly.');
          return;
        } else {
          newSpace = $(this.installedSpace(space));
          newSpace.injectBefore(form);
          spaceInput.value = '';
          installed[space] = spaceURL;
          setValue('installed', installed);
          ShiftSpace.ShiftMenu.addSpace(space);
        }
      }.bind(this));
    }.bind(this));
    
    //console.log('buildSettings - added form action');
  },
  
  installedSpace: function(id) {
    var div = this.doc.createElement('div');
    div.setAttribute('id', 'installed' + id);
    div.setAttribute('class', 'installedSpace');

    div.innerHTML = '<img src="' + server + 'spaces/' + id + '/' + id + '.png" width="32" height="32" /> ' +
                '<div class="info"><a href="http://metatron.shiftspace.org/spaces/' + id.toLowerCase() + '" target="_blank">' + id + '</a>' +
                '</div>' +
                '<input type="button" value="Uninstall" class="submit uninstall" id="uninstall' + id + '" />' +
                '<br class="clear" /></div>';
    
    //console.log('func installedSpace - uninstall ' + _$(div).getElementByClassName('uninstall'));            
    var uninstallButton = _$(div).getElementByClassName('uninstall');
    
    $(uninstallButton).addEvent('click', function() {
      if (confirm('Are you sure you want to uninstall ' + id + '?')) {
        delete installed[id];
        setValue('installed', installed);
        $(div).remove();
        ShiftSpace.ShiftMenu.removeSpace(id);
      }
    });
    
    return div;
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
    var tab = _$(this.doc.getElementById('tabs')).getElementsByClassName('active')[0];
    // close the plugin menu if open
    if(this.pluginMenu && !$(this.pluginMenu).hasClass('SSDisplayNone')) this.pluginMenu.addClass('SSDisplayNone');
    if (tab) {
      $(tab).removeClass('active');
    }
    var content = _$(this.doc.getElementById('scroller')).getElementsByClassName('active')[0];
    if (content) {
      $(content).removeClass('active');
    }
    $(this.doc.getElementById('tab-' + id)).addClass('active');
    $(this.doc.getElementById(id)).addClass('active');
  },
  
  removeTab: function(id) {
    var tab = $(this.doc.getElementById('tab-' + id));
    if (tab) {
      tab.remove();
    }
  },
  
  buildLogin: function() {
    this.addPane('login');
    //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CREATE SUBSECTIONS');
    var sections = this.createSubSections('login', ['Login', 'Sign up']);
    /*
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> DONE CREATING SUBSECTIONS');
    console.log('build sections');
    console.log('sections: ' + sections);
    */
    $(sections[0]).setHTML('<form id="loginForm" action="http://shiftspace.org/login" method="post">' +
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
    //console.log('built sections[0]');
    $(sections[0]).setStyle('padding-top', 15);
    $(this.doc.getElementById('loginForm')).addEvent('submit', function(e) {
      new Event(e).preventDefault();
      var credentials = {
        username: this.doc.getElementById('username').value,
        password: this.doc.getElementById('password').value
      };
      ShiftSpace.user.login(credentials, this.handleLogin.bind(this));
    }.bind(this));
    $(sections[1]).setHTML('<form id="registerForm" action="http://shiftspace.org/join" method="post">' +
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
    $(sections[1]).setStyle('padding-top', 15);
    $(this.doc.getElementById('registerForm')).addEvent('submit', function(e) {
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
    var pane = this.addTab('welcome', 'Welcome');
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
    
    //console.log('sections length ' + sections.length);
    for (var i = 0; i < sections.length; i++) {
      var activeTab = (i == 0) ? ' subtab-active' : '';
      var activeSection = (i == 0) ? ' subsection-active' : '';
      tabs += '<div id="subtab-' + target + i + '" class="subtab' + activeTab + '">' + sections[i] + '</div>';
      content += '<div id="subsection-' + target + i + '" class="subsection' + activeSection + '"></div>';
    }
    
    var holder = _$(this.doc.getElementById(target));
    holder.innerHTML = '<div class="subtabs">' +
                       '<div class="subtabs-inner">' + tabs + '</div>' +
                       '</div>' +
                       '<div class="subsections">' + content + '</div>' +
                       '<br class="clear" />';
    
    /*                   
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> grabbing subtabs');
    console.log(holder.innerHTML)
    console.log(holder.getElementsByClassName('subsection').length);;
    */
    
    /*
    console.log(holder);
    console.log(holder.getElementsByClassName.toString());
    console.log('trying');
    */
    //console.log(holder.getElementsByClassName('subtab').length);
    
    holder.getElementsByClassName('subtab').each(function(subtab) {
      $(subtab).addEvent('click', function(e) {
        //console.log('SELECT SUB TAB');
        var active = holder.getElementsByClassName('subtab-active')[0];
        if (active) {
          $(active).removeClass('subtab-active');
        }
        //console.log('1');
        var above = holder.getElementsByClassName('subtab-above')[0];
        if (above) {
          $(above).removeClass('subtab-above');
        }
        //console.log('2');
        var subsection = holder.getElementsByClassName('subsection-active')[0];
        if (subsection) {
          $(subsection).removeClass('subsection-active');
        }
        //console.log('3');
        $(e.currentTarget).addClass('subtab-active');
        if (e.currentTarget.previousSibling) {
          $(e.currentTarget.previousSibling).addClass('subtab-above');
        }
        //console.log('4');
        var id = e.currentTarget.getAttribute('id').substr(7);
        //console.log('5');
        //console.log(id);
        //console.log(this.doc.getElementById('subsection-' + id));
        $(this.doc.getElementById('subsection-' + id)).addClass('subsection-active'); 
        //console.log('6');
      }.bind(this));
    }.bind(this));
    /*
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> fixed subtabs! <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
    console.log(holder.getElementsByClassName('subsections').length);
    console.log('=====================================================================================');
    */
    return holder.getElementsByClassName('subsection');
  },
  
  
  /*
  
  Function: refresh
  Resize the content area.
  
  */
  refresh: function() {
    if (!this.doc || !this.doc.getElementById('top')) 
    {
      // Need to wait a moment longer while things are being built
      if(this.resize) setTimeout(this.resize.bind(this), 50);
    } 
    else 
    {
      var top = $(this.doc.getElementById('top')).getParent();
      var bottom = $(this.doc.getElementById('bottom'));
      bottom.setStyle('height', this.frame.getSize().size.y -
      top.getSize().size.y);
    }
    //console.log('cleaning up');
    this.resizer.setStyle('width', window.getWidth() - 50);
    //console.log('cleaned');
    if(this.notifierFx)
    {
      //console.log('stop notifier');
      this.notifierFx.stop();
      //console.log('set');
      this.notifierFx.set(Math.max(0, this.frame.getSize().size.y - 4));
    }
    //console.log('exiting refresh');
  },
  
  
  /*
  
  Function: show
  Show the console.
  
  */
  show: function() {
    this.cancelNotifier = true;
    //console.log('make visible');
    this.frame.setStyle('display', 'block');
    //console.log('refresh');
    this.refresh();
    //console.log('checking pending');
    if (SSPendingShifts() > 0) 
    {
      SSSetPendingShifts(0);
      loadShifts();
    }
  },
  
  
  /*
  
  Function: hide
  Hide the console.
  
  */
  hide: function() {
    this.frame.setStyle('display', 'none');
    //console.log('again set');
    this.notifierFx.set(-32);
    //console.log('hide plugin menu');
    this.hidePluginMenu();
    //console.log('plugin menu hidden');
  },
  
  minimize: function() {
    this.frame.setStyle('height', 0);
    this.refresh();
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
    //console.log('++++++++++++++++++++++++++++++++++++++++++ ADD SHIFTS');
    for (var shiftId in shifts) {
      var shift = shifts[shiftId];
      try
      {
        this.addShift(shift);
      }
      catch(exc)
      {
        console.error('Exception adding shift ' + shiftId + ' to console: ' + SSDescribeException(exc));
      }
    }
  },
  
  showShift: function(id) {
    console.log('>>>>>>>>>>>>>>>>>>>>>>> SHOW SHIFT ' + id);
    var el = $(this.doc.getElementById(id));
    console.log(el);
    if(el)
    {
      el.addClass('active');
      el.addClass('SSUserSelectNone');
      console.log('about to hide edit title field');
      this.hideEditTitleField(id);
    }
    console.log('exit SHOW SHIFT');
  },
  
  blurShift: function(id) {
    //console.log('CONSOLE BLLLLLLLLLLLLLLLLLLLLLLUR ' + id);
    this.hideEditTitleField(id);
    //console.log('EXIT');
  },
  
  focusShift: function(id) {
  },

  hideShift: function(id) {
    var el = $(this.doc.getElementById(id));
    console.log('console hide shiftId: ' + id);
    console.log(el);
    if(el)
    {
      el.removeClass('active');
      el.addClass('SSUserSelectNone');
      this.hideEditTitleField(id);
    }
  },
  
  showEditTitleField: function(id) {
    var el = _$(this.doc.getElementById(id));
    if(el)
    {
      $(el.getElementByClassName('summaryEdit')).removeClass('SSDisplayNone');
      $(el.getElementByClassName('summaryView')).addClass('SSDisplayNone');
    }
  },
  
  hideEditTitleField: function(id) {
    console.log('hideEditTitleField');
    var el = _$(this.doc.getElementById(id));
    if(el)
    {
      $(el.getElementByClassName('summaryEdit')).addClass('SSDisplayNone');
      $(el.getElementByClassName('summaryView')).removeClass('SSDisplayNone');
    }
  },
  
  setTitleForShift: function(id, title) {
    var el = _$(this.doc.getElementById(id));
    if(el)
    {
      $(el.getElementByClassName('summaryView')).setText(title);
    }
  },
  
  updateShift: function(shiftJson) {
    var entry = _$(this.doc.getElementById(shiftJson.id));
    
    $(entry.getElementByClassName('summary').getElementByClassName('summaryView')).setHTML(shiftJson.summary);
    $(entry.getElementByClassName('user')).setHTML(shiftJson.username);
  },
  
  
  /*
  
  Function: addShift
  Adds a shift to the console.
  
  */
  addShift: function(aShift, options) {
    //console.log('adding - ' + aShift.id);
    // clone a model shift
    var newEntry = _$(this.modelShiftEntry.clone(true));
    
    //console.log(newEntry);
    
    var controls = newEntry.getElementByClassName('controls');
    
    var icon = ShiftSpace.info(aShift.space).icon;
    var img = newEntry.getElementByClassName('expander').getElementsByTagName('img')[0];
    
    //console.log('image and icon grabbed');
    
    newEntry.setAttribute('id', aShift.id);
    
    //console.log('set id');

    newEntry.getElementByClassName('spaceTitle').innerHTML = aShift.space;
    $(newEntry.getElementByClassName('spaceTitle')).setStyle('background', 'transparent url(' + icon + ') no-repeat 3px 1px');
    
    var summary = newEntry.getElementByClassName('summary');
    
    var summaryView = summary.getElementByClassName('summaryView');
    summaryView.innerHTML = aShift.summary;
    
    var summaryEdit = summary.getElementByClassName('summaryEdit');
    summaryEdit.setAttribute('value', aShift.summary);
    
    newEntry.getElementByClassName('user').innerHTML = aShift.username;
    newEntry.getElementByClassName('posted').innerHTML = aShift.created; 
    
    newEntry.getElementByClassName('SSPermaLink').setAttribute('href', ShiftSpace.info().server+'sandbox?id=' + aShift.id);
    
    //console.log('main props set');
    
    // Add hover behavior, this can probably be handle via css - David
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
        newEntry.addClass('active');
        // tell ShiftSpace to show the shift
        showShift(aShift.id);
      } 
      else 
      {
        // tell ShiftSpace to hide the shift
        hideShift(aShift.id);
        newEntry.removeClass('active');
        this.hideEditTitleField(aShift.id);
      }
    }.bind(this));
    
    //console.log('mouse behaviors set');
    
    var slideFx = new Fx.Slide($(controls), {
        duration: 250
    });
    slideFx.hide();
    
    //console.log('slide fx');
    
    $(newEntry.getElementByClassName('expander')).addEvent('click', function(e) {
      var event = new Event(e);
      event.stop();
      slideFx.toggle();
      if (!newEntry.hasClass('expanded'))
      {
        newEntry.addClass('expanded');
        newEntry.removeClass('hover');
        $(SSGetElementByClass('expander', newEntry).getElementsByTagName('img')[0]).setProperty('src', server + 'images/Console/arrow-open.gif');
      } 
      else 
      {
        newEntry.removeClass('expanded');
        newEntry.addClass('hover');
        $(SSGetElementByClass('expander', newEntry).getElementsByTagName('img')[0]).setProperty('src', server + 'images/Console/arrow-close.gif');
        // hide the edit field as well
        this.hideEditTitleField(aShift.id);
      }
    }.bind(this));
    
    //console.log('expando set');
    
    controls.addEvent('click', function(e) {
      var event = new Event(e);
      event.stopPropagation();
    });
    
    //console.log('override click behavior, delete node below');
    
    // we need to use SSGetElementByClass because controls was already MooTools wrapped
    $(SSGetElementByClass('delete', controls)).addEvent('click', function(e) {
      var event = new Event(e);
      event.preventDefault();
      if (confirm('Are you sure you want to delete that? There is no undo.')) 
      {
        deleteShift(aShift.id);
      }
    });
    
    //console.log('add edit link behavior');
    
    // Shift Editing from console
    $(SSGetElementByClass('edit', controls)).addEvent('click', function(e) {
      var event = new Event(e);
      event.preventDefault();
      showShift(aShift.id);
      editShift(aShift.id);
      
      if(SSUserCanEditShift(aShift.id))
      {
        // show this shift  
        this.showShift(aShift.id);
        newEntry.removeClass('SSUserSelectNone');
        this.showEditTitleField(aShift.id);
      }
    }.bind(this));
    
    //console.log('summary edit key events');
    
    // Event for the title edit input field
    $(summaryEdit).addEvent('keyup', function(_evt) {
      var evt = new Event(_evt);
      if(evt.key == 'enter')
      {
        newEntry.getElement('.summaryView').setHTML($(evt.target).getProperty('value'));
        this.showShift(aShift.id);
        // defined in Core - David
        updateTitleOfShift(aShift.id, evt.target.getProperty('value'));
      }
    }.bind(this));
    
    //console.log('add summary field click event');
    
    $(summaryEdit).addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      evt.stop();
    });
    
    //console.log('--------------------------------- about to inject');
    //console.log(this.doc);
    
    // add it
    if (options && options.isActive) 
    {
      $(newEntry).injectTop($(this.doc.getElementById('shifts')));
      $(newEntry).addClass('active');
    } 
    else 
    {
      //console.log($(this.doc.getElementById('shifts')));
      $(newEntry).injectInside($(this.doc.getElementById('shifts')));
    }
    
    //console.log('--------------------------------- adding plugin icons');
    this.addPluginIconForShift(aShift.id);
    //console.log('--------------------------------- done adding plugin icons');
    
    this.shiftCount++;
    this.updateCount();
    
    //console.log('------------------------------------ ADDED');
  },
  
  addPluginIconForShift: function(shiftId)
  {
    var el = this.doc.getElementById(shiftId);
    //console.log(shiftId);
    //console.log(el);
    el = _$(el);
    //console.log('wrapped');
    var pluginDiv = $(this.doc.createElement('div'));
    //console.log('plugin div created');
    for(var plugin in installedPlugins)
    {
      //console.log('plugin ' + plugin);
      if(SSGetPluginType(plugin) == 'menu')
      {
        //console.log('adding plugin style');
        pluginDiv.addClass('plugin');
        pluginDiv.addClass('pg'+plugin); // tag with plugin name
        
        pluginDiv.addClass(SSPlugInMenuIconForShift(plugin, shiftId));
        
        //console.log('adding plugin event');
        pluginDiv.addEvent('click', function(_evt) {
          var evt = new Event(_evt);
          evt.stop();

          // wacky stuff
          this.showPluginMenuForShift.bindResource(this, {
            type: 'plugin',
            name: plugin, 
            args: [plugin, shiftId] 
          })();

        }.bind(this));

        //console.log('adding plugin div');
        pluginDiv.inject(el.getElementByClassName('pluginIcons'));
      }
    }

  },
  
  updateCount : function()
  {
    var doc = this.frame.contentDocument;
    var shiftTab = _$(doc.getElementById('tab-shifts')).getElementByClassName('tab-inner');
    shiftTab.innerHTML = this.shiftCount + " shifts";
  },
  
  removeShift: function(shiftId) {
    $(this.doc.getElementById(shiftId)).remove();
    this.shiftCount--;
    this.updateCount();
  },
  
  createShiftEntryModel: function() {
    //console.log('create entry div');
    var shiftEntry = $(this.doc.createElement('div'));
    //console.log('done create entry div');
    shiftEntry.className = 'entry SSUserSelectNone';
    //console.log('set class name');
    
    // ---------------- Expander ----------------------- //
    var expanderDiv = $(this.doc.createElement('div'));
    expanderDiv.className = 'expander column';
    //console.log('expander made');
    
    var expanderImg = $(this.doc.createElement('img'));
    expanderImg.setProperty('src', server + 'images/Console/arrow.gif');
    //console.log('expanderImg made');
    expanderImg.injectInside(expanderDiv);
    //console.log('expanderImg injected');
    
    // ------------------ Space ------------------------- //
    //console.log('create space div');
    var spaceDiv = $(this.doc.createElement('div'));
    spaceDiv.className = 'space column';
    
    //console.log('create spacetitle');
    var spaceTitle = $(this.doc.createElement('div'));
    spaceTitle.className = 'spaceTitle';
    spaceTitle.injectInside(spaceDiv);
    
    //console.log('space added');
    
    // ------------------- Plugins ------------------------- //
    var plugins = $(this.doc.createElement('div'));
    plugins.addClass('pluginIcons');
    plugins.injectInside(spaceDiv);
    
    //console.log('plugins added');
    
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
    
    //console.log('summary added');
    
    // ------------------- User ---------------------------- //
    var userDiv = $(this.doc.createElement('div'));
    userDiv.className = 'user column';
    
    //console.log('user div added');
    
    // ------------------- Posted -------------------------- //
    var postedDiv = $(this.doc.createElement('div'));
    postedDiv.className = 'posted cell';
    //console.log('setHTML');
    postedDiv.setHTML('Just posted');
    //console.log('posted div added');
    
    // ------------------- Clear --------------------------- //
    var clear = $(this.doc.createElement('div'));
    clear.className = 'clear';
    
    //console.log('clear added');
    
    // ------------------- Controls ------------------------ //
    var controls = $(this.doc.createElement('div'));
    controls.className = 'controls';
    // check to see if the the user matches
    var controlOptions = 'Currently, all you can do is <a href="#delete" class="delete">delete this shift</a> or <a href="#edit" class="edit">edit this shift</a>, <a target="new" class="SSPermaLink">permalink</a>';
    controls.innerHTML = controlOptions;
    
    //console.log('controls added');
    
    // -------------------- Build the entry ---------------- //
    //console.log('injecting');
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