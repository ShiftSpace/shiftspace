// ==UserScript==
// @name           ShiftSpace
// @namespace      http://shiftspace.org/
// @description    An open source layer above any website
// @include        *
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

Script: shiftspace.user.js
    ShiftSpace: An Open Source layer above any webpage

License:
    - GNU General Public License
    - GNU Lesser General Public License
    - Mozilla Public License

Credits:
    - Created by Mushon Zer-Aviv, Dan Phiffer, Avital Oliver, David Buchbut and
      David Nolen
    - Thanks to Clay Shirky, Joe Moore, Johan Sundström, Eric Heitzman, 
      Jakob Hilden, _why, Aaron Boodman and Nancy Hechinger

*/

// ShiftSpace is built on the Mootools framework (pre-processing required)

// INCLUDE Mootools.js

/*

Class: ShiftSpace
  A singleton controller object designed to keep some data and methods private.
  The Space class has access to all private data, while other components, such as
  User, Console and each space class, must rely on publicly exposed interfaces.

*/

var ShiftSpace = new (function() {

    // The server variable determines where to look for ShiftSpace content
    var server = 'http://api.shiftspace.org/';
    
    // Check to see if the server URL is already stored
    if (getValue('server', false)) {
      server = getValue('server', 'http://api.shiftspace.org/');
    }
    // get Dan's input on how to set this
    if(typeof ShiftSpaceSandBoxMode != 'undefined')
    {
      server = window.location.href.substr(0, window.location.href.indexOf('sandbox'));
    }
    
    // Current ShiftSpace version
    var version = '0.11';
    
    // Logging verbosity and non-sandboxed JS visibility
    var debug = 0;
    
    // Cache loadFile data
    var cacheFiles = 0;
    
    // The basic building blocks of ShiftSpace (private objects)
    var spaces = {};
    var shifts = {};
    var trails = {};
    var plugins = {};
    var displayList = [];
    var pinWidgets = [];
    
    // Holds the id of the currently focused shift
    var focusedShiftId = null;
    var focusedSpace = null;
    
    // These are for the race condition between shifts loading and console setup
    var pendingShifts = -1;
    var consoleIsWaiting = false;
    
    // Each space and a corresponding URL of its origin
    var installed = getValue('installed', {
      'Notes' : server + 'spaces/Notes/Notes.js',
      'ImageSwap': server + 'spaces/ImageSwap/ImageSwap.js',
      'Highlights': server + 'spaces/Highlights/Highlights.js',
      'SourceShift': server + 'spaces/SourceShift/SourceShift.js',
      'Canvas' : server + 'spaces/Canvas/Canvas.js'
    });
    
    // Each plugin and a corresponding URL of its origin
    var installedPlugins = getValue('installedPlugins', {
      'Trails' : server + 'plugins/Trails/NewTrail.js'
    });
    
    // An index of cached files, used to clear the cache when necessary
    var cache = getValue('cache', []);
    
    /*
    
    Function: initialize
    Sets up external components and loads installed spaces.
    
    */
    this.initialize = function() {
      log("Initializing ShiftSpace (debug enabled)");

      debug = 0;

      // Load external scripts (pre-processing required)
      // INCLUDE User.js
      // INCLUDE Element.js
      // INCLUDE Space.js
      // INCLUDE Shift.js
      // INCLUDE Console.js
      // INCLUDE ShiftMenu.js
      // INCLUDE RangeCoder.js
      // INCLUDE Pin.js
      // INCLUDE PinWidget.js
      // INCLUDE Plugin.js

      // Load CSS styles
      loadStyle('styles/ShiftSpace.css');
      loadStyle('styles/ShiftMenu.css');

      // Load each installed space - this asynchronous, we need to wait till
      // they are all done
      for (var space in installed) {
        log("Loading " + space);
        loadSpace(space);
      }

      // need to think about plugin loading architecture! - this is going to involve a reworking of file loading
      for(var plugin in installedPlugins) {
        log("Loading " + plugin)
        loadPlugin(plugin);
      }
      
      // Set up event handlers
      window.addEvent('keydown',   keyDownHandler.bind(this) );
      window.addEvent('keyup',     keyUpHandler.bind(this) );
      window.addEvent('keypress',  keyPressHandler.bind(this) );
      window.addEvent('mousemove', mouseMoveHandler.bind(this) );
      // hide all pinWidget menus on window click
      window.addEvent('click', function() {
        ShiftSpace.Console.hidePluginMenu.bind(ShiftSpace.Console);
        pinWidgets.each(function(x){
          if(!x.isSelecting) x.hideMenu();
        });
      });

      // iframe covers
      this.covers = [];

      // create the pin selection bounding box
      createPinSelect();

      // See if there's anything on the current page
      checkForContent();
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
    this.info = function(spaceName) {
        if (typeof spaceName != 'undefined') {
            var defaults = {
                title: spaceName,
                icon: server + 'images/unknown-space.png',
                version: '1.0'
            };
            if (!spaces[spaceName]) {
                defaults.unknown = true;
                return defaults;
            }
            var spaceInfo = $merge(defaults, spaces[spaceName].attributes);
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
    
    function spaceForShift(shiftId)
    {
      return spaces[shifts[shiftId].space];
    }
    
    function userForShift(shiftId)
    {
      return shifts[shiftId].username;
    }
    
    function isNewShift(shiftId)
    {
      return (shiftId.search('newShift') != -1);
    }
    
    function implementsProtocol(protocol, object)
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
    
    function isSSElement(node)
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
    this.isSSElement = isSSElement;
    
    /*
    
    Function: installSpace
    Loads the JavaScript source of a Space, then loads the space into memory.
    The source URL is saved in the 'installed' object for future reference.
    
    Parameters:
        space - The Space name to install
        pendingShift - A shift to show upon installation
        
    */
    this.installSpace = function(space, pendingShift) {
        var url = server + 'spaces/' + space + '/' + space + '.js';
        installed[space] = url;
        setValue('installed', installed);
        loadSpace(space, pendingShift);
    };
    
    /*
    
    Function: uninstallSpace
    Removes a space from memory and from stored caches.
    
    Parameters:
        space - the Space name to remove
    
    */
    this.uninstallSpace = function(spaceName) {
        var url = installed[spaceName];
        delete spaces[spaceName];
        delete installed[spaceName];
        setValue('installed', installed);
        this.clearCache(url);
    };
    
    
    // TODO: move this stuff to class User
    // TODO: write actual method calls
    // TODO: write documentation
    this.getUser = function() {
        return {
            getUsername: function() {
                return 'shiftspace';
            },
            getName: function() {
                return 'ShiftSpace';
            },
            setPref: function(prefKey, prefValue) {
                var key = this.getUsername() + '.pref.' + prefKey;
                return setValue(key, prefValue);
            },
            getPref: function(prefKey, defaultValue) {
                var key = this.getUsername() + '.pref.' + prefKey;
                return getValue(key, defaultValue);
            },
            sendMessage: function(subject, message) {
                return;
            }
        };
    };
    
    
    // TODO: write documentation
    this.xmlhttpRequest = function(config) {
        GM_xmlhttpRequest(config);
    };
    
    
    /*
    
    Function: clearCache
    Expunge previously stored files.
    
    Parameters:
        url - (Optional) The URL of the file to remove. If not specified, all
              files in the cache will be deleted.
    
    */
    this.clearCache = function(url) {
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
        if (!spaces[spaceName]) {
            log('Error: Space ' + spaceName + ' does not exist.', true);
            return;
        }
        
        var tempId = 'newShift' + Math.round(Math.random(0, 1) * 1000000);
        while (shifts[tempId]) {
            tempId = 'newShift' + Math.round(Math.random(0, 1) * 1000000);
        }
        
        var shiftJson = {
            id: tempId,
            space: spaceName,
            username: ShiftSpace.user.getUsername(),
            position: (options && options.position && { x: options.position.x, y: options.position.y }) || null
        };
        //console.log(shiftJson);
        
        shifts[tempId] = shiftJson;
        
        // check to see if focused space
        focusSpace(spaces[spaceName]);
        
        try
        {
          spaces[spaceName].createShift(shiftJson);
        }
        catch(err)
        {
          console.error(err);
        }
        
        // call onShiftCreate
        spaces[spaceName].onShiftCreate(tempId);

        if(!options.deferred)
        {
          spaces[spaceName].showShift(shiftJson);
          // call onShiftShow
          spaces[spaceName].onShiftShow(tempId);
          /*
          spaces[spaceName].editShift(tempId);
          spaces[spaceName].onShiftEdit(temp);
          */
          editShift(tempId);
          focusShift(tempId);
        }
    }
    
    
    /*
    
    focusShift (private)
    Focuses a shift.
      
    Parameter:
        shiftId - the id of the shift.
    
    */
    function focusShift(shiftId) {
      var shift = shifts[shiftId];
      var space = spaceForShift(shiftId);
      
      // unfocus the last shift
      if (focusedShiftId) {
        // hmmm, note, we maybe should have loadShift to avoid confusion about show - David
        spaceForShift(focusedShiftId).orderBack(focusedShiftId);
      }
      focusedShiftId = shift.id;
      space.orderFront(shift.id);

      // call onShiftFocus
      space.onShiftFocus(shiftId);
      
      // if new shift present the editing interface
      if(isNewShift(shiftId))
      {
        space.editShift(shiftId);
      }

      //space.hideInterface();

      // scroll the window if necessary
      var mainView = space.mainViewForShift(shiftId);
      
      console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> focus shift');
      console.log(mainView);

      if(mainView)
      {
        var pos = mainView.getPosition();
        var vsize = mainView.getSize().size;
        var viewPort = window.getSize().viewPort;
        var windowScroll = window.getSize().scroll;

        if(pos.x > viewPort.x+windowScroll.x ||
           pos.y > viewPort.y+windowScroll.y)
        {
          var scrollFx = new Fx.Scroll(window, {
            duration: 1000,
            transition: Fx.Transitions.Cubic.easeIn,
          });

          scrollFx.scrollTo(pos.x-25, pos.y-25);
        }
      }
    }
    
    /*
    focusSpace (private)
    Focuses a space.
    
    Parameter:
      space - a ShiftSpace.Space instance
    */
    function focusSpace(space) {
      if(focusedSpace && focusedSpace != space)
      {
        console.log('hiding interface!');
        // check to see if focused space
        focusedSpace.setIsVisible(false);
        focusedSpace.hideInterface();
      }

      focusedSpace = space;
      focusedSpace.setIsVisible(true);
      focusedSpace.showInterface();
      console.log('focusSpace >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> show interface, ' + space.getName());
    }
    
    /*
    
    Function: showShift
    Displays a shift on the page.
    
    Parameters:
        shiftId - The ID of the shift to display.
    
    */
    this.showShift = function(shiftId) {
      var shift = shifts[shiftId];
      shift.content = shift.content.replace('\n', '\\n');
      shift.content = shift.content.replace('\r', '\\r');
      var shiftJson = Json.evaluate(shift.content);
      shiftJson.id = shiftId;
      
      if (this.info(shift.space).unknown) {
        if (confirm('Would you like to install the space ' + shift.space + '?')) {
          this.installSpace(shift.space, shiftId);
        }
      } else {
        // if not a new shift just show the shift
        if(shiftId.search('newShift') == -1)
        {
          spaces[shift.space].showShift(shiftJson);
          focusShift(shift.id);
        }
        else
        {
          // if it's new it's always in edit mode
          editShift(shiftId);
        }
      }

      // call onShiftShow
      spaces[shift.space].onShiftShow(shiftId);
    },
    
    
    /*
    
    Function: hideShift
    Hides a shift from the page.
        
    Parameters:
        shiftId - The ID of the shift to hide.
    
    */
    this.hideShift = function(shiftId) {
        var shift = shifts[shiftId];
        spaces[shift.space].hideShift(shiftId);
        
        // call onShiftHide
        spaces[shift.space].onShiftHide(shiftId);
    };
    
    
    /*
    
    checkForContent (private)
    Sends a request to the server about the current page's ShiftSpace content.
    
    */
    function checkForContent() {
      var params = {
        href: window.location.href
      };
      serverCall('query', params, function(json) {
        if (!json.status) {
          return;
        }
        if (json.user) {
          // TODO: activate the menu
        }
        pendingShifts = json.shifts;
        if (json.shifts > 0 && consoleIsWaiting) {
          ShiftSpace.Console.showNotifier();
        }
      });
    }
    
    
    /*
    
    consoleIsReady (private)
    Called by the Console object when it finishes initializing.
    
    */
    function consoleIsReady() {
        if (pendingShifts == -1) {
            consoleIsWaiting = true;
        } else if (pendingShifts > 0) {
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
            json.each(function(shift) {
                shifts[shift.id] = shift;
            });
            //console.log('(loadshifts)-----------------------------------------------------');
            //console.log(json);
            ShiftSpace.Console.addShifts(shifts);
        });
    }
    
    
    /*
    
    saveShift (private)
    Saves a shift's JSON object to the server.
    
    */
    function saveShift(shiftJson) {
        console.log('saveShift');
        console.log(shiftJson);
        
        if (shiftJson.id.substr(0, 8) == 'newShift') {
            return saveNewShift(shiftJson);
        }
        
        var space = spaces[shiftJson.space];
        var params = {
            id: shiftJson.id, // TODO: handle this in a more secure way
            summary: shiftJson.summary,
            content: Json.toString(shiftJson),
            version: space.attributes.version,
            username: ShiftSpace.user.getUsername()
        };
        
        serverCall('shift.update', params, function() {
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
        var params = {
            href: window.location.href,
            space: shiftJson.space,
            summary: shiftJson.summary,
            content: Json.toString(shiftJson),
            version: space.attributes.version
        };
        
        serverCall('shift.create', params, function(responseJson) {
            
            shiftJson.username = ShiftSpace.user.getUsername();
            
            // with the real value
            var shiftObj = space.shifts[shiftJson.id];
            shiftObj.setId(responseJson.url_slug);
            
            // delete the temporary stuff
            delete shifts[shiftJson.id];
            delete space.shifts[shiftJson.id];
            
            if (focusedShiftId == shiftJson.id) {
                focusedShiftId = responseJson.url_slug;
            }
            shiftJson.id = responseJson.url_slug;
            shiftJson.content = Json.toString(shiftJson);
            shifts[shiftJson.id] = shiftJson;
            space.shifts[shiftJson.id] = shiftObj;
            
            ShiftSpace.Console.addShift(shiftJson, true);
            
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
      var space = spaceForShift(shiftId);
      var user = userForShift(shiftId);

      if(ShiftSpace.user.getUsername() == user)
      {
        // show the space interface
        focusShift(shiftId);
        focusSpace(space);

        // then edit it
        space.onShiftEdit(shiftId);
        space.editShift(shiftId);
      }
      else
      {
        alert("You do not have permission to edit this shift.");
      }
    }
    
    /*
    
    deleteShift (private)
    Deletes a shift from the server.
    
    */
    function deleteShift(shiftId) {
        
        var space = shifts[shiftId].space;
        spaces[space].deleteShift(shiftId);
        
        if (focusedShiftId == shiftId) {
            focusedShiftId = null;
        }
        
        var params = {
            id: shiftId
        };
        
        serverCall('shift.delete', params, function() {
            ShiftSpace.Console.removeShift(shiftId);
            spaces[space].onShiftDelete(shiftId);
            delete shifts[shiftId];
        });
    }
    
    
    // Used by keyboard handlers to maintain state information
    var keyState = {};
    
    /*
    
    keyDownHandler (private)
    Handles keydown events.
    
    */
    function keyDownHandler(event) {
        var now = new Date();
        event = new Event(event);
        
        // Try to prevent accidental shift+space activation by requiring a 500ms
        //   lull since the last keypress
        if (keyState.keyDownTime &&
            now.getTime() - keyState.keyDownTime < 500) {
            keyState.keyDownTime = now.getTime();
            return false;
        }
        
        if (event.code != 16) {
            // Remember when last non-shift keypress occurred
            keyState.keyDownTime = now.getTime();
        } else if (!keyState.shiftPressed) {
            // Remember that shift is down
            keyState.shiftPressed = true;
            // Show the menu if the user is signed in
            if (ShiftSpace.ShiftMenu ) {
                keyState.shiftMenuShown = true;
                ShiftSpace.ShiftMenu.show(keyState.x, keyState.y);
            }
        }
        
        // If shift is down and any key other than space is pressed,
        // then definately shiftspace should not be invocated
        // unless shift is let go and pressed again
        if (keyState.shiftPressed &&
            event.key != 'space' &&
            event.code != 16) {
            keyState.ignoreSubsequentSpaces = true;
            
            if (keyState.shiftMenuShown) {
                keyState.shiftMenuShown = false;
                ShiftSpace.ShiftMenu.hide();
            }
        }

        // Check for shift + space keyboard press
        if (!keyState.ignoreSubsequentSpaces &&
            event.key == 'space' &&
            event.shift) {
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
            if (keyState.consoleShown) {
                keyState.consoleShown = false;
                ShiftSpace.Console.hide();
            } else {
                keyState.consoleShown = true;
                ShiftSpace.Console.show();
            }
            
        }
    }
    
    
    /*
    
    keyDownHandler (private)
    Handles keyup events.
    
    */
    function keyUpHandler(event) {
        event = new Event(event);
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
    
    this.addCover = function(newCover)
    {
      // create covers if we haven't already
      this.covers.push(newCover);
    }

    this.addIframeCovers = function() {
      this.covers.each(function(aCover) {
        aCover.cover.setStyle('display', 'block');
      });
    }
    
    this.updateIframeCovers = function() {
      this.covers.each(function(aCover) {
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
    
    this.removeIframeCovers = function() {
      this.covers.each(function(aCover) {
        aCover.cover.setStyle('display', 'none');
      });
    }
    
    // for holding the current pin selection
    var currentPinSelection = null;
    // create the pin selection frame
    function createPinSelect() {
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
    
    function pinMouseOverHandler (_evt) {
      var evt = new Event(_evt);
      var target = $(evt.target);

      if(!isSSElement(target) &&
         !target.hasClass('SSPinSelect'))
      {
        currentPinSelection = target;
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
    
    function pinMouseMoveHandler(_evt) {
      if(ShiftSpace.PinSelect.getParent())
      {
        ShiftSpace.PinSelect.remove();
      }
    }
    
    function pinMouseClickHandler(_evt) {
      var evt = new Event(_evt);
      if(currentPinWidget)
      {
        if(ShiftSpace.PinSelect.getParent()) ShiftSpace.PinSelect.remove();
        removePinEvents();
        currentPinWidget.userPinnedElement(currentPinSelection);
      }
    }
    
    function checkPinReferences(pinRef)
    {
      var otherShifts = allPinnedShifts.copy().remove(pinRef.shift);
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
    var allPinnedShifts = [];
    function pinElement(element, pinRef)
    {
      ShiftSpace.pinRef = pinRef;

      // store this pinRef to ensure the same node doesn't get pinned
      if(!allPinnedShifts.contains(pinRef.shift)) allPinnedShifts.push(pinRef.shift);
      // make sure nobody else is targeting the same node
      checkPinReferences(pinRef);
      
      var targetNode = $(ShiftSpace.Pin.toNode(pinRef));
      
      // pinRef has become active set targetElement and element properties
      $extend(pinRef, {
        'element': element,
        'targetElement': targetNode
      });
      
      console.log(targetNode);

      switch(pinRef.action)
      {
        case 'before':
          element.injectBefore(targetNode);
        break;
        
        case 'replace':
          targetNode.replaceWith(element);
          //pinRef.targetStyles = targetNode.getStyles('float', 'width', 'height', 'position', 'display');
          //element.setStyles(pinRef.targetStyles);
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
          if(targetNode.getTag() == 'img')
          {
            wrapper.setStyle('display', 'inline');
          }
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
    
    function unpinElement(pinRef) {
      console.log('>>>>>>>>>>>>>>>>>>>>>>> unpinElement');
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
      console.log('<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< DONE');
    }
    
    /*
      Function: attachPinEvents
        Attaches the mouse events to handle Pin selection.
    */
    function attachPinEvents() {
      window.addEvent('mouseover', pinMouseOverHandler);
      window.addEvent('click', pinMouseClickHandler);
      ShiftSpace.PinSelect.addEvent('mousemove', pinMouseMoveHandler);
    }
    
    function removePinEvents() {
      window.removeEvent('mouseover', pinMouseOverHandler);
      window.removeEvent('click', pinMouseClickHandler);
      ShiftSpace.PinSelect.removeEvent('mousemove', pinMouseMoveHandler);
    }
    
    // hold the current active pin widget
    var currentPinWidget = null;
    function startPinSelection(widget) {
      currentPinWidget = widget;
      // show the selection interface
      attachPinEvents();
    }
    
    function stopPinSelection() {
      currentPinWidget = null;
      if(ShiftSpace.PinSelect.getParent()) ShiftSpace.PinSelect.remove();
      removePinEvents();
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

      // Caching is implemented as a rather blunt instrument ...
      if (!cacheFiles) {
        // ... either append the current timestamp to the URL ...
        var now = new Date();
        url += (url.indexOf('?') == -1) ? '?' : '&';
        url += now.getTime();
      } else {
        // ... or use getValue to retrieve the file's contents
        var cached = getValue('cache.' + url, false);
        if (cached) {
          log('Loading ' + url + ' from cache');
          callback({
            responseText: cached
          });
          return true;
        }
      }

      // Load the URL then execute the callback
      //log('Loading ' + url + ' from network');
      GM_xmlhttpRequest({
        'method': 'GET',
        'url': url,
        'onload': function(response) {
          // Store file contents for later retrieval
          if (cacheFiles) {
            cache.push(url);
            setValue('cache', cache);
            setValue('cache.' + url, response.responseText);
          }
          if (typeof callback == 'function') {
            callback(response);
          }
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
    function loadSpace(space, pendingShift) 
    {
      //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Space: '  + space);
      if(space)
      {
        if (typeof ShiftSpaceSandBoxMode != 'undefined') 
        {
          var url = installed[space] + '?' + new Date().getTime();
          var newSpace = new Asset.javascript(url, {
            id: space
          });
          if (typeof pendingShift != 'undefined') 
          {
            ShiftSpace.showShift(pendingShift);
          }
        } 
        else 
        {
          loadFile(installed[space], function(rx) {
            log('loading '+ space);
            eval(rx.responseText);
            if (typeof pendingShift != 'undefined') 
            {
              ShiftSpace.showShift(pendingShift);
            }
          });
        }
      }
    }
    
    /*
    
    registerSpace (private)
    Called by the Space class to register with ShiftSpace.
    
    Parameters:
        instance - An instance object of the space.
    
    */
    function registerSpace(instance) {
      var spaceName = instance.attributes.name;
      spaces[spaceName] = instance;
      instance.addEvent('onShiftUpdate', saveShift.bind(this));

      var spaceDir = installed[spaceName].match(/(.+\/)[^\/]+\.js/)[1];

      if (!instance.attributes.icon) {
        var icon = installed[spaceName].replace('.js', '.png');
        instance.attributes.icon = icon;
      } else if (instance.attributes.icon.indexOf('/') == -1) {
        var icon = spaceDir + instance.attributes.icon;
        instance.attributes.icon = icon;
      }

      // if a css file is defined in the attributes load the style
      if (instance.attributes.css) {
        if (instance.attributes.css.indexOf('/') == -1) {
          var css = spaceDir + instance.attributes.css;
          instance.attributes.css = css;
        }
        loadStyle(instance.attributes.css, instance.onCssLoad.bind(instance));
      }

      // This exposes each space instance to the console
      if (debug) {
        ShiftSpace[instance.attributes.name + 'Space'] = instance;
      }
      
      // remove weird null spaces
      for(var space in installed) {
        if(space == '')
        {
          delete installed[space];
        }
      }

      // Check to see if we're still waiting for a space to load
      for (var space in installed) {
        if (!spaces[space]) {
          return;
        }
      }

      // If all spaces have been loaded, build the shift menu and the console
      ShiftSpace.ShiftMenu.buildMenu();

      // Attach hide events to each space, so the console will be in sync
      for (var spaceName in spaces) 
      {
        var space = spaces[spaceName];
        space.addEvent('onShiftHide', ShiftSpace.Console.hideShift.bind(ShiftSpace.Console));
        space.addEvent('onShiftShow', ShiftSpace.Console.showShift.bind(ShiftSpace.Console));
      }
    }
    
    /*
      Function: loadPlugin (private)
        Loads a plugin
    */
    function loadPlugin(plugin) 
    {
      //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PlugIn: '  + plugin);
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
          log('loading '+ plugin);
          eval(rx.responseText);
        });
      }
    }
    
    /*
      Function: registerPlugin (private)
        Register a plugin.
    */
    function registerPlugin(plugin)
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
        loadStyle(plugin.attributes.css, plugin.onCssLoad.bind(plugin));
      }

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
    function serverCall(method, parameters, callback) {
      var url = server + 'shiftspace.php?method=' + method;
      var data = '';
      for (var key in parameters) {
        if (data != '') {
          data += '&';
        }
        data += key + '=' + encodeURIComponent(parameters[key]);
      }
      var now = new Date();
      url += '&cache=' + now.getTime();

      //GM_openInTab(url);

      var req = {
        method: 'POST',
        url: url,
        data: data,
        onload: function(rx) {
          if (typeof callback == 'function') {
            var json = Json.evaluate(rx.responseText);
            if(json.status == 0)
            {
              console.error(method + ' failed' + ((json.message && (', error: ' + json.message)) || '') + '.');
            }
            else
            {
              callback(json);
            }
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
    function setValue(key, value) {
      GM_setValue(key, Json.toString(value));
      return value;
    }
    
    
    /*
    
    getValue (private, except in debug mode)
    A wrapper function for GM_getValue that handles non-string data better.
    
    Parameters:
        key - A unique string identifier
        defaultValue - This value will be returned if nothing is found.
    
    Returns:
        Either the stored value, or defaultValue if none is found.
    
    */
    function getValue(key, defaultValue) {
      var result = GM_getValue(key, Json.toString(defaultValue));
      // Fix for GreaseKit, which doesn't support default values
      if (result == null) 
      {
        return defaultValue;
      } 
      else 
      {
        return Json.evaluate(result);
      }
    }
    
    
    /*
    
    includeScript (private)
    A helper function used to execute dynamically-loaded JS. Loads and eval's
    the contents of a Javascript file.
    
    Parameters:
        url - The URL of the JS file to load
    
    */
    function includeScript(url, callback) {
      loadFile(url, function(rx) {
        eval(rx.responseText);
        if (typeof callback == 'function') {
          callback(rx);
        }
      });
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

      loadFile(url, function(rx) {
        var css = rx.responseText;
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

          var style = new Element('style', {
            type: 'text/css'
          });

          style.appendText(css); // You can not use setHTML on style elements in Safari - David
          style.injectInside(head);
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
    
    // In debug mode expose more to the non-sandboxed JavaScript environment 
    if (debug) {
      this.spaces = spaces;
      this.shifts = shifts;
      this.trails = trails;
      this.setValue = setValue;
      this.getValue = getValue;
      unsafeWindow.ShiftSpace = this;
    }
    
    return this;
})();

// Only run in the top-most frame
// This doesn't work in Safari for some reason
if (self == top ||
    (window.webkit &&
     window.parent == window)) 
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
    ShiftSpace.initialize();
  }
}
