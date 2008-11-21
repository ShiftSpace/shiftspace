// ==UserScript==
// @name           ShiftSpace
// @namespace      http://shiftspace.org/
// @description    An open source layer above any website
// @include        *
// @exclude        http://metatron.shiftspace.org/api/sandbox/*
// @exclude        http://shiftspace.org/api/sandbox/*
// @exclude        http://www.shiftspace.org/api/sandbox/*
// @require        http://metatron.shiftspace.org/dev/mootools/mootools-1.2-core.js
// @require        http://metatron.shiftspace.org/dev/mootools/mootools-1.2-more.js
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

if(typeof console != 'undefined' && console.log) console.log('Loading ShiftSpace');

/*

Class: ShiftSpace
  A singleton controller object that represents ShiftSpace Core. All methods
  functions and variables are private.  Please refer to the documention on <User>,
  <ShiftSpace.Space>, <ShiftSpace.Shift>, <ShiftSpace.Plugin> to see public
  interfaces.
*/

var ShiftSpace = new (function() {
    // INCLUDE SSLog.js
    if(typeof %%LOG_LEVEL%% != 'undefined')
    {
      SSSetLogLevel(%%LOG_LEVEL%%);
    }
    else
    {
      throw new Error("Bailing: No such logging level %%LOG_LEVEL%%, please fix the config/env/%%ENV_NAME%%.json file.");
      return;
    }

    // NOTE: This will be preprocessed by preprocess.py and replaced with the proper
    // servers
    var server = SSGetValue('server', '%%SERVER%%');
    var spacesDir = SSGetValue('spaceDir', '%%SPACEDIR%%');
    
    var __sys__ = %%SYSTEM_TABLE%%;
    var __sysavail__ = {
      files: [],
      packages: []
    };
    
    SSLog('SERVER: ' + server, SSLogForce);
    SSLog('SPACESDIR: ' + spacesDir, SSLogForce);

    // make sure all our stuff is hidden at first

    // TODO: a place to set deploy vs. develop variables - David
    // Load packages.json

    // Current ShiftSpace version
    var version = '0.13';
    // Cache loadFile data
    var cacheFiles = 0;

    if(typeof ShiftSpaceSandBoxMode != 'undefined') 
    {
      server = window.location.href.substr(0, window.location.href.indexOf('sandbox'));
      cacheFiles = 0;
    }

    // ===========================
    // = ShiftSpace Core Objects =
    // ===========================
    
    var __spaces__ = {};
    var shifts = {};
    var trails = {};
    var plugins = {};
    var displayList = [];
    var __globalState__ = $H();

    // NOTE: will replace with ResourceManager in 0.5 - David
    plugins.attempt = function(options)
    {
      //SSLog('attempting to call plugin');
      var args = ($type(options.args) == 'array' && options.args) || [options.args];
      
      function execute()
      {
        SSLog('executing plugin ' + options.name + ' call ' + options.method, SSLogPlugin);
        SSLog('plugin installed ' + plugins[options.name], SSLogPlugin);
        if(options.method)
        {
          plugins[options.name][options.method].apply(plugins[options.name], args);
          if(options.callback && $type(options.callback) == 'function') options.callback();
        }
      };

      // load then call
      if(!plugins[options.name])
      {
        SSLog('Load plugin ' + options.name, SSLogPlugin);
        // Listen for the real load event
        SSAddEvent('onPluginLoad', function(plugin) {
          SSLog(options.name + ' plugin loaded ', SSLogPlugin);
          if(plugin.attributes.name == options.name) execute();
        });
        // Loading the plugin
        SSLoadPlugin(options.name, null);
      }
      else
      {
        execute();
      }
    };

    var __SSInvalidShiftIdError__ = "__SSInvalidShiftIdError__";

    // Holds the id of the currently focused shift
    var __focusedShiftId__ = null;
    var __focusedSpace__ = null;

    var __consoleIsWaiting__ = false;
    var __defaultShiftStatus__ = 1;
    var __defaultEmailComments__ = 1;

    // paths to required ShiftSpace files
    // TODO: remove this dependency - David
    this.ClassPaths = {
      'SSTableViewDatasource': '/client/'
    };

    // TODO: paths to view controllers, should probably just default unless defined in UserClassPaths - David
    this.UIClassPaths = {
      'SSCell': '/client/views/SSCell/',
      'SSEditableTextCell': '/client/views/SSEditableTextCell/',
      'SSTabView': '/client/views/SSTabView/',
      'SSTableView': '/client/views/SSTableView/',
      'SSTableRow': '/client/views/SSTableRow/',
      'SSConsole': '/client/views/SSConsole/'
    };

      // path to user defined view controllers
    this.UserClassPaths = {
      'SSCustomTableRow': '/client/customViews/SSCustomTableRow/' // TODO: change this to point to the real folder - David
    };

    // Stores initial data for plugins that are needed for the console at startup
    // since the plugins won't actually be loaded until they are needed
    var __pluginsData__ = {};

    // Each space and a corresponding URL of its origin
    var installed;
    if(typeof ShiftSpaceSandBoxMode == 'undefined')
    {
      // respect that fact that different space may come from different servers
      // besides the one where user data is being stored
      installed = SSGetValue('installed', {
        'Notes' : server + 'spaces/Notes/Notes.js',
        'ImageSwap': server + 'spaces/ImageSwap/ImageSwap.js',
        'Highlights': server + 'spaces/Highlights/Highlights.js',
        'SourceShift': server + 'spaces/SourceShift/SourceShift.js'
      });
    }
    else
    {
      // if in sandbox dev'ing load from the global server var
      installed = {
        'Notes' : server + 'spaces/Notes/Notes.js',
        'ImageSwap': server + 'spaces/ImageSwap/ImageSwap.js',
        'Highlights': server + 'spaces/Highlights/Highlights.js',
        'SourceShift': server + 'spaces/SourceShift/SourceShift.js'
      };
      SSLog(installed);
    }

    var spacePrefs = SSGetValue('spacePrefs', {});

    // Each plugin and a corresponding URL of its origin

    var installedPlugins = {};
    
    /*
    if(typeof ShiftSpaceSandBoxMode == 'undefined')
    {
      // otherwise respect existing values, servers might be different
      // for different resources
      installedPlugins = SSGetValue('installedPlugins', {
        'Delicious': server + 'plugins/Delicious/Delicious.js',
        'Trails': server + 'plugins/Trails/NewTrail.js',
        'Comments': server + 'plugins/Comments/Comments.js',
        'Twitter': server + 'plugins/Twitter/Twitter.js'
      });
      SSLog(installedPlugins);
    }
    else
    {
      // hard code so that we pick up from localhost if dev'ing
      installedPlugins = {
        'Trails': server + 'plugins/Trails/NewTrail.js',
        'Comments': server + 'plugins/Comments/Comments.js'
      };
    }
    */

    // installedPlugins = {
    //   'Trails' : myFiles + 'plugins/Trails/NewTrail.js'
    // };

    // An index of cached files, used to clear the cache when necessary
    var cache = SSGetValue('cache', []);

    // new additions for Sandalphon
    this.UI = {}; // holds all UI class objects
    this.Objects = new Hash(); // holds all instantiated UI objects
    this.NameTable = new Hash(); // holds all instantiated UI object by CSS id

    // Private variable and function for controlling user authentication
    var username = false;
    function setUsername(_username) {
      username = _username;
    }

    var alreadyCheckedForUpdate = false;

    // INCLUDE PACKAGE System
    // INCLUDE PACKAGE ErrorHandling
    // INCLUDE PACKAGE Internationalization
    // INCLUDE PACKAGE EventHandling
    // INCLUDE PACKAGE UtilitiesExtras
    // INCLUDE PACKAGE Core
    
    function SSResetCore()
    {
      // reset all internal state
      __spaces__ = {};
    }
    
    /*

    Function: initialize
    Sets up external components and loads installed spaces.

    */
    this.initialize = function() {
      // ShiftSpace global var is set by this point not before.
      
      // export for third party deveopers
      ShiftSpace.Element = SSElement;
      ShiftSpace.Iframe = SSIframe;
      ShiftSpace.Input = SSInput;
      
      // look for install links
      SSCheckForInstallSpaceLinks();
      if(SSLocalizedStringSupport()) SSLoadLocalizedStrings("en");
      SSLog('load localized strings');
      
      // Load external scripts (pre-processing required)

      // INCLUDE PACKAGE Pinning
      // INCLUDE PACKAGE ShiftSpaceCore
      // INCLUDE PACKAGE ShiftSpaceCoreUI
      // INCLUDE PACKAGE ShiftSpaceUI
      
      // Set up user event handlers
      ShiftSpace.User.addEvent('onUserLogin', function() {
        SSLog('ShiftSpace Login ======================================');
        SSSetDefaultShiftStatus(SSGetPref('defaultShiftStatus', 1));
        // FIXME: Just make this into a onUserLogin hook - David
        if(SSHasResource('RecentlyViewedHelpers'))
        {
          SSSetValue(ShiftSpace.User.getUsername() + '.recentlyViewedShifts', []);
        }
        SSFireEvent('onUserLogin');
      });

      ShiftSpace.User.addEvent('onUserLogout', function() {
        SSFireEvent('onUserLogout');
      });
      
      // Load CSS styles
      SSLog('Loading core stylesheets', SSLogSystem);
      SSLoadStyle('styles/ShiftSpace.css', function() {
        // create the error window
        SSCreateErrorWindow();
      });
      SSLoadStyle('styles/ShiftMenu.css');

      SSLog('>>>>>>>>>>>>>>>>>>>>>>> Loading Spaces', SSLogSystem);
      // Load all spaces and plugins immediately if in the sanbox
      if (typeof ShiftSpaceSandBoxMode != 'undefined') 
      {
        for (var space in installed) 
        {
          SSLog('loading space ' + space, SSLogSystem);
          SSLoadSpace(space);
        }
        for(var plugin in installedPlugins) 
        {
          SSLoadPlugin(plugin);
        }
      }

      // If all spaces have been loaded, build the shift menu and the console
      SSLog('Building ShiftMenu', SSLogSystem);
      ShiftSpace.ShiftMenu.buildMenu();
      
      // hide all pinWidget menus on window click
      window.addEvent('click', function() {
        if(ShiftSpace.Console)
        {
          ShiftSpace.Console.hidePluginMenu.bind(ShiftSpace.Console)();
          __pinWidgets__.each(function(x){
            if(!x.isSelecting) x.hideMenu();
          });
        }
      });

      // create the pin selection bounding box
      SSLog('Creating pin selection DOM', SSLogSystem);
      SSCreatePinSelect();

      // check for page iframes
      SSCheckForPageIframes();

      SSLog('Grabbing content');

      // Create the modal div
      SSLog('Create DOM for modal mode and dragging', SSLogSystem);
      SSCreateModalDiv();
      SSCreateDragDiv();
      SSLog('ShiftSpace initialize complete');
      
      // Synch with server, 
      SSLog('Synchronizing with server', SSLogSystem);
      SSSynch();
    };
    
    function SSHasResource(resourceName)
    {
      return __sysavail__.files.contains(resourceName) || __sysavail__.packages.contains(resourceName);
    }
    
    function SSResourceExists(resourceName)
    {
      return __sys__.files[resourceName] != null || __sys__.packages[resourceName] != null;
    }
    
    /*
    Function: SSSynch
      Synchronize with server: checks for logged in user.
    */
    function SSSynch() 
    {
      var params = {
        href: window.location.href
      };
      SSServerCall('query', params, function(json) {
        SSLog('++++++++++++++++++++++++++++++++++++++++++++ GOT CONTENT');
        
        if (!json.status) 
        {
          console.error('Error checking for content: ' + json.message);
          return;
        }

        if (json.username)
        {
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
        SSLog('+++++++++++++++++++++++++++++++++++++++++++ exit SSynch');
      });
    }
    
    // Element extensions because child selectors don't work properly in MooTools 1.2 for some reason - David
    Element.implement({
      _ssgenId: function()
      {
        var id = this.getProperty('id');
        if(!id)
        {
          id = Math.round(Math.random()*1000000+(new Date()).getMilliseconds());
          this.setProperty('id', 'generatedId_'+id);
        }
        return id;
      },
      _getElement: function(sel)
      {
        this._ssgenId();
        return (new Document(this.ownerDocument)).getWindow().$$('#' + this.getProperty('id') + ' ' + sel)[0];
      },
      _getElements: function(sel)
      {
        this._ssgenId();
        return (new Document(this.ownerDocument)).getWindow().$$('#' + this.getProperty('id') + ' ' + sel);
      }
    });
    
    function SSLocalizedStringSupport()
    {
      return (typeof __sslang__ != 'undefined');
    }
    
    // Localized String Support
    function SSLocalizedString(string)
    {
      if(SSLocalizedStringSupport() && ShiftSpace.localizedStrings[string]) return ShiftSpace.localizedStrings[string];
      return string;
    }

    // ===============================
    // = Function Prototype Helpers  =
    // ===============================

    // This won't work for GM_getValue of course - David
    Function.prototype.safeCall = function() {
      var self = this, args = [], len = arguments.length;
      for(var i = 0; i < len; i++) args.push(arguments[i]);
      setTimeout(function() {
        return self.apply(null, args);
      }, 0);
    };

    // Work around for GM_getValue - David
    Function.prototype.safeCallWithResult = function() {
      var self = this, args = [], len = arguments.length;
      for(var i = 0; i < len-1; i++) args.push(arguments[i]);
      // the last argument is the callback
      var callback = arguments[len-1];
      setTimeout(function() {
        callback(self.apply(null, args));
      }, 0);
    };

    /*
      Function: SSSetPref
        Set a user preference. Implicitly calls SSSetValue which will JSON encode the value.

      Parameters:
        pref - the preference name as string.
        value - the value.

      See Also:
        SSSetValue
    */
    function SSSetPref(pref, value)
    {
      if(ShiftSpace.User.isLoggedIn())
      {
        var key = [ShiftSpace.User.getUsername(), pref].join('.');
        SSSetValue(key, value);
      }
    }

    /*
      Function: SSGetPref
        Return a user preference.  Implicity calls SSGetValue which will JSON decode the value.

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
        return SSGetValue(key, defaultValue);
      }
      return defaultValue;
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
    this.info = function(spaceName) 
    {
      if (typeof spaceName != 'undefined') 
      {
        var defaults = {
          title: spaceName,
          icon: server + 'images/unknown-space.png',
          version: '1.0'
        };
        if (!installed[spaceName]) 
        {
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
      for (var aSpaceName in installed) 
      {
        spaceIndex.push(aSpaceName);
      }
      return {
        server: server,
        spacesDir: spacesDir,
        spaces: spaceIndex.join(', '),
        version: version
      };
    };

    
    function SSPluginForName(name)
    {
      var plugin = plugin[name];
      
      if(!plugin)
      {
        throw SSPluginDoesNotExistError(new Error());
      }
      else
      {
        return plugin;
      }
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
      return SSGetShift(shiftId).username;
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
      SSLog('SSGetPluginType');
      if(__pluginsData__[pluginName] && __pluginsData__[pluginName].type)
      {
        return __pluginsData__[pluginName].type;
      }
      else
      {
        SSLog('(1) If this is at ShiftSpace load time: if you wish to include plugin data included at shift query time for the ' + pluginName + ' plugin you must include a shift.query.php file in your plugin folder.  Please refer to the Comments version of this file for reference. (2) You need to define plugin type, refer to Plugin.js. kisses, The ShiftSpace Core Robot', SSLogWarning);
        return null;
      }
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
	return null;
      }
    };

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

    // TODO: write some documentation here
    function SSCheckForUpdates()
    {
      // Only check once per page load
      if (alreadyCheckedForUpdate) 
      {
        return false;
      }
      alreadyCheckedForUpdate = true;

      var now = new Date();
      var lastUpdate = SSGetValue('lastCheckedForUpdate', now.getTime());

      // Only check every 24 hours
      if (lastUpdate - now.getTime() > 86400)
      {
        SSSetValue('lastCheckedForUpdate', now.getTime());

        GM_xmlhttpRequest({
          method: 'POST',
          url: server + 'shiftspace.php?method=version',
          onload: function(rx)
          {
            if (rx.responseText != version)
            {
              if (confirm('There is a new version of ShiftSpace available. Would you like to update now?'))
              {
                window.location = 'http://www.shiftspace.org/api/shiftspace.php?method=shiftspace.user.js';
              }
            }
          }
        });

        return true;
      }
      return false;
    };

    /*
      Function: SSXmlHttpRequest
        Private version of GM_xmlHttpRequest. Implemented for public use via Space/Shift.xmlhttpRequest.

      Parameters:
        config - same JSON object as used by GM_xmlhttpRequest.
    */
    function SSXmlHttpRequest(config) 
    {
      GM_xmlhttpRequest(config);
    }

    /*
    Function: SSClearCache
      Expunge previously stored files.

    Parameters:
        url - (Optional) The URL of the file to remove. If not specified, all
              files in the cache will be deleted.
    */
    function SSClearCache(url) 
    {
      if (typeof url == 'string') 
      {
        // Clear a specific file from the cache
        log('Clearing ' + url + ' from cache');
        SSSetValue('cache.' + url, 0);
      } 
      else 
      {
        // Clear all the files from the cache
        cache.each(function(url) {
          log('Clearing ' + url + ' from cache');
          SSSetValue('cache.' + url, 0);
        });
      }
    };

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
          var spaceObject = SSSpaceForName(space);

          // in the case of the web we need to load the space first
          if(!spaceObject)
          {
            // load the space first
            SSLoadSpace(space, function() {
              ids.each(SSShowShift);
            });
            return;
          }
          else
          {
            // otherwise just show the puppies, this works in the sandbox
            ids.each(SSShowShift);
          }
        }
      }
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

    /*
    Function: SSLoadFile
      Loads a URL and executes a callback with the response

    Parameters:
      url - The URL of the target file
      callback - A function to process the file once it's loaded
    */
    function SSLoadFile(url, callback)
    {
      // If the URL doesn't start with "http://", assume it's on our server
      if (url.substr(0, 7) != 'http://' &&
          url.substr(0, 8) != 'https://') {
        url = server + url;
      }

      //SSLog('loadFile:' + url);

      // Caching is implemented as a rather blunt instrument ...
      if (!cacheFiles) 
      {
        // ... either append the current timestamp to the URL ...
        var now = new Date();
        url += (url.indexOf('?') == -1) ? '?' : '&';
        url += now.getTime();
      } 
      else 
      {
        SSLog('load from cache');
        // ... or use SSGetValue to retrieve the file's contents
        var cached = SSGetValue('cache.' + url, false, true);

        if (cached) 
        {
          //SSLog('Loading ' + url + ' from cache');
          if (typeof callback == 'function') 
          {
            callback({ responseText: cached });
          }
          return true;
        }
      }

      // Load the URL then execute the callback
      //SSLog('Loading ' + url + ' from network');
      GM_xmlhttpRequest({
        'method': 'GET',
        'url': url,
        'onload': function(response) 
        {
          // Store file contents for later retrieval
          if (cacheFiles) 
          {
            cache.push(url);
            SSSetValue('cache', cache);
            SSSetValue('cache.' + url, response.responseText, true);
          }
          if (typeof callback == 'function') 
          {
            callback(response);
          }
        },
        'onerror': function(response) 
        {
          SSLog("failed loadFile call, for file " + url, SSLogError);
          if(errCallback && typeof errCallback == 'function') errCallback(); // FIXME: broken - David
        }
      });

      return true;
    }


    /*
    Function: SSServerCall
      Sends a request to the server.

    Parameters:
      method - Which method to call on the server (string)
      parameters - Values passed with the call (object)
      callback - (optional) A function to execute upon completion
    */
    function SSServerCall(method, parameters, _callback) 
    {
      var callback = _callback;
      var url = server + 'shiftspace.php?method=' + method;
      
      SSLog('serverCall: ' + url, SSLogServerCall);
      
      var data = '';

      for (var key in parameters) 
      {
        if (data != '') 
        {
          data += '&';
        }
        data += key + '=' + encodeURIComponent(parameters[key]);
      }

      var plugins = new Hash(installedPlugins);
      url += '&plugins=' + plugins.getKeys().join(',');

      var now = new Date();
      url += '&cache=' + now.getTime();

      //SSLog(data);

      //GM_openInTab(url);
      var req = {
        method: 'POST',
        url: url,
        data: data,
        onload: function(_rx) 
        {
          SSLog('done!');
          var rx = _rx;
          SSLog('servercall returned', SSLogServerCall);
          /*
          SSLog(rx.responseText);
          SSLog(typeof callback == 'function');
          */
          if ($type(callback) == 'function') 
          {
            //SSLog('evaluate ' + rx.responseText);
            try
            {
              SSLog('trying ' + url);
              SSLog(rx.responseText);
              SSLog(eval('(' + rx.responseText + ')'));
              SSLog('tried ' + url);
              var theJson = JSON.decode(rx.responseText);
              SSLog('success!');
            }
            catch(exc)
            {
              SSLog('Server call exception: ' + SSDescribeException(exc), SSLogServerCall);
            }
            /*
            SSLog('done evaluating');
            SSLog(callback);
            */
            callback(theJson);
          }
          else
          {
            SSLog('callback is not a function', SSLogServerCall);
          }
        },
        onerror: function(err)  
        {
          SSLog(err);
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
    Function: SSSetValue
      A wrapper function for GM_setValue that handles non-string data better.

    Parameters:
      key - A unique string identifier
      value - The value to store. This will be serialized by uneval() before
              it gets passed to GM_setValue.

    Returns:
        The value passed in.
    */
    function SSSetValue(key, value, rawValue) 
    {
      if (rawValue) 
      {
        GM_setValue(key, value);
      } 
      else 
      {
        GM_setValue(key, JSON.encode(value));
      }
      return value;
    }


    /*
    Function: SSGetValue (private, except in debug mode)
      A wrapper function for GM_getValue that handles non-string data better.

    Parameters:
      key - A unique string identifier
      defaultValue - This value will be returned if nothing is found.
      rawValue - Doesn't use Json encoding on stored values

    Returns:
      Either the stored value, or defaultValue if none is found.
    */
    function SSGetValue(key, defaultValue, rawValue) 
    {
      if (!rawValue) 
      {
        defaultValue = JSON.encode(defaultValue);
      }
      var result = GM_getValue(key, defaultValue);
      // Fix for GreaseKit, which doesn't support default values
      if (result == null) 
      {
        SSLog('SSGetValue("' + key + '") = ' + JSON.decode(defaultValue), SSLogForce);
        return JSON.decode(defaultValue);
      } 
      else if (rawValue) 
      {
        SSLog('SSGetValue("' + key + '") = ' + result, SSLogForce);
        return result;
      } 
      else 
      {
        SSLog('SSGetValue("' + key + '") = ...' + JSON.decode(result), SSLogForce);
        return JSON.decode(result);
      }
    }


    /*
    Function: SSLoadStyle
      Loads a CSS file, processes it to make URLs absolute, then appends it as a
      STYLE element in the page HEAD.

    Parameters:
      url - The URL of the CSS file to load
      callback - A custom function to handle css text if you don't want to use GM_addStyle
      spaceCallback - A callback function for spaces that want to use GM_addStyle but need to be notified of CSS load.
    */
    function SSLoadStyle(url, callback, frame) 
    {
      // TODO: check to see if the domain is different, if so don't mess with the url - David
      // TODO: get rid of frame, change to context so we can use this function for iframe's as well
      var dir = url.split('/');
      dir.pop();
      dir = dir.join('/');
      if (dir.substr(0, 7) != 'http://') {
        dir = server + dir;
      }

      //SSLog('loadStyle: ' + url);
      SSLoadFile(url, function(rx) {
        //SSLog(')))))))))))))))))))))))))))))))))))))))))))))))))) ' + url);
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
          // FIXME: we don't want to rely on this, we can't target iframes - David
          GM_addStyle(css);
        }

        if (typeof callback == 'function')
        {
          callback();
        }

      });
    }
    
    var __dragDiv__;
    function SSCreateDragDiv()
    {
      __dragDiv__ = new ShiftSpace.Element('div', {
        id: 'SSDragDiv'
      });
    }
    
    function SSAddDragDiv()
    {
      console.log('SSAddDragDiv');
      $(document.body).grab(__dragDiv__);
    }
    
    function SSRemoveDragDiv()
    {
      console.log('SSRemoveDragDiv');
      __dragDiv__ = __dragDiv__.dispose();
    }

    // In sandbox mode, expose something for easier debugging.
    if (typeof ShiftSpaceSandBoxMode != 'undefined')
    {
      this.spaces = SSAllSpaces();
      this.shifts = shifts;
      this.trails = trails;
      this.SSSetValue = SSSetValue;
      this.SSGetValue = SSGetValue;
      this.plugins = plugins;
      unsafeWindow.ShiftSpace = this;
      
      // For Sandbox export classes
      this.Space = ShiftSpace.Space;
      this.Shift = ShiftSpace.Shift;
      this.Plugin = ShiftSpace.Plugin;

      this.SSGetShift = SSGetShift;
      this.SSGetPageShifts = SSGetPageShifts;
      this.SSHideShift = SSHideShift;
      this.SSDeleteShift = SSDeleteShift;
      this.SSEditShift = SSEditShift;
      this.SSShowShift = SSShowShift;
      this.SSUserOwnsShift = SSUserOwnsShift;
      this.SSSetShiftStatus = SSSetShiftStatus;
      this.sys = __sys__;
      this.SSHasResource = SSHasResource;
      this.SSResourceExists = SSResourceExists;
      
      // export SSLog
      window.SSLog = SSLog;
    }

    return this;
})();

// NOTE: For Safari & Firefox 3.1 to keep SS extensions out of private scope - David
ShiftSpace.__externals__ = {
  evaluate: function(external, object)
  {
    with(ShiftSpace.__externals__)
    {
      eval(external);
    }
  }
};

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
