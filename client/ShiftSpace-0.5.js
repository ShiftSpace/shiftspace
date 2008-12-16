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
    // INCLUDE Bootstrap
    
    /*

    Function: initialize
    Sets up external components and loads installed spaces.

    */
    this.initialize = function() {
      // paths to required ShiftSpace files
      
      // INCLUDE PostInitDeclarations
      
      // look for install links
      SSCheckForInstallSpaceLinks();
      if(SSLocalizedStringSupport()) SSLoadLocalizedStrings("en");
      SSLog('load localized strings');
      
      // Load external scripts (pre-processing required)
      // INCLUDE PACKAGE ShiftSpaceUI
      
      // Create the object right away if we're not running under the Sandalphon tool
      ShiftSpace.ShiftMenu = new ShiftMenu();
      ShiftSpace.Console = new SSConsole();
      
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
        
        if (json.error) 
        {
          console.error('Error checking for content: ' + json.error.message);
          return;
        }

        if (json.data.username)
        {
          // Set private user variable
          ShiftSpace.User.setUsername(json.data.username);
          ShiftSpace.User.setEmail(json.data.email);

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
        SSLog('Clearing ' + url + ' from cache', SSLogSystem);
        SSSetValue('cache.' + url, 0);
      } 
      else 
      {
        // Clear all the files from the cache
        cache.each(function(url) {
          SSLog('Clearing ' + url + ' from cache', SSLogSystem);
          SSSetValue('cache.' + url, 0);
        });
      }
    };

    // In sandbox mode, expose something for easier debugging.
    if (typeof ShiftSpaceSandBoxMode != 'undefined')
    {
      this.spaces = SSAllSpaces();
      this.shifts = shifts;
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
