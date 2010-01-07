// ==UserScript==
// @name           ShiftSpace
// @namespace      http://shiftspace.org/
// @description    An open source layer above any website
// @include        *
// @exclude        http://metatron.shiftspace.org/api/sandbox/*
// @exclude        http://shiftspace.org/api/sandbox/*
// @exclude        http://www.shiftspace.org/api/sandbox/*
// @exclude        %%SERVER%%*
// @require        %%SERVER%%externals/mootools-1.2.3-core.js
// @require        %%SERVER%%externals/mootools-1.2.3.1-more.js
// @require        %%SERVER%%externals/Videobox.js
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
Avital says: "Who knows what will happen by 2012?! The dinosaurs might be back!"
Avital says: (replace any-string-in-the-world "There's no point, just use Lisp")
Avital says: "Strict mode?! Keep the errors to yourself!"

Script: shiftspace.user.js
    ShiftSpace: An Open Source layer above any webpage

License:
    - GNU General Public License
    - GNU Lesser General Public License
    - Mozilla Public License

Credits:
    - Created by Mushon Zer-Aviv, Dan Phiffer, Avital Oliver, David Buchbut,
      David Nolen, Joe Moore, Justin Blinder, Xia Liangjie, Harlo Holmes,
      Clint Newsom, Jaqi Vigil, Alan Schaffer
    - Thanks to Clay Shirky, Johan Sundstrom, Eric Heitzman, Jakob Hilden,
      _why, Aaron Boodman and Nancy Hechinger

*/
// git hook test
if(typeof console != 'undefined' && console.log)
{
  console.log('Loading ShiftSpace');
}
else
{
  var console = {};
  console.log = function(){};
}

/*
Class: ShiftSpace
  A singleton controller object that represents ShiftSpace Core. All methods
  functions and variables are private.  Please refer to the documention on <User>,
  <ShiftSpace.Space>, <ShiftSpace.Shift>, <ShiftSpace.Plugin> to see public
  interfaces.
*/
var __root = this;
var ShiftSpace = new (function() {
    // INCLUDE Bootstrap
    SSLog("ShiftSpace starting up", SSLogSystem);
    var SSApp = SSApplication();

    /*
      Function: initialize
        Sets up external components and loads installed spaces.
    */
    this.initialize = function() {
      SSLog("ShiftSpace initializing", SSLogSystem);
      // INCLUDE PostInitDeclarations
      
      SSLog("\tChecking for install links", SSLogSystem);
      SSCheckForInstallSpaceLinks();

      SSLog("\tChecking localization support", SSLogSystem);
      if(SSLocalizedStringSupport()) SSLoadLocalizedStrings("en");
      
      SSLog("\tLoading UI classes", SSLogSystem);
      // INCLUDE PACKAGE ShiftSpaceUI
      SSLog("\tInitializing UI", SSLogSystem);

      SSLog("\tCreating console", SSLogSystem);

      var __mainCssLoaded = false;
      var p = SSLoadStyle('styles/ShiftSpace.css');
      p.op(function(v) {
        __mainCssLoaded = true;
        SSPostNotification('onMainCssLoad');
      });
      SSLog("\tLoading core styles", SSLogSystem);

      var uip = Sandalphon.load(String.urlJoin("builds/compiledViews", SSInfo().env, "ShiftSpaceMain"));

      (function(ui) {
        Sandalphon.addStyle(ui.styles);
        var frag = Sandalphon.convertToFragment(ui.interface);
        $(document.body).grab(frag);

        Sandalphon.activate(frag);

        ShiftSpace.Console = ShiftSpaceNameTable.SSConsole = SSControllerForNode("SSConsole");
        ShiftSpace.Notifier = ShiftSpaceNameTable.Notifier = SSControllerForNode("SSNotifier");
        ShiftSpace.SpaceMenu = ShiftSpaceNameTable.SSSpaceMenu = SSControllerForNode("SpaceMenu");
        ShiftSpace.SSConsoleWindow = ShiftSpaceNameTable.SSConsoleWindow = SSControllerForNode("SSConsoleWindow");

        SSLog("\tShiftSpace UI initialized", SSLogSystem);
      }.asPromise())(uip);

      ShiftSpace.Sandalphon = Sandalphon;
      
      // Add to look up table
      ShiftSpaceObjects.ShiftSpace = SSNotificationProxy;

      SSAddObserver(SSNotificationProxy, 'onInstalledSpacesDidChange', SSUpdateInstalledSpaces);
      SSAddObserver(SSNotificationProxy, 'onUserLogin', SSUpdateInstalledSpaces);
      SSAddObserver(SSNotificationProxy, 'onUserLogout', SSUpdateInstalledSpaces);
      
      // hide all pinWidget menus on window click
      window.addEvent('click', function() {
        if(ShiftSpace.Console)
        {
          __pinWidgets.each(function(x){
            if(!x.isSelecting) x.hideMenu();
          });
        }
      });

      SSCreatePinSelect();
      SSCheckForPageIframes();
      SSCreateModalDiv();
      SSCreateDragDiv();

      SSLog("\tSynchronizing with server", SSLogSystem);
      SSSync(uip);
    };
    
    /*
      Function: SSSync (private)
        Synchronize with server: checks for logged in user.
    */
    function SSSync(uip)
    {
      // initialize the value of default spaces for guest users
      SSInitDefaultSpaces();
      var p1 = SSApp.query();
      p1.op(
        function(value) {
          var installed = ShiftSpace.User.installedSpaces(), ps;
          if(installed)
          {
            SSSetup();
          }
          else
          {
            // first time ShiftSpace user default spaces not loaded yet
            SSAddObserver(SSNotificationProxy, "onDefaultSpacesAttributesLoad", SSSetup);
            ps = SSLoadDefaultSpacesAttributes();
          }
          return value;
        }
      );
      SSWaitForUI(p1, uip);
    }
    
    /*
      Function: SSWaitForUI (private)
        Waits for the core user interface components to initialize. Once
        initialized posts "onSync" notification.
     */
    var SSWaitForUI = function(userData, uip)
    {
      // wait for console and notifier before sending onSync
      var ui = [ShiftSpace.Console, ShiftSpace.Notifier, ShiftSpace.SpaceMenu, ShiftSpace.SSConsoleWindow];
      if(!ui.every(Function.msg('isLoaded')))
      {
        ui.each(Function.msg('addEvent', 'load', function(obj) {
          if(ui.every(Function.msg('isLoaded')))
          {
            SSPostNotification("onSync");
            if(userData)
            {
              ShiftSpace.User.syncData(userData);
              SSPostNotification('onUserLogin');
              SSLog("Synchronized", SSLogSystem);
            }
            else
            {
              SSLog("User is not logged in", userData, SSLogSystem);
            }
            SSLog("Update installed spaces", SSLogForce);
            SSUpdateInstalledSpaces();
            if (typeof ShiftSpaceSandBoxMode != 'undefined') SSCheckHash();
          }
          SSCheckForCurrentShift();
        }.bind(this)));
      }
      else
      {
        SSPostNotification("onSync");
      }
    }.asPromise();


    function SSCheckForCurrentShift()
    {
      var currentShift = SSGetValue("__currentShift");
      if(currentShift && window.location.href == currentShift.href)
      {
        SSSetValue("__currentShift", null);
        SSLog("showing shift", currentShift.id, SSLogForce);
        SSShowShift(SSSpaceForShift(currentShift.id), currentShift.id);
      }
    }

    /*
      Function: SSCheckHash
        Check the window location hash for operations that make life easiers as a developer
        and a designer.
    */
    function SSCheckHash()
    {
      var hash = $A(window.location.hash).tail(1).str();
      var kvs = hash.split("&").map(function(str) {
        var parts = str.split("=");
        return [parts[0], JSON.decode(parts[1])];
      });
      var ops = kvs.hash();

      if(ops["open"])
      {
        ops["open"].each(Function.comp(
          ShiftSpaceNameTable.asFn(),
          function(view) {
            if(view['open'])
            {
              view['open']();
            }
            else
            {
              view.show();
            }
          }
        ));
      }

      if(ops["tab"])
      {
        ShiftSpaceNameTable.MainTabView.selectTabByName(ops["tab"]);
      }
    }
    
    /*
      Function: SSSetup (private)
        Automatically load spaces that have been set to autolaunch
        due either to user preferences or domain settings for the space.
     */
    function SSSetup()
    {
      // automatically load a space if there is domain match
      var installed = SSInstalledSpaces();
      for(var space in installed)
      {
        var domains = installed[space].domains;
        if(domains)
        {
          var host = "http://" + window.location.host;
          var domainMatch = false;
          for(var i = 0; i < domains.length; i++)
          {
            if(domains[i] == host)
            {
              domainMatch = true;
              continue;
            }
          }
          if(domainMatch)
          {
            SSLoadSpace(space, function(spaceInstance) {
              spaceInstance.showInterface();
            });
          }
        }
      }
      SSLog("setup complete", SSLogSystem);
    }

    /*
      Function: SSCheckForUpdates (private)
        Check to see if a new version of ShiftSpace is available. If it is
        prompt user to install.
     */
    function SSCheckForUpdates()
    {
      // Only check once per page load
      if(alreadyCheckedForUpdate) return false;
      alreadyCheckedForUpdate = true;

      var now = new Date();
      var lastUpdate = SSGetValue('lastCheckedForUpdate', now.getTime());

      // Only check every 24 hours
      if (lastUpdate - now.getTime() > 86400)
      {
        SSSetValue('lastCheckedForUpdate', now.getTime());

        GM_xmlhttpRequest({
          method: 'POST',
          url: SSInfo().server + 'server/?method=version',
          onload: function(rx)
          {
            if (rx.responseText != version)
            {
              if (confirm('There is a new version of ShiftSpace available. Would you like to update now?'))
              {
                window.location = 'http://www.shiftspace.org/api/shiftspace?method=shiftspace.user.js';
              }
            }
          }
        });

        return true;
      }
      return false;
    };

    if (typeof ShiftSpaceSandBoxMode != 'undefined')
    {
      unsafeWindow.ShiftSpace = this;
      this.sys = __sys__;
      // export symbols directly to the window for debugging purposes - David
      ['SSSpaceForName',
       'SSApp',
       'SSApplication',
       'SSTableForName',
       'SSControllerForNode',
       'Sandalphon',
       'SSInstalledSpaces',
       'SSGetSpaceAttributes',
       'SSCellError',
       'SSException'
       ].each(function(sym) {
         unsafeWindow[sym] = eval(sym);
       });
    }

    return this;
})();

// NOTE: To keep SS extensions out of private scope - David
ShiftSpace.__externals = {
  evaluate: function(external, extract)
  {
    var result = {};
    with(ShiftSpace.__externals)
    {
      var Space = function(obj) {
        return new Class($merge({Extends:ShiftSpace.Space}, obj));
      };
      var Shift = function(obj) {
        return new Class($merge({Extends:ShiftSpace.Shift}, obj));
      };
      eval(external);
      extract.each(function(sym) {
        try
        {
          result[sym] = eval(sym);
        }
        catch(err)
        {
          result[sym] = null;
        }
      });
    }
    return result;
  }
};

