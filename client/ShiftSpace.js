// ==UserScript==
// @name           ShiftSpace
// @namespace      http://shiftspace.org/
// @description    An open source layer above any website
// @include        *
// @exclude        http://metatron.shiftspace.org/api/sandbox/*
// @exclude        http://shiftspace.org/api/sandbox/*
// @exclude        http://www.shiftspace.org/api/sandbox/*
// @require        http://metatron.shiftspace.org/code/trunk/client/Mootools.js
// @require        http://metatron.shiftspace.org/code/trunk/client/Videobox.js
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
  A singleton controller object that represents ShiftSpace Core. All methods
  functions and variables are private.  Please refer to the documention on <User>,
  <ShiftSpace.Space>, <ShiftSpace.Shift>, <ShiftSpace.Plugin> to see public
  interfaces.
*/

var ShiftSpace = new (function() {
    
    // The server variable determines where to look for ShiftSpace content
    // Check to see if the server URL is already stored
    // permissions problem here?
    if (typeof server == 'undefined') {
      var server = getValue('server', 'http://www.shiftspace.org/dev/');
    }
    
    //server = "http://localhost/~davidnolen/shiftspace-0.11/";
    //server = "http://metatron.shiftspace.org/~dnolen/shiftspace/";
    //var myFiles = "http://localhost/~davidnolen/shiftspace-0.11/";
    //server = "http://metatron.shiftspace.org/api/";

    // Current ShiftSpace version
    var version = '0.12';
    
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
    
    // NOTE: will replace with ResourceManager in 0.5 - David
    plugins.attempt = function(options)
    {
      console.log('attempting to call plugin');
      var args = ($type(options.args) == 'array' && options.args) || [options.args];
      
      function execute()
      {
        console.log('executing plugin ' + options.name + ' call ' + options.method);
        console.log('plugin installed ' + plugins[options.name]);
        if(options.method)
        {
          //console.log();
          plugins[options.name][options.method].apply(plugins[options.name], args);
          if(options.callback && $type(options.callback) == 'function') options.callback();
        }
      };

      // load then call
      if(!plugins[options.name])
      {
        console.log('loading plugin');
        SSLoadPlugin(options.name, execute);
      }
      else
      {
        execute();
      }
    };
    
    // event proxy object since, ShiftSpace is not a MooTools class
    var __eventProxyClass__ = new Class({});
    __eventProxyClass__.implement(new Events);
    var __eventProxy__ = new __eventProxyClass__();
    
    var __SSInvalidShiftIdError__ = "__SSInvalidShiftIdError__";
    
    // Holds the id of the currently focused shift
    var __focusedShiftId__ = null;
    var __focusedSpace__ = null;
    
    // These are for the race condition between shifts loading and console setup
    var __pendingShifts__ = -1;
    // A shift pending space load
    var __pendingShift__ = null;
    var __consoleIsWaiting__ = false;
    
    // User defaults
    var __defaultShiftStatus__ = 1;
    var __defaultEmailComments__ = 1;
    
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
    
    // installed = {
    //   'Notes' : myFiles + 'spaces/Notes/Notes.js',
    //   'ImageSwap': myFiles + 'spaces/ImageSwap/ImageSwap.js',
    //   'Highlights': myFiles + 'spaces/Highlights/Highlights.js',
    //   'SourceShift': myFiles + 'spaces/SourceShift/SourceShift.js',
    // };

    // Each plugin and a corresponding URL of its origin
    var installedPlugins = getValue('installedPlugins', {
      'Trails': server + 'plugins/Trails/NewTrail.js',
      'Comments': server + 'plugins/Comments/Comments.js'
    });

    // installedPlugins = {
    //   'Trails' : myFiles + 'plugins/Trails/NewTrail.js'
    // };
    
    // An index of cached files, used to clear the cache when necessary
    var cache = getValue('cache', []);
    
    // Private variable and function for controlling user authentication
    var username = false;
    function setUsername(_username) {
      username = _username;
    }
    
    var alreadyCheckedForUpdate = false;
    
    // INCLUDE IframeHelpers.js
    // INCLUDE PinHelpers.js
    
    /*
    
    Function: initialize
    Sets up external components and loads installed spaces.
    
    */
    this.initialize = function() {
      
      debug = 0;
      
      // look for install links
      SSCheckForInstallSpaceLinks();
      
      // Load external scripts (pre-processing required)
      // INCLUDE User.js
      console.log('User.js loaded');

      // Set up user event handlers
      ShiftSpace.User.addEvent('onUserLogin', function() {
        console.log('ShiftSpace Login ======================================');
        SSSetDefaultShiftStatus(SSGetPref('defaultShiftStatus', 1));
        // clear out recently viewed shifts on login
        setValue(ShiftSpace.User.getUsername() + '.recentlyViewedShifts', []);
      });
      
      ShiftSpace.User.addEvent('onUserLogout', function() {
        SSFireEvent('onUserLogout');
      });
      
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
      // INCLUDE Actions.js
      // INCLUDE ConsoleExtensions.js
      console.log('ConsoleExtensions.js loaded');
      
      // Load CSS styles
      loadStyle('styles/ShiftSpace.css', function() {
        // create the error window
        SSCreateErrorWindow();
      });
      loadStyle('styles/ShiftMenu.css');

      // Load all spaces and plugins immediately if in the sanbox
      if (typeof ShiftSpaceSandBoxMode != 'undefined') {
        for (var space in installed) {
          loadSpace(space);
        }
        for(var plugin in installedPlugins) {
          SSLoadPlugin(plugin);
        }
      }
      
      // If all spaces have been loaded, build the shift menu and the console
      ShiftSpace.ShiftMenu.buildMenu();
      
      // Set up event handlers
      window.addEvent('keydown', keyDownHandler.bind(this));
      window.addEvent('keyup', keyUpHandler.bind(this));
      window.addEvent('keypress', keyPressHandler.bind(this));
      window.addEvent('mousemove', mouseMoveHandler.bind(this));
      
      // hide all pinWidget menus on window click
      window.addEvent('click', function() {
        ShiftSpace.Console.hidePluginMenu.bind(ShiftSpace.Console)();
        __pinWidgets__.each(function(x){
          if(!x.isSelecting) x.hideMenu();
        });
      });
      
      // create the pin selection bounding box
      SSCreatePinSelect();
      
      // check for page iframes
      SSCheckForPageIframes();
      
      console.log('Grabbing content');
      
      // See if there's anything on the current page
      SSCheckForContent();
      
      console.log('ShiftSpace initialize complete');
    };
    
    
    function SSCheckForInstallSpaceLinks()
    {
      $$('.SSInstallFirstLink').setStyle('display', 'none');

      $$('.SSInstallSpaceLink').each(function(x) {
       console.log('================================================== SSCheckForInstallSpaceLinks');
       x.setStyle('display', 'block');
       x.addEvent('click', SSHandleInstallSpaceLink);
      });
    }
    
    
    function SSHandleInstallSpaceLink(_evt)
    {
      var evt = new Event(_evt);
      var target = evt.target;
      var spaceName = target.getAttribute('title');
      
      //console.log(target);
      console.log('installing ' + spaceName);
      
      // first check for the attributes file
      // loadFile(server + 'spaces/' + spaceName + '/attributes.js', SSInstallSpaceLinkCallback, SSInstallSpaceLinkCallback);
      SSInstallSpace(spaceName);
    }
    
    
    /*
      Function: SSAddEvent
        Adds a Mootools style custom event to the ShiftSpace object.
        
      Parameters:
        eventType - a event type as string.
        callback - a function.
    
      See also:
        SSFireEvent
    */
    function SSAddEvent(eventType, callback) {
      __eventProxy__.addEvent(eventType, callback);
    };
    
    /*
      Function: SSFireEvent
        A function to fire events.
        
      Parameters:
        eventType - event type as string.
        data - any extra event data that should be passed to the event listener.
    */
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
    
    /*
      Function: SSSetPref
        Set a user preference. Implicitly calls setValue which will JSON encode the value.
        
      Parameters:
        pref - the preference name as string.
        value - the value.
        
      See Also:
        setValue
    */
    function SSSetPref(pref, value)
    {
      if(ShiftSpace.User.isLoggedIn())
      {
        var key = [ShiftSpace.User.getUsername(), pref].join('.');
        setValue(key, value);
      }
    }
    
    /*
      Function: SSGetPref
        Return a user preference.  Implicity calls getValue which will JSON decode the value.
      
      Parameters:
        pref - the preference key as a string.
        defaultValue - the defaultValue if this preference does not exist.
        
      Returns:
        A JSON object.
    */
    function SSGetPref(pref, defaultValue)
    {
      if(ShiftSpace.User.isLoggedIn())
      {
        var key = [ShiftSpace.User.getUsername(), pref].join('.');
        return getValue(key, defaultValue);
      }
      return defaultValue;
    }
    
    /*
      Function: SSSetDefaultShiftStatus
        Set the default shift status, the only valid values are 1 for public, 2 for private.
      
      Parameters:
        value - the new shift status value.
    */
    function SSSetDefaultShiftStatus(value)
    {
      if(value)
      {
        __defaultShiftStatus__ = value;
        SSSetPref('defaultShiftStatus', __defaultShiftStatus__);
      }
    }

    /*
      Function: SSGetDefaultShiftStatus
        Returns the default shift status.
      
      Parameters:
        checkPref - if the value should be grabbed directly via SSGetPref.

      Returns:
        Either 1 for public or 2 for private.
    */
    function SSGetDefaultShiftStatus(checkPref)
    {
      return (checkPref && SSGetPref('defaultShiftStatus', 1)) || __defaultShiftStatus__;
    }
    
    
    function SSSetDefaultEmailComments(value)
    {
      if(value)
      {
        __defaultEmailComments__ = value;
        SSSetPref('defaultEmailComments', __defaultEmailComments__);
      }
    }
    
    function SSGetDefaultEmailComments(checkPref)
    {
      // NOTE: 2 because we can't store 0s in the DB when in the sandbox, 1 = false, 2 = true in this case - David
      return (checkPref && SSGetPref('defaultEmailComments', 2) || __defaultEmailComments__);
    }
    
    
    /*
      Function: SSSetPrefForSpace
        Set user preference for a space.  Calls setValue.  The preference
        key will be converted to username.spaceName.preferenceKey.
      
      Parameters:
        spaceName - space name as string.
        pref - string representing the preference name.
        value - the value to be set.
    */
    function SSSetPrefForSpace(spaceName, pref, value)
    {
      if(ShiftSpace.User.isLoggedIn())
      {
        var key = [ShiftSpace.User.getUsername(), spaceName, pref].join('.');
        setValue(key, value);
      }
    }
    
    
    /*
      Function: SSGetPrefForSpace
        Retrieve a preference for a space.
        
      Parameters:
        spaceName - spaceName as string.
        pref - the preference key.
    */
    function SSGetPrefForSpace(spaceName, pref)
    {
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
    this._$ = _$; // export
    
    
    /*
      Function: SSGetShiftContent
        Returns the actual content of shift.  The content is the actual
        representation of the shift as defined by the encode method of the
        originating Shift class.
        
      Parameters:
        shiftId - a shift id.
        
      Returns:
        A Javascript object with the shifts's properties.
    */
    function SSGetShiftContent(shiftId)
    {
      if(!SSIsNewShift(shiftId))
      {
        var shift = SSGetShift(shiftId);
        var content = unescape(shift.content); // MERGE: for 0.5 - David
      
        if(content)
        {
          content = content.replace(/\n/g, '\\n');
          content = content.replace(/\r/g, '\\r');
        }
        
        // legacy content, strip surrounding parens
        if(content[0] == "(")
        {
          content = content.substr(1, content.length-2);
        }
        
        if(content[0] == '"') content = content.substr(1, content.length-2);
        
        var dbgStr = '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> SSGetShiftContent';
        console.log(dbgStr);
        console.log(content);
        
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
        
        return obj;
      }
      else
      {
        return {};
      }
    }
    
    /*
      Function: SSGetUrlForShift
        Returns the url of a shift.
        
      Parameters:
        shiftId - a shift id.
        
      Returns:
        A url as a string.
    */
    function SSGetUrlForShift(shiftId)
    {
      //console.log(shifts[shiftId]);
      return SSGetShift(shiftId).href;
    }
    
    /*
      Function: SSGetRecentlyViewedShifts
        Returns a hash of recently viewed shifts.  The shifts are hashed by
        their id.  Each id points to a Javascript object that has the metadata
        for that particular shift.
        
      Parameters:
        callback - a function to be called when the operation is complete.  A callback is necessary since plugins have access.
    */
    function SSGetRecentlyViewedShifts(callback)
    {
      // array of shifts on the currently viewed url
      var localShifts = {};
      // array of shifts living on other urls
      var remoteShifts = [];

      // grab the local shifs and generate an array of remote shifts
      getValue.safeCallWithResult(ShiftSpace.User.getUsername()+'.recentlyViewedShifts', null, null, function(recentlyViewedShifts) {
        if(recentlyViewedShifts)
        {
          var len = recentlyViewedShifts.length;

          len.times(function(i) {
            var shiftId = recentlyViewedShifts[i];
            if(SSGetShift(shiftId))
            {
              localShifts[shiftId] = SSGetShiftData(shiftId);
            }
            else
            {
              remoteShifts.push(shiftId);
            }
          });
      
          if(remoteShifts.length > 0)
          {
            SSLoadShifts(remoteShifts, function(remoteShiftsArray) {
              // convert array into hash
              var theRemoteShifts = {};
              remoteShiftsArray.each(function(shift) {
                theRemoteShifts[shift.id] = shift;
              });
              // merge local and remote
              callback($merge(localShifts, theRemoteShifts));
            });
          }
          else
          {
            callback(localShifts);
          };
        }
      });
    }
    
    /*
      Function: SSSpaceForShift
        Returns the space singleton for a shift.
        
      Parameters:
        shiftId - a shift id.
        
      Returns:
        The space singleton.
    */
    function SSSpaceForShift(shiftId)
    {
      //console.log('SSSpaceForShift');
      var shift = SSGetShift(shiftId);
      return spaces[shift.space];
    }
    
    /*
      Function: SSUserForShift
        Returns the username for a shift.
        
      Parameters:
        shiftId - a shift id.
        
      Returns:
        The shift author's username as a string.
    */
    function SSUserForShift(shiftId)    
    {
      return shifts[shiftId].username;
    }
    
    /*
      Function: SSUserOwnsShift
        Used to check whether the currently logged in user authored a shift.
        
      Parameters:
        shiftId - a shift id.
        
      Returns:
        true or false.
    */
    function SSUserOwnsShift(shiftId)
    {
      return (SSUserForShift(shiftId) == ShiftSpace.User.getUsername());
    }

    /*
      Function: SSUserCanEditShift
        Used to check whether a user has permission to edit a shift.
        
      Parameters:
        shiftId - a shift id.
        
      Returns:
        true or false.
    */
    function SSUserCanEditShift(shiftId)
    {
      return (ShiftSpace.User.isLoggedIn() &&
              SSUserOwnsShift(shiftId));
    }
    
    /*
      Function: SSIsNewShift
        Used to check whether a shift is newly created and unsaved.
        
      Parameters:
        shiftId - a shift id.
    */
    function SSIsNewShift(shiftId)
    {
      return (shiftId.search('newShift') != -1);
    }
    
    /*
      Function: SSSetShiftStatus
        Sets the shift public private status.
      
      Parameters:
        shiftId - a shift id.
        newStatus - the status.
    */
    function SSSetShiftStatus(shiftId, newStatus) {
      SSGetShift(shiftId).status = newStatus;
      var params = {
        id: shiftId,
        status: newStatus
      };
      serverCall('shift.update', params, function() {
        console.log('>>>>>>>>>>>>>>>>>>>>>>>> shiftId ' + shiftId);
        SSFireEvent('onShiftUpdate', shiftId);
      });
    }
    
    // ==================
    // = Plugin Support =
    // ==================
    
    /*
      Function: SSGetPlugin
        Returns a plugin object.
        
      Parameters:
        pluginName - a name representing a plugin.
        
      Returns:
        A plugin object.
    */
    function SSGetPlugin(pluginName)
    {
      return plugins[pluginName];
    }
    
    /*
      Function: SSGetPluginType
        Returns the plugin type.
        
      Parameters:
        pluginName - the plugin name as a string.
        
      See Also:
        Plugin.js
    */
    function SSGetPluginType(pluginName)
    {
      return __pluginsData__[pluginName]['type'];
    }
    
    /*
      Function: SSPlugInMenuIconForShift
        Returns the icon for a particular shift if the plugin is menu based.
        
      Parameters:
        pluginName - plugin name as string.
        shiftId - a shift id.
        callback - a function callback because the plugin may not be loaded yet.
        
      Returns:
        A CSS style with a background image style that will point to the icon image.
    */
    function SSPlugInMenuIconForShift(pluginName, shiftId, callback)
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
        plugin.menuIconForShift(shiftId, callback);
      }
    }
    
    
    function SSPluginDataForShift(pluginName, shiftId)
    {
      return __pluginsData__[pluginName]['data'][shiftId];
    }
    
    
    /*
      Function: SSImplementsProtocol
        A method to check if an object implements the required properties.
        
      Parameters:
        protocol - an array of required properties
        object - the javascript object in need of verification.
        
      Returns:
        A javascript object that contains two properties, 'result' which is a boolean and 'missing', an array of missing properties.
    */
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
    
    /*
      Function: SSIsSSElement
        Check wheter a node is a ShiftSpace Element or has a parent node that is.
        
      Parameters:
        node - a DOM node.
        
      Returns:
        true or false.
    */
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
    
    /*
      Function: SSIsNotSSElement
        Conveniece function that returns the opposite of SSIsSSElement.  Useful for node filtering.
        
      Parameters:
        node - a DOM node.
        
      Returns:
        true or false.
    */
    function SSIsNotSSElement(node)
    {
      return !SSIsSSElement(node);
    }
    
    
    function SSPendingShifts()
    {
      return __pendingShifts__;
    }
    
    
    function SSSetPendingShifts(val)
    {
      __pendingShifts__ = val;
    }
    
    /*
      Function: SSFocusedShiftId
        Returns the current focused shift's id.
      
      Returns:
        a shift id.
    */
    function SSFocusedShiftId()
    {
      return __focusedShiftId__;
    }
    
    /*
      Function: SSSetFocusedShiftId
        Should never be called.
        
      Parameters:
        newId - a shift id.
    */
    function SSSetFocusedShiftId(newId)
    {
      __focusedShiftId__ = newId;
    }
    
    /*
      Function: SSFocusedSpace
        Returns the currently focused space object.
        
      Returns:
        A space object.
    */
    function SSFocusedSpace()
    {
      return __focusedSpace__;
    }
    
    /*
      Function: SSSetFocusedSpace
        Should never be called
        
      Parameters:
        newSpace - a space object.
    */
    function SSSetFocusedSpace(newSpace)
    {
      __focusedSpace__ = newSpace;
    }

    // ======================
    // = FullScreen Support =
    // ======================
    
    var __isHidden__ = false;
    var __shiftSpaceState__ = new Hash();

    /*
      Function: SSSetHidden
        Sets the private hidden variable.
        
      Parameters:
        val - sets a boolean value.
    */
    function SSSetHidden(val)
    {
      __isHidden__ = val;
    }
    
    /*
      Function: ShiftSpaceIsHidden
        Returns whether ShiftSpace is hidden, that is in full screen mode.

      Parameters:
        return a boolean.
    */
    function ShiftSpaceIsHidden()
    {
      return __isHidden__;
    }
    
    /*
      Function: ShiftSpaceHide
        Hide ShiftSpace for fullscreen mode.
    */
    function ShiftSpaceHide()
    {
      // set the private hidden var
      // used to control the appearance of the ShiftMenu 
      SSSetHidden(true);
      
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
    
    /*
      Function: ShiftSpaceShow
        Show ShiftSpace, normally used when exiting fullscreen mode.
    */
    function ShiftSpaceShow()
    {
      // set the private hidden var
      // used to control the appearance of the ShiftMenu
      SSSetHidden(false);
      
      console.log(__shiftSpaceState__);
      
      // restore ShiftSpace
      if(__shiftSpaceState__.get('consoleVisible'))
      {
        console.log('Console show!');
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
    
    // TODO: write some documentation here
    function SSCheckForUpdates() {
      
      // Only check once per page load
      if (alreadyCheckedForUpdate) {
        return;
      }
      alreadyCheckedForUpdate = true;
      
      var now = new Date();
      var lastUpdate = getValue('lastCheckedForUpdate', now.getTime());
      
      // Only check every 24 hours
      if (lastUpdate - now.getTime() > 86400) {
        setValue('lastCheckedForUpdate', now.getTime());
        GM_xmlhttpRequest({
          method: 'POST',
          url: server + 'shiftspace.php?method=version',
          onload: function(rx) {
            if (rx.responseText != version) {
              if (confirm('There is a new version of ShiftSpace available. Would you like to update now?')) {
                window.location = 'http://www.shiftspace.org/api/shiftspace.php?method=shiftspace.user.js';
              }
            }
          }
        });
        return true;
      }
      return false;
    }
    
    /*
    
    Function: SSInstallSpace
      Loads the JavaScript source of a Space, then loads the space into memory.
      The source URL is saved in the 'installed' object for future reference.
    
    Parameters:
      space - The Space name to install
      pendingShift - A shift to show upon installation
        
    */
    function SSInstallSpace(space, pendingShift) {
      if(!installed[space])
      {
        var url = server + 'spaces/' + space + '/' + space + '.js';
        installed[space] = url;
        setValue('installed', installed);
        
        // let everyone else know
        loadSpace(space, pendingShift, function() {
          alert(space + " space installed.");
          SSFireEvent('onSpaceInstall', space);
        }.bind(this));
      }
    };
    
    /*
    Function: SSUninstallSpace
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

    /*
      Function: SSXmlHttpRequest
        Private version of GM_xmlHttpRequest. Implemented for public use via Space/Shift.xmlhttpRequest.
      
      Parameters:
        config - same JSON object as used by GM_xmlhttpRequest.
    */
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
    Function: initShift
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
    
    /*
      Function: SSShowNewShift
        Shows a new shift, different from showShift in that it immediately puts the shift in edit mode.
        
      Parameters:
        shiftId - a shift id.
    */
    function SSShowNewShift(shiftId)
    {
      var space = SSSpaceForShift(shiftId);
      
      // call onShiftCreate
      showShift(shiftId); // TODO: remove - David
      space.onShiftCreate(shiftId);
      editShift(shiftId);
      focusShift(shiftId, false);
    }
    
    
    /*
    Function: focusShift
      Focuses a shift.
      
    Parameter:
      shiftId - the id of the shift.
    */
    function focusShift(shiftId)
    {
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
    
    /*
      Function: blurShift
        Blurs a shift.
        
      Parameters:
        shiftId - a shift id.
    */
    function blurShift(shiftId)
    {
      // create a blur event so console gets updated
      var space = SSSpaceForShift(shiftId);
      space.blurShift(shiftId);
      space.onShiftBlur(shiftId);
    }

    /*
    focusSpace
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
    
    /*
      Function: updateTitleOfShift
        Tell the space to the update the title of the shift if necessary.
      
      Parameters:
        shiftId - a shift id.
        title - the new title.
    */
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
          
          // if the space is loaded check if this shift can be shown
          if(space)
          {
            if(!space.canShowShift(SSGetShiftContent(shiftId)))
            {
              throw new Error();
            }
          }

          // extract the shift content
          var shiftJson = SSGetShiftContent(shiftId);
          console.log('extracted shift json');
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

          // add to recently viewed list
          SSAddRecentlyViewedShift(shiftId);

          // wrap this in a try catch
          try
          {
            console.log('showing the shift =======================================');
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
          var params = {id:shiftId};
          serverCall.safeCall('shift.broken', params, function(result) {
            console.log(result);
          });

          SSShowErrorWindow(shiftId);

          // probably need to do some kind of cleanup
          ShiftSpace.Console.hideShift(shiftId);
        }
      }
    }
    
    /*
      Function: SSAddRecentlyViewedShift
        Add a recently viewed shift.
        
      Parameters:
        shiftId - a shift id
    */
    function SSAddRecentlyViewedShift(shiftId)
    {
      // store a reference to this
      // TODO: only add these if the user is logged in
      if(ShiftSpace.User.isLoggedIn() && !SSIsNewShift(shiftId))
      {
        getValue.safeCallWithResult(ShiftSpace.User.getUsername()+'.recentlyViewedShifts', null, null, function(recentlyViewedShifts) {
          // simply mark the ids
          recentlyViewedShifts.unshift(shiftId);
          // store the recently viewed shifts
          setValue(ShiftSpace.User.getUsername() + '.recentlyViewedShifts', recentlyViewedShifts);
        });
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
    Function: SSCheckForContent
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
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
          console.log(json);          
          // Set private user variable
          ShiftSpace.User.setUsername(json.username);
          ShiftSpace.User.setEmail(json.email);

          // fire user login for the Console
          if (__consoleIsWaiting__)
          {
            SSFireEvent('onUserLogin', {status:1});
          }
          
          // make sure default shift status preference is set
          SSSetDefaultShiftStatus(SSGetPref('defaultShiftStatus', 1));
        }
        
        SSSetPendingShifts(json.count);
        
        if (json.count > 0 && __consoleIsWaiting__) 
        {
          //console.log('about to show notifier');
          ShiftSpace.Console.showNotifier();
        }
      });
    }
    
    /*
      Function: SSCheckForAutolaunch
        Check for Spaces which need to be auto-launched.
    */
    function SSCheckForAutolaunch()
    {
      for(space in installed)
      {
        if(SSGetPrefForSpace(space, 'autolaunch'))
        {
          var ids = SSAllShiftIdsForSpace(space);

          var spaceObject = spaces[space]
          
          // in the case of the web we need to load the space first
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
    
    /*
    Function: SSAllShiftIdsForSpace
      Returns all shift ids on the current url for a particular Space.
      
    Parameters:
      spaceName - the name of the Space as a string.
    */
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
    Function: SSConsoleIsReady
      Called by the Console object when it finishes initializing.
      
    Returns:
      A boolean value.
    */
    function SSConsoleIsReady() {
      if (SSPendingShifts() == -1) {
        __consoleIsWaiting__ = true;
      } else if (SSPendingShifts() > 0) {
        ShiftSpace.Console.showNotifier();
      }
    }
    
    
    /*
    Function: loadShifts
      Loads the actual shift data for the current page.
    */
    function loadShifts() {
      console.log('====================================================================');
      console.log('LOAD SHIFTS');
      console.log('====================================================================');
      
      var params = {
          href: window.location.href
      };
      serverCall('shift.query', params, function(json) {
          if (!json.status) {
            console.error('Error loading shifts: ' + json.message);
            return;
          }
          
          //console.log(Json.toString(json));
          
          console.log('====================================================================');
          console.log('SHIFT QUERY RETURN');
          console.log('====================================================================');
          console.log(json);


          // save the pluginsData
          for(var plugin in installedPlugins)
          {
            //console.log('++++++++++++++++++++++++++++++++++++++ CHECKING FOR ' + plugin);
            if(json[plugin]) 
            {
              /*
              console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
              console.log('LOADING INITIAL DATA FOR ' + plugin);
              console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
              */
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
    
    /*
      Function: SSGetShift
        Returns a shift by shift id.
        
      Parameters:
        shiftId - a shift id.
    */
    function SSGetShift(shiftId)
    {
      var theShift = shifts[shiftId];
      
      if(theShift)
      {
        return shifts[shiftId];
      }
    }
    this.SSGetShift = SSGetShift; // temporary - David
    
    /*
      Function: SSGetAuthorForShift
        Returns the username of the Shift owner as a string.
        
      Parameters:
        shiftId - a shift id.
        
      Returns:
        A user name as a string.
    */
    function SSGetAuthorForShift(shiftId)
    {
      return SSGetShift(shiftId).username;
    }
    
    /*
    Function: SSGetShiftData
      Returns a copy of the shift data.
      
    Parameters:
      shiftId - a shift id.
      
    Returns:
      An copy of the shift's properties.
    */
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
    
    /*
      Function: SSSetShift
        Update the shift properties of a shift.
        
      Parameters:
        shiftId - a shift id.
    */
    function SSSetShift(shiftId, shiftData)
    {
      shifts[shiftId] = $merge(shifts[shiftId], {
        content: shiftData.content
      });
    }
    
    /*
      Function: SSLoadShift
        Load a single shift from the network.
        
      Parameters:
        shiftId - a shift id.
        callback - a callback handler.
    */
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
    
    /*
      Function: SSLoadShifts
        Same as SSLoadShift except handles an array of shift id.
        
      Parameters:
        shiftIds - an array of shift ids.
        callback - a callback handler.
    */
    function SSLoadShifts(shiftIds, callback)
    {
      // fetch a content from the network;
      var params = { shiftIds: shiftIds.join(',') };
      serverCall.safeCall('shift.get', params, function(_returnArray) {
        var returnArray = _returnArray;
        
        if(returnArray && returnArray.length > 0)
        {
          // filter out null shifts
          returnArray = returnArray.filter(function(x) { return x != null; });

          // update internal array
          returnArray.each(function (shiftObj) {
            SSSetShift(shiftObj.id, shiftObj);
          });
          
          if(callback && $type(callback) == 'function')
          {
            callback(returnArray);
          }
        }
      });
    }
    
    /*
      Function: SSShiftIsLoaded
        Check to see if the shift has it's content loaded yet.
        
      Parameters:
        shiftId - a shift id.
        
      Returns:
        a boolean value.
    */
    function SSShiftIsLoaded(shiftId)
    {
      return SSHasProperty(SSGetShift(shiftId), ('content'));
    }
    
    /*
      Function: SSHasProperty
        Convenience function to check whether an object has a property.
        
      Parameters:
        obj - an Object.
        prop - the property name as a string.
        
      Returns:
        a boolean.
    */
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

    /*
      Function: SSGetShifts
        Similar to SSLoadShifts, probably should be merged.  Only used by plugins.
        
      Parameters:
        shiftIds - an array of shift ids.
        callBack - a callback function.
        errorHandler - a error handling function.
    */
    function SSGetShifts(shiftIds, callBack, errorHandler)
    {
      var newShiftIds = [];
      var finalJson = {};
      
      newShiftIds = shiftIds;

      // put these together
      var params = { shiftIds: newShiftIds.join(',') };
      
      serverCall.safeCall('shift.get', params, function(json) {
        if(json.contains(null))
        {
          if(errorHandler && $type(errorHandler) == 'function')
          {
            errorHandler({
              type: __SSInvalidShiftIdError__, 
              message: "one or more invalid shift ids to SSGetShift"
            });
          }
        }
        else
        {
          // should probably filter out any uncessary data
          json.each(function(x) {
            finalJson[x.id] = x;
          });

          if(callBack) callBack(finalJson);
        }
      });
    }
    
    function SSGetPageShifts(shiftIds)
    {
      var result = [];
      for(var i = 0; i < shiftIds.length; i++)
      {
        var cshift = SSGetShift(shiftIds[i]);
        var copy = {
          username: cshift.username,
          space: cshift.space,
          status: cshift.status
        };
        result.push(copy);
      }
      return result;
    }

    
    /*
      Function: SSGetPageShiftIdsForUser
        Gets all the shifts ids on the current page for the logged in user.
        
      Returns:
        An array of shift ids.
    */
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
      Function: saveShift
        Saves a shift's JSON object to the server.
        
      Parameters:
        shiftJson - a shiftJson object, delivered from Shift.encode.
        
      See Also:
        Shift.encode
    */
    function saveShift(shiftJson) {
      //console.log('saveShift');
      //console.log(shiftJson);
      
      // if new skip to saveNewShift
      if (shiftJson.id.substr(0, 8) == 'newShift') {
        saveNewShift.safeCall(shiftJson);
        return;
      }
      
      var filters = shiftJson.filters;
      delete shiftJson.filters;
      
      var space = spaces[shiftJson.space];
      var params = {
        id: shiftJson.id, // TODO: handle this in a more secure way
        summary: shiftJson.summary,
        content: escape(Json.toString(shiftJson)), // MERGE: for 0.5 - David
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
        console.log('returned shift.update! ' + Json.toString(json));
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
    Function: saveNewShift
      Creates a new entry for the shift on the server.
    
    Parameters:
      shiftJson - a shift json object, delivered from Shift.encode
      
    See Also:
      Shift.encode
    */
    function saveNewShift(shiftJson) 
    {
      var space = spaces[shiftJson.space];
      
      // remove the filters from the json object
      var filters = shiftJson.filters;
      delete shiftJson.filters;
      
      var params = {
        href: window.location.href,
        space: shiftJson.space,
        summary: shiftJson.summary,
        content: escape(Json.toString(shiftJson)),  // MERGE: for 0.5 - David
        version: space.attributes.version,
        filters: Json.toString(filters),
        status: SSGetDefaultShiftStatus() // TODO: this call is in the space ecosystem
      };
      
      /*
      console.log('//////////////////////////////////////////////////////////////////');
      console.log(Json.toString(params));
      console.log('//////////////////////////////////////////////////////////////////');
      */

      serverCall.safeCall('shift.create', params, function(json) {
        //console.log('>>>>>>>>>>>>>>>>> SAVED new shift');
        if (!json.status) 
        {
          console.error(json.message);
          return;
        }
        
        shiftJson.username = ShiftSpace.User.getUsername();
        shiftJson.created = 'Just posted';
        shiftJson.status = SSGetDefaultShiftStatus();
        shiftJson.href = window.location.href;
        
        // with the real value
        var shiftObj = space.shifts[shiftJson.id];
        shiftObj.setId(json.id);
        
        // delete the temporary stuff from the space
        // TODO: The following is hacky, should be made cleaner
        // --------- clean up area starts here -----------------
        delete shifts[shiftJson.id];
        delete space.shifts[shiftJson.id];
        
        if (SSFocusedShiftId() == shiftJson.id) {
          SSSetFocusedShiftId(json.id);
        }
        shiftJson.id = json.id;
        shiftJson.content = Json.toString(shiftJson);
        shifts[shiftJson.id] = shiftJson;
        space.shifts[shiftJson.id] = shiftObj;
        // --------- clean up area of todo ends here --------------
        
        // add and show the shift in the Console
        ShiftSpace.Console.show();
        ShiftSpace.Console.addShift(shiftJson, {isActive:true});
        ShiftSpace.Console.showShift(shiftJson.id);
        
        // call onShiftSave
        space.onShiftSave(shiftJson.id);
      });

    }
    
    /*
    Function: editShift
      Edit a shift.
      
    Parameters:
      shiftId - a shift id.
    */
    function editShift(shiftId) 
    {
      // make sure shift content is either loaded or that it is a newly created shift (thus no content)
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
        
        // if the space is loaded check if this shift can be shown
        if(space)
        {
          if(!space.canShowShift(SSGetShiftContent(shiftId)))
          {
            // bail
            return;
          }
        }
        
        // add a deferred shift edit if the css is not yet loaded
        if(space && !space.cssIsLoaded())
        {
          space.addDeferredEdit(shiftId);
          return;
        }
        
        // if the user has permissions, edit the shift
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
    Function: deleteShift
      Deletes a shift from the server.
    
    Parameters:
      shiftId - a shift id.
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
    
    keyDownHandler
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
          // Check to see if there's a newer release available
          // There's probably a better place to put this call.
          if (SSCheckForUpdates()) {
            return;
          }
          //console.log('show console!');
          keyState.consoleShown = true;
          ShiftSpace.Console.show();
        }

      }
    }
    
    
    /*
    
    keyDownHandler
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
    
    keyPressHandler
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
    
    /*
    Function: loadFile
      Loads a URL and executes a callback with the response
    
    Parameters:
      url - The URL of the target file
      callback - A function to process the file once it's loaded
    */
    function loadFile(url, callback, errCallback)
    {
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
          if(errCallback && typeof errCallback == 'function') errCallback();
        }
      });

      return true;
    }
    
    /*
    Function: loadSpace
      Loads the space's source code, executes it and stores an instance of the
      space class in the 'spaces' object
    
    Parameters:
      space - the Space name to load
      pendingShift - a pending shift id, will probably become deprecaed.
      callback - a callback function to run when the space is loaded.
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
    Function: SSRegisterSpace
      Called by the Space class to register with ShiftSpace.
    
    Parameters:
      instance - A space object.
    */
    function SSRegisterSpace(instance) {
      //console.log("SSRegisterSpace");
      var spaceName = instance.attributes.name;
      //console.log('Register Space ===================================== ' + spaceName);
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
    
    /*
      Function: SSRemoveShift
        Remove a shift from the internal array.
        
      Parameters:
        shiftId - a shift id.
    */
    function SSRemoveShift(shiftId)
    {
      delete shifts[shiftId];
    }
    
    /*
      Function: SSLoadPlugin
        Loads a plugin
        
      Parameters:
        plugin - a plugin name as a string.
        callback - a callback function.
    */
    function SSLoadPlugin(plugin, callback) 
    {
      //console.log('SSLoadPlugin ' + plugin);
      if(plugins[plugin])
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
      Function: SSRegisterPlugin
        Register a plugin.
        
      Parameters:
        plugin - a plugin object.
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
            }, null);
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
    Function: serverCall
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
              //console.log('trying');
              //console.log(rx.responseText);
              //console.log(eval('(' + rx.responseText + ')'));
              //console.log('tried');
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
    Function: setValue
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
    Function: getValue (private, except in debug mode)
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
    Function: loadStyle 
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
      
      //console.log('loadStyle: ' + url);
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
    Function: log
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
    
    /*
      Function: SSCanGoFullScreen
        Returns wether ShiftSpace can lose the fullscreen mode.
        
      Parameters:
        Returns a boolean.
    */
    function SSCanGoFullScreen()
    {
      return true;
    }
    
    /*
      Function: SSCanExitFullScreen
        Return whther ShiftSpace is ready to return to full screen mode.
        
      Returns:
        A boolean.
    */
    function SSCanExitFullScreen()
    {
      return true;
    }
    
    var __errorWindowShiftPropertyModel__;
    var __errorWindowMinimized__ = true;
    
    /*
      Function: SSCreateErrorWindow
        Create the error window.
    */
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
      errorWindowMessage.setHTML('Help us improve our experimental fix feature, copy and paste the shift details and <a target="new" href="http://metatron.shiftspace.org/trac/newticket">file a bug report</a>.');

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
    
    /*
      Function: SSShowErrorWindow
        Show the error window.
        
      Parameters:
        shiftId - a shift id.
    */
    function SSShowErrorWindow(shiftId)
    {
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
            content: unescape(shift.content) // MERGE: for 0.5 - David
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
    
    /*
      Function: SSHideErrorWindow
        Hide the error window.
    */
    function SSHideErrorWindow()
    {
      __errorWindow__.addClass('SSDisplayNone');
    }
    
    /*
      Function: SSErrorWindowUpdateTableForShift
        Update object description table for a shift.
        
      Parameters:
        shiftId - a shift id.
    */
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
          content: unescape(theShift.content) // MERGE: for 0.5 - David
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
      this.plugins = plugins;
      unsafeWindow.ShiftSpace = this;

      // for Action Menu debugging
      this.SSGetPageShifts = SSGetPageShifts;
      this.SSHideShift = hideShift;
      this.SSDeleteShift = deleteShift;
      this.SSEditShift = editShift;
      this.SSShowShift = showShift;
      this.SSUserOwnsShift = SSUserOwnsShift;
      this.SSSetShiftStatus = SSSetShiftStatus;
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
