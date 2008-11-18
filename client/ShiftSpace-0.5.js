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

console.log('Loading ShiftSpace');

/*

Class: ShiftSpace
  A singleton controller object that represents ShiftSpace Core. All methods
  functions and variables are private.  Please refer to the documention on <User>,
  <ShiftSpace.Space>, <ShiftSpace.Shift>, <ShiftSpace.Plugin> to see public
  interfaces.
*/

var ShiftSpace = new (function() {
    // INCLUDE SSLog.js
    SSSetLogLevel(SSLogError);

    // Default to http://shiftspace.org/dev
    var server = SSGetValue('server', 'http://www.shiftspace.org/dev/');
    var spacesDir = SSGetValue('spaceDir', 'http://www.shiftspace.org/dev/spaces/');

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

    // {SystemBasePackages}
    
    // INCLUDE IframeHelpers.js
    // INCLUDE SSException.js
    // INCLUDE PinHelpers.js
    // INCLUDE SSViewProxy.js
    // LocalizedStringsSupport.js
    // INCLUDE SandalphonSupport.js
    // INCLUDE EventProxy.js
    // INCLUDE RecentlyViewedHelpers.js
    // INCLUDE FullScreen.js
    // INCLUDE ErrorWindow.js
    // INCLUDE Element.js
    // INCLUDE ../sandalphon/sandalphon.js
    
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

      // INCLUDE User.js
      SSLog('User.js loaded');

      SSLog('Element.js loaded');
      // INCLUDE SSView.js
      SSLog('SSView.js loaded');
      // INCLUDE views/SSCell/SSCell.js
      SSLog('SSCell.js loaded');
      // INCLUDE views/SSEditableTextCell/SSEditableTextCell.js
      SSLog('SSEditableTextCell.js loaded');
      // INCLUDE views/SSTabView/SSTabView.js
      SSLog('SSTabView.js loaded');
      // INCLUDE SSTableViewDatasource.js
      SSLog('SSTableViewDatasource.js loaded');
      // INCLUDE views/SSTableView/SSTableView.js
      SSLog('SSTableView.js loaded');
      // INCLUDE views/SSTableRow/SSTableRow.js
      SSLog('SSTableRow.js loaded');
      // INCLUDE customViews/SSCustomTableRow/SSCustomTableRow.js
      SSLog('SSCustomTableRow.js loaded');
      // INCLUDE views/SSConsole/SSConsole.js
      SSLog('SSConsole.js loaded');
      // INCLUDE Space.js
      SSLog('Space.js loaded');
      // INCLUDE Shift.js
      SSLog('Shift.js loaded');
      // INCLUDE RangeCoder.js
      SSLog('RangeCoder.js loaded');
      // INCLUDE Pin.js
      SSLog('Pin.js loaded');
      // INCLUDE PinWidget.js
      SSLog('PinWidget.js loaded');
      // INCLUDE Plugin.js
      SSLog('Plugin.js loaded');
      // INCLUDE ShiftMenu.js
      SSLog('ShiftMenu.js loaded');
      // INCLUDE CoreEvents.js
      SSLog('CoreEvents.sj loaded');
      
      // Set up user event handlers
      ShiftSpace.User.addEvent('onUserLogin', function() {
        SSLog('ShiftSpace Login ======================================');
        SSSetDefaultShiftStatus(SSGetPref('defaultShiftStatus', 1));
        // clear out recently viewed shifts on login
        SSSetValue(ShiftSpace.User.getUsername() + '.recentlyViewedShifts', []);
        SSFireEvent('onUserLogin');
      });

      ShiftSpace.User.addEvent('onUserLogout', function() {
        SSFireEvent('onUserLogout');
      });
      
      // Load CSS styles
      SSLoadStyle('styles/ShiftSpace.css', function() {
        // create the error window
        SSCreateErrorWindow();
      });
      SSLoadStyle('styles/ShiftMenu.css');

      SSLog('>>>>>>>>>>>>>>>>>>>>>>> Loading Spaces');
      // Load all spaces and plugins immediately if in the sanbox
      if (typeof ShiftSpaceSandBoxMode != 'undefined') 
      {
        for (var space in installed) 
        {
          SSLog('loading space ' + space);
          SSLoadSpace(space);
        }
        for(var plugin in installedPlugins) 
        {
          SSLoadPlugin(plugin);
        }
      }

      // If all spaces have been loaded, build the shift menu and the console
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
      SSCreatePinSelect();

      // check for page iframes
      SSCheckForPageIframes();

      SSLog('Grabbing content');

      // Create the modal div
      SSCreateModalDiv();
      SSCreateDragDiv();
      SSLog('ShiftSpace initialize complete');
      
      // Synch with server, 
      SSSynch();
    };
    
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
    
    function SSCheckForInstallSpaceLinks()
    {
      $$('.SSInstallFirstLink').setStyle('display', 'none');

      $$('.SSInstallSpaceLink').each(function(x) {
       SSLog('================================================== SSCheckForInstallSpaceLinks');
       x.setStyle('display', 'block');
       x.addEvent('click', SSHandleInstallSpaceLink);
      });
    }
    
    function SSHandleInstallSpaceLink(_evt)
    {
      var evt = new Event(_evt);
      var target = evt.target;
      var spaceName = target.getAttribute('title');
      
      //SSLog(target);
      SSLog('installing ' + spaceName);
      
      // first check for the attributes file
      // loadFile(server + 'spaces/' + spaceName + '/attributes.js', SSInstallSpaceLinkCallback, SSInstallSpaceLinkCallback);
      SSInstallSpace(spaceName);
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
    
    /*
      Function: SSSetShiftStatus
        Sets the shift public private status.

      Parameters:
        shiftId - a shift id.
        newStatus - the status.
    */
    function SSSetShiftStatus(shiftId, newStatus) 
    {
      SSGetShift(shiftId).status = newStatus;
      var params = {
        id: shiftId,
        status: newStatus
      };
      SSServerCall('shift.update', params, function() {
        SSLog('>>>>>>>>>>>>>>>>>>>>>>>> shiftId ' + shiftId);
        SSFireEvent('onShiftUpdate', shiftId);
      });
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
        Set user preference for a space.  Calls SSSetValue.  The preference
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
        SSSetValue(key, value);
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
        var value = SSGetValue(key, null);
        return value;
      }
      return null;
    };

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


    function SSGetInfoForInstalledSpace(spaceName, callback)
    {
      // fetch data for the space
    }


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
        var content = unescape(shift.content);

        // if it starts with a quote remove the extra quoting, became an issue when we don't preload shifts - David
        if(content[0] == '"')
        {
          content = content.substr(1, content.length-2);
        }

        // replace any spurious newlines or carriage returns
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

        var obj = null;
        try
        {
          obj = JSON.decode(content);
        }
        catch(err)
        {
          SSLog('content for shift ' + shiftId +' failed to load', SSLogError);
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
      //SSLog(shifts[shiftId]);
      return SSGetShift(shiftId).href;
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
      //SSLog('SSSpaceForShift');
      var shift = SSGetShift(shiftId);
      return SSSpaceForName(shift.space);
    }
    
    function SSSpaceNameForShift(shiftId)
    {
      var shift = SSGetShift(shiftId);
      return shift.space;
    }
    
    /*
      Functions: SSpaceForName
        Returns the space associated with a particular name.
    */
    function SSSpaceForName(name)
    {
      var space = __spaces__[name];
      
      if(!space)
      {
        throw SSSpaceDoesNotExistError(new Error());
      }
      else
      {
        return space;
      }
    }
    
    function SSSetSpaceForName(space, name)
    {
      __spaces__[name] = space;
    }
    
    function SSRemoveSpace(name)
    {
      delete __spaces__[name];
    }
    
    function SSSpacesCount()
    {
      return __spaces__.length;
    }
    
    function SSAllSpaces()
    {
      return __spaces__;
    }
    
    function SSAllShifts()
    {
      return shifts;
    }
    
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

    Function: SSInstallSpace
      Loads the JavaScript source of a Space, then loads the space into memory.
      The source URL is saved in the 'installed' object for future reference.

    Parameters:
      space - The Space name to install
    */
    function SSInstallSpace(space) 
    {
      if(!installed[space])
      {
        var url = server + 'spaces/' + space + '/' + space + '.js';
        installed[space] = url;
        SSSetValue('installed', installed);

        // let everyone else know
        SSLoadSpace(space, function() {
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
    function SSUninstallSpace(spaceName) 
    {
      var url = installed[spaceName];
      SSRemoveSpace(spaceName);
      delete installed[spaceName];
      SSSetValue('installed', installed);

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
    Function: SSInitShift
      Creates a new shift on the page.

    Parameters:
      space - The name of the Space the Shift belongs to.
    */
    function SSInitShift(spaceName, options) 
    {
      SSLog('spaceName: ' + spaceName);
      if (!installed[spaceName]) 
      {
        SSLog('Space ' + spaceName + ' does not exist.', SSLogError);
        return;
      }

      var tempId = 'newShift' + Math.round(Math.random(0, 1) * 1000000);
      while (SSGetShift(tempId)) 
      {
        tempId = 'newShift' + Math.round(Math.random(0, 1) * 1000000);
      }

      var _position = (options && options.position && { x: options.position.x, y: options.position.y }) || null;
      var shiftJson = {
        id: tempId,
        space: spaceName,
        username: ShiftSpace.User.getUsername(),
        position: _position
      };
      //SSLog(shiftJson);

      SSSetShift(tempId, shiftJson);

      SSLog('+++++++++++++++++++++++++++++++++++++++++++++++');
      SSLog(SSSpaceForName(spaceName));
      SSLog('calling create shift');
      
      var noError = SSSpaceForName(spaceName).createShift(shiftJson);
      
      SSLog('noError : ' + noError);
      
      if(noError)
      {
        //SSLog('tempId:' + tempId);
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
      SSLog('SSShowNewShift');
      SSShowShift(shiftId); // TODO: remove - David
      SSLog('calling onShiftCreate');
      space.onShiftCreate(shiftId);
      SSEditShift(shiftId);
      SSFocusShift(shiftId, false);
    }

    /*
    Function: SSFocusShift
      Focuses a shift.

    Parameter:
      shiftId - the id of the shift.
    */
    function SSFocusShift(shiftId)
    {
      var shift = SSGetShift(shiftId);
      var space = SSSpaceForShift(shiftId);
      var lastFocusedShift = SSFocusedShiftId();

      // unfocus the last shift
      if (lastFocusedShift &&
          SSGetShift(lastFocusedShift) &&
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
        var vsize = mainView.getSize();
        //var viewPort = window.getSize().viewPort; // window.getViewPort();
        var viewPort = window.getSize();
        var windowScroll = window.getScroll();

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
        //SSLog('+++++++++++++++++++++++++++++++++++++++ NO MAIN VIEW');
      }
    }

    /*
      Function: SSBlurShift
        Blurs a shift.

      Parameters:
        shiftId - a shift id.
    */
    function SSBlurShift(shiftId)
    {
      // create a blur event so console gets updated
      var space = SSSpaceForShift(shiftId);
      space.blurShift(shiftId);
      space.onShiftBlur(shiftId);
    }

    /*
    SSFocusSpace
    Focuses a space.

    Parameter:
      space - a ShiftSpace.Space instance
    */
    function SSFocusSpace(space, position)
    {
      SSLog('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> FOCUS SPACE');

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
      Function: SSUpdateTitleOfShift
        Tell the space to the update the title of the shift if necessary.

      Parameters:
        shiftId - a shift id.
        title - the new title.
    */
    function SSUpdateTitleOfShift(shiftId, title)
    {
      SSSpaceForShift(shiftId).updateTitleOfShift(shiftId, title);
      SSShowShift(shiftId);
    }

    /*
    Function: SSShowShift
      Displays a shift on the page.

    Parameters:
      shiftId - The ID of the shift to display.
    */
    function SSShowShift(shiftId)
    {
      SSLog('SSShowShift >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ' + SSShiftIsLoaded(shiftId));
      if(!SSShiftIsLoaded(shiftId) && !SSIsNewShift(shiftId))
      {
        SSLog('SSLoadShift');
        // first make sure that is loaded
        SSLoadShift(shiftId, SSShowShift.bind(ShiftSpace));
        return;
      }
      else
      {
        try
        {
          SSLog('Try showing shift!');
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
            SSLog(shift);
            SSLog('space not loaded ' + shift.space + ', ' + shiftId);
            SSLoadSpace(shift.space);
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
          SSLog('extracted shift json');
          shiftJson.id = shiftId;

          // SSLog('foo -- - - -- - - --- - - -- - -- -- - -');
          // SSLog(shiftJson);
          // check to make sure the css is loaded first
          if(!space.cssIsLoaded())
          {
            //SSLog('css not loaded');
            space.addDeferredShift(shiftJson);
            return;
          }

          // fix legacy content
          shiftJson.legacy = shift.legacy;

          // add to recently viewed list
          SSAddRecentlyViewedShift(shiftId);

          // wrap this in a try catch
          if(typeof ShiftSpaceSandBoxMode == 'undefined')
          {
            try
            {
              SSLog('showing the shift =======================================');
              SSSpaceForName(shift.space).showShift(shiftJson);
            }
            catch(err)
            {
              SSLog('Exception: ' + SSDescribeException(err));
              console.error(err);
            }
          }
          else
          {
            // in the sandbox we just want to see the damn error
            SSSpaceForName(shift.space).showShift(shiftJson);
          }

          SSFocusShift(shift.id);

          // call onShiftShow
          space.onShiftShow(shiftId);
        }
        catch(err)
        {
          SSLog('Could not show shift, ' + SSDescribeException(err), SSLogError);
          var params = {id:shiftId};
          SSServerCall.safeCall('shift.broken', params, function(result) {
            SSLog(result);
          });

          SSShowErrorWindow(shiftId);

          // probably need to do some kind of cleanup
          if(ShiftSpace.Console) ShiftSpace.Console.hideShift(shiftId);
        }
      }
    }



    /*

    Function: SSHideShift
      Hides a shift from the page.

    Parameters:
        shiftId - The ID of the shift to hide.

    */
    function SSHideShift(shiftId)
    {
      var shift = SSGetShift(shiftId);
      var space = SSSpaceForShift(shiftId);

      space.hideShift(shiftId);
      space.onShiftHide(shiftId);
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
    Function: SSAllShiftIdsForSpace
      Returns all shift ids on the current url for a particular Space.

    Parameters:
      spaceName - the name of the Space as a string.
    */
    function SSAllShiftIdsForSpace(spaceName)
    {
      var shiftsForSpace = [];
      var allShifts = SSAllShifts();
      for(shiftId in allShifts)
      {
        if(SSSpaceNameForShift(shiftId) == spaceName)
        {
          shiftsForSpace.push(shiftId);
        }
      }
      return shiftsForSpace;
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
        return theShift;
      }

      return null;
    }

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
      shifts[shiftId] = $merge(shifts[shiftId], shiftData);
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
      SSServerCall.safeCall('shift.get', params, function(returnArray) {
        if(returnArray && returnArray[0])
        {
          var shiftObj = returnArray[0];
          SSLog('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++', SSLogForce);
          SSLog(shiftObj, SSLogForce);
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
      SSServerCall.safeCall('shift.get', params, function(_returnArray) {
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
      return (SSGetShift(shiftId) && SSHasProperty(SSGetShift(shiftId), ('content')));
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

      SSServerCall.safeCall('shift.get', params, function(json) {
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
        var allShifts = SSAllShifts();
        for(shiftId in allShifts)
        {
          if(SSUserForShift(shiftId) == username)
          {
            shiftIds.push(shiftId);
          }
        }
      }

      return shiftIds;
    }


    /*
      Function: SSSaveShift
        Saves a shift's JSON object to the server.

      Parameters:
        shiftJson - a shiftJson object, delivered from Shift.encode.

      See Also:
        Shift.encode
    */
    function SSSaveShift(shiftJson) 
    {
      //SSLog('saveShift');
      //SSLog(shiftJson);

      // if new skip to SSSaveNewShift
      if (shiftJson.id.substr(0, 8) == 'newShift') {
        SSSaveNewShift.safeCall(shiftJson);
        return;
      }

      var filters = shiftJson.filters;
      delete shiftJson.filters;

      var space = SSSpaceForName(shiftJson.space);
      var params = {
        id: shiftJson.id, // TODO: handle this in a more secure way
        summary: shiftJson.summary,
        content: escape(JSON.encode(shiftJson)), // MERGE: for 0.5 - David
        version: space.attributes.version,
        username: ShiftSpace.User.getUsername(),
        filters: JSON.encode(filters)
      };

      // if a legacy shift is getting updated, we should update the space name
      var shift = SSGetShift(shiftJson.id);
      if(shift.legacy)
      {
        params.space = space.attributes.name;
      }

      SSServerCall.safeCall('shift.update', params, function(json) {
        SSLog('returned shift.update! ' + JSON.encode(json));
        if (!json.status) {
          console.error(json.message);
          return;
        }
        if(ShiftSpace.Console) ShiftSpace.Console.updateShift(shiftJson);
        // call onShiftSave
        SSSpaceForName(shiftJson.space).onShiftSave(shiftJson.id);
      });
    }

    /*
    Function: SSSaveNewShift
      Creates a new entry for the shift on the server.

    Parameters:
      shiftJson - a shift json object, delivered from Shift.encode

    See Also:
      Shift.encode
    */
    function SSSaveNewShift(shiftJson)
    {
      var space = SSSpaceForName(shiftJson.space);

      // remove the filters from the json object
      var filters = shiftJson.filters;
      delete shiftJson.filters;

      var params = {
        href: window.location.href,
        space: shiftJson.space,
        summary: shiftJson.summary,
        content: escape(JSON.encode(shiftJson)),
        version: space.attributes.version,
        filters: JSON.encode(filters),
        status: SSGetDefaultShiftStatus() // TODO: this call is in the space ecosystem
      };

      SSLog('saving new shift!');
      SSServerCall.safeCall('shift.create', params, function(json) {
        SSLog('>>>>>>>>>>>>>>>>> SAVED new shift', SSLogServerCall);
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
        var shiftObj = space.getShift(shiftJson.id);
        shiftObj.setId(json.id);

        // unintern this id
        SSRemoveShift(shiftJson.id);
        // we just want to change the name, so don't delete
        space.unintern(shiftJson.id);

        if (SSFocusedShiftId() == shiftJson.id) 
        {
          SSSetFocusedShiftId(json.id);
        }
        
        shiftJson.id = json.id;
        shiftJson.content = JSON.encode(shiftJson);
        
        // intern local copy
        SSSetShift(shiftJson.id, shiftJson);
        // intern the space copy
        space.intern(shiftJson.id, shiftObj);

        // add and show the shift
        if(ShiftSpace.Console)
        {
          ShiftSpace.Console.show();
          ShiftSpace.Console.addShift(shiftJson, {isActive:true});
          ShiftSpace.Console.showShift(shiftJson.id);
        }

        // call onShiftSave
        space.onShiftSave(shiftJson.id);
        
        // fire an event with the real id
        SSLog('here we go!');
        SSFireEvent('onShiftSave', shiftJson.id);
      });

    }

    /*
    Function: SSEditShift
      Edit a shift.

    Parameters:
      shiftId - a shift id.
    */
    function SSEditShift(shiftId)
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
        var shift = SSGetShift(shiftId);

        // load the space first
        if(!space)
        {
          SSLoadSpace(shift.space, function() {
            SSEditShift(shiftId);
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
          SSFocusSpace(space, (shiftJson && shiftJson.position) || null);

          // show the shift first, this way edit and show are both atomic - David
          SSShowShift(shiftId);

          // then edit it
          space.editShift(shiftId);
          space.onShiftEdit(shiftId);

          // focus the shift
          SSFocusShift(shiftId);

          SSFireEvent('onShiftEdit', shiftId);
        }
        else
        {
          window.alert("You do not have permission to edit this shift.");
        }
      }
    }

    /*
    Function: SSDeleteShift
      Deletes a shift from the server.

    Parameters:
      shiftId - a shift id.
    */
    function SSDeleteShift(shiftId) 
    {
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

      SSServerCall('shift.delete', params, function(json) {
        if (!json.status) 
        {
          console.error(json.message);
          return;
        }
        if(ShiftSpace.Console) ShiftSpace.Console.removeShift(shiftId);
        // don't assume the space is loaded
        if(space) space.onShiftDelete(shiftId);
        SSRemoveShift(shiftId);
      });
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
    Function: SSLoadSpace
      Loads the space's source code, executes it and stores an instance of the
      space class in the 'spaces' object

    Parameters:
      space - the Space name to load
      callback - a callback function to run when the space is loaded.
    */
    function SSLoadSpace(space, callback)
    {
      if(space)
      {
        SSLog('loading space: ' + space); 
        if (typeof ShiftSpaceSandBoxMode != 'undefined')
        {
          var url = installed[space] + '?' + new Date().getTime();
          SSLog('loading ' + url);
          var newSpace = new Asset.javascript(url, {
            id: space
          });

          SSLog('Direct inject ' + space);
          if(callback) callback();
        }
        else
        {
          SSLog('loading space: ' + space);
          SSLoadFile(installed[space], function(rx) {
            var err;
            //SSLog(space + ' Space loaded, rx.responseText:' + rx.responseText);

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
    function SSRegisterSpace(instance) 
    {
      SSLog("SSRegisterSpace");
      var spaceName = instance.attributes.name;
      SSLog('Register Space ===================================== ' + spaceName);
      SSSetSpaceForName(instance, spaceName);
      instance.addEvent('onShiftUpdate', SSSaveShift.bind(this));

      var spaceDir = installed[spaceName].match(/(.+\/)[^\/]+\.js/)[1];

      instance.attributes.dir = spaceDir;

      if (!instance.attributes.icon) 
      {
        var icon = installed[spaceName].replace('.js', '.png');
        instance.attributes.icon = icon;
      } 
      else if (instance.attributes.icon.indexOf('/') == -1) 
      {
        var icon = spaceDir + instance.attributes.icon;
        instance.attributes.icon = icon;
      }

      //SSLog("Space icon: " + instance.attribution.icon);

      // if a css file is defined in the attributes load the style
      if (instance.attributes.css) 
      {
        if (instance.attributes.css.indexOf('/') == -1) 
        {
          var css = spaceDir + instance.attributes.css;
          instance.attributes.css = css;
        }
        setTimeout(SSLoadStyle.bind(ShiftSpace, [instance.attributes.css, instance.onCssLoad.bind(instance)]), 0);
      }

      // This exposes each space instance to the console
      if (typeof ShiftSpaceSandBoxMode != 'undefined') 
      {
        ShiftSpace[instance.attributes.name + 'Space'] = instance;
      }

      if(ShiftSpace.Console)
      {
        instance.addEvent('onShiftHide', ShiftSpace.Console.hideShift.bind(ShiftSpace.Console));
      }

      instance.addEvent('onShiftShow', function(shiftId) {
        if(ShiftSpace.Console) ShiftSpace.Console.showShift(shiftId);
      });
      instance.addEvent('onShiftBlur', function(shiftId) {
        SSBlurShift(shiftId);
        if(ShiftSpace.Console) ShiftSpace.Console.blurShift(shiftId);
      });
      instance.addEvent('onShiftFocus', function(shiftId) {
        SSFocusShift(shiftId);
        if(ShiftSpace.Console) ShiftSpace.Console.focusShift(shiftId);
      });
      instance.addEvent('onShiftSave', function(shiftId) {
        if(ShiftSpace.Console)
        {
          ShiftSpace.Console.blurShift(shiftId);
          ShiftSpace.Console.setTitleForShift(shifts[shiftId].summary);
        }
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
      //SSLog('SSLoadPlugin ' + plugin);
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
        SSLoadFile(installedPlugins[plugin], function(rx) {
          //SSLog(plugin + " Plugin loaded");
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
        SSLoadStyle.safeCall(plugin.attributes.css, plugin.onCssLoad.bind(plugin));
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
          var includesTotal = plugin.attributes.includes.length;
          var includeLoadCount = 0;
          //SSLog('Loading includes ' + plugin.attributes.includes);
          plugin.attributes.includes.each(function(include) {
            loadFile.safeCall(plugin.attributes.dir+include, function(rx) {
              includeLoadCount++;
              //SSLog('includeLoadCount ' + includeLoadCount);
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
              // Notify listeners of plugin load
              if(includeLoadCount == includesTotal) 
              {
                //SSLog('onPluginLoad');
                SSFireEvent('onPluginLoad', plugin);
              }
            }, null);
          });
        }
      }
      else
      {
        // Notify listeners of plugin load
        SSFireEvent('onPluginLoad', plugin);
      }

      // listen for plugin status changes and pass them on
      plugin.addEvent('onPluginStatusChange', function(evt) {
        SSFireEvent('onPluginStatusChange', evt);
      });

      // This exposes each space instance to the console
      if (typeof ShiftSpaceSandBoxMode != 'undefined')
      {
        ShiftSpace[plugin.attributes.name] = plugin;
      }
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
        SSLog('SSGetValue("' + key + '") = ' + JSON.decode(defaultValue));
        return JSON.decode(defaultValue);
      } 
      else if (rawValue) 
      {
        SSLog('SSGetValue("' + key + '") = ' + result);
        return result;
      } 
      else 
      {
        SSLog('SSGetValue("' + key + '") = ...' + JSON.decode(result));
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

          if(!Browser.Engine.trident)
          {
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
            var style = doc.createStyleSheet()
            style.cssText = css;
          }
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
      document.body.grab(__dragDiv__);
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
      this.Sandalphon = Sandalphon;
      
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
