// ==UserScript==
// @name           ShiftSpace
// @namespace      http://shiftspace.org/
// @description    An open source layer above any website
// @include        *
// @exclude        http://metatron.shiftspace.org/api/sandbox/*
// @require        http://metatron.shiftspace.org/code/trunk/client/Mootools.js
// ==/UserScript==

/*

WHOA, WHAT JUST HAPPENED?

If you've just clicked a link and you're seeing this source code, wondering what
just happened, this is a Greasemonkey userscript. To use ShiftSpace you probably
need to install a Firefox extension called Greasemonkey. (Or, if you're not
running Firefox, you ought to install it first.)

For more info about Greasemonkey, go to www.greasespot.net 

- - - -

Avital says: "I will only grow vegetables if I love to grow vegetables."
Mushon says: "Make it a Dorongle!"
David says: "I am against smart!"

Script: shiftspace.user.js
    ShiftSpace: An Open Source layer above any webpage

License:
    - GNU General Public License
    - GNU Lesser General Public License
    - Mozilla Public License

Credits:
    - Created by Mushon Zer-Aviv, Dan Phiffer, Avital Oliver, David Buchbut,
      David Nolen and Joe Moore
    - Thanks to Clay Shirky, Johan Sundstrom, Eric Heitzman, Jakob Hilden,
      _why, Aaron Boodman and Nancy Hechinger

*/

// ShiftSpace is built on the Mootools framework (pre-processing required)

console.log('Loading ShiftSpace');

/*

Class: ShiftSpace
  A singleton controller object designed to keep some data and methods private.
  The Space class has access to all private data, while other components, such as
  User, Console and each space class, must rely on publicly exposed interfaces.

*/

var ShiftSpace = new (function() {
    // The server variable determines where to look for ShiftSpace content
    // Check to see if the server URL is already stored
    // permissions problem here?
    if (typeof server == 'undefined') {
      var server = getValue('server', 'http://metatron.shiftspace.org/api/');
    }
    
    //server = "http://localhost/~davidnolen/shiftspace-0.11/";
    //server = "http://metatron.shiftspace.org/~dnolen/shiftspace/";
    //var myFiles = "http://localhost/~davidnolen/shiftspace-0.11/";
    //server = "http://metatron.shiftspace.org/api/";

    // Current ShiftSpace version
    var version = '0.11';
    
    // Logging verbosity and non-sandboxed JS visibility
    var debug = 0;
    
    // Cache loadFile data
    var cacheFiles = 0;
    
    // get Dan's input on how to set this
    if(typeof ShiftSpaceSandBoxMode != 'undefined') {
      server = window.location.href.substr(0, window.location.href.indexOf('sandbox'));
      cacheFiles = 0;
    }
    
    // The basic building blocks of ShiftSpace (private objects)
    var spaces = {};
    var shifts = {};
    var trails = {};
    var plugins = {};
    var displayList = [];
    
    // event proxy object since, ShiftSpace is not a MooTools class
    var __eventProxyClass__ = new Class({});
    __eventProxyClass__.implement(new Events);
    var __eventProxy__ = new __eventProxyClass__();
    console.log(__eventProxy__);
    
    // An array of allocated Pin Widgets
    var __pinWidgets__ = [];
    
    // An array of recently viewed shifts
    var __recentlyViewedShifts__ = {};
    
    // Used to cover iframes so that resize and drag operations don't get borked
    var __iframeCovers__ = [];
    
    // Exceptions
    var __SSPinOpException__ = "__SSPinOpException__";
    
    // Holds the id of the currently focused shift
    var __focusedShiftId__ = null;
    var __focusedSpace__ = null;
    
    // These are for the race condition between shifts loading and console setup
    var __pendingShifts__ = -1;
    // A shift pending space load
    var __pendingShift__ = null;
    var __consoleIsWaiting__ = false;
    
    // Stores initial data for plugins that are needed for the console at startup
    // since the plugins won't actually be loaded until they are needed
    var __pluginsData__ = {};
    
    // Each space and a corresponding URL of its origin
    var installed = getValue('installed', {
      'Notes' : server + 'spaces/Notes/Notes.js',
      'ImageSwap': server + 'spaces/ImageSwap/ImageSwap.js',
      'Highlights': server + 'spaces/Highlights/Highlights.js',
      'SourceShift': server + 'spaces/SourceShift/SourceShift.js'
    });
    
    var spacePrefs = getValue('spacePrefs', {});
    
    /*
    installed = {
      'Notes' : myFiles + 'spaces/Notes/Notes.js',
      'ImageSwap': myFiles + 'spaces/ImageSwap/ImageSwap.js',
      'Highlights': myFiles + 'spaces/Highlights/Highlights.js',
      'SourceShift': myFiles + 'spaces/SourceShift/SourceShift.js',
    };
    */

    // Each plugin and a corresponding URL of its origin
    var installedPlugins = getValue('installedPlugins', {
      'Trails' : server + 'plugins/Trails/NewTrail.js'
    });

    /*
    installedPlugins = {
      'Trails' : myFiles + 'plugins/Trails/NewTrail.js'
    };
    */
    
    // An index of cached files, used to clear the cache when necessary
    var cache = getValue('cache', []);
    
    // Private variable and function for controlling user authentication
    var username = false;
    function setUsername(_username) {
      username = _username;
    }
    
    /*
    
    Function: initialize
    Sets up external components and loads installed spaces.
    
    */
    this.initialize = function() {
      
      debug = 0;
      
      // Load external scripts (pre-processing required)
      // INCLUDE Exception.js
      console.log('Exception.js loaded');
      // INCLUDE User.js
      console.log('User.js loaded');
      // INCLUDE Element.js
      console.log('Element.js loaded');
      // INCLUDE Space.js
      console.log('Space.js loaded');
      // INCLUDE Shift.js
      console.log('Shift.js loaded');
      // INCLUDE RangeCoder.js
      console.log('RangeCoder.js loaded');
      // INCLUDE Pin.js
      console.log('Pin.js loaded');
      // INCLUDE PinWidget.js
      console.log('PinWidget.js loaded');
      // INCLUDE Plugin.js
      console.log('Plugin.js loaded');
      // INCLUDE ShiftMenu.js
      console.log('ShiftMenu.js loaded');
      // INCLUDE Console.js
      console.log('Console.js loaded');
      // INCLUDE ConsoleExtensions.js
      console.log('ConsoleExtensions.js loaded');

      // Load CSS styles
      loadStyle('styles/ShiftSpace.css', function() {
        // create the error window
        SSCreateErrorWindow();
      });
      loadStyle('styles/ShiftMenu.css');

      // Load each installed space - this asynchronous, we need to wait till
      // they are all done
      if (typeof ShiftSpaceSandBoxMode != 'undefined') {
        for (var space in installed) {
          loadSpace(space);
        }
      }

      // need to think about plugin loading architecture! - this is going to involve a reworking of file loading
      if (typeof ShiftSpaceSandBoxMode != 'undefined') {
        for(var plugin in installedPlugins) {
          SSLoadPlugin(plugin);
        }
      }
      
      // If all spaces have been loaded, build the shift menu and the console
      ShiftSpace.ShiftMenu.buildMenu();
      
      // Set up event handlers
      window.addEvent('keydown', keyDownHandler.bind(this) );
      window.addEvent('keyup', keyUpHandler.bind(this) );
      window.addEvent('keypress', keyPressHandler.bind(this) );
      window.addEvent('mousemove', mouseMoveHandler.bind(this) );
      // hide all pinWidget menus on window click
      window.addEvent('click', function() {
        ShiftSpace.Console.hidePluginMenu.bind(ShiftSpace.Console)();
        __pinWidgets__.each(function(x){
          if(!x.isSelecting) x.hideMenu();
        });
      });
      
      // Set up user event handlers
      ShiftSpace.User.addEvent('onUserLogin', function() {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> RECENTLY VIEWED SHIFTS');
        // clear out recently viewed shifts on login
        __recentlyViewedShifts__ = {};
        setValue(ShiftSpace.User.getUsername() + '.recentlyViewedShifts', __recentlyViewedShifts__);
      });
      ShiftSpace.User.addEvent('onUserLogout', function() {
        SSFireEvent('onUserLogout');
      });
      
      // grab the recently viewed shifts
      /*
      if(ShiftSpace.User.isLoggedIn())
      {
        getValue('recentlyViewedShifts')        
      }
      */
      
      // create the pin selection bounding box
      SSCreatePinSelect();
      // check for page iframes
      SSCheckForPageIframes();
      
      console.log('Grabbing content');
      
      // See if there's anything on the current page
      SSCheckForContent();
      
      console.log('ShiftSpace initialize complete');
    };
    
    // Add event behaviors
    function SSAddEvent(eventType, callback) {
      __eventProxy__.addEvent(eventType, callback);
    };
    
    function SSFireEvent(eventType, data) {
      __eventProxy__.fireEvent(eventType, data);
    };
    
    // ===============================
    // = Function Prototype Helpers  =
    // ===============================
    
    // bindResource - for atomic operations
    Function.prototype.bindResource = function(obj, options)
    {
      var fn = this;
      
      // check to make sure it's not already there
      if(spaces[options.name] || plugins[options.name])
      {
        var args = options.args || []
        return fn.bind(obj, args);
      }
      
      return function() {
        if(options.type == 'space')
        {
          if(!spaces[options.name])
          {
            loadSpace(options.name, null, function() {
              fn.apply(obj, args);
            });
          }
        }
        if(options.type == 'plugin')
        {
          if(!plugins[options.name])
          {
            SSLoadPlugin(options.name, function() {
              fn.apply(obj, options.args);
              
              if(options.method)
              {
                plugins[options.name][options.method].apply(plugins[options.name], options.args);
              }
            });
          }
        }
      }
      
    }
     
    // This won't work for GM_getValue of course
    Function.prototype.safeCall = function() {
      var self = this, args = [], len = arguments.length;
      for(var i = 0; i < len; i++) args.push(arguments[i]);
      setTimeout(function() {
        return self.apply(null, args);
      }, 0);
    }
    
    // Work around for GM_getValue
    Function.prototype.safeCallWithResult = function() {
      var self = this, args = [], len = arguments.length;
      for(var i = 0; i < len-1; i++) args.push(arguments[i]);
      // the last argument is the callback
      var callback = arguments[len-1];
      setTimeout(function() {
        callback(self.apply(null, args));
      }, 0);
    }
    
    
    function SSSetPrefForSpace(spaceName, pref, value)
    {
      console.log('SSSetPrefForSpace');
      if(ShiftSpace.User.isLoggedIn())
      {
        var key = [ShiftSpace.User.getUsername(), spaceName, pref].join('.');
        setValue(key, value);
      }
    }
    
    
    function SSGetPrefForSpace(spaceName, pref)
    {
      console.log('SSGetPrefForSpace');
      if(ShiftSpace.User.isLoggedIn())
      {
        var key = [ShiftSpace.User.getUsername(), spaceName, pref].join('.');
        var value = getValue(key, null);
        return value;
      }
    }
    
    /*
    
    Function: info
    Provides basic information about ShiftSpace's current state.
    
    Parameters:
        spaceName - (optional) Get information about a specific installed space.
    
    Returns:
        When no parameter is specified, returns an object with the following
        variables set:
        
        - server (string), the base URL of the ShiftSpace server
        - spaces (string), a list of currently installed spaces
        - version (string), the current version of ShiftSpace
        
        If spaceName is specified, returns the following information about the
        space:
        
        - title (string), a human-readable version of the space name
        - icon (string), the URL of the Space's icon
        - version (string), the current version of the installed Space
    
    */
    this.info = function(spaceName) {
      if (typeof spaceName != 'undefined') {
        var defaults = {
          title: spaceName,
          icon: server + 'images/unknown-space.png',
          version: '1.0'
        };
        if (!installed[spaceName]) {
          defaults.unknown = true;
          return defaults;
        }
        // TODO - this must be fixed, we need to cache space attributes - David
        defaults.icon = server + 'spaces/' + spaceName + '/' + spaceName + '.png';
        //var spaceInfo = $merge(defaults, spaces[spaceName].attributes);
        var spaceInfo = $merge(defaults, {});
        delete spaceInfo.name; // No need to send this back
        spaceInfo.url = installed[spaceName];
        return spaceInfo;
      }
      var spaceIndex = [];
      for (var spaceName in installed) {
        spaceIndex.push(spaceName);
      }
      return {
        server: server,
        spaces: spaceIndex.join(', '),
        version: version
      };
    };
    
    
    function SSGetInfoForInstalledSpace(spaceName, callback)
    {
      // fetch data for the space
    }
    
    // we need this as we transition away from FF2
    function SSGetElementByClass(searchClass, _node)
    {
      return SSGetElementsByClass(searchClass, _node)[0];
    }

    // Safari 3 and FF3 support this natively
    function SSGetElementsByClass(searchClass, _node) 
    {
      var classElements = new Array();
      var node = _node || this;
      var els = node.getElementsByTagName('*');
      var elsLen = els.length;

      var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
      for (var i = 0; i < elsLen; i++) 
      {
        if ( pattern.test(els[i].className) ) 
        {
          classElements.push(els[i]);
        }
      }
      return classElements.map(function(node) {return _$(node);});
    }

    // our special wrapper
    function _$(el)
    {
      if(!el) return null;
      
      el.getElementsByClassName = SSGetElementsByClass;
      el.getElementByClassName = function(className) {
        return this.getElementsByClassName(className)[0];
      }

      return el;
    }
    
    
    function SSGetShiftContent(shiftId)
    {
      if(!SSIsNewShift(shiftId))
      {
        var shift = SSGetShift(shiftId);
        var content = shift.content;
      
        if(content)
        {
          content = content.replace(/\n/g, '\\n');
          content = content.replace(/\r/g, '\\r');
          //content = content.replace(/"/g,);
        }
        
        /*
        console.log('the content');
        console.log(content);
        */
        
        // legacy content, strip surrounding parens
        if(content[0] == "(")
        {
          content = content.substr(1, content.length-2);
        }
        
        /*
        console.log('now');
        console.log(content);
        */
        
        var obj = null;
        try
        {
          obj = Json.evaluate(content);
        }
        catch(err)
        {
          console.log('Error: content for shift ' + shiftId +' failed to load');
          throw err;
        }
        
        /*
        console.log('the obj');
        console.log(obj);
        */
      
        return obj;
      }
      else
      {
        return {};
      }
    }
    
    function SSGetUrlForShift(shiftId)
    {
      //console.log(shifts[shiftId]);
      return SSGetShift(shiftId).href;
    }
    
    
    function SSGetRecentlyViewedShifts()
    {
      var copy = {};
      for(var shiftId in __recentlyViewedShifts__)
      {
        copy[shiftId] = SSGetShiftData(shiftId);
      }
      return copy;
    }
    
    
    function SSSpaceForShift(shiftId)
    {
      //console.log('SSSpaceForShift');
      var shift = SSGetShift(shiftId);
      return spaces[shift.space];
    }
    
    
    function SSUserForShift(shiftId)    
    {
      return shifts[shiftId].username;
    }
    
    
    function SSUserOwnsShift(shiftId)
    {
      return (SSUserForShift(shiftId) == ShiftSpace.User.getUsername());
    }

    
    function SSUserCanEditShift(shiftId)
    {
      return (ShiftSpace.User.isLoggedIn() &&
              SSUserOwnsShift(shiftId));
    }
    
    
    function SSIsNewShift(shiftId)
    {
      return (shiftId.search('newShift') != -1);
    }
    
    function SSSetShiftStatus(shiftId, newStatus) {
      SSGetShift(shiftId).status = newStatus;
      var params = {
        id: shiftId,
        status: newStatus
      };
      serverCall('shift.update', params, function() {
        SSFireEvent('onShiftUpdate', shiftId);
      });
    }
    
    // ==================
    // = Plugin Support =
    // ==================
    
    function SSGetPlugin(pluginName)
    {
      return plugins[pluginName];
    }
    

    function SSGetPluginType(plugin)
    {
      return __pluginsData__[plugin]['type'];
    }
    

    function SSPlugInMenuIconForShift(pluginName, shiftId, cb)
    {
      var plugin = SSGetPlugin(pluginName);
      // if the plugin isn't loaded yet, use the initial plugins data
      if(!plugin)
      {
        var shiftData = __pluginsData__[pluginName]['data'][shiftId];
        if(__pluginsData__[pluginName]['data'][shiftId])
        {
          return shiftData['icon'];
        }
        else
        {
          return __pluginsData__[pluginName]['defaultIcon'];
        }
      }
      else
      {
        plugin.menuIconForShift(shiftId, cb);
      }
    }
    

    function SSImplementsProtocol(protocol, object)
    {
      var result = true;
      var missing = [];
      for(var i = 0; i < protocol.length; i++)
      {
        var prop = protocol[i];
        if(!object[prop])
        {
           result = false;
           missing.push(prop);
        }
      }
      return {'result': result, 'missing': missing};
    }
    
    // =============
    // = Utilities =
    // =============
    
    function SSIsSSElement(node)
    {
      if(node.hasClass('ShiftSpaceElement'))
      {
        return true;
      }
      
      var hasSSParent = false;
      var curNode = node;

      while(curNode.getParent() && $(curNode.getParent()).hasClass && !hasSSParent)
      {
        if($(curNode.getParent()).hasClass('ShiftSpaceElement'))
        {
          hasSSParent = true;
          continue;
        }
        curNode = curNode.getParent();
      }
      
      return hasSSParent;
    }
    this.isSSElement = SSIsSSElement;
    
    
    function SSIsNotSSElement(element)
    {
      return !SSIsSSElement(element);
    }
    
    
    function SSPendingShifts()
    {
      return __pendingShifts__;
    }
    
    
    function SSSetPendingShifts(val)
    {
      __pendingShifts__ = val;
    }
    
    
    function SSFocusedShiftId()
    {
      return __focusedShiftId__;
    }
    
    
    function SSSetFocusedShiftId(newId)
    {
      __focusedShiftId__ = newId;
    }
    
    
    function SSFocusedSpace()
    {
      return __focusedSpace__;
    }
    
    
    function SSSetFocusedSpace(newSpace)
    {
      __focusedSpace__ = newSpace;
    }

    // ======================
    // = FullScreen Support =
    // ======================
    
    var __isHidden__ = false;
    var __shiftSpaceState__ = new Hash();
    function setHidden(val)
    {
      __isHidden__ = val;
    }
    function ShiftSpaceIsHidden()
    {
      return __isHidden__;
    }
    
    function ShiftSpaceHide()
    {
      // set the private hidden var
      // used to control the appearance of the ShiftMenu 
      setHidden(true);
      
      // remove all the previous state vars
      __shiftSpaceState__.empty();
      
      __shiftSpaceState__.set('consoleVisible', ShiftSpace.Console.isVisible());
      __shiftSpaceState__.set('focusedShiftId', SSFocusedShiftId());
      
      // go through each space and close it down, and sleep it
      ShiftSpace.Console.hide();
      
      // hide the spaces
      for(var space in spaces)
      {
        spaces[space].saveState();
        
        if(spaces[space].isVisible())
        {
          spaces[space].hide();
        }
      }
    }
    
    function ShiftSpaceShow()
    {
      // set the private hidden var
      // used to control the appearance of the ShiftMenu
      setHidden(false);
      
      // restore ShiftSpace
      if(__shiftSpaceState__.get('consoleVisible'))
      {
        ShiftSpace.Console.show();
      }
      if(__shiftSpaceState__.get('focusedShiftId'))
      {
        focusShift(__shiftSpaceState__.get('focusedShiftId'));
      }

      // restore the spaces
      for(var space in spaces)
      {
        spaces[space].restoreState();
      }
    }
    
    /*
    
    Function: installSpace
    Loads the JavaScript source of a Space, then loads the space into memory.
    The source URL is saved in the 'installed' object for future reference.
    
    Parameters:
        space - The Space name to install
        pendingShift - A shift to show upon installation
        
    */
    function SSInstallSpace(space, pendingShift) {
      var url = server + 'spaces/' + space + '/' + space + '.js';
      installed[space] = url;
      setValue('installed', installed);
      
      // let everyone else know
      loadSpace(space, pendingShift, function() {
        SSFireEvent('onSpaceInstall', space);
      }.bind(this));
    };
    
    /*
    
    Function: uninstallSpace
    Removes a space from memory and from stored caches.
    
    Parameters:
        space - the Space name to remove
    
    */
    function SSUninstallSpace(spaceName) {
      var url = installed[spaceName];
      delete spaces[spaceName];
      delete installed[spaceName];
      setValue('installed', installed);
      
      SSClearCache(url);
      
      // let everyone else know
      SSFireEvent('onSpaceUninstall', spaceName);
    };

    
    function SSXmlHttpRequest(config) {
      GM_xmlhttpRequest(config);
    }
    
    /*
    
    Function: SSClearCache
    Expunge previously stored files.
    
    Parameters:
        url - (Optional) The URL of the file to remove. If not specified, all
              files in the cache will be deleted.
    
    */
    function SSClearCache(url) {
      if (typeof url == 'string') {
        // Clear a specific file from the cache
        log('Clearing ' + url + ' from cache');
        setValue('cache.' + url, 0);
      } else {
        // Clear all the files from the cache
        cache.each(function(url) {
          log('Clearing ' + url + ' from cache');
          setValue('cache.' + url, 0);
        });
      }
    };
    
    
    /*
    
    initShift (private)
    Creates a new shift on the page.
    
    Parameters:
        space - The name of the Space the Shift belongs to.
    
    */
    function initShift(spaceName, options) {
      //console.log('spaceName: ' + spaceName);
      if (!installed[spaceName]) {
        console.log('Error: Space ' + spaceName + ' does not exist.', true);
        return;
      }

      var tempId = 'newShift' + Math.round(Math.random(0, 1) * 1000000);
      while (shifts[tempId]) {
        tempId = 'newShift' + Math.round(Math.random(0, 1) * 1000000);
      }

      var _position = (options && options.position && { x: options.position.x, y: options.position.y }) || null;
      var shiftJson = {
        id: tempId,
        space: spaceName,
        username: ShiftSpace.User.getUsername(),
        position: _position
      };
      //console.log(shiftJson);

      shifts[tempId] = shiftJson;

      var noError = spaces[spaceName].createShift(shiftJson);
      if(noError)
      {
        //console.log('tempId:' + tempId);
        SSShowNewShift(tempId);
      }
      else
      {
        console.error("There was an error creating the shift");
      }
    }
    
    
    function SSShowNewShift(shiftId)
    {
      //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SSShowNewShift ' + shiftId);
      var space = SSSpaceForShift(shiftId);
      
      // call onShiftCreate
      showShift(shiftId);
      space.onShiftCreate(shiftId);
      editShift(shiftId);
      focusShift(shiftId, false);
    }
    
    
    /*
    
    focusShift (private)
    Focuses a shift.
      
    Parameter:
        shiftId - the id of the shift.
    
    */
    function focusShift(shiftId) {
      var shift = shifts[shiftId];
      var space = SSSpaceForShift(shiftId);
      var lastFocusedShift = SSFocusedShiftId();
      
      // unfocus the last shift
      if (lastFocusedShift && 
          shifts[lastFocusedShift] &&
          lastFocusedShift != shiftId) 
      {
        var lastSpace = SSSpaceForShift(lastFocusedShift);
        if(lastSpace.getShift(lastFocusedShift))
        {
          lastSpace.getShift(lastFocusedShift).blur();
          lastSpace.orderBack(lastFocusedShift);
        }
      }
      SSSetFocusedShiftId(shift.id);
      space.orderFront(shift.id);

      // call
      space.focusShift(shiftId);
      space.onShiftFocus(shiftId);
      
      // scroll the window if necessary
      var mainView = space.mainViewForShift(shiftId);
      
      if(mainView && !SSIsNewShift(shiftId))
      {
        var pos = mainView.getPosition();
        var vsize = mainView.getSize().size;
        var viewPort = window.getSize().viewPort;
        var windowScroll = window.getSize().scroll;
        
        var leftScroll = (windowScroll.x > pos.x-25);
        var rightScroll = (windowScroll.x < pos.x-25);
        var downScroll = (windowScroll.y < pos.y-25);
        var upScroll = (windowScroll.y > pos.y-25);
        
        if(pos.x > viewPort.x+windowScroll.x ||
           pos.y > viewPort.y+windowScroll.y ||
           pos.x < windowScroll.x ||
           pos.y < windowScroll.y)
        {
          var scrollFx = new Fx.Scroll(window, {
            duration: 1000,
            transition: Fx.Transitions.Cubic.easeIn
          });
          
          var size = window.getSize();

          if(!window.webkit)
          {
            scrollFx.scrollTo(pos.x-25, pos.y-25);
          }
          else
          {
            window.scrollTo(pos.x-25, pos.y-25);
          }
        }
      }
      else
      {
        //console.log('+++++++++++++++++++++++++++++++++++++++ NO MAIN VIEW');
      }
    }
    
    function blurShift(shiftId)
    {
      // create a blur event so console gets updated
      var space = SSSpaceForShift(shiftId);
      space.blurShift(shiftId);
      space.onShiftBlur(shiftId);
    }

    /*
    focusSpace (private)
    Focuses a space.
    
    Parameter:
      space - a ShiftSpace.Space instance
    */
    function focusSpace(space, position) 
    {
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> FOCUS SPACE');

      var lastFocusedSpace = SSFocusedSpace();
      
      if(lastFocusedSpace && lastFocusedSpace != space)
      {
        // check to see if focused space
        lastFocusedSpace.setIsVisible(false);
        lastFocusedSpace.hideInterface();
      }
      
      // set the focused space private var
      SSSetFocusedSpace(space);
      space.setIsVisible(true);
      space.showInterface();
    }
    
    function updateTitleOfShift(shiftId, title)
    {
      SSSpaceForShift(shiftId).updateTitleOfShift(shiftId, title);
      showShift(shiftId);
    }
    
    /*
    
    Function: showShift
    Displays a shift on the page.
    
    Parameters:
        shiftId - The ID of the shift to display.
    
    */
    function showShift(shiftId) 
    {
      // console.log('showShift >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      if(!SSShiftIsLoaded(shiftId) && !SSIsNewShift(shiftId))
      {
        // first make sure that is loaded
        SSLoadShift(shiftId, showShift.bind(ShiftSpace));
        return;
      }
      else
      {
        try
        {
          // get the space and the shift
          var shift = SSGetShift(shiftId);

          // check to see if this is a known space
          if (ShiftSpace.info(shift.space).unknown) 
          {
            if (confirm('Would you like to install the space ' + shift.space + '?')) 
            {
              SSInstallSpace(shift.space, shiftId);
              return;
            }
          }

          var space = SSSpaceForShift(shiftId);

          // load the space first
          if(!space)
          {
            console.log('space not loaded ' + shift.space + ', ' + shiftId);
            loadSpace(shift.space, shiftId);
            return;
          }

          // extract the shift content
          var shiftJson = SSGetShiftContent(shiftId);
          shiftJson.id = shiftId;
          
          // console.log('foo -- - - -- - - --- - - -- - -- -- - -');
          // console.log(shiftJson);
          // check to make sure the css is loaded first
          if(!space.cssIsLoaded())
          {
            //console.log('css not loaded');
            space.addDeferredShift(shiftJson);
            return;
          }

          // fix legacy content
          shiftJson.legacy = shift.legacy;

          // store a reference to this
          // TODO: only add these if the user is logged in
          if(ShiftSpace.User.isLoggedIn())
          {
            // simply mark the ids
            __recentlyViewedShifts__[shift.id] = 1;
            // store the recently viewed shifts
            setValue(ShiftSpace.User.getUsername() + '.recentlyViewedShifts', __recentlyViewedShifts__);
          }

          // wrap this in a try catch
          try
          {
            spaces[shift.space].showShift(shiftJson);
          }
          catch(err)
          {
            console.log('Exception: ' + SSDescribeException(err));
          }

          focusShift(shift.id);

          // call onShiftShow
          space.onShiftShow(shiftId);
        }
        catch(err)
        {
          console.log('Error: Could not show shift, ' + SSDescribeException(err));
          SSShowErrorWindow(shiftId);

          // probably need to do some kind of cleanup
          ShiftSpace.Console.hideShift(shiftId);
        }
      }
    }
    
    /*
    
    Function: hideShift
    Hides a shift from the page.
        
    Parameters:
        shiftId - The ID of the shift to hide.
    
    */
    function hideShift(shiftId) 
    {
      var shift = SSGetShift(shiftId);
      var space = SSSpaceForShift(shiftId);

      space.hideShift(shiftId);
      space.onShiftHide(shiftId);
    }
    

    /*
    
    SSCheckForContent (private)
    Sends a request to the server about the current page's ShiftSpace content.
    
    */
    function SSCheckForContent() {
      var params = {
        href: window.location.href
      };
      serverCall('query', params, function(json) {
        //console.log('++++++++++++++++++++++++++++++++++++++++++++ GOT CONTENT');
        if (!json.status) {
          console.error('Error checking for content: ' + json.message);
          return;
        }
        
        if (json.username) 
        {
          // Set private user variable
          setUsername(json.username);
          
          // load the recently viewed shifts
          __recentlyViewedShifts__ = getValue(json.username+'.recentlyViewedShifts', {});
           
          if (__consoleIsWaiting__)
          {
            SSFireEvent('onUserLogin', {status:1});
          }
        }
        
        SSSetPendingShifts(json.count);
        
        if (json.count > 0 && __consoleIsWaiting__) 
        {
          //console.log('about to show notifier');
          ShiftSpace.Console.showNotifier();
        }
      });
    }
    
    
    function SSCheckForAutolaunch()
    {
      for(space in installed)
      {
        if(SSGetPrefForSpace(space, 'autolaunch'))
        {
          var ids = SSAllShiftIdsForSpace(space);

          var spaceObject = spaces[space]
          
          // in the case of the web
          if(!spaceObject)
          {
            // load the space first
            loadSpace(space, null, function() {
              ids.each(showShift);
            });
            return;
          }
          else
          {
            // otherwise just show the puppies, this works in the sandbox
            ids.each(showShift);
          }
        }
      }
    }
    
    
    function SSAllShiftIdsForSpace(spaceName)
    {
      var shiftsForSpace = [];
      for(shiftId in shifts)
      {
        if(shifts[shiftId].space == spaceName)
        {
          shiftsForSpace.push(shiftId);
        }
      }
      return shiftsForSpace;
    }
    
    
    /*
    
    SSConsoleIsReady (private)
    Called by the Console object when it finishes initializing.
    
    */
    function SSConsoleIsReady() {
      if (SSPendingShifts() == -1) {
        __consoleIsWaiting__ = true;
      } else if (SSPendingShifts() > 0) {
        ShiftSpace.Console.showNotifier();
      }
    }
    
    
    /*
    
    loadShifts (private)
    Loads the actual shift data for the current page.
    
    */
    function loadShifts() {
      
      var params = {
          href: window.location.href
      };
      serverCall('shift.query', params, function(json) {
          if (!json.status) {
            console.error('Error loading shifts: ' + json.message);
            return;
          }
          
          //console.log(Json.toString(json));
          
          /*
          console.log('====================================================================');
          console.log('SHIFT QUERY RETURN');
          console.log('====================================================================');
          console.log(json);
          */

          // save the pluginsData
          for(var plugin in installedPlugins)
          {
            //console.log('++++++++++++++++++++++++++++++++++++++ CHECKING FOR ' + plugin);
            if(json[plugin]) 
            {
              //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
              //console.log('LOADING INITIAL DATA FOR ' + plugin);
              //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
              __pluginsData__[plugin] = json[plugin];
            }
          }
          
          //console.log(__pluginsData__);
          
          json.shifts.each(function(shift) {
            shifts[shift.id] = shift;
            
            if(['notes', 'highlight', 'sourceshift', 'imageswap'].contains(shift.space))
            {
              shift.space = shift.space.capitalize();
              shift.legacy = true;
            }
            if(shift.space == 'Highlight')
            {
              shift.space += 's';
            }
            if(shift.space == 'Sourceshift')
            {
              shift.space = 'SourceShift';
            }
            if(shift.space == 'Imageswap')
            {
              shift.space = 'ImageSwap';
            }
          });
          
          ShiftSpace.Console.addShifts(shifts);
          
          // check for autolaunched content, better for sandbox
          // TODO: refactor
          if(ShiftSpace.User.isLoggedIn())
          {
            SSCheckForAutolaunch();
          }
      });
    }
    
    
    function SSGetShift(shiftId)
    {
      var theShift = shifts[shiftId];
      
      if(theShift)
      {
        return shifts[shiftId];
      }
    }
    
    
    function SSGetAuthorForShift(shiftId)
    {
      return SSGetShift(shiftId).username;
    }
    
    
    // returns a copy of the shift data
    function SSGetShiftData(shiftId)
    {
      var shift = SSGetShift(shiftId);
      return {
        id : shift.id,
        title : shift.summary,
        summary: shift.summary,
        space: shift.space,
        href : shift.href,
        username : shift.username
      };
    }
    
    
    function SSSetShift(shiftId, shiftData)
    {
      shifts[shiftId] = $merge(shifts[shiftId], {
        content: shiftData.content
      });
    }
    
    
    function SSLoadShift(shiftId, callback)
    {
      // fetch a content from the network;
      
      var params = { shiftIds: shiftId };
      serverCall.safeCall('shift.get', params, function(returnArray) {
        if(returnArray && returnArray[0])
        {
          var shiftObj = returnArray[0];
          SSSetShift(shiftObj.id, shiftObj);
          
          if(callback && $type(callback) == 'function')
          {
            callback(shiftObj.id);
          }
        }
      });
    }
    
    
    function SSShiftIsLoaded(shiftId)
    {
      return SSHasProperty(SSGetShift(shiftId), ('content'));
    }
    
    
    function SSHasProperty(obj, prop)
    {
      return (typeof obj[prop] != 'undefined');
    }
    
    
    function SSSetPendingShift(shiftId)
    {
      __pendingShift__ = shiftId;
    }
    
    
    function SSPendingShift()
    {
      return __pendingShift__;
    }

    // call to get just the shifts that are needed
    function SSGetShifts(shiftIds, callBack)
    {
      var newShiftIds = [];
      var finalJson = {};
      
      newShiftIds = shiftIds;

      // put these together
      var params = { shiftIds: newShiftIds.join(',') };
      
      serverCall.safeCall('shift.get', params, function(json) {
        /*
        if (!json.status) {
          console.error('Error getting shifts: ' + json.message);
          return;
        }
        */
        
        // should probably filter out any uncessary data
        json.each(function(x) {
          finalJson[x.id] = x;
        });
        
        if(callBack) callBack(finalJson);
      });
    }
    
    
    function SSGetPageShiftIdsForUser()
    {
      var shiftIds = [];
      
      if(ShiftSpace.User.isLoggedIn())
      {
        var username = ShiftSpace.User.getUsername();
        
        for(shiftId in shifts)
        {
          if(shifts[shiftId].username == username)
          {
            shiftIds.push(shiftId);
          }
        }
      }
      
      return shiftIds;
    }
    
    
    /*
    
    saveShift (private)
    Saves a shift's JSON object to the server.
    
    */
    function saveShift(shiftJson) {
      //console.log('saveShift');
      //console.log(shiftJson);
      
      // if new skip to saveNewShift
      if (shiftJson.id.substr(0, 8) == 'newShift') {
        return saveNewShift(shiftJson);
      }
      
      var filters = shiftJson.filters;
      delete shiftJson.filters;
      
      var space = spaces[shiftJson.space];
      var params = {
        id: shiftJson.id, // TODO: handle this in a more secure way
        summary: shiftJson.summary,
        content: Json.toString(shiftJson),
        version: space.attributes.version,
        username: ShiftSpace.User.getUsername(),
        filters: Json.toString(filters),
      };
      
      // if a legacy shift is getting updated, we should update the space name
      var shift = SSGetShift(shiftJson.id);
      if(shift.legacy)
      {
        params.space = space.attributes.name;
      }
      
      serverCall.safeCall('shift.update', params, function(json) {
        //console.log('returned shift.update! ' + Json.toString(json));
        if (!json.status) {
          console.error(json.message);
          return;
        }
        ShiftSpace.Console.updateShift(shiftJson);
        // call onShiftSave
        spaces[shiftJson.space].onShiftSave(shiftJson.id);
      });
    }
    
    /*
    
    saveNewShift (private)
    Creates a new entry for the shift on the server.
    
    */
    function saveNewShift(shiftJson) {
      
      var space = spaces[shiftJson.space];
      
      // remove the filters from the json object
      var filters = shiftJson.filters;
      delete shiftJson.filters;
      
      var params = {
        href: window.location.href,
        space: shiftJson.space,
        summary: shiftJson.summary,
        content: Json.toString(shiftJson),
        version: space.attributes.version,
        filters: Json.toString(filters),
        status: getValue('default_shift_status', 1)
      };

      serverCall.safeCall('shift.create', params, function(json) {
        console.log('>>>>>>>>>>>>>>>>> SAVED new shift');
        if (!json.status) {
          console.error(json.message);
          return;
        }
        
        shiftJson.username = ShiftSpace.User.getUsername();
        shiftJson.created = 'Just posted';
        shiftJson.status = getValue('default_shift_status', 1);
        shiftJson.href = window.location.href;
        
        // with the real value
        var shiftObj = space.shifts[shiftJson.id];
        shiftObj.setId(json.id);
        
        // delete the temporary stuff
        delete shifts[shiftJson.id];
        delete space.shifts[shiftJson.id];
        
        if (SSFocusedShiftId() == shiftJson.id) {
          SSSetFocusedShiftId(json.id);
        }
        shiftJson.id = json.id;
        shiftJson.content = Json.toString(shiftJson);
        shifts[shiftJson.id] = shiftJson;
        space.shifts[shiftJson.id] = shiftObj;
        
        // add and show the shift
        ShiftSpace.Console.addShift(shiftJson, {isActive:true});
        ShiftSpace.Console.showShift(shiftJson.id);
        
        // call onShiftSave
        space.onShiftSave(shiftJson.id);
      });

    }
    
    /*
    editShift (private)
    Edit a shift.
    */
    function editShift(shiftId) 
    {
      if(!SSShiftIsLoaded(shiftId) && !SSIsNewShift(shiftId))
      {
        // first make sure that is loaded
        SSLoadShift(shiftId, editShift.bind(ShiftSpace));
        return;
      }
      else
      {
        var space = SSSpaceForShift(shiftId);
        var user = SSUserForShift(shiftId);
        var shift = shifts[shiftId];

        // load the space first
        if(!space)
        {
          loadSpace(shift.space, shiftId, function() {
            editShift(shiftId);
          });
          return;
        }
        if(space && !space.cssIsLoaded())
        {
          space.addDeferredEdit(shiftId);
          return;
        }
        
        if(SSUserCanEditShift(shiftId))
        {
          var shiftJson = SSGetShiftContent(shiftId);

          // show the interface
          focusSpace(space, (shiftJson && shiftJson.position) || null);
        
          // show the shift first, this way edit and show are both atomic - David
          showShift(shiftId);

          // then edit it
          space.editShift(shiftId);
          space.onShiftEdit(shiftId);
        
          // focus the shift
          focusShift(shiftId);
          
          SSFireEvent('onShiftEdit', shiftId);
        }
        else
        {
          window.alert("You do not have permission to edit this shift.");
        }
      }
    }
    
    /*
    
    deleteShift (private)
    Deletes a shift from the server.
    
    */
    function deleteShift(shiftId) {
      var space = SSSpaceForShift(shiftId);
      
      // don't assume the space is loaded
      if(space) space.deleteShift(shiftId);

      if(SSFocusedShiftId() == shiftId) 
      {
        SSSetFocusedShiftId(null);
      }

      var params = {
        id: shiftId
      };

      serverCall('shift.delete', params, function(json) {
        if (!json.status) {
          console.error(json.message);
          return;
        }
        ShiftSpace.Console.removeShift(shiftId);
        // don't assume the space is loaded
        if(space) space.onShiftDelete(shiftId);
        delete shifts[shiftId];
      });
    }
    
    
    // Used by keyboard handlers to maintain state information
    var keyState = {};
    
    /*
    
    keyDownHandler (private)
    Handles keydown events.
    
    */
    function keyDownHandler(_event) {
      var event = new Event(_event);
      var now = new Date();

      //console.log('keyDownHandler');

      // Try to prevent accidental shift+space activation by requiring a 500ms
      //   lull since the last keypress
      if (keyState.keyDownTime &&
          now.getTime() - keyState.keyDownTime < 500) 
      {
        keyState.keyDownTime = now.getTime();
        return false;
      }

      if (event.code != 16) 
      {
        // Remember when last non-shift keypress occurred
        keyState.keyDownTime = now.getTime();
      } 
      else if (!keyState.shiftPressed) 
      {
        // Remember that shift is down
        keyState.shiftPressed = true;
        // Show the menu if the user is signed in
        if (ShiftSpace.ShiftMenu) 
        {
          keyState.shiftMenuShown = true;
          ShiftSpace.ShiftMenu.show(keyState.x, keyState.y);
        }
      }

      // If shift is down and any key other than space is pressed,
      // then definately shiftspace should not be invocated
      // unless shift is let go and pressed again
      if (keyState.shiftPressed &&
        event.key != 'space' &&
        event.code != 16) 
      {
        keyState.ignoreSubsequentSpaces = true;

        if (keyState.shiftMenuShown) 
        {
          keyState.shiftMenuShown = false;
          ShiftSpace.ShiftMenu.hide();
        }
      }

      // Check for shift + space keyboard press
      if (!keyState.ignoreSubsequentSpaces &&
        event.key == 'space' &&
        event.shift) 
      {
        //console.log('space pressed');
        // Make sure a keypress event doesn't fire
        keyState.cancelKeyPress = true;

        /*
        // Blur any focused inputs
        var inputs = document.getElementsByTagName('input');
        .merge(document.getElementsByTagName('textarea'))
        .merge(document.getElementsByTagName('select'));
        inputs.each(function(input) {
          input.blur();
        });
        */

        // Toggle the console on and off
        if (keyState.consoleShown) 
        {
          keyState.consoleShown = false;
          //console.log('hide console!');
          ShiftSpace.Console.hide();
        }
        else 
        {
          //console.log('show console!');
          keyState.consoleShown = true;
          ShiftSpace.Console.show();
        }

      }
    }
    
    
    /*
    
    keyDownHandler (private)
    Handles keyup events.
    
    */
    function keyUpHandler(_event) {
      var event = new Event(_event);
      // If the user is letting go of the shift key, hide the menu and reset
      if (event.code == 16) {
        keyState.shiftPressed = false;
        keyState.ignoreSubsequentSpaces = false;
        ShiftSpace.ShiftMenu.hide();
      }
    }
    
    
    /*
    
    keyPressHandler (private)
    Handles keypress events.
    
    */
    function keyPressHandler(event) {
      // Cancel if a keydown already picked up the shift + space
      if (keyState.cancelKeyPress) {
        keyState.cancelKeyPress = false;
        event = new Event(event);
        event.stopPropagation();
        event.preventDefault();
      }
    }
    
    function mouseMoveHandler(e) {
      var event = new Event(e);
      keyState.x = event.page.x;
      keyState.y = event.page.y;

      if (event.shift) {
        ShiftSpace.ShiftMenu.show(keyState.x, keyState.y);
      } else if (ShiftSpace.ShiftMenu) {
        ShiftSpace.ShiftMenu.hide();
      }
    }
    
    // ==========================
    // = Iframe Cover Functions =
    // ==========================
    
    SSCheckForPageIframes = function()
    {
      $$('iframe').filter(SSIsNotSSElement).each(function(aFrame) {
        SSAddCover({cover:SSCreateCover(), frame:aFrame});
      });
    }
    
    SSCreateCover = function()
    {
      var cover = new ShiftSpace.Element('div', {
        'class': "SSIframeCover"
      });
      cover.setStyle('display', 'none');
      cover.injectInside(document.body);
      return cover;
    }
    
    SSAddCover = function(newCover)
    {
      // create covers if we haven't already
      __iframeCovers__.push(newCover);
    }

    SSAddIframeCovers = function() {
      __iframeCovers__.each(function(aCover) {
        aCover.cover.setStyle('display', 'block');
      });
    }
    
    SSUpdateIframeCovers = function() {
      __iframeCovers__.each(function(aCover) {
        var pos = aCover.frame.getPosition();
        var size = aCover.frame.getSize().size;
        aCover.cover.setStyles({
          left: pos.x,
          top: pos.y,
          width: size.x+3,
          height: size.y+3
        });
      });
    }
    
    SSRemoveIframeCovers = function() {
      __iframeCovers__.each(function(aCover) {
        aCover.cover.setStyle('display', 'none');
      });
    }
    
    // ===================
    // = Pin API Support =
    // ===================
    
    // for holding the current pin selection
    var __currentPinSelection__ = null;
    
    // create the pin selection frame
    function SSCreatePinSelect() {
      var targetBorder = new ShiftSpace.Element('div', {
        'class': "SSPinSelect SSPinSelectInset"
      });
    
      var insetOne = new ShiftSpace.Element('div', {
        'class': "SSPinSelectInset"
      });
      var insetTwo = new ShiftSpace.Element('div', {
        'class': "SSPinSelectInset"
      });
      insetTwo.injectInside(insetOne);
      insetOne.injectInside(targetBorder);
      
      ShiftSpace.PinSelect = targetBorder;
    }
    
    function SSPinMouseOverHandler (_evt) {
      var evt = new Event(_evt);
      var target = $(evt.target);

      if(!SSIsSSElement(target) &&
         !target.hasClass('SSPinSelect'))
      {
        __currentPinSelection__ = target;
        var pos = target.getPosition();
        var size = target.getSize().size;
      
        ShiftSpace.PinSelect.setStyles({
          left: pos.x-3,
          top: pos.y-3,
          width: size.x+3,
          height: size.y+3
        });

        ShiftSpace.PinSelect.injectInside(document.body);
      }
    }
    
    function SSPinMouseMoveHandler(_evt) {
      if(ShiftSpace.PinSelect.getParent())
      {
        ShiftSpace.PinSelect.remove();
      }
    }
    
    function SSPinMouseClickHandler(_evt) {
      var evt = new Event(_evt);
      evt.stop();
      if(__currentPinWidget__)
      {
        if(ShiftSpace.PinSelect.getParent()) ShiftSpace.PinSelect.remove();
        SSRemovePinEvents();
        __currentPinWidget__.userPinnedElement(__currentPinSelection__);
      }
    }
    
    function SSCheckPinReferences(pinRef)
    {
      var otherShifts = __allPinnedShifts__.copy().remove(pinRef.shift);
      var matchingShifts = otherShifts.filter(function(x) {
        var aPinRef = x.getPinRef();
        return ((aPinRef.relativeXPath == pinRef.relativeXPath) && 
                (aPinRef.ancestorId == pinRef.ancestorId));
      });

      // hide any shifts with matching paths
      matchingShifts.each(function(x) {
        x.hide();
      });
      
      return (matchingShifts.length > 0);
    }
    
    // stores direct references to the shift objects
    var __allPinnedShifts__ = [];
    function SSPinElement(element, pinRef)
    {
      ShiftSpace.pinRef = pinRef;

      // store this pinRef to ensure the same node doesn't get pinned
      if(!__allPinnedShifts__.contains(pinRef.shift)) __allPinnedShifts__.push(pinRef.shift);
      // make sure nobody else is targeting the same node
      SSCheckPinReferences(pinRef);
      
      var targetNode = $(ShiftSpace.Pin.toNode(pinRef));
      
      // pinRef has become active set targetElement and element properties
      $extend(pinRef, {
        'element': element,
        'targetElement': targetNode
      });
      
      if(!targetNode)
      {
        // throw an exception
        throw(__SSPinOpException__);
      }
      
      // store the styles
      pinRef.originalStyles = element.getStyles('float', 'width', 'height', 'position', 'display', 'top', 'left');
      pinRef.targetStyles = targetNode.getStyles('float', 'width', 'height', 'position', 'display', 'top', 'left');
      
      if(targetNode.getStyle('display') == 'inline')
      {
        var size = targetNode.getSize().size;
        pinRef.targetStyles.width = size.x;
        pinRef.targetStyles.height = size.y;
      }
      
      switch(pinRef.action)
      {
        case 'before':
          element.injectBefore(targetNode);
        break;
        
        case 'replace':
          targetNode.replaceWith(element);          
        break;
        
        case 'after':
          element.injectAfter(targetNode);
        break;
        
        case 'relative':
          var elPos = element.getPosition();
          var tgPos = targetNode.getPosition();
        
          // if no offset set it now
          if(!pinRef.offset)
          {
            var elpos = element.getPosition();
            var tpos = targetNode.getPosition();
            pinRef.offset = {x: elpos.x - tpos.x, y: elpos.y - tpos.y};
            pinRef.originalOffset = {x: elpos.x, y: elpos.y};
          }
          
          // hide the element while we do some node magic
          element.addClass('SSDisplayNone');
        
          // wrap the target node
          var wrapper = new Element('div', {
            'class': 'SSImageWrapper SSPositionRelative'
          });
          targetNode.replaceWith(wrapper);
          targetNode.injectInside(wrapper);
          
          // if the target node is an image we
          // want the wrapper node to display inline
          wrapper.setStyle('display', targetNode.getStyle('display'));

          var styles = targetNode.getStyles('width', 'height');
        
          // set the dimensions of the wrapper
          if( styles.width && styles.height != 'auto' )
          {
            wrapper.setStyle('width', styles.width);
          }
          else
          {
            wrapper.setStyle('width', targetNode.getSize().size.x);
          }
          
          if( styles.height && styles.height != 'auto' )
          {
            wrapper.setStyle('height', styles.height);
          }
          else
          {
            wrapper.setStyle('height', targetNode.getSize().size.y);
          }
        
          // override clicks in case the wrapper is inside of a link
          wrapper.addEvent('click', function(_evt) {
            var evt = new Event(_evt);
            evt.stop();
          });
          // store a reference to the wrapper
          pinRef.wrapper = wrapper;

          targetNode = wrapper;
        
          // inject it inside the parent of the target node
          element.injectInside(targetNode);
        
          // position absolute now
          if(element.getStyle('position') != 'absolute')
          {
            pinRef.cssPosition = element.getStyle('position');
            element.setStyle('position', 'absolute');
          }

          // set the position
          element.setStyles({
            left: pinRef.offset.x,
            top: pinRef.offset.y
          });
          
          // we're done show the element
          element.removeClass('SSDisplayNone');
        break;

        default:
        break;
      }
    }
    
    function SSUnpinElement(pinRef) {
      switch(pinRef.action) 
      {
        case 'relative':
          var pos = pinRef.element.getPosition();

          // get the parentElement
          var parentElement = pinRef.element.getParent();
          // take out the original node
          var targetNode = pinRef.targetElement.remove();
          // remove the pinned element from the page
          pinRef.element.remove();
          // replace the wrapper with the target
          parentElement.replaceWith(targetNode);
          
          var tpos = parentElement.getPosition();

          // restore the position of the element
          pinRef.element.setStyle('position', pinRef.cssPosition);
          
          if(pinRef.originalOffset)
          {
            var nx = pinRef.originalOffset.x;
            var ny = pinRef.originalOffset.y;
          }
          else
          {
            var nx = pos.x;
            var ny = pos.y;
          }

          pinRef.element.setStyles({
            left: nx,
            top: ny
          });

        break;

        case 'replace':
          // restore the original styles
          /*
          pinRef.element.setStyles({
            position: '',
            float: '',
            display: '',
            width: '',
            height: ''
          });
          */
        case 'before':
        case 'after':
          pinRef.element.replaceWith(pinRef.targetElement);
        break;

        default:
        break;
      }
    }
    
    /*
      Function: SSAttachPinEvents
        Attaches the mouse events to handle Pin selection.
    */
    function SSAttachPinEvents() {
      window.addEvent('mouseover', SSPinMouseOverHandler);
      window.addEvent('click', SSPinMouseClickHandler);
      ShiftSpace.PinSelect.addEvent('mousemove', SSPinMouseMoveHandler);
    }
    
    function SSRemovePinEvents() {
      window.removeEvent('mouseover', SSPinMouseOverHandler);
      window.removeEvent('click', SSPinMouseClickHandler);
      ShiftSpace.PinSelect.removeEvent('mousemove', SSPinMouseMoveHandler);
    }
    
    // hold the current active pin widget
    var __currentPinWidget__ = null;
    function SSStartPinSelection(widget) {
      __currentPinWidget__ = widget;
      // show the selection interface
      SSAttachPinEvents();
    }
    
    function SSStopPinSelection() {
      __currentPinWidget__ = null;
      if(ShiftSpace.PinSelect.getParent()) ShiftSpace.PinSelect.remove();
      SSRemovePinEvents();
    }
    
    /*
    
    loadFile (private)
    Loads a URL and executes a callback with the response
    
    Parameters:
        url - The URL of the target file
        callback - A function to process the file once it's loaded
    
    */
    function loadFile(url, callback) {
      // If the URL doesn't start with "http://", assume it's on our server
      if (url.substr(0, 7) != 'http://' &&
          url.substr(0, 8) != 'https://') {
        url = server + url;
      }
      
      //console.log('loadFile:' + url);

      // Caching is implemented as a rather blunt instrument ...
      if (!cacheFiles) {
        // ... either append the current timestamp to the URL ...
        var now = new Date();
        url += (url.indexOf('?') == -1) ? '?' : '&';
        url += now.getTime();
      } else {
        console.log('load from cache');
        // ... or use getValue to retrieve the file's contents
        var cached = getValue('cache.' + url, false, true);
        
        if (cached) {
          //console.log('Loading ' + url + ' from cache');
          if (typeof callback == 'function') {
            callback({ responseText: cached });
          }
          return true;
        }
      }

      // Load the URL then execute the callback
      //console.log('Loading ' + url + ' from network');
      GM_xmlhttpRequest({
        'method': 'GET',
        'url': url,
        'onload': function(response) {
          // Store file contents for later retrieval
          if (cacheFiles) {
            cache.push(url);
            setValue('cache', cache);
            setValue('cache.' + url, response.responseText, true);
          }
          if (typeof callback == 'function') {
            callback(response);
          }
        },
        'onerror': function(response) {
          console.error("Error: failed GM_xmlhttpRequest, " + response);
        }
      });

      return true;
    }
    
    /*
    
    loadSpace (private)
    Loads the space's source code, executes it and stores an instance of the
    space class in the 'spaces' object
    
    Parameters:
        space - the Space name to load
    
    */
    function loadSpace(space, pendingShift, callback) 
    {
      // set the pending shift if there is one
      SSSetPendingShift(pendingShift);
      
      if(space)
      {
        if (typeof ShiftSpaceSandBoxMode != 'undefined') 
        {
          var url = installed[space] + '?' + new Date().getTime();
          var newSpace = new Asset.javascript(url, {
            id: space
          });

          if(callback) callback();
        }
        else 
        {
          console.log('loading space: ' + space);
          loadFile(installed[space], function(rx) {
            var err;
            //console.log(space + ' Space loaded, rx.responseText:' + rx.responseText);
            
            // TODO: for Safari the following does not work, we need a function in Space
            // that evals the actual space. - David
            try
            {
              if(window.webkit)
              {
                ShiftSpace.__externals__.evaluate(rx.responseText);
              }
              else
              {
                eval(rx.responseText, ShiftSpace);                
              }
            }
            catch(exc)
            {
              console.error('Error loading ' + space + ' Space - ' + SSDescribeException(exc));
              //throw exc;
            }
            
            if(callback) callback();
          });
        }
      }
    }
    
    /*
    
    SSRegisterSpace (private)
    Called by the Space class to register with ShiftSpace.
    
    Parameters:
        instance - An instance object of the space.
    
    */
    function SSRegisterSpace(instance) {
      //console.log("SSRegisterSpace");
      var spaceName = instance.attributes.name;
      console.log('Register Space ===================================== ' + spaceName);
      spaces[spaceName] = instance;
      instance.addEvent('onShiftUpdate', saveShift.bind(this));

      var spaceDir = installed[spaceName].match(/(.+\/)[^\/]+\.js/)[1];
      
      instance.attributes.dir = spaceDir;

      if (!instance.attributes.icon) {
        var icon = installed[spaceName].replace('.js', '.png');
        instance.attributes.icon = icon;
      } else if (instance.attributes.icon.indexOf('/') == -1) {
        var icon = spaceDir + instance.attributes.icon;
        instance.attributes.icon = icon;
      }

      //console.log("Space icon: " + instance.attribution.icon);

      // if a css file is defined in the attributes load the style
      if (instance.attributes.css) {
        if (instance.attributes.css.indexOf('/') == -1) {
          var css = spaceDir + instance.attributes.css;
          instance.attributes.css = css;
        }
        setTimeout(loadStyle.bind(ShiftSpace, [instance.attributes.css, instance.onCssLoad.bind(instance)]), 0);
      }

      // This exposes each space instance to the console
      if (debug) {
        ShiftSpace[instance.attributes.name + 'Space'] = instance;
      }

      instance.addEvent('onShiftHide', ShiftSpace.Console.hideShift.bind(ShiftSpace.Console));
      instance.addEvent('onShiftShow', function(shiftId) {
        ShiftSpace.Console.showShift(shiftId);
      });
      instance.addEvent('onShiftBlur', function(shiftId) {
        blurShift(shiftId);
        ShiftSpace.Console.blurShift(shiftId);
      });
      instance.addEvent('onShiftFocus', function(shiftId) {
        focusShift(shiftId);
        ShiftSpace.Console.focusShift(shiftId);
      });
      instance.addEvent('onShiftSave', function(shiftId) {
        ShiftSpace.Console.blurShift(shiftId);
        ShiftSpace.Console.setTitleForShift(shifts[shiftId].summary);
      });
      instance.addEvent('onShiftDestroy', SSRemoveShift);
    }
    
    function SSRemoveShift(shiftId)
    {
      delete shifts[shiftId];
    }
    
    /*
      Function: SSLoadPlugin (private)
        Loads a plugin
    */
    function SSLoadPlugin(plugin, callback) 
    {
      //console.log('SSLoadPlugin ' + plugin);
      if(plugins[plugins])
      {
        if(callback) callback();
        return;
      }
      
      if (typeof ShiftSpaceSandBoxMode != 'undefined') 
      {
        var url = installedPlugins[plugin] + '?' + new Date().getTime();
        var newSpace = new Asset.javascript(url, {
          id: plugin
        });
      } 
      else 
      {
        loadFile(installedPlugins[plugin], function(rx) {
          //console.log(plugin + " Plugin loaded");
          // TODO: The following does not work we need to use the plugin eval
          try
          {
            if(window.webkit)
            {
              ShiftSpace.__externals__.evaluate(rx.responseText);
            }
            else
            {
              eval(rx.responseText, ShiftSpace);
            }
          }
          catch(exc) 
          {
            console.error('Error loading ' + plugin + ' Plugin - ' + SSDescribeException(exc));
          }
          
          if(callback) callback();
        });
      }
    }
    
    /*
      Function: SSRegisterPlugin (private)
        Register a plugin.
    */
    function SSRegisterPlugin(plugin)
    {
      plugins[plugin.attributes.name] = plugin;
      
      var pluginDir = installedPlugins[plugin.attributes.name].match(/(.+\/)[^\/]+\.js/)[1];
      
      // if a css file is defined in the attributes load the style
      if (plugin.attributes.css)
      {
        if (plugin.attributes.css.indexOf('/') == -1) 
        {
          var css = pluginDir + plugin.attributes.css;
          plugin.attributes.css = css;
        }
        loadStyle.safeCall(plugin.attributes.css, plugin.onCssLoad.bind(plugin));
      }
      plugin.attributes.dir = pluginDir;
      
      // Load any includes
      if(plugin.attributes.includes)
      {
        if (typeof ShiftSpaceSandBoxMode != 'undefined') 
        {
          plugin.attributes.includes.each(function(include) {
            var url = plugin.attributes.dir + include + '?' + new Date().getTime();
            var newSpace = new Asset.javascript(url, {
              id: include
            });
          });
        }
        else
        {
          plugin.attributes.includes.each(function(include) {
            loadFile.safeCall(plugin.attributes.dir+include, function(rx) {
              try
              {
                if(window.webkit)
                {
                  ShiftSpace.__externals__.evaluate(rx.responseText);
                }
                else
                {
                  eval(rx.responseText, plugin);
                }
              }
              catch(exc)
              {
                console.error('Error loading ' + include + ' include for ' + plugin.attributes.name + ' Plugin - ' + SSDescribeException(exc));
              }
            });
          });
        }
      }
      
      // listen for plugin status changes and pass them on
      plugin.addEvent('onPluginStatusChange', function(evt) {
        SSFireEvent('onPluginStatusChange', evt);
      });

      // This exposes each space instance to the console
      if (debug) 
      {
        ShiftSpace[plugin.attributes.name] = plugin;
      }
    }
    
    /*
    
    serverCall (private)
    Sends a request to the server.
    
    Parameters:
        method - Which method to call on the server (string)
        parameters - Values passed with the call (object)
        callback - (optional) A function to execute upon completion
    
    */
    function serverCall(method, parameters, _callback) {
      var callback = _callback;
      var url = server + 'shiftspace.php?method=' + method;
      //console.log('serverCall: ' + url);
      var data = '';
      
      for (var key in parameters) {
        if (data != '') {
          data += '&';
        }
        data += key + '=' + encodeURIComponent(parameters[key]);
      }
      
      var plugins = new Hash(installedPlugins);
      url += '&plugins=' + plugins.keys().join(',');
      
      var now = new Date();
      url += '&cache=' + now.getTime();
      
      //console.log(data);
      
      //GM_openInTab(url);
      var req = {
        method: 'POST',
        url: url,
        data: data,
        onload: function(_rx) {
          var rx = _rx;
          //console.log('servercall returned');
          /*
          console.log(rx.responseText);
          console.log(typeof callback == 'function');
          */
          if (typeof callback == 'function') {
            //console.log('evaluate ' + rx.responseText);
            try
            {
              /*
              console.log('trying');
              console.log(eval('(' + rx.responseText + ')'));
              console.log('tried');
              */
              var theJson = Json.evaluate(rx.responseText);
            }
            catch(exc)
            {
              console.log('Server call exception: ' + SSDescribeException(exc));
            }
            /*
            console.log('done evaluating');
            console.log(callback);
            */
            callback(theJson);
          }
          else
          {
            console.log('callback is not a function');
          }
        },
        onerror: function(err) {
          console.log(err);
        }
      };
      
      // Firefox doesn't work without this
      // and the existence of this breaks Safari
      if(!window.webkit)
      {
        req.headers = {
          'Content-type': 'application/x-www-form-urlencoded'
        };
      }

      // we need to have error handling right here
      GM_xmlhttpRequest(req);
    }
    
    
    /*
    
    setValue (private, except in debug mode)
    A wrapper function for GM_setValue that handles non-string data better.
    
    Parameters:
        key - A unique string identifier
        value - The value to store. This will be serialized by uneval() before
                it gets passed to GM_setValue.
    
    Returns:
        The value passed in.
    
    */
    function setValue(key, value, rawValue) {
      if (rawValue) {
        GM_setValue(key, value);
      } else {
        GM_setValue(key, Json.toString(value));
      }
      return value;
    }
    
    
    /*
    
    getValue (private, except in debug mode)
    A wrapper function for GM_getValue that handles non-string data better.
    
    Parameters:
        key - A unique string identifier
        defaultValue - This value will be returned if nothing is found.
        rawValue - Doesn't use Json encoding on stored values
    
    Returns:
        Either the stored value, or defaultValue if none is found.
    
    */
    function getValue(key, defaultValue, rawValue) {
      if (!rawValue) {
        defaultValue = Json.toString(defaultValue);
      }
      var result = GM_getValue(key, defaultValue);
      // Fix for GreaseKit, which doesn't support default values
      if (result == null) {
        console.log('getValue("' + key + '") = ' + Json.evaluate(defaultValue));
        return Json.evaluate(defaultValue);
      } else if (rawValue) {
        console.log('getValue("' + key + '") = ' + result);
        return result;
      } else {
        console.log('getValue("' + key + '") = ...' + Json.evaluate(result));
        return Json.evaluate(result);
      }
    }
    
    
    /*
    
    loadStyle (private)
    Loads a CSS file, processes it to make URLs absolute, then appends it as a
    STYLE element in the page HEAD.
    
    Parameters:
        url - The URL of the CSS file to load
        callback - A custom function to handle css text if you don't want to use GM_addStyle
        spaceCallback - A callback function for spaces that want to use GM_addStyle but need to be notified of CSS load.
    */
    function loadStyle(url, callback, frame) {
      // TODO: check to see if the domain is different, if so don't mess with the url - David
      var dir = url.split('/');
      dir.pop();
      dir = dir.join('/');
      if (dir.substr(0, 7) != 'http://') {
        dir = server + dir;
      }
      
      console.log('loadStyle: ' + url);
      loadFile(url, function(rx) {
        var css = rx.responseText;
        // this needs to be smarter, only works on directory specific urls
        css = css.replace(/url\(([^)]+)\)/g, 'url(' + dir + '/$1)');
        
        // if it's a frame load it into the frame
        if(frame)
        {
          var doc = frame.contentDocument;

          if( doc.getElementsByTagName('head').length != 0 )
          {
            var head = doc.getElementsByTagName('head')[0];
          }
          else
          {
            // In Safari iframes don't get the head element by default - David
            // Mootools-ize body
            $(doc.body);
            var head = new Element( 'head' );
            head.injectBefore( doc.body );
          }
          
          var style = doc.createElement('style');
          style.setAttribute('type', 'text/css');
          style.appendChild(doc.createTextNode(css)); // You can not use setHTML on style elements in Safari - David
          head.appendChild(style);
        }
        else
        {
          GM_addStyle(css);
        }
        
        if (typeof callback == 'function') 
        {
          callback();
        } 

      });
    }
    
    /*
    
    log (private)
    Logs a message to the console, but only in debug mode or when reporting
    errors.
    
    Parameters:
        msg - The message to be logged in the JavaScript console.
        verbose - Force the message to be logged when not in debug mode. 
    
    */
    function log(msg, verbose) {
      if (typeof verbose != 'undefined' || debug) {
        if (typeof console == 'object' && console.log) {
          console.log(msg);
        } else if (typeof GM_log != 'undefined') {
          GM_log(msg);
        } else {
          setTimeout(function() {
            throw(msg);
          }, 0);
        }
      }
    }
    
    function SSCanGoFullScreen()
    {
      return true;
    }
    
    function SSCanExitFullScreen()
    {
      return true;
    }
    
    var __errorWindowShiftPropertyModel__;
    var __errorWindowMinimized__ = true;
    function SSCreateErrorWindow()
    {
      // Create the model for the table
      __errorWindowShiftPropertyModel__ = new ShiftSpace.Element('tr');
      __errorWindowShiftPropertyModel__.setStyle('display', '');
      var propertyName = new ShiftSpace.Element('td');
      propertyName.addClass('SSErrorWindowShiftProperty');
      var propertyValue = new ShiftSpace.Element('td');
      propertyName.injectInside(__errorWindowShiftPropertyModel__);
      propertyValue.injectInside(__errorWindowShiftPropertyModel__);
      
      // the error window
      __errorWindow__ = new ShiftSpace.Element('div', {
        'class': "SSErrorWindow SSDisplayNone"
      });
      
      // error title area
      var errorWindowTitle = new ShiftSpace.Element('div', {
        'class': "SSErrorWindowTitle"
      });
      errorWindowTitle.injectInside(__errorWindow__);
      errorWindowTitle.setText('Oops ... it seems this shift is broken');
      
      // the errow message area
      var errorWindowMessage = new ShiftSpace.Element('div', {
        'class': "SSErrorWindowMessage"
      });
      errorWindowMessage.injectInside(__errorWindow__);
      errorWindowMessage.setText('It might be incompatible with this version of ShiftSpace.');

      var br = new ShiftSpace.Element('br');
      br.setStyle('clear', 'both');
      br.injectInside(__errorWindow__);
      
      // add the bottom
      var errorWindowBottom = new ShiftSpace.Element('div', {
        'class': "SSErrorWindowBottom"
      });
      errorWindowBottom.injectInside(__errorWindow__);
      
      // build the disclosure triangle and label
      var errorWindowDisclosure = new ShiftSpace.Element('div', {
        'class': "SSErrorWindowDisclosure"
      });
      var errorWindowExpandWrapper = new ShiftSpace.Element('div', {
        'class': "SSErrorWindowExpandWrapper SSUserSelectNone"
      });
      var errorWindowExpand = new ShiftSpace.Element('div', {
        'class': "SSErrorWindowExpand"
      });
      errorWindowExpand.injectInside(errorWindowExpandWrapper);
      var errorWindowExpandLabel = new ShiftSpace.Element('div', {
        'class': "SSErrorWindowExpandLabel SSDefaultCursor"
      });
      errorWindowExpandLabel.setText('view shift details');
      errorWindowExpandLabel.injectInside(errorWindowExpandWrapper);
      errorWindowExpandWrapper.injectInside(errorWindowDisclosure);
      
      errorWindowDisclosure.injectInside(errorWindowBottom);
      
      // bulid the table where the shift data will be shows
      var errorWindowShiftStatusScroll = new ShiftSpace.Element('div', {
        'class': 'SSErrorWindowShiftStatusScroll SSDisplayNone'
      });
      var errorWindowShiftStatus = new ShiftSpace.Element('table', {
        'class': "SSErrorWindowShiftStatus",
        'col' : 2
      });
      errorWindowShiftStatus.injectInside(errorWindowShiftStatusScroll);
      errorWindowShiftStatusScroll.injectInside(errorWindowDisclosure);
      
      
      // build the ok button
      var errorWindowOk = new ShiftSpace.Element('div', {
        'class': "SSErrorWindowOk SSUserSelectNone"
      });
      errorWindowOk.setText('OK');
      errorWindowOk.injectInside(errorWindowBottom);
      
      // build the fix button
      var errorWindowFix = new ShiftSpace.Element('div', {
        'class': "SSErrorWindowFix SSErrorWindowButton SSDisplayNone"
      });
      errorWindowFix.setText('Fix');
      errorWindowFix.injectInside(errorWindowBottom);

      errorWindowOk.addEvent('click', function(_evt) {
        var evt = new Event(_evt);
        
        var fadeFx = __errorWindow__.effects({
          duration: 300,
          transition: Fx.Transitions.Cubic.easeOut,
          onComplete: function()
          {
            // reset the error window
            __errorWindow__.setStyles({
              width: 280, 
              height: 100
            });
            errorWindowExpand.removeClass('SSErrorWindowExpandOpen');
            errorWindowExpandLabel.setText('view shift details');
            errorWindowShiftStatusScroll.addClass('SSDisplayNone');
            __errorWindowMinimized__ = true;
          }
        });
        
        fadeFx.start({
          opacity: [0.95, 0]
        });
      });
      
      // add expand action
      errorWindowExpandWrapper.addEvent('click', function(_evt) {
        var evt = new Event(_evt);
        
        if(!__errorWindowMinimized__)
        {
          errorWindowExpand.removeClass('SSErrorWindowExpandOpen');
          errorWindowExpandLabel.setText('view shift details');
          errorWindowShiftStatusScroll.addClass('SSDisplayNone');
        }
        else
        {
          errorWindowExpand.addClass('SSErrorWindowExpandOpen');
          errorWindowExpandLabel.setText('hide shift details');
        }
        
        var resizeFx = __errorWindow__.effects({
          duration: 500,
          transition: Fx.Transitions.Cubic.easeOut,
          onComplete: function()
          {
            if(!__errorWindowMinimized__)
            {
              errorWindowShiftStatusScroll.removeClass('SSDisplayNone');
            }
          }
        });

        if(__errorWindowMinimized__)
        {
          resizeFx.start({
            width: [280, 340],
            height: [100, 300],
          });
        }
        else
        {
          resizeFx.start({
            width: [340, 280],
            height: [300, 100],
          });
        }
        
        __errorWindowMinimized__ = !__errorWindowMinimized__;
      });

      __errorWindow__.injectInside(document.body);
    }
    
    function SSShowErrorWindow(shiftId)
    {
      console.log('======================================================================== ' + shiftId);
      /*
      __errorWindow__.getElement('.SSErrorWindowTitle').setText(title);
      __errorWindow__.getElement('.SSErrorWindowMessage').setText(message);
      */
      
      if(shiftId) SSErrorWindowUpdateTableForShift(shiftId);
      
      // is this shift fixable, if so show the fix button
      var space = SSSpaceForShift(shiftId);
      var fixButton = __errorWindow__.getElement('.SSErrorWindowFix');

      if(space && space.fix && SSUserCanEditShift(shiftId))
      {
        fixButton.removeClass('SSDisplayNone');
        fixButton.removeEvents();
        
        fixButton.addEvent('click', function(_evt) {
          var evt = new Event(_evt);
          
          // close the error window
          SSHideErrorWindow();

          var shift = SSGetShift(shiftId);
          
          // hmm add the shift, not show it
          // load the shift
          space.addShift({
            id: shiftId,
            username: shift.username,
            summary: shift.summary
          });
          // set the current shift
          space.setCurrentShiftById(shiftId);
          // edit the shift
          space.editShift(shiftId);

          // attempt to fix it
          var err = space.fix({
            id: shiftId,
            username: shift.username,
            summary: shift.summary,
            content: shift.content
          });
          
        });
      }
      else
      {
        fixButton.addClass('SSDisplayNone');
      }

      __errorWindow__.setOpacity(0);
      __errorWindow__.removeClass('SSDisplayNone');
      
      var fadeFx = __errorWindow__.effects({
        duration: 300,
        transition: Fx.Transitions.Cubic.easeOut
      });
      
      fadeFx.start({
        opacity: [0, 0.95]
      });
    }
    
    function SSHideErrorWindow()
    {
      __errorWindow__.addClass('SSDisplayNone');
    }
    
    function SSErrorWindowUpdateTableForShift(shiftId)
    {
      var statusTable = __errorWindow__.getElement('.SSErrorWindowShiftStatus');
      // clear out the table of it's contents
      statusTable.empty();
      
      var theShift = SSGetShift(shiftId);
      var shiftContent;
      
      try
      {
        shiftContent = SSGetShiftContent(shiftId);
      }
      catch(err)
      {
        shiftContent = {
          id: theShift.id,
          content: theShift.content
        };
      }
      
      for(var prop in shiftContent)
      {
        var newPair = __errorWindowShiftPropertyModel__.clone(true);
        var tds = newPair.getElements('td');

        tds[0].setText(prop);
        tds[1].setText(shiftContent[prop]);

        newPair.injectInside(statusTable);
      }
    }
    
    // In sandbox mode, expose something for easier debugging.
    if (typeof ShiftSpaceSandBoxMode != 'undefined') 
    {
      this.spaces = spaces;
      this.shifts = shifts;
      this.trails = trails;
      this.setValue = setValue;
      this.getValue = getValue;
      unsafeWindow.ShiftSpace = this;
    }
    
    return this;
})();

// NOTE: For Safari to keep SS extensions out of private scope - David
ShiftSpace.__externals__ = {
  evaluate: function(external, object)
  {
    with(ShiftSpace.__externals__)
    {
      eval(external);
    }
  }
}

// For errors in Safari because many errors are silent in GreaseKit
function SSDescribeException(_exception)
{
  var temp = [];
  for(var prop in _exception)
  {
    temp.push(prop + ':' + _exception[prop]);
  }
  return "Exception:{ " + temp.join(', ') +" }";
}

if(self == top) 
{
  // if in sandbox mode need to wait until the window is ready to open
  if(typeof ShiftSpaceSandBoxMode != 'undefined')
  {
    window.addEvent('domready', function(){
      ShiftSpace.initialize();
    });
  }
  else
  {
    try
    {
      console.log('starting up');
      ShiftSpace.initialize();
    }
    catch(exc)
    {
      console.error("Unable to install ShiftSpace :(, " + SSDescribeException(exc));
    }
  }
}
