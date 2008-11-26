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

if (SSInclude != undefined) SSLog('Including ../client/SSLog.js...', SSInclude);

// Start ../client/SSLog.js ---------------------------------------------------

// ==Builder==
// @required
// @name              SSLog
// @package           System_
// @dependencies      GreaseMonkeyApi
// ==/Builder==

// Internal Error Logging, trust me, you don't need this - kisses ShiftSpace Core Robot
var SSNoLogging = 0;

var SSLogMessage        = 1,
    SSLogError          = 1 << 1,
    SSLogWarning        = 1 << 2,
    SSLogPlugin         = 1 << 3,
    SSLogServerCall     = 1 << 4,
    SSLogSpaceError     = 1 << 5,
    SSLogShift          = 1 << 6,
    SSLogSpace          = 1 << 7,
    SSLogViews          = 1 << 8,
    SSLogSandalphon     = 1 << 9,
    SSLogForce          = 1 << 10,
    SSInclude           = 1 << 11,
    SSLogViewSystem     = 1 << 12;
    SSLogSystem         = 1 << 13;

var SSLogAll = 0xfffffff;           // All bits on (if we have at most 32 types)
var __ssloglevel__ = SSNoLogging;

/*
Function: log
  Logs a message to the console, but only in debug mode or when reporting
  errors.

Parameters:
  msg - The message to be logged in the JavaScript console.
  verbose - Force the message to be logged when not in debug mode.
*/
function SSLog(msg, type) 
{
  if (typeof console == 'object' && SSLog) 
  {
    var messageType = '';

    if(type == SSLogError)
    {
      messageType = 'ERROR: ';
    }
    
    if(type == SSLogWarning)
    {
      messageType = 'WARNING: ';
    }
    
    if(__ssloglevel__ == SSLogAll || (type && (__ssloglevel__ & type)) || type == SSLogForce)
    {
      if($type(msg) != 'string')
      {
        console.log(msg);
      }
      else
      {
        console.log(messageType + msg);
      }
    }
  } 
  else if (typeof GM_log != 'undefined') 
  {
    GM_log(msg);
  } 
  else 
  {
    setTimeout(function() {
      throw(msg);
    }, 0);
  }
}

function SSSetLogLevel(level)
{
  SSLog('SSSetLogLevel ' + level);
  __ssloglevel__ = level;
}

if(typeof SSLogError != 'undefined')
{
  SSSetLogLevel(SSLogError);
}
else
{
  throw new Error("Bailing: No such logging level SSLogError, please fix the config/env/dev.json file.");
}


// End ../client/SSLog.js -----------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSLog');

if (SSInclude != undefined) SSLog('Including ../client/core/PreInitDeclarations.js...', SSInclude);

// Start ../client/core/PreInitDeclarations.js --------------------------------

// ==Builder==
// @optional
// @name              PreInitDeclarations
// ==/Builder==

// NOTE: This will be preprocessed by preprocess.py and replaced with the proper
// servers
var server = SSGetValue('server', 'http://localhost/~davidnolen/shiftspace-0.5/');
var spacesDir = SSGetValue('spaceDir', 'http://localhost/~davidnolen/shiftspace-0.5/spaces/');

var __sys__ = {
    "files": {
        "ActionMenu": {
            "customView": true, 
            "dependencies": [
                "SSView"
            ], 
            "name": "ActionMenu", 
            "optional": true, 
            "package": "ShiftSpaceUI", 
            "path": "..\/client\/customViews\/ActionMenu\/ActionMenu.js", 
            "uiclass": true
        }, 
        "CoreEvents": {
            "name": "CoreEvents", 
            "option": true, 
            "package": "EventHandling", 
            "path": "..\/client\/CoreEvents.js"
        }, 
        "ErrorWindow": {
            "dependencies": [
                "ShiftSpaceElement"
            ], 
            "name": "ErrorWindow", 
            "optional": true, 
            "package": "ErrorHandling", 
            "path": "..\/client\/ErrorWindow.js"
        }, 
        "EventProxy": {
            "name": "EventProxy", 
            "package": "System", 
            "path": "..\/client\/EventProxy.js", 
            "required": true
        }, 
        "FullScreen": {
            "dependencies": [
                "ShiftSpaceElement"
            ], 
            "name": "FullScreen", 
            "optional": true, 
            "package": "UtilitiesExtras", 
            "path": "..\/client\/FullScreen.js"
        }, 
        "GreaseMonkeyApi": {
            "name": "GreaseMonkeyApi", 
            "optional": true, 
            "package": "System_", 
            "path": "..\/sandbox\/GreaseMonkeyApi.js"
        }, 
        "IframeHelpers": {
            "dependences": "Element", 
            "name": "IframeHelpers", 
            "optional": true, 
            "package": "UtilitiesExtras", 
            "path": "..\/client\/IframeHelpers.js"
        }, 
        "LocalizedStringsSupport": {
            "name": "LocalizedStringsSupport", 
            "package": "Internationalization", 
            "path": "..\/client\/LocalizedStringsSupport.js", 
            "required": true
        }, 
        "NewTrail": {
            "dependencies": [
                "Plugin"
            ], 
            "name": "TrailsPlugin", 
            "optional": true, 
            "package": "Trails", 
            "path": "..\/plugins\/Trails\/NewTrail.js"
        }, 
        "PersistenceFunctions": {
            "name": "PersistenceFunctions", 
            "optional": true, 
            "package": "Core", 
            "path": "..\/client\/core\/PersistenceFunctions.js"
        }, 
        "Pin": {
            "name": "Pin", 
            "optional": true, 
            "package": "Pinning", 
            "path": "..\/client\/Pin.js"
        }, 
        "PinHelpers": {
            "dependencies": [
                "Pin"
            ], 
            "name": "PinHelpers", 
            "optional": true, 
            "package": "Pinning", 
            "path": "..\/client\/PinHelpers.js"
        }, 
        "PinWidget": {
            "dependencies": [
                "PinHelpers", 
                "ShiftSpaceElement"
            ], 
            "name": "PinWidget", 
            "optional": true, 
            "package": "Pinning", 
            "path": "..\/client\/PinWidget.js"
        }, 
        "Plugin": {
            "name": "Plugin", 
            "package": "ShiftSpaceCore", 
            "path": "..\/client\/Plugin.js", 
            "required": true
        }, 
        "PluginFunctions": {
            "name": "PluginFunctions", 
            "optional": true, 
            "package": "Core", 
            "path": "..\/client\/core\/PluginFunctions.js"
        }, 
        "PostInitDeclarations": {
            "name": "PostInitDeclarations", 
            "optional": true, 
            "path": "..\/client\/core\/PostInitDeclarations.js"
        }, 
        "PreInitDeclarations": {
            "name": "PreInitDeclarations", 
            "optional": true, 
            "path": "..\/client\/core\/PreInitDeclarations.js"
        }, 
        "RangeCoder": {
            "name": "RangeCoder", 
            "optional": true, 
            "package": "Pinning", 
            "path": "..\/client\/RangeCoder.js"
        }, 
        "RecentlyViewedHelpers": {
            "name": "RecentlyViewedHelpers", 
            "optional": true, 
            "package": "Trails", 
            "path": "..\/client\/RecentlyViewedHelpers.js"
        }, 
        "RemoteFunctions": {
            "name": "RemoteFunctions", 
            "optional": true, 
            "package": "Core", 
            "path": "..\/client\/core\/RemoteFunctions.js"
        }, 
        "SSCell": {
            "dependencies": [
                "SSView"
            ], 
            "name": "SSCell", 
            "optional": true, 
            "package": "ShiftSpaceCoreUI", 
            "path": "..\/client\/views\/SSCell\/SSCell.js", 
            "uiclass": true
        }, 
        "SSConsole": {
            "name": "SSConsole", 
            "optional": true, 
            "package": "ShiftSpaceUI", 
            "path": "..\/client\/views\/SSConsole\/SSConsole.js", 
            "uiclass": true
        }, 
        "SSCustomExceptions": {
            "dependencies": [
                "SSException"
            ], 
            "name": "SSCustomExceptions", 
            "optional": true, 
            "package": "System", 
            "path": "..\/client\/SSCustomExceptions.js"
        }, 
        "SSCustomTableRow": {
            "dependencies": [
                "SSTableRow"
            ], 
            "name": "SSCustomTableRow", 
            "optional": true, 
            "package": "ShiftSpaceCoreUI", 
            "path": "..\/client\/customViews\/SSCustomTableRow\/SSCustomTableRow.js", 
            "uiclass": true
        }, 
        "SSDefaultTest": {
            "name": "SSDefaultTest", 
            "path": "..\/tests\/SSDefaultTest.js", 
            "suite": "SSDefaultTestSuite", 
            "test": true
        }, 
        "SSDefaultTestSuite": {
            "dependencies": [
                "SSDefaultTest"
            ], 
            "name": "SSDefaultTestSuite", 
            "path": "..\/tests\/SSDefaultTestSuite.js", 
            "suite": "SSDefaultTestSuperSuite", 
            "test": true
        }, 
        "SSDefaultTestSuperSuite": {
            "dependencies": [
                "SSDefaultTestSuite"
            ], 
            "name": "SSDefaultTestSuperSuite", 
            "path": "..\/tests\/SSDefaultTestSuperSuite.js", 
            "test": true
        }, 
        "SSEditableTextCell": {
            "dependencies": [
                "SSCell"
            ], 
            "name": "SSEditableTextCell", 
            "package": "ShiftSpaceCoreUI", 
            "path": "..\/client\/views\/SSEditableTextCell\/SSEditableTextCell.js", 
            "required": true, 
            "uiclass": true
        }, 
        "SSException": {
            "name": "SSException", 
            "optional": true, 
            "package": "System", 
            "path": "..\/client\/SSException.js"
        }, 
        "SSListView": {
            "dependencies": [
                "SSView", 
                "SSCell"
            ], 
            "name": "SSListView", 
            "optional": true, 
            "package": "ShiftSpaceCoreUI", 
            "path": "..\/client\/views\/SSListView\/SSListView.js", 
            "uiclass": true
        }, 
        "SSListViewTest": {
            "dependencies": [
                "SSListView"
            ], 
            "name": "SSListViewTest", 
            "path": "..\/tests\/SSListViewTest\/SSListViewTest.js", 
            "suite": "UI", 
            "test": true
        }, 
        "SSLog": {
            "dependencies": [
                "GreaseMonkeyApi"
            ], 
            "name": "SSLog", 
            "package": "System_", 
            "path": "..\/client\/SSLog.js", 
            "required": true
        }, 
        "SSTabView": {
            "dependencies": [
                "SSView"
            ], 
            "name": "SSTabView", 
            "package": "ShiftSpaceCoreUI", 
            "path": "..\/client\/views\/SSTabView\/SSTabView.js", 
            "required": true, 
            "uiclass": true
        }, 
        "SSTableRow": {
            "dependencies": [
                "SSView"
            ], 
            "name": "SSTableRow", 
            "package": "ShiftSpaceCoreUI", 
            "path": "..\/client\/views\/SSTableRow\/SSTableRow.js", 
            "required": true, 
            "uiclass": true
        }, 
        "SSTableView": {
            "dependencies": [
                "SSView"
            ], 
            "name": "SSTableView", 
            "package": "ShiftSpaceCoreUI", 
            "path": "..\/client\/views\/SSTableView\/SSTableView.js", 
            "required": true, 
            "uiclass": true
        }, 
        "SSTableViewDatasource": {
            "name": "SSTableViewDatasource", 
            "optional": true, 
            "package": "ShiftSpaceCore", 
            "path": "..\/client\/SSTableViewDatasource.js"
        }, 
        "SSUnitTest": {
            "dependencies": [
                "SSException"
            ], 
            "name": "SSUnitTest", 
            "optional": true, 
            "package": "Testing", 
            "path": "..\/client\/SSUnitTest.js"
        }, 
        "SSView": {
            "dependencies": [
                "SandalphonCore", 
                "SSLog", 
                "PreInitDeclarations", 
                "UtilityFunctions"
            ], 
            "name": "SSView", 
            "package": "ShiftSpaceCoreUI", 
            "path": "..\/client\/SSView.js", 
            "required": true
        }, 
        "SSViewProxy": {
            "dependencies": [
                "SandalphonSupport"
            ], 
            "name": "SSViewProxy", 
            "package": "System", 
            "path": "..\/client\/SSViewProxy.js", 
            "required": true
        }, 
        "SandalphonCore": {
            "name": "SandalphonCore", 
            "package": "System", 
            "path": "..\/sandalphon\/SandalphonCore.js", 
            "required": true
        }, 
        "SandalphonSupport": {
            "dependencies": [
                "SandalphonCore"
            ], 
            "name": "SandalphonSupport", 
            "package": "System", 
            "path": "..\/client\/SandalphonSupport.js", 
            "required": true
        }, 
        "Shift": {
            "name": "Shift", 
            "package": "ShiftSpaceCore", 
            "path": "..\/client\/Shift.js", 
            "required": true
        }, 
        "ShiftFunctions": {
            "name": "ShiftFunctions", 
            "optional": true, 
            "package": "Core", 
            "path": "..\/client\/core\/ShiftFunctions.js"
        }, 
        "ShiftMenu": {
            "dependencies": [
                "ShiftSpaceElement", 
                "EventProxy"
            ], 
            "name": "ShiftMenu", 
            "package": "ShiftSpaceUI", 
            "path": "..\/client\/ShiftMenu.js", 
            "required": true
        }, 
        "ShiftSpaceElement": {
            "name": "ShiftSpaceElement", 
            "package": "System", 
            "path": "..\/client\/ShiftSpaceElement.js", 
            "required": true
        }, 
        "SomeFile1": {
            "dependencies": [
                "SomeFile3"
            ], 
            "package": "TestTesting", 
            "path": "..\/client\/testTesting\/SomeFile1.js", 
            "required": true
        }, 
        "SomeFile2": {
            "dependencies": [
                "SomeFile3"
            ], 
            "package": "TestTesting", 
            "path": "..\/client\/testTesting\/SomeFile2.js", 
            "required": true
        }, 
        "SomeFile3": {
            "package": "TestTesting", 
            "path": "..\/client\/testTesting\/SomeFile3.js", 
            "required": true
        }, 
        "Space": {
            "name": "Space", 
            "package": "ShiftSpaceCore", 
            "path": "..\/client\/Space.js", 
            "required": true
        }, 
        "SpaceFunctions": {
            "name": "SpaceFunctions", 
            "optional": true, 
            "package": "Core", 
            "path": "..\/client\/core\/SpaceFunctions.js"
        }, 
        "TestTesting": {
            "dependencies": [
                "SomeFile1", 
                "SomeFile2"
            ], 
            "path": "..\/tests\/TestTesting.js", 
            "suite": "TestTesting", 
            "test": true
        }, 
        "User": {
            "name": "User", 
            "optional": true, 
            "package": "ShiftSpaceCore", 
            "path": "..\/client\/User.js"
        }, 
        "UserFunctions": {
            "name": "UserFunctions", 
            "optional": true, 
            "package": "Core", 
            "path": "..\/client\/core\/UserFunctions.js"
        }, 
        "UtilityFunctions": {
            "name": "UtilityFunctions", 
            "optional": true, 
            "package": "Core", 
            "path": "..\/client\/core\/UtilityFunctions.js"
        }, 
        "shiftspace": {
            "dependencies": [
                "GreaseMonkeyApi"
            ], 
            "name": "SSLog", 
            "package": "System_", 
            "path": "..\/shiftspace.user.js", 
            "required": true
        }, 
        "shiftspace-orig": {
            "dependencies": [
                "GreaseMonkeyApi"
            ], 
            "name": "SSLog", 
            "package": "System_", 
            "path": "..\/shiftspace-orig.user.js", 
            "required": true
        }
    }, 
    "packages": {
        "Core": [
            "UserFunctions", 
            "UtilityFunctions", 
            "ShiftFunctions", 
            "PersistenceFunctions", 
            "RemoteFunctions", 
            "PluginFunctions", 
            "SpaceFunctions"
        ], 
        "ErrorHandling": [
            "ErrorWindow"
        ], 
        "EventHandling": [
            "CoreEvents"
        ], 
        "Internationalization": [
            "LocalizedStringsSupport"
        ], 
        "Pinning": [
            "RangeCoder", 
            "Pin", 
            "PinHelpers", 
            "PinWidget"
        ], 
        "ShiftSpaceCore": [
            "SSTableViewDatasource", 
            "Shift", 
            "Space", 
            "Plugin", 
            "User"
        ], 
        "ShiftSpaceCoreUI": [
            "SSView", 
            "SSTabView", 
            "SSTableView", 
            "SSTableRow", 
            "SSCell", 
            "SSCustomTableRow", 
            "SSEditableTextCell", 
            "SSListView"
        ], 
        "ShiftSpaceUI": [
            "ActionMenu", 
            "SSConsole", 
            "ShiftMenu"
        ], 
        "System": [
            "ShiftSpaceElement", 
            "SSException", 
            "EventProxy", 
            "SandalphonCore", 
            "SandalphonSupport", 
            "SSCustomExceptions", 
            "SSViewProxy"
        ], 
        "System_": [
            "GreaseMonkeyApi", 
            "SSLog", 
            "shiftspace", 
            "shiftspace-orig"
        ], 
        "TestTesting": [
            "SomeFile3", 
            "SomeFile2", 
            "SomeFile1"
        ], 
        "Testing": [
            "SSUnitTest"
        ], 
        "Trails": [
            "NewTrail", 
            "RecentlyViewedHelpers"
        ], 
        "UtilitiesExtras": [
            "FullScreen", 
            "IframeHelpers"
        ]
    }
};
var __sysavail__ = {
  files: [],
  packages: []
};

SSLog('SERVER: ' + server, SSLogForce);
SSLog('SPACESDIR: ' + spacesDir, SSLogForce);

var version = '0.13';
var cacheFiles = 0;

if(typeof ShiftSpaceSandBoxMode != 'undefined') 
{
  server = window.location.href.substr(0, window.location.href.indexOf('sandbox'));
  cacheFiles = 0;
}

var displayList = [];
var __SSInvalidShiftIdError__ = "__SSInvalidShiftIdError__";
var __consoleIsWaiting__ = false;
var __defaultEmailComments__ = 1;

// Stores initial data for plugins that are needed for the console at startup
// since the plugins won't actually be loaded until they are needed
var __pluginsData__ = {};

// Each space and a corresponding URL of its origin
var installed = SSGetValue('installed', {
  'Notes' : server + 'spaces/Notes/Notes.js',
  'ImageSwap': server + 'spaces/ImageSwap/ImageSwap.js',
  'Highlights': server + 'spaces/Highlights/Highlights.js',
  'SourceShift': server + 'spaces/SourceShift/SourceShift.js'
});

var spacePrefs = SSGetValue('spacePrefs', {});

// Each plugin and a corresponding URL of its origin

var installedPlugins = {};

/*
// otherwise respect existing values, servers might be different
// for different resources
installedPlugins = SSGetValue('installedPlugins', {
  'Delicious': server + 'plugins/Delicious/Delicious.js',
  'Trails': server + 'plugins/Trails/NewTrail.js',
  'Comments': server + 'plugins/Comments/Comments.js',
  'Twitter': server + 'plugins/Twitter/Twitter.js'
});
SSLog(installedPlugins);
*/

// installedPlugins = {
//   'Trails' : myFiles + 'plugins/Trails/NewTrail.js'
// };

// An index of cached files, used to clear the cache when necessary
var cache = SSGetValue('cache', []);
var alreadyCheckedForUpdate = false;


// End ../client/core/PreInitDeclarations.js ----------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('PreInitDeclarations');

// === START PACKAGE [System] ===

if(__sysavail__) __sysavail__.packages.push("System");

if (SSInclude != undefined) SSLog('Including ../client/ShiftSpaceElement.js...', SSInclude);

// Start ../client/ShiftSpaceElement.js ---------------------------------------

// ==Builder==
// @required
// @name	            ShiftSpaceElement
// @package           System
// ==/Builder==

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

/*
  Class: ShiftSpace.Element
    A wrapper around the MooTools Element class that marks each DOM node with the ShiftSpaceElement CSS
    class.  This is required for identifying which elements on the page belong to ShiftSpace.  In the case
    of iFrames this is also used to make sure that iFrame covers get generated so that drag and resize
    operations don't break.
*/
var SSElement = new Class({
  /*
    Function: initialize (private)
      Initialize the element and if necessary add appropiate event handlers.

    Parameters:
      _el - a raw DOM node or a string representing a HTML tag type.
      props - the same list of options that would be passed to the MooTools Element class.

    Returns:
      An ShiftSpace initialized and MooTools wrapped DOM node.
  */
  initialize: function(_el, props)
  {
    var el = (_el == 'iframe') ? new IFrame(props) : new Element(_el, props);

    // ShiftSpaceElement style needs to be first, otherwise it overrides passed in CSS classes - David
    el.setProperty( 'class', 'ShiftSpaceElement ' + el.getProperty('class') );

    // remap makeResizable and makeDraggable - might want to look into this more
    var resizeFunc = el.makeResizable;
    var dragFunc = el.makeDraggable;

    // override the default behavior
    if(SSAddIframeCovers)
    {
      el.makeDraggable = function(options)
      {
        var dragObj;
        if(!dragFunc)
        {
          dragObj = new Drag.Move(el, options);
        }
        else
        {
          dragObj = (dragFunc.bind(el, options))();
        }

        dragObj.addEvent('onStart', function() {
          SSAddIframeCovers();
        });
        dragObj.addEvent('onDrag', SSUpdateIframeCovers);
        dragObj.addEvent('onComplete', SSRemoveIframeCovers);

        return dragObj;
      };

      // override the default behavior
      el.makeResizable = function(options)
      {
        var resizeObj;
        if(!resizeFunc)
        {
          resizeObj = new Drag.Base(el, $merge({modifiers: {x: 'width', y: 'height'}}, options));
        }
        else
        {
          resizeObj = (resizeFunc.bind(el, options))();
        }

        resizeObj.addEvent('onStart', SSAddIframeCovers);
        resizeObj.addEvent('onDrag', SSUpdateIframeCovers);
        resizeObj.addEvent('onComplete', SSRemoveIframeCovers);

        return resizeObj;
      };
    }

    return el;
  }
});

/*
  Class : ShiftSpace.Iframe
    This class allows the creation of iframes with CSS preloaded.  This will eventually
    be deprecated by the the forthcoming MooTools Iframe element which actually loads
    MooTools into the Iframe.  Inherits from <ShiftSpace.Element>.  You shouldn't instantiate
    this class directly, just use <ShiftSpace.Element>.
*/
var SSIframe = new Class({

  Extends: SSElement,

  /*
    Function: initialize (private)
      Initializes the iframe.

    Parameters:
      props - the same properties that would be passed to a MooTools element.

    Returns:
      A ShiftSpace initialized and MooTools wrapped Iframe.
  */
  initialize: function(props)
  {
    // check for the css property
    this.css = props.css;

    // check for cover property to see if we need to add a cover to catch events
    var loadCallBack = props.onload;
    delete props.onload;

    // eliminate the styles, add on load event
    var finalprops = $merge(props, {
      events:
      {
        load : function(_cb) {
          // load the css
          if(this.css)
          {
            SSLoadStyle(this.css, null, this.frame);
          }
          _cb();
        }.bind(this, loadCallBack)
      }
    });

    // store a ref for tricking
    this.frame = this.parent('iframe', finalprops);

    var addCover = true;
    if($type(props.addCover) != 'undefined' && props.addCover == false) addCover = false;

    if(addCover && SSAddCover)
    {
      // let ShiftSpace know about it
      SSAddCover({cover:SSCreateCover(), frame:this.frame});
    }
    else
    {
      SSLog('=========================== No cover to add!');
    }

    // return
    return this.frame;
  }
});

var SSInput = new Class({
  Extends: SSElement
  // Create an iframe
  // Apply the styles
  // Create the requested input field
  // set the input field / textarea to be position absolute, left top right bottom all 0
  // set up event handlers so they get pass up to the developer
});

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

// End ../client/ShiftSpaceElement.js -----------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('ShiftSpaceElement');

if (SSInclude != undefined) SSLog('Including ../client/SSException.js...', SSInclude);

// Start ../client/SSException.js ---------------------------------------------

// ==Builder==
// @optional
// @name              SSException
// @package           System
// ==/Builder==

var SSExceptionPrinter = new Class({
  toString: function()
  {
    return ["["+this.name+"] message: " + this.message(), " fileName:" + this.fileName(), " lineNumber: " + this.lineNumber(), (this.originalError() && this.originalError().message) || 'no original error'].join(", ");
  }
});

var SSException = new Class({
  
  name: 'SSException',

  Implements: SSExceptionPrinter,
    
  initialize: function(_error)
  {
    this.theError = _error;
  },
    
  setMessage: function(msg)
  {
    this.__message__ = msg; 
  },
  
  message: function()
  {
    return this.__message__ || (this.theError && this.theError.message) || 'n/a';
  },
  
  fileName: function()
  {
    return (this.theError && this.theError.fileName) || 'n/a';
  },

  lineNumber: function()
  {
    return (this.theError && this.theError.lineNumber) || 'n/a';
  },
  
  originalError: function()
  {
    return this.theError;
  }
  
});

// End ../client/SSException.js -----------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSException');

if (SSInclude != undefined) SSLog('Including ../client/EventProxy.js...', SSInclude);

// Start ../client/EventProxy.js ----------------------------------------------

// ==Builder==
// @required
// @name              EventProxy
// @package           System
// ==/Builder==

// event proxy object since, ShiftSpace is not a MooTools class
var __eventProxyClass__ = new Class({});
__eventProxyClass__.implement(new Events);
var __eventProxy__ = new __eventProxyClass__();

/*
  Function: SSAddEvent
    Adds a Mootools style custom event to the ShiftSpace object.

  Parameters:
    eventType - a event type as string.
    callback - a function.

  See also:
    SSFireEvent
*/
var __sleepingObjects__ = $H();
function SSAddEvent(eventType, callback, anObject)
{
  //console.log('adding event ' + eventType);
  if(anObject && anObject.isAwake && !anObject.isAwake())
  {
    var objId = anObject.getId();
    if(!__sleepingObjects__.get(objId))
    {
      __sleepingObjects__.set(anObject.getId(), $H({
        object: anObject,
        events: $H()
      }));
    }
    var eventsHash = __sleepingObjects__.get(objId).get('events');
    if(!eventsHash.get(eventType))
    {
      eventsHash.set(eventType, []);
    }
    eventsHash.get(eventType).push(callback);
  }
  else
  {
    __eventProxy__.addEvent(eventType, callback);
  }
};

/*
  Function: SSFireEvent
    A function to fire events.

  Parameters:
    eventType - event type as string.
    data - any extra event data that should be passed to the event listener.
*/
function SSFireEvent(eventType, data) 
{
  //console.log('SSFireEvent ' + eventType);
  __eventProxy__.fireEvent(eventType, data);
  
  var awakeNow = __sleepingObjects__.filter(function(objectHash, objectName) {
    return objectHash.get('object').isAwake();
  });
  
  // call back these immediate
  awakeNow.each(function(objectHash, objectName) {
    //console.log('now awake ' + objectName);
    SSAddEventsAndFire(eventType, objectHash.get('events').get(eventType));
  });
  
  var stillSleeping = __sleepingObjects__.filter(function(objectHash, objectName) {
    //console.log('checking ' + objectName + ' ' + objectHash.get('object').isAwake());
    return !objectHash.get('object').isAwake();
  });
  
  stillSleeping.each(function(objectHash, objectName) {
    objectHash.get('object').addEvent('onAwake', function() {
      //console.log('waking up!');
      SSAddEventsAndFire(eventType, objectHash.get('events').get(eventType));
    });
  });
  
  // update which objects are still sleeping
  __sleepingObjects__ = stillSleeping;
  
  //console.log('still sleeping');
  //console.log(__sleepingObjects__.getLength());
};

// takes and event type and a list of event callbacks
// adds each callback as well as executing
function SSAddEventsAndFire(eventType, events)
{
  if(events && events.length > 0)
  {
    events.each(function(callback) {
      SSAddEvent(eventType, callback);
      callback();
    });
  }
}

// End ../client/EventProxy.js ------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('EventProxy');

if (SSInclude != undefined) SSLog('Including ../sandalphon/SandalphonCore.js...', SSInclude);

// Start ../sandalphon/SandalphonCore.js --------------------------------------

// ==Builder==
// @required
// @name              SandalphonCore
// @package           System
// ==/Builder==

var SandalphonClass = new Class({

  initialize: function(attribute)
  {
    // for analyzing fragments of markup
    this.setFragment(new Element('div'));
    this.outletBindings = [];
    this.contextHash = $H();
  },
  
  /*
    Function: _genId
      Generate an object id.  Used for debugging.  The instance is indentified by this in the global
      ShiftSpace.Objects hash.
  */
  _genContextId: function()
  {
    return ('ctxtid_'+(Math.round(Math.random()*1000000+(new Date()).getMilliseconds())));
  },
  
  
  getContextId: function(ctxt)
  {
    console.log(ctxt);
    if(!ctxt.ssctxtid)
    {
      ctxt.ssctxtid = this._genContextId();
    }
    return ctxt.ssctxtid;
  },
  

  contextForId: function(id)
  {
    return this.contextHash.get(id).context;
  },
  
  
  internContext: function(ctxt)
  {
    var ctxtId = this.getContextId(ctxt);
    if(!this.contextHash.get(ctxtId))
    {
      // default isReady to true, because some contexts aren't activated
      this.contextHash.set(ctxtId, {isReady:true, context:ctxt});
    }
    return ctxtId;
  },
  
  
  contextIsReady: function(ctxt)
  {
    // intern the context just in case
    this.internContext(ctxt);
    return this.contextHash.get(this.getContextId(ctxt)).isReady;
  },
  
  
  setContextIsReady: function(ctxtid, val)
  {
    this.contextForId(ctxtid).isReady = val;
  },
  
  
  convertToFragment: function(markup, ctxt)
  {
    var context = ctxt || window;
    
    // generate the fragment in the context
    var fragment = context.$(context.document.createElement('div'));
    fragment.set('html', markup);
    
    // TODO: generalize to return markup that doesn't have a root node
    var markupFrag = $(fragment.getFirst().dispose());

    //console.log('convertToFragment');
    //console.log(markupFrag.getProperty('id'));
    
    // destroy the temporary fragment
    fragment.destroy();
    
    return markupFrag;
  },
  
  /*
    Function: fragment
      Returns the private fragment node.
    
    Returns:
      The fragment node.
  */
  fragment: function()
  {
    return this.__fragment__;
  },
  
  /*
    Function:
      Sets the private fragment node.
  */
  setFragment: function(frag)
  {
    this.__fragment__ = frag;
  },

  /*
    Function: loadFile
      Loads an interface file from the speficied path.
    
    Parameters:
      path - a file path as string.  This path should be absolute from the root ShiftSpace directory.
  */
  load: function(path, callback)
  {
    var interface;
    var styles;
    
    SSLog("Sandalphon LOAD " + path);
    
    var server = (ShiftSpace && ShiftSpace.info && ShiftSpace.info().server) || '..';
    //console.log('load!');
    // load the interface file
    if(typeof SandalphonToolMode != 'undefined')
    {
      var interfaceCall = new Request({
        url:  server+path+'.html',
        method: 'get',
        onComplete: function(responseText, responseXML)
        {
          SSLog("Sandalphon interface call complete");
          interface = responseText;
        }.bind(this),
        onFailure: function()
        {
          console.error('Oops could not load that interface file');
        }
      });
      
      var stylesCall = new Request({
        url:  '..'+path+'.css',
        method: 'get',
        onComplete: function(responseText, responseXML)
        {
          SSLog("Sandalphon styles call complete");
          styles = responseText;
        }.bind(this),
        onFailure: function()
        {
          console.error('Oops could not load that interface file');
        }
      });
      
      // Group HTMl and CSS calls
      var loadGroup = new Group(interfaceCall, stylesCall);
      loadGroup.addEvent('complete', function() {
        SSLog('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Sandalphon interface loda complete');
        if(callback) callback({interface:interface, styles:styles});
      });
      
      // fetch
      interfaceCall.send();
      stylesCall.send();
    }
    else
    {
      // just use loadFile if we're running in ShiftSpace
      SSLoadFile(path+'.html', function(rx) {
        interface = rx.responseText;
        SSLoadFile(path+'.css', function(rx) {
          styles = rx.responseText;
          if(callback) callback({interface:interface, styles:styles});
        });
      });
    }

  },
  
  
  addStyle: function(css, ctxt) 
  {
    var context = ctxt || window;
    var contextDoc = context.document;
    
    if (context.$$('head').length != 0) 
    {
      var head = context.$$('head')[0];
    } 
    else 
    {
      var head = context.$(contextDoc.createElement('head'));
      head.injectBefore($(contextDoc.body));
    }
    
    // Add some base styles
    css += "                          \
      .SSDisplayNone                  \
      {                               \
        display: none;                \
      }                               \
      .SSUserSelectNone               \
      {                               \
        -moz-user-select: none;       \
        user-select: none;            \
        -webkit-user-select: none;    \
      }                               \
    ";
    
    if(!Browser.Engine.trident)
    {
      var style = context.$(contextDoc.createElement('style'));
      style.setProperty('type', 'text/css');
      style.appendText(css);
      style.injectInside(head);
    }
    else
    {
      var style = contextDoc.createStyleSheet();
      style.cssText = css;
    }
  },
  
  
  activate: function(ctxt)
  {
    var context = ctxt || window;
    
    // internalize this context
    var ctxtid = this.internContext(context);
    this.setContextIsReady(ctxtid, false);
    
    SSLog('>>>>>>>>>>>>>>>>>> activate', SSLogSandalphon);
    console.log('>>>>>>>>>>>>>>>>>>> activate');
    
    // First generate the outlet bindings
    this.generateOutletBindings(context);
    // First instantiate all controllers
    this.instantiateControllers(context);
    // Initialize all outlets
    this.bindOutlets(context);
    this.awakeObjects(context);
    
    // the context is ready now
    this.setContextIsReady(ctxtid, true);
  },
  
  
  /*
    Function: instantiateControllers
      Instantiate any backing JS view controllers for the interface.
  */
  instantiateControllers: function(ctxt)
  {
    SSLog('instantiateControllers', SSLogSandalphon);
    var context = ctxt || window;
    
    var views = this.contextQuery(context, '*[uiclass]');
    
    SSLog(views, SSLogSandalphon);  

    // instantiate all objects
    views.each(function(aView) {
      var theClass = aView.getProperty('uiclass');
      SSLog('=========================================');
      SSLog('instantiating ' + theClass);
      new ShiftSpace.UI[theClass](aView, {
        context: context
      });
      SSLog('instantation complete');
    });
    
    // notify all listeners
    SSLog('Notifying all listeners');
    views.each(SSNotifyInstantiationListeners);
  },
  
  
  contextQuery: function(context, sel)
  {
    return (context.$$ && context.$$(sel)) ||
           (context.getElements && context.getElements(sel)) ||
           [];
  },
  
  
  generateOutletBindings: function(ctxt)
  {
    // grab the right context, grab all outlets
    var context = ctxt || window;
    var outlets = this.contextQuery(context, '*[outlet]');

    // TODO: need to figure out what the outlets are going to be BEFORE instantiating controllers

    outlets.each(function(anOutlet) {
      var outletTarget, sourceName;
      
      // grab the outlet parent id
      var outlet = anOutlet.getProperty('outlet').trim();
      
      // if not a JSON value it's just the id
      if(outlet[0] != '{')
      {
        outletTarget = outlet;
        sourceName = anOutlet.getProperty('id');
      }
      else
      {
        // otherwise JSON decode it in safe mode
        var outletBinding = JSON.decode(outlet);
        outletTarget = outletBinding.target;
        sourceName = outletBinding.name;
      }
      
      this.outletBindings.push({
        sourceName: sourceName,
        source: anOutlet,
        targetName: outletTarget,
        context: context
      });

    }.bind(this));
  },
  
  
  bindOutlets: function()
  {
    // bind each outlet
    this.outletBindings.each(function(binding) {
      
      var context = binding.context,
          sourceName = binding.sourceName,
          source = binding.source,
          targetName = binding.targetName;
      
      // check the context, and the top level window    
      var target = context.$(targetName) || (context != window && $(targetName));
        
      if(!target)
      {
        // check for parent with matching css selector
        target = source.getParent(targetName);
      } 
      
      if(!target)
      {
        // throw an exception
        console.error('Error: Sandalphon bindOutlets, binding target does not exist! ' + targetName);
        console.error(source);
        // bail
        return;
      }
      
      // check for a controller on the source
      if(SSControllerForNode(source))
      {
        source = SSControllerForNode(source);
      }
      
      SSControllerForNode(target).addOutletWithName(sourceName, source);
    }.bind(this));
    
    SSLog(this.outletBindings, SSLogSandalphon);
  },
  
  
  awakeObjects: function(context)
  {
    ShiftSpace.Objects.each(function(object, objectId) {
      if(object.awake && !object.isAwake())
      {
        object.awake(context);
        object.setIsAwake(true);
        object.fireEvent('onAwake');
      }
    });
  },
  
  
  /*
    Function: analyze
      Determine if all the required classes for the interface are available.
    
    Parameters:
      html - the interface markup as a string.
  */
  analyze: function(html)
  {
    this.fragment().set('html', html);
    
    var allNodes = this.fragment().getElements('*[uiclass]');
    
    var classes = allNodes.map(function(x){return x.getProperty('uiclass')});
    
    // First verify that we have a real path for each class
    var missingClasses = false;
    classes.each(function(x) {
      if(!missingClasses) missingClasses = (ShiftSpace.ClassPaths[x] == null && ShiftSpace.UIClassPaths[x] == null && ShiftSpace.UserClassPaths[x] == null);
    }.bind(this));
    
    if(missingClasses) console.error('Error missing uiclasses.');
    
    if(missingClasses)
    {
      return false;
    }
    else
    {
      return true;
    }
  }
  
});
var Sandalphon = new SandalphonClass();


var SandalphonToolClass = new Class({
   Language: 'en',

   initialize: function(storage)
   { 
     console.log('starting up!');
     SSLog('Sandalphon, sister of Metatron, starting up.', SSLogSandalphon);
     // setup the persistent storage
     this.setStorage(storage);
     // initialize the classpath
     this.setupClassPaths();
     // intialize the interface
     this.initInterface();
     console.log('Loading localized strings!');
     // load localised strings
     this.loadLocalizedStrings(this.Language);
   },


   loadLocalizedStrings: function(lang)
   {
     console.log('Making the request');
     SSLog('load localized strings ' + lang, SSLogSandalphon);
     new Request({
       url: "../client/LocalizedStrings/"+lang+".json",
       method: "get",
       onComplete: function(responseText, responseXML)
       {
         console.log('Response returned')
         SSLog(lang + " - " + ShiftSpace.lang, SSLogSandalphon);
         if(lang != ShiftSpace.lang)
         {
           console.log('decoding language file');
           ShiftSpace.localizedStrings = JSON.decode(responseText);
           console.log('done');
           SSLog(ShiftSpace.localizedStrings, SSLogSandalphon);

           // update objects
           ShiftSpace.Objects.each(function(object, objectId) {
             if(object.localizationChanged) object.localizationChanged();
           });

           // update markup
           $$(".SSLocalized").each(function(node) {

             var originalText = node.getProperty('title');

             if(node.get('tag') == 'input' && node.getProperty('type') == 'button')
             {
               node.setProperty('value', SSLocalizedString(originalText));
             }
             else
             {
               node.set('text', SSLocalizedString(originalText));              
             }

           }.bind(this));
         }

         ShiftSpace.lang = lang;
       },
       onFailure: function(response)
       {
         console.error('Error loading localized strings ' + response);
       }
     }).send();
   },


   /*
     Function: initInterface
       Loads the last used input paths as a convenience.
   */
   initInterface: function()
   {
     SSLog('Initializing interface', SSLogSandalphon);

     this.storage().get('lastInterfaceFile', function(ok, value) {
       if(ok && value) $('loadFileInput').setProperty('value', value);
     });
     this.storage().get('lastTestFile', function(ok, value) {
       if(ok && value) $('loadTestInput').setProperty('value', value);
     });

     this.attachEvents();    
   },

   /*
     Function: setupClassPaths
       Loads the class paths.  Doesn't really do all that much now.
   */
   setupClassPaths: function()
   {
     // initialize the UIClassPaths var
     this.storage().get('UIClassPaths', function(ok, value) {
       if(ok)
       {
         /*
         if(!value)
         {
         */
           SSLog('Initializing class paths.', SSLogSandalphon);
           this.storage().set('UIClassPaths', JSON.encode(ShiftSpace.UIClassPaths));
           this.storage().set('ClassPaths', JSON.encode(ShiftSpace.ClassPaths));
         /*}
         else
         {
           console.log('Loading class paths.');
           this.UIClassPaths = JSON.decode('('+value+')');
         }*/
         this.loadClassFiles();
       }
     }.bind(this));
   },

   /*
     Function: loadClassFiles
       Loads all of the files pointed to in the class path dictionaries.
   */
   loadClassFiles: function()
   {
     for(var className in ShiftSpace.ClassPaths)
     {
       var path = '..' + ShiftSpace.ClassPaths[className] + className;
       new Asset.javascript(path+'.js');
     }

     for(var className in ShiftSpace.UIClassPaths)
     {
       var path = '..' + ShiftSpace.UIClassPaths[className] + className;
       new Asset.css(path+'.css');
       new Asset.javascript(path+'.js');
     }

     for(var className in ShiftSpace.UserClassPaths)
     {
       var path = '..' + ShiftSpace.UserClassPaths[className] + className;
       new Asset.css(path+'.css');
       new Asset.javascript(path+'.js');
     }

     SSLog('Class files loaded.', SSLogSandalphon);
   },
   
   /*
     Function: loadTest
       Loads a test file.

     Parameters:
       path - the path to the test file as a string.  The path should be absolute from the root ShiftSpace directory.
   */
   loadTest: function(path)
   {
     SSLog('Loading test file', SSLogSandalphon);
     // save for later
     this.storage().set('lastTestFile', path);

     // load the interface file
     new Request({
       url:  '..'+path,
       method: 'get',
       onSuccess: function(responseText, responseXML)
       {
         try
         {
           SSLog('Evaluating test', SSLogSandalphon);
           eval(responseText);         
           SSLog('Running test', SSLogSandalphon);   
           this.runTest()  
         }
         catch(exc)
         {
           SSLog(exc, SSLogError);
         }
       }.bind(this),
       onFailure: function()
       {
         console.error('Oops could not load that test file.');
       }
     }).send();
   },
   
   /*
     Function: storage
       Accessor method.

     Returns:
       The persistent storage object.
   */
   storage: function()
   {
     return this.__storage__;
   },

   /*
     Function: setStorage
       Set the persistent storage object.

     Parameters:
       storage - A persistent storage object, provided by persist.js
   */
   setStorage: function(storage)
   {
     this.__storage__ = storage;
   },

   
   loadUI: function(ui)
   {
     //console.log(ui);
     // empty it out first
     $('SSSandalphonContainer').empty();
     // Add the style
     Sandalphon.addStyle(ui.styles);
     // load the new file
     $('SSSandalphonContainer').set('html', ui.interface);
     // activate the interface
     Sandalphon.activate();
   },

   /*
     Function: attachEvents
       Attach the gui events for the interface.
   */
   attachEvents: function()
   {
     // attach file loading events
     $('loadFileInput').addEvent('keyup', function(_evt) {
       var evt = new Event(_evt);
       if(evt.key == 'enter')
       {
         Sandalphon.load($('loadFileInput').getProperty('value'), this.loadUI.bind(this));
       }
     }.bind(this));

     // attach the compile events
     $('compileFile').addEvent('click', this.compileFile.bind(this));

     // attach test events
     $('loadTestInput').addEvent('keyup', function(_evt) {
       var evt = new Event(_evt);
       if(evt.key == 'enter')
       {
         this.loadTest($('loadTestInput').getProperty('value'));
       }
     }.bind(this));

     $('loadTestFile').addEvent('click', function(_evt) {
       var evt = new Event(_evt);
       this.loadTest($('loadTestInput').getProperty('value'));
     }.bind(this));

     // attach events to localization switcher
     $('localizedStrings').addEvent('change', function(_evt) {
       var evt = new Event(_evt);
       this.loadLocalizedStrings($('localizedStrings').getProperty('value'));
     }.bind(this));
   },
   
   /*
      Function: compileFile
        Tell the server to compile the file
    */
   compileFile: function()
   {
     // clear out all existing system data

     // grab the filepath
     var filepath = $('loadFileInput').getProperty('value');
     // save for later
     this.storage().set('lastInterfaceFile', filepath);

     new Request({
       url: "compile.php",
       data: {"filepath":'..'+filepath+'.html'},
       onComplete: function(responseText, responseXml)
       {
         var filename = filepath.split('/').getLast();
         Sandalphon.load('/client/compiledViews/'+filename, this.loadUI.bind(this));
       }.bind(this),
       onFailure: function(response)
       {
         console.error(response);
       }
     }).send();
   },
});


// End ../sandalphon/SandalphonCore.js ----------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SandalphonCore');

if (SSInclude != undefined) SSLog('Including ../client/SandalphonSupport.js...', SSInclude);

// Start ../client/SandalphonSupport.js ---------------------------------------

// ==Builder==
// @required
// @name              SandalphonSupport
// @package           System
// @dependencies      SandalphonCore
// ==/Builder==

var SSInstantiationListeners = {};
function SSAddInstantiationListener(element, listener)
{
  var id = element._ssgenId();
  if(!SSInstantiationListeners[id])
  {
    SSInstantiationListeners[id] = [];
  }
  SSInstantiationListeners[id].push(listener);
}

function SSNotifyInstantiationListeners(element)
{
  var listeners = SSInstantiationListeners[element.getProperty('id')];
  if(listeners)
  {
    listeners.each(function(listener) {
      if(listener.onInstantiate)
      {
        listener.onInstantiate();
      }
    });
  }
}

var __controllers__ = $H();
// NOTE: we generate ids and store controller refs ourselves this is because of weird garbage collection
// around iframes and wrappers around dom nodes when SS runs under GM - David
function SSSetControllerForNode(controller, _node)
{
  var node = $(_node);

  // generate our own id
  node._ssgenId();
  // keep back reference
  __controllers__.set(node.getProperty('id'), controller);
}

// return the controller for a node
function SSControllerForNode(_node)
{
  var node = $(_node);

  return __controllers__.get(node.getProperty('id')) ||
         (node.getProperty('uiclass') && new SSViewProxy(node)) ||
         null;
}

// End ../client/SandalphonSupport.js -----------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SandalphonSupport');

if (SSInclude != undefined) SSLog('Including ../client/SSCustomExceptions.js...', SSInclude);

// Start ../client/SSCustomExceptions.js --------------------------------------

// ==Builder==
// @optional
// @name              SSCustomExceptions
// @package           System
// @dependencies      SSException
// ==/Builder==

var SSSpaceDoesNotExistError = new Class({
  Extends: SSException,
  
  name: 'SSSpaceDoesNotExistError',
  
  initialize: function(_error, spaceName)
  {
    this.parent(_error);
    this.spaceName = spaceName;
  },
  
  message: function()
  {
    return "Space " + this.spaceName + " does not exist.";
  }

});

var ShiftDoesNotExistError = new Class({
  
});

// End ../client/SSCustomExceptions.js ----------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSCustomExceptions');

if (SSInclude != undefined) SSLog('Including ../client/SSViewProxy.js...', SSInclude);

// Start ../client/SSViewProxy.js ---------------------------------------------

// ==Builder==
// @required
// @name	            SSViewProxy
// @package           System
// @dependencies      SandalphonSupport
// ==/Builder==

var SSViewProxy = new Class({

  name: "SSViewProxy",

  Implements: [Options, Events],
  
  defaults: function()
  {
    return {};
  },

  initialize: function(el, options)
  {
    // store the element
    this.element = $(el);

    // generate an id for the element in case it doesn't already have one
    el._ssgenId();
    // set messages
    this.setMessages([]);
    // add a listener for this element
    SSAddInstantiationListener(el, this);
  },


  onInstantiate: function()
  {
    this.deliverMessages();
  },


  adoptClassMethods: function()
  {
    // NOTE: probably overkill, but here to implement just in case - David
  },


  setMessages: function(newMessages)
  {
    this.__messages__ = newMessages;
  },


  messages: function()
  {
    return this.__messages__;
  },


  deliverMessages: function()
  {
    var controller = SSControllerForNode(this.element);
    SSLog('deliverMessages ' + this.element, SSLogViews);
    SSLog(controller, SSLogViews);
    this.messages().each(function(message) {
      controller[message.name].apply(controller, message.arguments);
    });
  },


  setDelegate: function()
  {
    this.messages().push({name:'setDelegate', arguments:$A(arguments)});
  },


  show: function()
  {
    // add a show message
    this.messages().push({name:'show', arguments:$A(arguments)});
  },


  hide: function()
  {
    // add a hide message
    this.messages().push({name:'hide', arguments:$A(arguments)});
  },


  refresh: function()
  {
    // add a refresh message
    this.messages().push({name:'refresh', arguments:$A(arguments)});
  },


  addEvent: function(type, handler)
  {
    this.message().push({name:'addEvent', arguments:$A(arguments)});
  },


  destroy: function()
  {

  }

});

// End ../client/SSViewProxy.js -----------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSViewProxy');

// === END PACKAGE [System] ===


// === START PACKAGE [ErrorHandling] ===

if(__sysavail__) __sysavail__.packages.push("ErrorHandling");

if (SSInclude != undefined) SSLog('Including ../client/ErrorWindow.js...', SSInclude);

// Start ../client/ErrorWindow.js ---------------------------------------------

// ==Builder==
// @optional
// @name              ErrorWindow
// @package           ErrorHandling
// @dependencies      ShiftSpaceElement
// ==/Builder==

var __errorWindow__,
    __errorWindowShiftPropertyModel__,
    __errorWindowMinimized__ = true;

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
  errorWindowTitle.set('text', 'Oops ... it seems this shift is broken');

  // the errow message area
  var errorWindowMessage = new ShiftSpace.Element('div', {
    'class': "SSErrorWindowMessage"
  });
  errorWindowMessage.injectInside(__errorWindow__);
  errorWindowMessage.set('html', 'Help us improve our experimental fix feature, copy and paste the shift details and <a target="new" href="http://metatron.shiftspace.org/trac/newticket">file a bug report</a>.');

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
  errorWindowExpandLabel.set('text', 'view shift details');
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
  errorWindowOk.set('text', 'OK');
  errorWindowOk.injectInside(errorWindowBottom);

  // build the fix button
  var errorWindowFix = new ShiftSpace.Element('div', {
    'class': "SSErrorWindowFix SSErrorWindowButton SSDisplayNone"
  });
  errorWindowFix.set('text', 'Fix');
  errorWindowFix.injectInside(errorWindowBottom);
  
  __errorWindow__.set('tween', {
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
      errorWindowExpandLabel.set('text', 'view shift details');
      errorWindowShiftStatusScroll.addClass('SSDisplayNone');
      __errorWindowMinimized__ = true;
    }
  });
  
  __errorWindow__.set('morph', {
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

  errorWindowOk.addEvent('click', function(_evt) {
    var evt = new Event(_evt);
    __errorWindow__.tween('opacity', 0);
  });

  // add expand action
  errorWindowExpandWrapper.addEvent('click', function(_evt) {
    var evt = new Event(_evt);

    if(!__errorWindowMinimized__)
    {
      errorWindowExpand.removeClass('SSErrorWindowExpandOpen');
      errorWindowExpandLabel.set('text', 'view shift details');
      errorWindowShiftStatusScroll.addClass('SSDisplayNone');
    }
    else
    {
      errorWindowExpand.addClass('SSErrorWindowExpandOpen');
      errorWindowExpandLabel.set('text', 'hide shift details');
    }

    if(__errorWindowMinimized__)
    {
      __errorWindow__.morph({
        width: 340,
        height: 300
      });
    }
    else
    {
      __errorWindow__.morph({
        width: 280,
        height: 100
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
  __errorWindow__.getElement('.SSErrorWindowTitle').set('text', title);
  __errorWindow__.getElement('.SSErrorWindowMessage').set('text', message);
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
        content: unescape(shift.content)
      });

    });
  }
  else
  {
    fixButton.addClass('SSDisplayNone');
  }

  __errorWindow__.setOpacity(0);
  __errorWindow__.removeClass('SSDisplayNone');
  __errorWindow__.tween('opacity',0.95);
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
      content: unescape(theShift.content)
    };
  }

  for(var prop in shiftContent)
  {
    var newPair = __errorWindowShiftPropertyModel__.clone(true);
    var tds = newPair.getElements('td');

    tds[0].set('text', prop);
    tds[1].set('text', shiftContent[prop]);

    newPair.injectInside(statusTable);
  }
}

// End ../client/ErrorWindow.js -----------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('ErrorWindow');

// === END PACKAGE [ErrorHandling] ===


// === START PACKAGE [Internationalization] ===

if(__sysavail__) __sysavail__.packages.push("Internationalization");

if (SSInclude != undefined) SSLog('Including ../client/LocalizedStringsSupport.js...', SSInclude);

// Start ../client/LocalizedStringsSupport.js ---------------------------------

// ==Builder==
// @required
// @name              LocalizedStringsSupport
// @package           Internationalization
// ==/Builder==

var __sslang__ = null;
function SSLoadLocalizedStrings(lang, ctxt)
{
  var context = ctxt || window;
  //SSLog('load localized strings ' + lang);
  SSLoadFile("client/LocalizedStrings/"+lang+".json", function(rx) {
    SSLog(')))))))))))))))))))))))))))))))))))))))))))');
    SSLog(lang + " - " + __sslang__);
    if(lang != __sslang__)
    {
      SSLog('Evaluating language file');
      ShiftSpace.localizedStrings = JSON.decode(rx.responseText);
      //SSLog(ShiftSpace.localizedStrings);

      // update objects
      ShiftSpace.Objects.each(function(object, objectId) {
        if(object.localizationChanged) object.localizationChanged();
      });

      // in case we get a raw context from FF3
      if(!context.$$)
      {
        context = new Window(context);
      }

      // update markup
      //SSLog('fix localized');
      context.$$(".SSLocalized").each(function(node) {

        var originalText = node.getProperty('title');

        if(node.get('tag') == 'input' && node.getProperty('type') == 'button')
        {
          node.setProperty('value', SSLocalizedString(originalText));
        }
        else
        {
          node.set('text', SSLocalizedString(originalText));
        }

      }.bind(this));
    }

    __sslang__ = lang;
  });
}

// End ../client/LocalizedStringsSupport.js -----------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('LocalizedStringsSupport');

// === END PACKAGE [Internationalization] ===


// === START PACKAGE [EventHandling] ===

if(__sysavail__) __sysavail__.packages.push("EventHandling");

if (SSInclude != undefined) SSLog('Including ../client/CoreEvents.js...', SSInclude);

// Start ../client/CoreEvents.js ----------------------------------------------

// ==Builder==
// @option
// @name	            CoreEvents
// @package           EventHandling
// ==/Builder==

// Set up event handlers, these should not be tied into core
window.addEvent('keydown', SSKeyDownHandler.bind(this));
window.addEvent('keyup', SSKeyUpHandler.bind(this));
window.addEvent('keypress', SSKeyPressHandler.bind(this));
window.addEvent('mousemove', SSMouseMoveHandler.bind(this));

// Used by keyboard handlers to maintain state information
var __keyState__ = {};

/*
  Function: SSKeyDownHandler
    Handles keydown events.

  Parameters:
    _event - generated by the Browser.
*/
function SSKeyDownHandler(_event) 
{
  var event = new Event(_event);
  var now = new Date();

  //SSLog('keyDownHandler');

  // Try to prevent accidental shift+space activation by requiring a 500ms
  //   lull since the last keypress
  if (__keyState__.keyDownTime &&
      now.getTime() - __keyState__.keyDownTime < 500)
  {
    __keyState__.keyDownTime = now.getTime();
    return false;
  }

  if (event.code != 16)
  {
    // Remember when last non-shift keypress occurred
    __keyState__.keyDownTime = now.getTime();
  }
  else if (!__keyState__.shiftPressed)
  {
    // Remember that shift is down
    __keyState__.shiftPressed = true;
    // Show the menu if the user is signed in
    if (ShiftSpace.ShiftMenu)
    {
      __keyState__.shiftMenuShown = true;
      ShiftSpace.ShiftMenu.show(__keyState__.x, __keyState__.y);
    }
  }

  // If shift is down and any key other than space is pressed,
  // then definately shiftspace should not be invocated
  // unless shift is let go and pressed again
  if (__keyState__.shiftPressed &&
    event.key != 'space' &&
    event.code != 16)
  {
    __keyState__.ignoreSubsequentSpaces = true;

    if (__keyState__.shiftMenuShown)
    {
      __keyState__.shiftMenuShown = false;
      ShiftSpace.ShiftMenu.hide();
    }
  }

  // Check for shift + space keyboard press
  if (!__keyState__.ignoreSubsequentSpaces &&
    event.key == 'space' &&
    event.shift)
  {
    //SSLog('space pressed');
    // Make sure a keypress event doesn't fire
    __keyState__.cancelKeyPress = true;

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
    if (__keyState__.consoleShown)
    {
      __keyState__.consoleShown = false;
      //SSLog('hide console!');
      if(ShiftSpace.Console) ShiftSpace.Console.hide();
    }
    else
    {
      // Check to see if there's a newer release available
      // There's probably a better place to put this call.
      if (SSCheckForUpdates()) {
        return;
      }
      //SSLog('show console!');
      __keyState__.consoleShown = true;
      if(ShiftSpace.Console) ShiftSpace.Console.show();
    }

  }
};


/*
  Function: SSKeyDownHandler
    Handles keyup events.
    
  Parameters:
    _event - generated by the Browser.
*/
function SSKeyUpHandler(_event) 
{
  var event = new Event(_event);
  // If the user is letting go of the shift key, hide the menu and reset
  if (event.code == 16) 
  {
    __keyState__.shiftPressed = false;
    __keyState__.ignoreSubsequentSpaces = false;
    ShiftSpace.ShiftMenu.hide();
  }
}


/*
  Function: SSKeyPressHandler
    Handles keypress events.

  Parameters:
    _event - generated by the browser.
*/
function SSKeyPressHandler(_event)
{
  var event = new Event(_event);
  
  // Cancel if a keydown already picked up the shift + space
  if (__keyState__.cancelKeyPress) 
  {
    __keyState__.cancelKeyPress = false;
    event.stopPropagation();
    event.preventDefault();
  }
}

/*
  Function: SSMouseMoveHandler
    Handles mouse events.
    
  Parameters:
    _event - generated by the browser.
*/
function SSMouseMoveHandler(_event) 
{
  var event = new Event(_event);
  __keyState__.x = event.page.x;
  __keyState__.y = event.page.y;

  if (event.shift) 
  {
    ShiftSpace.ShiftMenu.show(__keyState__.x, __keyState__.y);
  } 
  else if (ShiftSpace.ShiftMenu) 
  {
    ShiftSpace.ShiftMenu.hide();
  }
}

// End ../client/CoreEvents.js ------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('CoreEvents');

// === END PACKAGE [EventHandling] ===


// === START PACKAGE [UtilitiesExtras] ===

if(__sysavail__) __sysavail__.packages.push("UtilitiesExtras");

if (SSInclude != undefined) SSLog('Including ../client/FullScreen.js...', SSInclude);

// Start ../client/FullScreen.js ----------------------------------------------

// ==Builder==
// @optional
// @name              FullScreen
// @package           UtilitiesExtras
// @dependencies      ShiftSpaceElement
// ==/Builder==

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

  if(ShiftSpace.Console)
  {
    __shiftSpaceState__.set('consoleVisible', ShiftSpace.Console.isVisible());
  }
  __shiftSpaceState__.set('focusedShiftId', SSFocusedShiftId());

  // go through each space and close it down, and sleep it
  if(ShiftSpace.Console) ShiftSpace.Console.hide();

  // hide the spaces
  for(var space in spaces)
  {
    var theSpace = SSSpaceForName(space);
    theSpace.saveState();

    if(theSpace.isVisible())
    {
      theSpace.hide();
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

  // restore ShiftSpace
  if(ShiftSpace.Console && __shiftSpaceState__.get('consoleVisible'))
  {
    ShiftSpace.Console.show();
  }
  if(__shiftSpaceState__.get('focusedShiftId'))
  {
    SSFocusShift(__shiftSpaceState__.get('focusedShiftId'));
  }

  // restore the spaces
  for(var space in spaces)
  {
    SSSpaceForName(space).restoreState();
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

var __modalDiv__;
var __modalDelegate__;
function SSCreateModalDiv()
{
  __modalDiv__ = new ShiftSpace.Element('div', {
    id: "SSModalDiv"
  });
  
  __modalDiv__.addEvent('click', function(_evt) {
    var evt = new Event(_evt);
    // TODO: deal with modal delegates here - David
  });
}


function SSEnterModal(delegate)
{
  // add the modal div to the dom
  __modalDiv__.injectInside(document.body);
  
  if(delegate)
  {
    __modalDelegate__ = delegate;
  }
}


function SSExitModal()
{
  // remove the modal div from the dom
  __modalDiv__.remove();
  __modalDelegate__ = null;
}


// End ../client/FullScreen.js ------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('FullScreen');

if (SSInclude != undefined) SSLog('Including ../client/IframeHelpers.js...', SSInclude);

// Start ../client/IframeHelpers.js -------------------------------------------

// ==Builder==
// @optional
// @name              IframeHelpers
// @package           UtilitiesExtras
// @dependences       Element
// ==/Builder==

// ==========================
// = Iframe Cover Functions =
// ==========================

// Used to cover iframes so that resize and drag operations don't get borked
var __iframeCovers__ = [];

/*
  Function: SSCheckForPageIframes
    Check for already existing iframes on the page and add covers to them.
*/
function SSCheckForPageIframes()
{
  $$('iframe').filter(SSIsNotSSElement).each(function(aFrame) {
    SSAddCover({cover:SSCreateCover(), frame:aFrame});
  });
}

/*
  Function: SSCreateCover
    Create a cover.  Should probably be refactored.
    
  Returns:
    a DOM node.
*/
function SSCreateCover()
{
  var cover = new ShiftSpace.Element('div', {
    'class': "SSIframeCover"
  });
  cover.setStyle('display', 'none');
  cover.injectInside(document.body);
  return cover;
}

/*
  Function: SSAddCover
    Add a iframe cover object to an internal array.
*/
function SSAddCover(newCover)
{
  // create covers if we haven't already
  __iframeCovers__.push(newCover);
}

/*
  Function: SSAddIframeCovers
    Add the iframe covers to the page.
*/
function SSAddIframeCovers() 
{
  __iframeCovers__.each(function(aCover) {
    aCover.cover.setStyle('display', 'block');
  });
}

/*
  Function: SSUpdateIframeCovers
    Update the position of the iframe covers.
*/
function SSUpdateIframeCovers() 
{
  __iframeCovers__.each(function(aCover) {
    var pos = aCover.frame.getPosition();
    var size = aCover.frame.getSize();
    aCover.cover.setStyles({
      left: pos.x,
      top: pos.y,
      width: size.x+3,
      height: size.y+3
    });
  });
}

/*
  Function: SSRemoveIframeCovers
    Remove the covers for the iframe.
*/
function SSRemoveIframeCovers() 
{
  __iframeCovers__.each(function(aCover) {
    aCover.cover.setStyle('display', 'none');
  });
}

// End ../client/IframeHelpers.js ---------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('IframeHelpers');

// === END PACKAGE [UtilitiesExtras] ===


// === START PACKAGE [Core] ===

if(__sysavail__) __sysavail__.packages.push("Core");

if (SSInclude != undefined) SSLog('Including ../client/core/UserFunctions.js...', SSInclude);

// Start ../client/core/UserFunctions.js --------------------------------------

// ==Builder==
// @optional
// @name              UserFunctions
// @package           Core
// ==/Builder==

// Private variable and function for controlling user authentication
var username = false;

function setUsername(_username) {
  username = _username;
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

// End ../client/core/UserFunctions.js ----------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('UserFunctions');

if (SSInclude != undefined) SSLog('Including ../client/core/UtilityFunctions.js...', SSInclude);

// Start ../client/core/UtilityFunctions.js -----------------------------------

// ==Builder==
// @optional
// @name              UtilityFunctions
// @package           Core
// ==/Builder==

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
function SSInfo(spaceName) 
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

var __dragDiv__;
function SSCreateDragDiv()
{
  __dragDiv__ = new ShiftSpace.Element('div', {
    id: 'SSDragDiv'
  });
}

function SSAddDragDiv()
{
  $(document.body).grab(__dragDiv__);
}

function SSRemoveDragDiv()
{
  __dragDiv__ = __dragDiv__.dispose();
}

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

function SSHasResource(resourceName)
{
  return __sysavail__.files.contains(resourceName) || __sysavail__.packages.contains(resourceName);
}

function SSResourceExists(resourceName)
{
  return __sys__.files[resourceName] != null || __sys__.packages[resourceName] != null;
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

function SSResetCore()
{
  // reset all internal state
  __spaces__ = {};
}

// End ../client/core/UtilityFunctions.js -------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('UtilityFunctions');

if (SSInclude != undefined) SSLog('Including ../client/core/ShiftFunctions.js...', SSInclude);

// Start ../client/core/ShiftFunctions.js -------------------------------------

// ==Builder==
// @optional
// @name              ShiftFunctions
// @package           Core
// ==/Builder==

var shifts = {};
var __focusedShiftId__ = null; // Holds the id of the currently focused shift
var __defaultShiftStatus__ = 1;

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

      // FIXME: make into onShowShift hook - David
      if(SSHasResource('RecentlyViewedHelpers'))
      {
        SSAddRecentlyViewedShift(shiftId);
      }

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
  Function: SSAllShifts
    Returns the private shifts variable.
    
  Returns:
    The internal hash table of all currently loaed shifts.
*/
function SSAllShifts()
{
  return shifts;
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
  Function: SSIsNewShift
    Used to check whether a shift is newly created and unsaved.

  Parameters:
    shiftId - a shift id.
*/
function SSIsNewShift(shiftId)
{
  return (shiftId.search('newShift') != -1);
}

// End ../client/core/ShiftFunctions.js ---------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('ShiftFunctions');

if (SSInclude != undefined) SSLog('Including ../client/core/PersistenceFunctions.js...', SSInclude);

// Start ../client/core/PersistenceFunctions.js -------------------------------

// ==Builder==
// @optional
// @name              PersistenceFunctions
// @package           Core
// ==/Builder==

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

// End ../client/core/PersistenceFunctions.js ---------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('PersistenceFunctions');

if (SSInclude != undefined) SSLog('Including ../client/core/RemoteFunctions.js...', SSInclude);

// Start ../client/core/RemoteFunctions.js ------------------------------------

// ==Builder==
// @optional
// @name              RemoteFunctions
// @package           Core
// ==/Builder==

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
  Function: SSXmlHttpRequest
    Private version of GM_xmlHttpRequest. Implemented for public use via Space/Shift.xmlhttpRequest.

  Parameters:
    config - same JSON object as used by GM_xmlhttpRequest.
*/
function SSXmlHttpRequest(config) 
{
  GM_xmlhttpRequest(config);
}


// End ../client/core/RemoteFunctions.js --------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('RemoteFunctions');

if (SSInclude != undefined) SSLog('Including ../client/core/PluginFunctions.js...', SSInclude);

// Start ../client/core/PluginFunctions.js ------------------------------------

// ==Builder==
// @optional
// @name              PluginFunctions
// @package           Core
// ==/Builder==

var plugins = {};

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


// End ../client/core/PluginFunctions.js --------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('PluginFunctions');

if (SSInclude != undefined) SSLog('Including ../client/core/SpaceFunctions.js...', SSInclude);

// Start ../client/core/SpaceFunctions.js -------------------------------------

// ==Builder==
// @optional
// @name              SpaceFunctions
// @package           Core
// ==/Builder==

var __spaces__ = {};
var __focusedSpace__ = null;

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
  Function: SSpaceForName
    Returns the space associated with a particular name.
    
  Parameters:
    space - the name of the space.
    
  Returns:
    The space instance.
*/
function SSSpaceForName(name)
{
  var space = __spaces__[name];
  return space;
}

/*
  Function: SSSetSpaceForName
    Set the space instance for a name.
    
  Parameters:
    space - a space instance.
    name - the name of the space.
    
  Returns:
    nothing
*/
function SSSetSpaceForName(space, name)
{
  __spaces__[name] = space;
}

/*
  Function: SSRemoveSpace
    Removes a space from the interal instances hash.
    
  Parameters:
    name - the name of the space to remove.
    
  Return:
    nothing.
*/
function SSRemoveSpace(name)
{
  delete __spaces__[name];
}

/*
  Function:
    Returns the number of installed spaces.
    
  Returns:
    An int.
*/
function SSSpacesCount()
{
  var length;
  for(var space in __spaces__) length++;
  return length;
}

function SSAllSpaces()
{
  return __spaces__;
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


function SSGetInfoForInstalledSpace(spaceName, callback)
{
  // fetch data for the space
}

// End ../client/core/SpaceFunctions.js ---------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SpaceFunctions');

// === END PACKAGE [Core] ===

    
    /*

    Function: initialize
    Sets up external components and loads installed spaces.

    */
    this.initialize = function() {
      // paths to required ShiftSpace files
      

if (SSInclude != undefined) SSLog('Including ../client/core/PostInitDeclarations.js...', SSInclude);

// Start ../client/core/PostInitDeclarations.js -------------------------------

// ==Builder==
// @optional
// @name              PostInitDeclarations
// ==/Builder==

if(typeof ShiftSpace == 'undefined') ShiftSpace = {};

// new additions for Sandalphon
ShiftSpace.UI = {}; // holds all UI class objects
ShiftSpace.Objects = new Hash(); // holds all instantiated UI objects
ShiftSpace.NameTable = new Hash(); // holds all instantiated UI object by CSS id

// TODO: remove this dependency - David
ShiftSpace.ClassPaths = {
  'SSTableViewDatasource': '/client/'
};

// TODO: paths to view controllers, should probably just default unless defined in UserClassPaths - David
ShiftSpace.UIClassPaths = {
  'SSCell': '/client/views/SSCell/',
  'SSEditableTextCell': '/client/views/SSEditableTextCell/',
  'SSTabView': '/client/views/SSTabView/',
  'SSTableView': '/client/views/SSTableView/',
  'SSTableRow': '/client/views/SSTableRow/',
  'SSConsole': '/client/views/SSConsole/'
};

  // path to user defined view controllers
ShiftSpace.UserClassPaths = {
  'SSCustomTableRow': '/client/customViews/SSCustomTableRow/' // TODO: change this to point to the real folder - David
};

// ShiftSpace global var is set by this point not before.
ShiftSpace.info = SSInfo;
// export for third party deveopers
ShiftSpace.Element = SSElement;
ShiftSpace.Iframe = SSIframe;
ShiftSpace.Input = SSInput;

// End ../client/core/PostInitDeclarations.js ---------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('PostInitDeclarations');
      
      // look for install links
      SSCheckForInstallSpaceLinks();
      if(SSLocalizedStringSupport()) SSLoadLocalizedStrings("en");
      SSLog('load localized strings');
      
      // Load external scripts (pre-processing required)


// === START PACKAGE [Pinning] ===

if(__sysavail__) __sysavail__.packages.push("Pinning");

if (SSInclude != undefined) SSLog('Including ../client/RangeCoder.js...', SSInclude);

// Start ../client/RangeCoder.js ----------------------------------------------

// ==Builder==
// @optional
// @name              RangeCoder
// @package           Pinning
// ==/Builder==

/*
  Class: RangeCoder
    A convenience class to encode and decode W3C Ranges <-> opaque objects.
*/
var RangeCoder = new Class({
  /*
    Property: toRange
      Takes a reference object and returns a W3C range.  The reference object is
      JavaScript object composed of the following properties ancestorOrigTextContent,
      ancestorPosition, startContainerXPath, startContainerOffset, endContainerXPath,
      endContainerOffset, origText.

    Arguments:
      refObj

    Returns:
      W3C Range.

    Example:
      (start code)
      var userSelection = window.getSelection();
      var myRange = userSelection.getRangeAt(0);
      SSLog(ShiftSpace.RangeCoder.toRef(myRange));
      (end)
  */
  toRange: function(refObj)
  {
    //SSLog('toRange');
    var objAncestor = this.getRangeAncestorNode(refObj);
    //SSLog(objAncestor);

    if (objAncestor)
    {
      //SSLog('generating range');
      return this.generateRange(objAncestor, refObj);
    }

    //SSLog('attempting to recover broken range');
    var recovered = this.recoverBrokenRange(refObj);
    if (recovered)
    {
      //SSLog('recovered the node');
      return recovered;
    }

    // post an alert if we failed
    // TODO: point this at the error window
    alert('Warning: An in-page reference was not recreateable because the webpage has changed. The original referenced text was: ' + refObj.origText);

    // return null
    return null;
  },

  /*
    Property: toRef
      Given a valid W3C Range, extract relevant info and store.

    Arguments:
      range - a W3C Range.

  */
  cleanWhitespace: function(node)
  {
    node.innerHTML = node.innerHTML.replace(new RegExp("\\n","g"));
  },

  toRef: function(range)
  {
    //get the common ancestor
    var objCommonAncestor = range.commonAncestorContainer;
    var origCommonAncestor = false;

    // if the Common Ancestor is text node use the parent node as ancestore since once spliting the text node there will be no ancestor exist for text node
    if(objCommonAncestor.nodeType == 3)
    {
      origCommonAncestor = objCommonAncestor;
      objCommonAncestor = objCommonAncestor.parentNode;
    }

    var colAncestorPosition = this.getAncestorPosition(objCommonAncestor);

    // Create new object for this highlight
    var newRef =
    {
      // XXX: is this orig_html hack still relevant >=0.11 ??
      ancestorOrigTextContent: (objCommonAncestor.tagName.toLowerCase()=="body")?ShiftSpace.orig_html:objCommonAncestor.textContent,   //to avoid adding the toolbarhtml
      ancestorPosition: colAncestorPosition,
      startContainerXPath: this.generateRelativeXPath(objCommonAncestor, range.startContainer),
      startContainerOffset: range.startOffset,
      endContainerXPath: this.generateRelativeXPath(objCommonAncestor, range.endContainer),
      endContainerOffset: range.endOffset,
      origText: range.toString()
    };
    /* newRef.ancestorOrigTextContent = String.clean(newRef.ancestorOrigTextContent); */
    /* newRef.origText = String.clean(newRef.origText); */
    // Save some extra info which might be useful for recovering if load fails
    // TODO: extra data to save that might be helpful:
    //   xpath from root to common ancestor?  find it even if textcontent changes
    //   location as % within DOM / page / source.  useful to disambiguate
    newRef.startText = range.startContainer.textContent;
    newRef.endText = range.endContainer.textContent;
    newRef.startTag = range.startContainer.tagName;
    newRef.endTag = range.endContainer.tagName;

    // save original ancestor text if stored ancestor is not original
    if (newRef.origCommonAncestor)
    {
      newRef.origAncestorOrigTextContent =  (origCommonAncestor.tagName.toLowerCase()=="body")?ShiftSpace.orig_html:origCommonAncestor.textContent;   //to avoid adding the toolbarhtml
    }

    return newRef;
  },

  //returns the count of nodes that are similar to the ancestor, the index of the ancestor in this array, and the ancestore tagname
  getAncestorPosition: function(oNode)
  {
    //get the array of items with the same tag name
    var iLength,iIndex;
    var nl = document.getElementsByTagName(oNode.tagName);
    var iOccurance=0;

    for (var i=0;i<nl.length;i++)
    {
      if(nl.item(i).textContent==oNode.textContent)
      {
        iOccurance++;
        //check if this is the same Node than set the index
        if(nl.item(i)==oNode)
        iIndex = iOccurance;
      }
    }

    return {
      tagName: oNode.tagName,
      length: iOccurance,
      ancIndex: iIndex
    };
  },

  generateRelativeXPath: function(contextNode, textNode)
  {
    var saveTextNode = textNode;

    for (i = 0; textNode; )
    {
      if (textNode.nodeType == 3)
      i++;

      textNode = textNode.previousSibling;
    }

    var xpath = '/text()[' + i + ']';
    textNode = saveTextNode.parentNode;

    while (textNode != contextNode &&
           textNode != null)
    {
      var i;
      saveTextNode = textNode;

      for (i = 0; textNode; )
      {
        if (textNode.nodeType == 1)
        i++;

        textNode = textNode.previousSibling;
      }

      xpath = '/*[' + i + ']' + xpath;
      textNode = saveTextNode.parentNode;
    }

    return '.' + xpath;
  },

  // Generates a proper W3C range from some xpath elements and other
  // bits of data
  generateRange: function(ancestor, refObj)
  {
    var startContainer = document.evaluate( refObj.startContainerXPath,
                                            ancestor,
                                            null,
                                            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                                            null).snapshotItem(0);

    var endContainer = document.evaluate( refObj.endContainerXPath,
                                          ancestor,
                                          null,
                                          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                                          null).snapshotItem(0);

    var range = document.createRange();
    range.setStart(startContainer, refObj.startContainerOffset);
    range.setEnd(endContainer, refObj.endContainerOffset);

    return range;
  },


  getRangeAncestorNode: function(refObj)
  {
    //SSLog('getRangeAncestorNode');
    var returnAncestor;
    var colAncestorPosition   = refObj.ancestorPosition;

    //get all the elements with the ancestor tagname
    var nl                    = document.getElementsByTagName(colAncestorPosition.tagName);
    var iIndex                = colAncestorPosition.ancIndex;
    var iOccuranceLength      = 0;
    var targetTextContent     = refObj.ancestorOrigTextContent;

    //SSLog('blar');
    //check if the tag Name is the body then compare differently
    if (colAncestorPosition.tagName.toLowerCase() == "body")
    {
      //return (targetTextContent==ShiftSpace.orig_text_content)?document.getElementsByTagName('body')[0]:null;
      return document.body;
    }
    else
    {
      //check the number of occurances of the similar nodes
      //SSLog('checking similar nodes ' + nl.length);
      for (var i=0;i<nl.length;i++)
      {
        //SSLog(i);
        if(nl.item(i).textContent==targetTextContent)
        {
          iOccuranceLength++;
          //if this is the occurance index mark the node as the ancestor node
          if (iIndex==iOccuranceLength)
          returnAncestor = nl.item(i);
        }
      }
      //SSLog('exit loop');
    }

    //validate that the page has the same number of occurances to make sure we highlight the right one
    if (iOccuranceLength == colAncestorPosition.length)
    {
      //SSLog('returning ancestor');
      return returnAncestor;
    }
    else
    {
      //SSLog('returning null');
      return null;
    }
  },

  // simple count of non-overlapping instances of substring within string
  countSubStrings: function(substring, string)
  {
    var offset = 0;
    var count = 0;
    
    var idx = string.indexOf(substring, offset);

    //SSLog('countSubStrings idx ' + idx);
    // check for empty strings
    if(substring != '')
    {
      while (idx >= 0)
      {
        count++;
        offset = idx + substring.length;

        idx = string.indexOf(substring, offset);
        //SSLog('string:' + string + ' substring:' + substring + ' offset:' + offset + ' idx:' + idx);
      }
    }
    
    //SSLog('exit countSubStrings');
    
    return count;
  },


  // Count string matches within a node, or within its children if it has them.
  // Counting criteria matches the criteria used when matching range endpoints:
  // We only count matches which are intact within a child (ignore if substring
  // is broken by non-text DOM elements).
  // Don't count if it doesn't have children.  Justification: text node refs
  // are always saved relative to parent, and our recovery method only supports
  // text.  Therefore we are only interested in children.
  countStringMatchesInNodeList: function(nl, text)
  {
    var count = 0;
    for (var i = 0; i < nl.length; i++)
    {
      var element = nl.item(i);
      if (element.hasChildNodes() && 0 <= element.textContent.indexOf(text))
      {
        for (var j = 0; j < element.childNodes.length; j++)
        // make sure that text isn't an empty string
        if(text != '')
        {
          count += this.countSubStrings(text, element.childNodes[j].textContent);
        }
      }
    }
    return count;
  },

  // Given a string, make it as short as possible while keeping it
  // unique within the content of a nodelist
  shortenUniqueString: function(nl, text, shortenFromEnd)
  {
    // TODO: improve efficiency, split-the-difference rather than shrink-by-one
    var bestText = text;
    var textCount = this.countStringMatchesInNodeList(nl, bestText);
    while (text.length > 4 && textCount <= 1)
    {
      bestText = text;
      text = shortenFromEnd ? text.substring(0,text.length-2) : text = text.substring(1);
      textCount = this.countStringMatchesInNodeList(nl, text);
    }
    return bestText;
  },

  /*
   * Given pre- and post-text, find corresponding point within a list of DOM elements.
   *
   * Strategy: first minimize pre/posttext to smallest possible unique string.
   * if unique pre or posttext, match pre-then-post.  Else give up.
   */
   DOMPointerFromContext: function(nl, pretext, posttext)
   {
     //SSLog('DOMPointerFromContext');
     // XXX don't use if empty/small
     //if (pretext.length < 5)
     //SSLog("WARNING, pretext is too short");

     pretext = this.shortenUniqueString(nl, pretext, false);
     var pretextCount = this.countStringMatchesInNodeList(nl, pretext);
     var pretextUnique = (pretextCount == 1) ? true : false;
     posttext = this.shortenUniqueString(nl, posttext, true);
     var posttextCount = this.countStringMatchesInNodeList(nl, posttext);

     // TODO: could minimize even further, pre and post don't need to be unique as long as there is
     // a unique pre-post match.  This yields an even greater chance of matching both within
     // single children (eg not broken by other shifts)
     // SSLog("pretext '" + pretext + "' posttext '" + posttext + "'");

     //check the number of occurances of the similar nodes
     //SSLog('nl.length = ' + nl.length);
     for (var i = 0; i < nl.length; i++)
     {
       if(0 <= nl.item(i).textContent.indexOf(pretext))
       {
         if (nl.item(i).hasChildNodes())
         {
           var children = nl.item(i).childNodes;
           for (var j = 0; j < children.length; j++)
           {
             var idxOf =  children[j].textContent.indexOf(pretext);
             if (idxOf >= 0)
             {
               // if unique or not unique but posttext matches, we've found it
               var postIdx = children[j].textContent.substring(idxOf + pretext.length).indexOf(posttext);
               if (pretextUnique || postIdx == 0)
               return { obj: children[j], offset: idxOf + pretext.length };
             }
           }
         }
       }
     }

     // Check for posttext
     // XXX: this isn't sorted out yet... should only run if pretext is missing, short, useless
     // perhaps merged with above.  this might not even run currently.
     /*
     for (var i=0;i<nl.length;i++)
     {
       if(0 <= nl.item(i).textContent.indexOf(posttext))
       {
         var element = nl.item(i);
         if (element.hasChildNodes())
         {
           var children = element.childNodes;
           for (var j = 0; j < children.length; j++)
           {
             var idxOf =  children[j].textContent.indexOf(posttext);
             if (idxOf >= 0) return { obj: children[j], offset: idxOf};
           }
         }
       }
     }
     */
     return null;
   },

  // Given some data, attempt to return reference to corresponding point in DOM
  DOMPointerFromData: function(nl, text, offset, containerXPath, orig)
  {
    //SSLog('DOMPointerFromData');
    // Handling legacy shifts (without sufficient info to always match text)
    // if the xpath is to the first text element, then we can treat parent text
    // to calculate text contect.  Empirically this is [1].
    if (text || containerXPath == "./text()[1]")
    {
      var pretext = orig.substring(0,offset);
      var posttext = orig.substring(offset);

      if (text)
      {
        pretext = text.substring(0,offset);
        posttext = text.substring(offset);
      }

      return this.DOMPointerFromContext(nl, pretext, posttext);
    }
    return null;
  },


  // Given a range, attempt to reconstruct it by examining the original context
  recoverBrokenRange: function(refObj)
  {
    //SSLog('Attempting to recover the broken range.');
    try
    {
      var colAncestorPosition   = refObj.ancestorPosition;
      //get all the elements with the ancestor tagname
      var nl                    = document.getElementsByTagName(colAncestorPosition.tagName);

      // Get pointers to range start and end withing DOM
      var startRv =  this.DOMPointerFromData (nl, refObj.startText, refObj.startContainerOffset, refObj.startContainerXPath, refObj.ancestorOrigTextContent);
      
      // TODO: optimize if end == start
      var endRv =  this.DOMPointerFromData (nl, refObj.endText, refObj.endContainerOffset, refObj.endContainerXPath, refObj.ancestorOrigTextContent);

      var noPartialRange = true;
      if (noPartialRange)
      {
        // Return range only if we matched both endpoints
        if (startRv && endRv)
        {
          var range = document.createRange();
          range.setStart(startRv.obj, startRv.offset);
          range.setEnd(endRv.obj, endRv.offset);
          return range;
        }
      }
      else
      {
        // Return range.  If we only matched one endpoint,
        // return an empty range at that point.
        if (startRv || endRv)
        {
          var range = document.createRange();

          if (startRv)
          {
            range.setStart(startRv.obj, startRv.offset);
          }
          else
          {
            range.setStart(endRv.obj, endRv.offset);
          }

          if (endRv)
          {
            range.setEnd(endRv.obj, endRv.offset);
          }
          else
          {
            range.setEnd(startRv.obj, startRv.offset);
          }

          return range;
        }
      }
    }
    catch(err)
    {
      // Commonly caused by invalid offset when creating range
      //SSLog ("ERROR recovering range");
    }

    return null;
  }
});
ShiftSpace.RangeCoder = new RangeCoder();


// End ../client/RangeCoder.js ------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('RangeCoder');

if (SSInclude != undefined) SSLog('Including ../client/Pin.js...', SSInclude);

// Start ../client/Pin.js -----------------------------------------------------

// ==Builder==
// @optional  
// @name              Pin
// @package           Pinning
// ==/Builder==

/*
  Class: Pin
    Convenience class for targeting nodes on a page. You can access the functionality via
    the singleton instance ShiftSpace.Pin.  It is often desirable for a shift to target a specifc node on a page
    rather than being absolute positioned.  In the case of Notes a user might want to attach that note to a specific
    node.  This is because the layout of a page is dependant on the width of the user's browser window.  In the case
    of center aligned content a note will not be in proper relation to what the shift author intended.  Pinning solves this
    issue.  In the case of ImageSwap pinning provides an high level mechanism for targeting images.  SourceShift presents
    the most complete use of the Pinning API.  SourceShift users can place arbitrary HTML before, after, relative to, or replace
    entirely any HTML element on the page.
    
    If you space requires such complex targeting it is recommended that you include a PinWidget in your interface rather than
    using the API directly.
    
  See Also:
    <PinWidget>
*/
var Pin = new Class({
  /*
    Property: toRef
      Takes a node and an action and returns a reference JSON which can be used
      to target this node later.
    
    Arguments:
      aNode - A DOM reference.
      action - a string, valid values are 'before', 'after,' 'replace', and 'relative'.
      
    Returns:
      A pin reference object.
  */
  toRef : function(aNode, action)
  {
    // find the first ancestor with an id
    var ancestor = null;
    var curNode = $(aNode);
    while(curNode != null &&
          curNode != document &&
          ancestor == null)
    {
      if(curNode.getProperty('id'))
      {
        ancestor = curNode;
      }
      else
      {
        curNode = $(curNode.getParent());
      }
    }
    
    // generate relative xpath if the ancestor and node are not the same
    var xpath = null;
    if(ancestor != aNode)
    {
      xpath = this.generateRelativeXPath(ancestor, aNode);
    }
    
    return {
      ancestorId : (ancestor && ancestor.getProperty('id')) || null,
      relativeXPath : xpath,
      action: action
    };
  },
  
  generateRelativeXPath : function(ancestor, aNode)
  {
    var xpath = '';
    while (aNode != ancestor && 
           aNode != document) 
    {
      var curNode = aNode;
      for (i = 0; curNode; )
      {
        if (curNode.nodeType == 1) i++;
        curNode = curNode.previousSibling;
      }

      xpath = '/*[' + i + ']' + xpath;
      aNode = aNode.parentNode;
    }

    return '.' + xpath;
  },
  
  /*
    Property: toNode
      Takes a pin reference JSON object and returns the targeted DOM node.
      
    Arguments:
      pinRef - a pin reference JSON object.
  */
  toNode : function(pinRef)
  {
    if(!pinRef || (pinRef.ancestorId && !pinRef.relativeXPath))
    {
      return null;
    }
    
    if(!pinRef.relativeXPath)
    {
      return $(pinRef.ancestorId);
    }
    else
    {
      var ancestor = (pinRef.ancestorId && $(pinRef.ancestorId)) || document;
      return $(document.evaluate( pinRef.relativeXPath, 
                                  ancestor, 
                                  null,
                                  XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, 
                                  null).snapshotItem(0));
    }
  },
  
  /*
    Property: isValidRef
      Checks to see if the pinRef object actually points to a real node.
      
    Returns:
      a boolean.
  */
  isValidRef: function(pinRef)
  {
    if(!pinRef || (!pinRef.ancestorId && !pinRef.relativeXPath)) return false;
    var node = ShiftSpace.Pin.toNode(pinRef)
    return (node != null);
  }
});
ShiftSpace.Pin = new Pin();

// End ../client/Pin.js -------------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('Pin');

if (SSInclude != undefined) SSLog('Including ../client/PinHelpers.js...', SSInclude);

// Start ../client/PinHelpers.js ----------------------------------------------

// ==Builder==
// @optional          
// @name              PinHelpers
// @package           Pinning
// @dependencies      Pin
// ==/Builder==

// ===================
// = Pin API Support =
// ===================

// An array of allocated Pin Widgets
var __pinWidgets__ = [];
// Exceptions
var __SSPinOpException__ = "__SSPinOpException__";
// for holding the current pin selection
var __currentPinSelection__ = null;

/*
  Function: SSCreatePinSelect
    Create the visible pin selection interface bits.
*/
function SSCreatePinSelect() 
{
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

/*
  Function: SSPinMouseOverHandler
    A mouse over handler for pin events.
    
  Parameters:
    _evt - a DOM event.
*/
function SSPinMouseOverHandler (_evt) 
{
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

/*
  Function: SSPinMouseMoveHandler
    The pin handler that checks for mouse movement.
    
  Parameters:
    _evt - a window DOM event.
*/
function SSPinMouseMoveHandler(_evt) 
{
  if(ShiftSpace.PinSelect.getParent())
  {
    ShiftSpace.PinSelect.remove();
  }
}

/*
  Function: SSPinMouseClickHandler
    A pin handler.
    
  Parameters:
    _evt - a window event page.
*/
function SSPinMouseClickHandler(_evt) 
{
  var evt = new Event(_evt);
  evt.stop();
  if(__currentPinWidget__)
  {
    if(ShiftSpace.PinSelect.getParent()) ShiftSpace.PinSelect.remove();
    SSRemovePinEvents();
    __currentPinWidget__.userPinnedElement(__currentPinSelection__);
  }
}

/*
  Function: SSCheckPinReferences
    Check to see if there is a conflicting pin reference on the page already.
    
  Parameters:
    pinRef - a pin reference object.
*/
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
/*
  Function: SSPinElement
    Pin an element to the page.
    
  Parameters:
    element - a DOM node.
    pinRef - a pin reference object.
*/
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

/*
  Function: SSUnpinElement
    Unpin an element from the page.
    
  Parameters:
    pinRef - a pin reference object.
*/
function SSUnpinElement(pinRef) 
{
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
    Attaches the mouse events to the window to handle Pin selection.
*/
function SSAttachPinEvents() 
{
  window.addEvent('mouseover', SSPinMouseOverHandler);
  window.addEvent('click', SSPinMouseClickHandler);
  ShiftSpace.PinSelect.addEvent('mousemove', SSPinMouseMoveHandler);
}

/*
  Function: SSRemovePinEvents
    Remove all pin selection listening events from the window.
*/
function SSRemovePinEvents() 
{
  window.removeEvent('mouseover', SSPinMouseOverHandler);
  window.removeEvent('click', SSPinMouseClickHandler);
  ShiftSpace.PinSelect.removeEvent('mousemove', SSPinMouseMoveHandler);
}

// hold the current active pin widget
var __currentPinWidget__ = null;
/*
  Function: SSStartPinSelection
    Start pin selection mode.
    
  Parameters:
    widget - the PinWidget object that started the pin selection operation.
*/
function SSStartPinSelection(widget) 
{
  __currentPinWidget__ = widget;
  // show the selection interface
  SSAttachPinEvents();
}

/*
  Function: SSStopPinSelection
    Stop handling pin selection.
*/
function SSStopPinSelection() 
{
  __currentPinWidget__ = null;
  if(ShiftSpace.PinSelect.getParent()) ShiftSpace.PinSelect.remove();
  SSRemovePinEvents();
}

// End ../client/PinHelpers.js ------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('PinHelpers');

if (SSInclude != undefined) SSLog('Including ../client/PinWidget.js...', SSInclude);

// Start ../client/PinWidget.js -----------------------------------------------

// ==Builder==
// @optional         
// @name              PinWidget
// @package           Pinning
// @dependencies      PinHelpers, ShiftSpaceElement
// ==/Builder==

/*
  Class: PinWidget
    A widget class that you can include on shift or space to allow for pinning functionality.  You should make use of this class if your shifts require complex targeting of HTML elements on the page.  If you space requires being embedded the HTML document or replacing an element HTML element in the document, PinWidget is designed for you.  You do not interact with the PinWidget directly.  You simply implement the delegate protocol defined by this class and everything happens automatically.
    The PinWidget class assumes that your delegate object has the following properties as methods.

    getPinRef - returns the pin reference object associated with the delegate.
    getPinWidgetButton() - returns a DOM node. This should be the DOM node where you want the PinWidget button to live.  For an example, examine the source for the Notes space.
    getPinWidgetAllowedActions() - returns an array of desired actions: before, after, replace, relative.
    onPin() - a pinEvent handler.

  Example:
    (start code)
    build: function()
    {
      // ... some interface building code ..

      var pinWidgetDiv = new ShiftSpace.Element('div', {
        'class':'MyShiftPinWidgetDiv'
      });

      this.pinWidget = new PinWidget(this);
    },

    getPinWidgetButton: function()
    {
      return this.pinWidgetDiv;
    },

    getPinWidgetButtonAllowedActions: function()
    {
      return ['before', 'after', 'replace];
    },

    onPin: function(pinRef)
    {
      if(pinRef.action == 'unpin')
      {
        this.unpin();
      }
      else
      {
        this.pin(this.element, pinRef);
      }
    }
    (end)
*/
var PinWidget = new Class({

  protocol: ['getPinRef', 'getPinWidgetButton', 'getPinWidgetAllowedActions', 'onPin', 'isPinned'],

  /*
    Function: initialize
      Takes an element that will represents the pin widget button and a callback
      function.  The callback will be made when the user has pinned a node on the
      page.  The element should be an appropriate tag with the the dimensions
      19px x 19px.

    Parameters:
      delegate - the delegate of this PinWidget.  Normally this either a <ShiftSpace.Space> instance or a <ShiftSpace.Shift> instance.  In either case the delegate should implement all of the methods defined in the PinWidget delegate protocol defined above.
  */
  initialize: function(delegate)
  {
    this.delegate = delegate;

    var message = SSImplementsProtocol(this.protocol, delegate);
    if(!message.result)
    {
      console.error('Error: delegate does not implement PinWidget protocol. Missing ' + message.missing.join(', ') + '.');
    }

    this.element = delegate.getPinWidgetButton();

    // check to see if the delegate has the required properties
    /*
    if(!followsProtocol(delegate, protocol))
    {
      // throw an exception, bail
      return;
    }
    */

    this.isPinned = false;

    // inser the pin widget into the element
    this.element.addClass('SSPinWidget');
    this.menuIsVisible = false;

    // create an image and stick in it there
    this.iconImg = new ShiftSpace.Element('img', {
      'class': 'normal',
      'src': server + 'images/ShiftMenu/blank.png'
    });
    this.iconImg.injectInside(this.element);

    this.createMenu();
    this.setMenuItems();

    this.element.addEvent('click', this.toggleSelection.bind(this));

    // check to see if the delegate is already pinned
    this.delegate.addEvent('pin', this.delegateWasPinned.bind(this));
    this.delegate.addEvent('unpin', this.delegateWasUnpinned.bind(this));

    __pinWidgets__.push(this);
  },

  /*
    Function: delegateWasPinned (private)
      Called when the delegate fires a pin event.
  */
  delegateWasPinned: function()
  {
    var pinRef = this.delegate.getPinRef();
    var targetNode = ShiftSpace.Pin.toNode(pinRef);

    if(targetNode != this.getPinnedElement())
    {
      this.setPinnedElement(targetNode);
      this.isPinned = true;
      this.updateMenu(pinRef.action);
      this.refresh();
    }
  },

  /*
    Function: delegateWasUnpinned (private)
      Called when the delegate fires a unpin event.
  */
  delegateWasUnpinned: function()
  {
    this.setPinnedElement(null);
    this.isPinned = false;
    this.refresh();
  },

  capitalize: function(str)
  {
    return str.charAt(0).toUpperCase()+str.substr(1, str.length-1);
  },

  /*
    Function: createMenu (private)
      Creates the pinning selection menu.
  */
  createMenu: function()
  {
    this.menu = new ShiftSpace.Element('div', {
      'class': "SSPinMenu"
    });

    // build the menu

    // the top item
    this.menuTopItem = new ShiftSpace.Element('div', {
      'class': "SSPinMenuTopItem item"
    });
    this.menuTopItem.set('html', "<div class='SSLeft'><div class='radio off'></div><span></span></div><div class='SSRight'></div>");
    this.menuTopItem.injectInside(this.menu);

    // don't add this one, we'll clone it
    this.menuItem = new ShiftSpace.Element('div', {
      'class': "SSPinMenuItem item"
    });
    this.menuItem.set('html', "<div class='SSLeft'><div class='radio off'></div><span></span></div><div class='SSRight'></div>");

    // add the bottom items, always unpin
    this.menuBottomItem = new ShiftSpace.Element('div', {
      'class': "SSPinMenuBottomItem item"
    });
    this.menuBottomItem.set('html', "<div class='SSLeft'><div class='radio off'></div><span>Unpin</span></div><div class='SSRight'></div>");
    this.menuBottomItem.injectInside(this.menu);

    // hide the menu
    this.menu.setStyle('display', 'none');

    // add menu to the parent note of the delegate's pin widget button
    this.menu.injectInside(this.element.getParent());

    this.menu.addEvent('click', this.userSelectedPinAction.bind(this));
  },

  /*
    Function: setMenuItems (private)
      Sets the pin widgets menu items based on the allowed actions specified by the delegate.
  */
  setMenuItems: function()
  {
    var actions = this.delegate.getPinWidgetAllowedActions();

    // first make sure the menu is big enough
    var menuItemsToAdd = actions.length - 1;
    for(var i = 0; i < menuItemsToAdd; i++)
    {
      this.menuItem.clone(true).injectBefore(this.menuBottomItem);
    }

    // set the first menu item
    this.menuTopItem.addClass(actions[0]);
    this.menuTopItem.getElement('span').set('text', actions[0].capitalize());

    // add the rest
    for(i = 0; i < this.menu.getElements('.SSPinMenuItem').length; i++)
    {
      var item = this.menu.getElements('.SSPinMenuItem')[i];
      item.addClass(actions[i+1]);
      item.getElement('span').set('text', actions[i+1].capitalize());
    }

    // set the last item
    this.menuBottomItem.addClass('unpin');
    this.menuBottomItem.getElement('span').set('text', 'Unpin');
  },

  /*
    Function: updateMenu (private)
      Refresh the pin selection menu.
  */
  updateMenu: function(action)
  {
    var target = this.menu.getElement('.'+action);

    // turn off any of the other ones
    target.getParent().getElements('.radio').removeClass('on');
    target.getParent().getElements('.radio').addClass('off');

    // turn on the toggle
    if(action != 'unpin')
    {
      target.getElement('.radio').removeClass('off');
      target.getElement('.radio').addClass('on');
    }
  },

  /*
    Function: toggleSelection (private)
      Toggles the pin selection mode. There are three, a) node selection mode, b) menu selection mode, c) pinned mode.

    Parameters:
      _evt - a DOM event.
  */
  toggleSelection: function(_evt)
  {
    var evt = new Event(_evt);
    evt.stopPropagation();

    // check to see if the element is alread pinned
    if(this.isPinned)
    {
      if(this.menu.getStyle('display') == 'none')
      {
        this.showMenu();
      }
      else
      {
        this.hideMenu();
      }
    }
    else
    {
      // check to see if we are in selecting mode
      if(!this.isSelecting)
      {
        this.isSelecting = true;

        // start selecting
        this.iconImg.addClass('select');
        SSStartPinSelection(this);
      }
      else
      {
        this.isSelecting = false;

        // stop selecting
        this.iconImg.removeClass('select');
        SSStopPinSelection();
      }
    }
  },

  /*
    Function: showMenu (private)
      Shows the pin selection options menu.

    Parameters:
      _evt - a DOM event.
  */
  showMenu: function(_evt)
  {
    var position = this.element.getPosition();
    var size = this.element.getSize();

    this.element.addClass('SSPinWidgetMenuOpen');

    this.menu.setStyles({
      left: this.element.offsetLeft - 12,
      top: this.element.offsetTop + size.y - 3,
      display: 'block'
    });

    // check for pin reference
    if(this.delegate.getPinRef() && this.delegate.isPinned())
    {
      this.updateMenu(this.delegate.getPinRef().action);
    }
  },

  /*
    Function: hideMenu (private)
      Hides the pin selectin option menu.

    Parameters:
      _evt - a DOM event.
  */
  hideMenu: function(_evt)
  {
    this.element.removeClass('SSPinWidgetActive');
    this.element.removeClass('SSPinWidgetMenuOpen');
    this.menu.setStyle('display', 'none');

    // remove styles
    this.iconImg.removeClass('select');
    this.element.removeClass('SSPinWidgetMenuOpen');
    this.setPinnedElement(null);
  },

  /*
    Function: userPinnedElement (private)
      User pinned the element.  This should never be called directly, ShiftSpace Core handles this.  Implicity show the pin selection option menu.

    Parameters:
      element - a DOM node.
  */
  userPinnedElement: function(element)
  {
    this.setPinnedElement(element);
    this.showMenu();
  },

  /*
    Function: setPinnedElement (private)
      Sets an internal reference to a pinned element.

    Parameters:
      element - a DOM node.
  */
  setPinnedElement: function(element)
  {
    // user selected node
    this.isSelecting = false;
    this.pinnedElement = element;
  },

  /*
    Function: getPinnedElement (private)
      Returns the pinned element. You should not call this directly.

    Parameters:
      element - a DOM node.
  */
  getPinnedElement: function(element)
  {
    return this.pinnedElement;
  },

  /*
    Function: userSelectedPinAction (private)
      Event handler that called when the user selects an option from the pin selection option menu.

    Parameters:
      _evt - a DOM event.
  */
  userSelectedPinAction: function(_evt)
  {
    var evt = new Event(_evt);
    var target = $(evt.target);

    while(!target.hasClass('item'))
    {
      target = target.getParent();
    }

    var action = null;

    if(target.hasClass('before'))
    {
      action = 'before';
    }
    if(target.hasClass('replace'))
    {
      action = 'replace';
    }
    if(target.hasClass('after'))
    {
      action = 'after';
    }
    if(target.hasClass('relative'))
    {
      action = 'relative';
    }
    if(target.hasClass('unpin'))
    {
      action = 'unpin';
    }

    // store this for menu display
    this.pinAction = action;

    // check to see if the pinned element has changed since last time
    var elementChanged = (this.lastPinned != this.pinnedElement);
    this.lastPinned = this.pinnedElement;

    // update the menu
    this.updateMenu(action);

    // this could probably be a little cleaner
    if(target.hasClass('unpin'))
    {
      this.delegate.onPin({action: 'unpin'});

      this.iconImg.removeClass('pinned');
      this.isPinned = false;
    }
    else
    {
      this.iconImg.removeClass('select');
      this.iconImg.addClass('pinned');

      // if the element didn't change use the old pin ref
      // and just change the action
      if(!elementChanged)
      {
        this.pinRef.action = action;
      }
      else
      {
        this.pinRef = ShiftSpace.Pin.toRef(this.pinnedElement, action);
      }

      // store the shift element that is pinned
      this.delegate.onPin(this.pinRef);

      this.iconImg.addClass('pinned');
      this.isPinned = true;
    }

    // hide the menu
    this.hideMenu();
  },

  /*
    Function: refresh (private)
      Called the refresh the appearance of the pin widget.
  */
  refresh: function()
  {
    if(!this.getPinnedElement())
    {
      this.menu.setStyle('display', 'none');
      this.iconImg.removeClass('select');
      this.iconImg.removeClass('pinned');
    }
    else
    {
      this.iconImg.removeClass('select');
      this.iconImg.addClass('pinned');
    }

    if(!this.menu.getStyle('display') == 'none')
    {
      // update the menu spot
    }
  }
});

ShiftSpace.PinWidget = PinWidget;

// End ../client/PinWidget.js -------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('PinWidget');

// === END PACKAGE [Pinning] ===


// === START PACKAGE [ShiftSpaceCore] ===

if(__sysavail__) __sysavail__.packages.push("ShiftSpaceCore");

if (SSInclude != undefined) SSLog('Including ../client/SSTableViewDatasource.js...', SSInclude);

// Start ../client/SSTableViewDatasource.js -----------------------------------

// ==Builder==
// @optional
// @name              SSTableViewDatasource
// @package           ShiftSpaceCore
// ==/Builder==

/*
  Class: SSTableViewDatasource
    Properties passed to the data providing url should send a json object with the following structure

    (start code)
    {
      ids: '*',
      users: ['mushon', 'dphiffer'],
      hrefs: '*',
      created: '*',
      summary: '*'
    }
    (end)
*/
var SSTableViewDatasource = new Class({

  Implements: [Events, Options],


  defaults:
  {
    data: [],
    dataKey: null,
    dataUpdateKey: null,
    dataProviderURL: null,
    dataUpdateURL: null,
    dataNormalizer: null,
    requiredProperties: []
  },


  initialize: function(options)
  {
    SSLog('SSTableViewDatasource instantiated.');
    this.setOptions(this.defaults, options);

    // set the options
    this.setProperties($H());
    this.setRequiredProperties(this.options.requiredProperties);
    this.setUpdateProperties({});

    this.setData(this.options.data);

    this.setDataKey(this.options.dataKey);
    this.setDataUpdateKey(this.options.dataUpdateKey);

    this.setDataProviderURL(this.options.dataProviderURL);
    this.setDataUpdateURL(this.options.dataUpdateURL);

    this.setDataNormalizer(this.options.dataNormalizer);
  },


  setData: function(newData)
  {
    this.__data__ = newData;
  },


  data: function()
  {
    return this.__data__;
  },


  hasData: function()
  {
    return (this.data() && this.data.length > 0);
  },


  setDataKey: function(key)
  {
    this.__dataKey__ = key;
  },


  dataKey: function()
  {
    return this.__dataKey__;
  },


  setDataUpdateKey: function(key)
  {
    this.__dataUpdateKey__ = key;
  },


  dataUpdateKey: function()
  {
    return this.__dataUpdateKey__;
  },


  updateRowColumn: function(rowIndex, columnName, value)
  {
    SSLog('SSTableViewDatasource updateRowColumn');
    // make an update call to the data source
    if(this.dataUpdateURL())
    {
      SSLog('we have an update url ' + rowIndex + ", " + columnName + " : " + value);

      var params = {};
      var updateKey = this.dataUpdateKey();

      params[updateKey] = this.data()[rowIndex][updateKey];
      params[columnName] = value;

      SSLog(params);

      // make an update request
      // FIXME: need to update this to do something else - David
      new Request({
        url: this.dataUpdateURL(),
        data: params,
        method: 'post',
        onComplete: function(responseText, responseXML)
        {
          // update the local copy of the data
          this.data()[rowIndex][columnName] = value;
          this.fireEvent('SSTabViewDatasourceDataUpdate', this);
        }.bind(this),
        onFailure: function()
        {
          console.error('SSTableViewDatasource update attempt failed');
        }
      }).send();
    }
  },


  setDataNormalizer: function(normalizer)
  {
    if(normalizer && normalizer.normalize)
    {
      this.__dataNormalizer__ = normalizer;
    }
  },


  dataNormalizer: function()
  {
    return this.__dataNormalizer__;
  },


  setDataProviderURL: function(url)
  {
    this.__url__ = url;
  },


  dataProviderURL: function()
  {
    return this.__url__;
  },


  setDataUpdateURL: function(url)
  {
    this.__dataUpdateURL__ = url;
  },


  dataUpdateURL: function()
  {
    return this.__dataUpdateURL__;
  },


  setProperty: function(key, value)
  {
    // set the property
    this.properties().set(key, value);
    // refetch data
    this.fetch();
  },


  setProperties: function(_props)
  {
    var props = (!_props && $H()) || (_props instanceof Hash && _props) || $H(_props);
    this.__properties__ = props;
  },


  properties: function()
  {
    return this.__properties__;
  },


  setRequiredProperties: function(properties)
  {
    this.__requiredProperties__ = properties;
  },


  requiredProperties: function()
  {
    return this.__requiredProperties__;
  },


  setUpdateProperties: function(properties)
  {
    this.__updateProperties__ = properties;
  },


  updateProperties: function()
  {
    return this.__updateProperties__;
  },


  rowCount: function()
  {
    return (this.data() && this.data().length) || 0;
  },


  rowForIndex: function(rowIndex)
  {
    return this.data()[rowIndex];
  },


  itemForRowIndexColumn: function(rowIndex, column)
  {
    return this.data()[rowIndex][column];
  },


  sortByColumn: function(column, direction)
  {
    SSLog('sort by column ' + column + ', direction ' + direction);
    this.fetch({
      sortByColumn: column,
      sortByDirection: direction
    });
  },


  isMissingProperties: function(properties)
  {
    // check for missing properties
    var missingProperties = [];
    if(this.requiredProperties().length > 0)
    {
      missingProperties = this.requiredProperties().filter(function(required) {
        return (properties.get(required) == null);
      });
    }

    return (missingProperties.length > 0);
  },


  valueForRowColumn: function(rowIndex, columnName)
  {
    return this.data()[rowIndex][columnName];
  },


  updateData: function(data)
  {
    if(this.dataNormalizer())
    {
      data = this.dataNormalizer().normalize(data);
    }

    this.setData(data);
  },


  fetch: function(_properties)
  {
    SSLog('data source fetch');

    // make sure the properties are a Hash
    var properties = (!_properties && $H()) || (_properties instanceof Hash && _properties) || $H(_properties);
    // combine them with the existing properties, careful not to modify this.properties()
    var allProperties = $H(this.properties().getClean()).combine(properties);
    var isMissingProperties = this.isMissingProperties(allProperties);
    
    // check for missing properties
    if( !isMissingProperties && this.dataProviderURL())
    {
      SSLog('>>>>>>>>>>>>>>>>>>>>>>>>>> SSTableViewDatasource fetch');
      // if actually running in ShiftSpace
      SSServerCall(this.dataProviderURL(), allProperties.getClean(), function(json) {
        SSLog('>>>>>>>>>>>>>>>>>>>>>>>>>> SSTableViewDatasource fetch RETURNED');
        this.updateData(json[this.dataKey()]);
        this.fireEvent('onload');
      }.bind(this));
    }
    else
    {
      // if we're missing properties empty out data
      if(isMissingProperties)
      {
        this.setData([]);
      }

      this.fireEvent('onload');
    }
  }

});

SSTableViewDatasource.DESCENDING = 0;
SSTableViewDatasource.ASCENDING = 1;


// End ../client/SSTableViewDatasource.js -------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSTableViewDatasource');

if (SSInclude != undefined) SSLog('Including ../client/Shift.js...', SSInclude);

// Start ../client/Shift.js ---------------------------------------------------

// ==Builder==
// @required
// @name              Shift
// @package           ShiftSpaceCore
// ==/Builder==

/*
  Class: ShiftSpace.Shift
    The base class for shifts.  Shifts can essentially be thought of as documents.  If you consider things from the MVC perspective
    the Shift is the View, the Space is the Controller.  When the model is modified via the interface you present in your shift
    (or space), in order for these changes to take, you will need to call the save method at key points.  This will sync
    the state of the shift with to the ShiftSpace database.  The design of the the Shift class is meant to be as declarative as possible.
    The key functions such as show, edit, hide, save, setup should not be called directly by you.  You simply implement the behavior
    you want when ShiftSpace calls these methods based on user interaction with the shift menu and the shift console.
*/
ShiftSpace.Shift = new Class({
  
  name: 'ShiftSpace.Shift',
  
  Implements: [Events, Options],

  getDefaults: function()
  {
    return {};
  },

  /*
    Function : initialize (private)
      Takes a json object and creates the shift.

    Parameter :
      _json - The JSON object that contains the properties the shift will have.
  */
  initialize: function(_json)
  {
    SSLog('====================================================== STARTING UP');
    this.setOptions(this.getDefaults(), _json);

    // private id var
    var id = _json.id;
    // private parent shift var
    var parentSpace;

    // rename options to json
    this.defaults = this.options;

    // the above probably should privatized against people accidentally using the options property

    // These two functions prevent spoofing an id
    // The id can be set only at shift instantiation
    // and Shiftspace checks if id number is available
    // or whether or not it is already in use and if it
    // isn't it use, the json object must be equal to the
    // one in Shiftspace.
    // perhaps ID block should be part of a user session?

    /* ------------------- Private Getters/Setters ------------------- */
    this.setId = function( aId ) {
      if( id == null || id.substr(0, 8) == 'newShift')
      {
        id = aId;
      }
    };

    /*
      Function: getId
        Return the private id variable.

      Returns:
        the id (string).
    */
    this.getId = function() {
      return id;
    };

    /*
      Function: setParentSpace (private)
        Sets the private parent space var.  You should not call this directly.
    */
    this.setParentSpace = function(_parentSpace) {
      if( parentSpace == null )
      {
        parentSpace = _parentSpace;
      }
    };

    /*
      Function: getParentSpace
        Returns the parent space instance. Useful when a shift needs to communicate the space object, which
        of course should be rare.
    */
    this.getParentSpace = function() {
      return parentSpace;
    };
    /* ------------------- End Private Getters/Setters ----------------- */

    // set the id & parent space
    if( _json.id )
    {
      this.setId( _json.id );
    }
    if( this.options.parentSpace )
    {
      this.setParentSpace( this.options.parentSpace );
    }

    this.setTitle(_json.summary || '');

    SSLog('======================================== CALLING SETUP ' + this.getParentSpace().attributes.name);

    // call setup
    this.setup(_json);

    // TODO: should pin if it's possible to pin - David

    return this;
  },

  /*
    Function: setup (abstract)
      To implemented by the subclass.  All initialization of your Shift instance should happen here.

    Parameters:
      json - an Object whose properties should be loaded by the instance.  This object contains a "location" property which is the mouse location.

    Example:
      (start code)
      setup: function(json)
      {
        this.build();
        this.attachEvents();

        var mainView = this.getMainView();
        if(json.position)
        {
          mainView.setStyles({
            left: json.position.x,
            top: json.position.y
          });
        }

        if(json.title)
        {
          this.setTitle(json.title);
        }
      }
      (end)
  */
  setup: function(json)
  {
  },

  /*
    Function: isNewShift
      Returns whether this shift is newly created or not.

    Returns:
      A boolean.
  */
  isNewShift: function()
  {
    return SSIsNewShift(this.getId());
  },

  /*
    Function: setFocusRegions
      Takes a variable list of DOM element that will trigger this
      shift to fire an onFocus event.
  */
  setFocusRegions : function()
  {
    var args = new Array(arguments);

    for( var i = 0; i < arguments.length; i++ )
    {
      var aRegion = arguments[i];
      aRegion.addEvent('mousedown', function() {
        this.focus();
      }.bind(this));
    }
  },

  /*
    Function: edit
      The shift should present it's editing interface.  Puts the shift into editing mode.  Be sure to call this.parent()
      if you override this method.
  */
  edit: function() 
  {
    this.setIsBeingEdited(true);
  },

  /*
    Function : save
      Fires the onUpdate event for anyone who is listening. Passes a ref to this object as
      the event parameter.
  */
  save : function()
  {
    // We can use events here because if we do
    // a Shift cannot save in their initialize method
    this.getParentSpace().updateShift( this );
    this.fireEvent('onShiftSave', this.getId());
  },

  markDirty: function()
  {
    this.dirty = true;
  },

  /*
    Function: refresh (abstact)
      You should always provide some kind of refresh function
      so that your shift can correct itself for resize operations,
      window size changes, showing, hiding, etc.
  */
  refresh : function() {},

  /*
    Function: encode (abstract)
      To be implemented by the subclass. This method should return an object whose the properties
      accurately represent the state of this shift.  When shift is instantiated this same object
      will be passed to the new instance so that you may restore the state of the shift.

    Returns:
      A object whose properties represent the current state of the shift instance.

    Example:
      (start code)
      encode: function()
      {
        return {
          name: "John Smith",
          address: "1 Park Ave"
        };
      }
      (end)
  */
  encode : function()
  {
    return {};
  },

  /*
    Function : canShow
      A function which determines whether the shift can be shown.

    Returns :
      A boolean.
  */
  canShow : function()
  {
    return true;
  },

  /*
    Function : canHide
      A function which determines whether the shift can be hidden.

    Returns :
      A boolean.
  */
  canHide : function()
  {
    return true;
  },

  /*
    Function : destroy
      Destroys the shift.  This will remove the shift's main view from the DOM as well as erase
      the shift from the ShiftSpace DB.
  */
  destroy : function()
  {
    if(this.getMainView() && this.getMainView().getParent())
    {
      this.getMainView().dispose();
    }

    this.fireEvent('onShiftDestroy', this.getId());
  },

  _show: function()
  {

  },

  /*
    Function : show
      Make the shift visible.  If you want to add custom behavior by overriding this method sure to add a call to this.parent() as the first line in your new method.
  */
  show : function()
  {
    this.setIsVisible(true);
    var mainView = this.getMainView();

    if( mainView )
    {
      mainView.removeClass('SSDisplayNone');
    }

    this.refresh();
    this.fireEvent('onShiftShow', this.getId());
  },

  _hide : function()
  {

  },

  /*
    Function : hide
      Hide the shift.  If you want to add custom behavior by overriding this method be sure to call this.parent() as the first line in your new method.
  */
  hide : function(el)
  {
    this.setIsVisible(false);
    var mainView = this.getMainView();

    if( mainView )
    {
      mainView.addClass('SSDisplayNone');
    }

    this.fireEvent('onShiftHide', this.getId());
  },

  /*
    Function : manageElement
      Sets the main view of the shift.  This lets ShiftSpace now what the main display
      element of your Shift is.  This is required for proper display ordering.

    Parameters:
      el - A ShiftSpace.Element
  */
  manageElement : function( el )
  {
    if( el )
    {
      this.mainView = el;
      this.mainView.addEvent('mousedown', function() {
        this.focus();
      }.bind(this));
    }
    else
    {
      console.error('Error: Attempt to set mainView to null.');
    }
  },

  /*
    Function : focus
      Tell ShiftSpace we want to focus this shift.
  */
  focus : function() 
  {
    this.fireEvent('onShiftFocus', this.getId() );
  },

  /*
    Function: onFocus
      Do any updating of the shift's interface for focus events here.
  */
  onFocus: function() {},

  /*
    Function: unfocus
      Tell ShiftSpace we want to blur this shift.
  */
  blur : function() 
  {
    this.setIsBeingEdited(false);
    this.fireEvent('onShiftBlur', this.getId() );
  },

  /*
    Function: onBlur
      Do any updating of the shift's interface here.
  */
  onBlur: function() {},

  /*
    Function: getMainView
      Returns the main view of the shift.  Without this ShiftSpace cannot order the shift.

    Returns:
      <ShiftSpace.Element>
  */
  getMainView : function()
  {
    return this.mainView;
  },

  /*
    Function: mainViewIsVisible
      Returns whether the main view of the shift is visible or not.

    Returns:
      boolean
  */
  mainViewIsVisible : function()
  {
    // TODO: change for 1.2 - David
    return ( this.mainView.getStyle('display') != 'none' );
  },

  /*
    Function: setIsVisible (private)
     Set the internal private flag tracking whether this shift is visible or not.  You should not call this directly.

    Parameters:
      val - a boolean.
  */
  setIsVisible: function(val)
  {
    this.__isVisible__ = val;
  },

  /*
    Function: isVisible
      Returns whether this shift is visible or not.

    Returns:
      A boolean.
  */
  isVisible: function()
  {
    return  this.__isVisible__;
  },

  /*
    Function: setIsBeingEdited (private)
      Sets the internal flag that tracks whether the shift is currently being edited or not.

    Parameters:
      val - a boolean.
  */
  setIsBeingEdited: function(val)
  {
    this.__isBeingEdited__ = val;
  },

  /*
    Function: isBeingEdited
      Returns whether this shift is currently being edited or not.

    Returns:
      A boolean.
  */
  isBeingEdited: function(val)
  {
    return this.__isBeingEdited__;
  },

  getRegion : function()
  {
    var pos = this.getMainView().getPos();
    var size = this.getMainView().getSize().size;

    return {
      left : pos.x,
      right : pos.x + size.x,
      top : pos.y,
      bottom : pos.y + size.y
    };
  },

  /*
    Function: pin
      Pins an element of the shift to a node on the page.

    Parameters:
      element - the Element to be pinned.
      pinRef - A pinRef JSON object created by <Pin>

    See Also:
      <Pin>,
      <PinWidget>

    Example:
      (start code)
      this.pin($('cssId), ShiftSpace.Pin.toRef($('someOtherCSSId')));
      (end)
  */
  pin : function(element, pinRef)
  {
    // get the target
    var pinTarget = ShiftSpace.Pin.toNode(pinRef);

    if(pinTarget)
    {
      // valid pin ref
      this.setPinRef(pinRef);

      // store some styles from the pin target, if action is replace
      switch(pinRef.action)
      {
        case 'replace':
          // we want the width, height and flow of the original if replace
          var targetStyles = pinTarget.getStyles('width', 'height', 'float');
          this.setPinTargetStyles(targetStyles);
          element.setStyles(targetStyles);
        break;

        case 'relative':
        break;

        default:
        break;
      }

      // store the size before pinning
      this.setPinElementDimensions(element.getSize().size);

      // this is already pinned need to unpin first
      if(this.getPinElement())
      {
        // clears everything
        this.unpin();
      }

      this.setPinTarget(pinTarget);
      this.setPinElement(element);

      // call ShiftSpace Pin API to pin this element
      pinRef.shift = this;
      SSPinElement(element, pinRef);
    }
    else
    {
      // Should throw an Exception ? - David
    }

    // fire a pin event
    this.fireEvent('pin', this);
  },

  /*
    Function: unPin
      Unpins an element of this shift from a element on the page.

    See Also:
      <Pin>,
      <PinWidget>
  */
  unpin : function()
  {
    // check to make sure there is an pinned element to restore
    if(this.getPinElement())
    {
      SSUnpinElement(this.getPinRef());

      // clear out these vars
      this.setPinTarget(null);
      this.setPinElement(null);
    }

    this.fireEvent('unpin', this);
  },

  /*
    Function: setPinElement (private)
      Set the element of the shift that will actually be pinned.

    Parameters:
      newEl - The element of the shift that will be pinned.
  */
  setPinElement: function(newEl)
  {
    this.pinElement = newEl;
  },

  /*
    Function: getPinElement (private)
      Returns the current element that is pinned.  This will return
      null if the shift is not currently pinned.

    Returns:
      A DOM node.
  */
  getPinElement: function()
  {
    return this.pinElement;
  },

  /*
    Function: setPinRef
      Set the current pinRef object. This is normally called automatically
      you should rarely if ever call this directly.

    Parameters:
      pinRef - Set the current pinRef object.
  */
  setPinRef : function(pinRef)
  {
    this.pinRef = pinRef;
  },

  /*
    Function: getPinRef
      Returns the set pinRef object (created by <Pin>) if this shift has one.
  */
  getPinRef : function()
  {
    return this.pinRef;
  },

  /*
    Function: getEncodablePinRef
      This returns a version of the pin reference object that is encodable.  This is necessary
      because we store dom node references in the pin reference and these should not
      get encoded on Shift save. Used to remove circular references that will break Json.toString().

    Returns:
      And encodable Object representation of the pin reference object.

    Example:
      (start code)
      encode: function()
      {
        return {
          title: this.getTitle(),
          color: this.getColor(),
          position: this.element.getPosition(),
          pinRef: this.getEncodablePinRef(this.getPinRef())
        };
      }
      (end)
  */
  getEncodablePinRef: function()
  {
    var pinRef = this.getPinRef();
    var temp = {};

    // don't attempt to encode element, targetElement, or wrapper properties
    for(var key in pinRef)
    {
      if(!['element','targetElement', 'wrapper', 'shift', 'originalStyles', 'targetStyles'].contains(key))
      {
        temp[key] = pinRef[key];
      }

      if(key == 'offset' && pinRef.action == 'relative')
      {
        // we need to get the latest offset
        temp['offset'] = {x: pinRef.element.offsetLeft, y: pinRef.element.offsetTop};
      }
    }

    return temp;
  },

  /*
    Function: setPinTarget (private)
      Sets the pin target.  This is the element on the page that has been targeted
      by the user.

    Parameters:
      pinTarget - A DOM node.
  */
  setPinTarget: function(pinTarget)
  {
    this.pinTarget = pinTarget;
  },

  /*
    Function: getPinTarget (private)
      Returns the current pin target if there is one.
  */
  getPinTarget: function()
  {
    return this.pinTarget;
  },

  /*
    Function: setPinTargetStyles
      When replacing a target node or being inserted before or after it is important
      to pick up some of the CSS dimensions of that target node.  In the case of replacing
      these styles need to be saved before the node is replaced and removed from the
      page DOM.

    Parameters:
      newStyles - A JSON object of saved CSS dimension styles.
  */
  setPinTargetStyles : function(newStyles)
  {
    this.targetStyles = newStyles;
  },

  /*
    Function: getPinTargetStyles
      Returns the JSON object of the target nodes CSS dimension styles.

    Returns:
      An Object.
  */
  getPinTargetStyles : function()
  {
    return this.targetStyles;
  },

  setPinElementStyles : function(newStyles)
  {
    this.pinElementStyles = newStyles;
  },

  getPinElementStyles: function()
  {
    return this.pinElementStyles;
  },

  setPinElementDimensions: function(size)
  {
    this.pinElementDimensions = size;
  },

  getPinElementDimensions: function(size)
  {
    return this.pinElementDimensions;
  },

  /*
    Function: isPinned
      Returns true if this shift is currently pinned.

    Returns:
      A boolean.
  */
  isPinned : function()
  {
    return (this.getPinTarget() != null);
  },

  /*
    Function: updateTitle
      Update the title of the shift. Implictly saves the shift.

    Parameters:
      newTitle - a new title (string).
  */
  updateTitle: function(newTitle)
  {
    if(newTitle && newTitle != this.getTitle())
    {
      this.setTitle(newTitle);
      this.save();
    }
  },

  /*
    Function: setTitle
      Used to set the current title of the shift.

    Parameters:
      newTitle - a new title (string).
  */
  setTitle : function(newTitle)
  {
    this.__title__ = newTitle;
  },

  /*
    Function: getTitle
      Returns the title of the shift.

    Returns:
      A string.
  */
  getTitle: function()
  {
    return (this.__title__ || this.defaultTitle());
  },

  /*
    Function: defaultTitle (abstract)
      To be implemented by subclasses.  Returns "Untitled" otherwise.

    Returns:
      A String.
  */
  defaultTitle: function()
  {
    return "Untitled";
  },

  /*
    Function: getAuthor
      Returns the display name of the user that authored this shift.

    See Also:
      <SSGetAuthorForShift>
  */
  getAuthor: function()
  {
    return SSGetAuthorForShift(this.getId());
  },

  /*
    Function : build (abstract)
      To be implemented by the subclass. Build the DOM for the shift.
  */
  build : function()
  {
  },

  /*
  */
  failedView: function()
  {
    // TODO: Show the failed view, if this shift can't be shown
  },

  errorView: function(err)
  {

  },

  /*
    Function: xmlhttpRequest
      Safe version of GM_xmlhttpRequest for shifts.

    Parameters:
      config - the same type of object that should be passed to GM_xmlhttpRequest.

    See Also:
      <SSXmlHttpRequest>
  */
  xmlhttpRequest: function(config)
  {
    SSXmlHttpRequest.safeCall(config);
  }
});


// End ../client/Shift.js -----------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('Shift');

if (SSInclude != undefined) SSLog('Including ../client/Space.js...', SSInclude);

// Start ../client/Space.js ---------------------------------------------------

// ==Builder==
// @required
// @name              Space
// @package           ShiftSpaceCore
// ==/Builder==

/*
  Class: ShiftSpace.Space
    The base class for spaces.  A Space is essentially an extension to the ShiftSpace architecture.  You can think of ShiftSpace
    as a kind of simple operating system and windowing interface.  ShiftSpace doesn't actually know much about individual spaces.
    A Space is a kind of document controller, the documents being the shifts it manages. Some spaces need a cross document interface,
    such as SourceShift, while others, such as Notes, present only the interface provided by the document itself.  The API for
    spaces can handle both types.  Refer to the source code of Notes and SourceShift to see their differences.

    Most of the methods here get called automatically.  For example, you should rarely if ever, call the showShift method directly.
    Users should be in control of whether a shift is visible or not.  In general the user of ShiftSpace is in control of the experience
    not the developer.  To get a better understanding of this please refer to the ShiftSpace tutorial.
*/
ShiftSpace.Space = new Class({
  
  name: 'ShiftSpace.Space',
  
  Implements: [Events, Options],

  attributes : {},

  /*
    Function : initialize (private)
      Initialize the space.  Sets internala state variables as well as calls SSRegisterSpace.  Also call the subclass
      setup method.
  */
  initialize: function( shiftClass )
  {
    SSLog('INITIALIZE: ' + this.attributes.name);

    this.shiftClass = shiftClass;

    // set the interface built flag
    this.__interfaceBuilt__ = false;
    this.__state__ = new Hash();

    this.__deferredNewShifts__= [];
    this.__deferredShifts__ = [];
    this.__deferredEdits__ = [];

    // if no css file, we don't need to wait for it to load
    this.setCssLoaded(!this.attributes.css);

    // the shifts array
    this.shifts = {};

    // is visible flag
    this.setIsVisible(false);

    var valid = true;

    if(!this.shiftClass)
    {
      valid = false;
      SSLog('You did not specify a Shift Class for this Space.', SSLogError);
    }

    // Error checking for Developers, probably should just replace with defaults
    if( !this.attributes.name )
    {
      valid = false;
      SSLog(this);
      SSLog('This Space does not define a name attribute.', SSLogError);
    }
    if( !this.attributes.icon )
    {
      valid = false;
      SSLog('Error: This Space does not have an icon.', SSLogError);
    }

    if( valid )
    {
      if(typeof SSRegisterSpace != 'undefined')
      {
        SSLog('REGISTER >');
        SSRegisterSpace( this, this.attributes );
      }
      else
      {
        SSLog('SSRegisterSpace is NOT defined.');
      }
    }
    else
    {
      var name = this.attributes.name || '';
      console.error( 'Error: The  ' + name + ' is not valid and will not be instantiated.' );
    }
    //SSLog('/ / / / SETTING UP');
    this.setup();

    return this;
  },

  /*
    Function: setup (abstract)
      To be implemented by subclasses.
  */
  setup: function() {},

  /*
    Function: interfaceIsBuilt
      Returns whether the interface of the space has been built yet.
  */
  interfaceIsBuilt : function()
  {
    return this.__interfaceBuilt__;
  },

  /*
    Function: setInterfaceIsBuilt (private)
      Set the private interface built flag.

    Parameters:
      val - a boolean.
  */
  setInterfaceIsBuilt : function(val)
  {
    return this.__interfaceBuilt__ = val;
  },

  /*
    Function: onCssLoad (private)
      Callback handler when the space's css file has loaded.  The interface is not built until after this
      function has been called.  Also any shifts that were set to creaetd/shown/edited.
  */
  onCssLoad : function()
  {
    this.setCssLoaded(true);

    if(this.__deferredContent__)
    {
      SSLog('__deferredContent__');

      this.showInterface();
      this.hideInterface();

      // load any deferred shifts
      this.__deferredShifts__.each(function(aShift) {
        if(aShift.id)
        {
          SSShowShift(aShift.id);
        }
        else
        {
          SSShowShift(aShift);
        }
      }.bind(this));

      // edit any deferred shifts
      this.__deferredEdits__.each(function(aShift) {
        SSLog('deferred edit');
        SSEditShift(aShift);
      }.bind(this));

      // load any deferred just created shifts
      this.__deferredNewShifts__.each(function(aShift) {
        SSLog('show deferred new shift');
        this.createShift(aShift);
        SSShowNewShift(aShift.id);
      }.bind(this));
    }
  },

  /*
    Function: addDeferredNew (private)
      Adds a deferred shift was just created.  This happens when a user create a shift
      using the Menu for a space that hasn't loaded yet.

    Parameters:
      shift - shift content Javascript object.
  */
  addDeferredNew: function(shift)
  {
    this.__deferredNewShifts__.push(shift);
    this.__deferredContent__ = true;
  },

  /*
    Function: addDeferredShift (private)
      Adds a deferred shift to be show.  This happens a user attempt to view a shift
      from <Console> for a space that hasn't loaded yet.

    Parameters:
      shiftId - a shift id.
  */
  addDeferredShift: function(shiftId)
  {
    this.__deferredShifts__.push(shiftId);
    this.__deferredContent__ = true;
  },

  /*
    Function: addDeferredEdit (private)
      Adds a deferred shift to be edited.  This happens when a user attempts to edit
      an existing shift from the <Console>.

    Parameters:
      shiftId - a shift id.
  */
  addDeferredEdit: function(shiftId)
  {
    this.__deferredEdits__.push(shiftId);
    this.__deferredContent__ = true;
  },

  /*
    Function: setCssLoaded (private)
      A setter for the internal flag tracking whether the css for this space has loaded yet.
  */
  setCssLoaded: function(val)
  {
    this.__cssLoaded__ = val;
  },

  /*
    Function: cssIsLoaded (private)
  */
  cssIsLoaded: function()
  {
    return this.__cssLoaded__;
  },

  /*
    Function: show (private)
      Show the space. Simple calls Space.showInterface

    See Also:
      Space.showInterface
  */
  show : function()
  {
    this.showInterface();
  },

  /*
    Function: hide
      Hide the space's interface is there is one.

    See Also:
      Space.hideInterface
  */
  hide : function()
  {
    this.hideInterface();

    for(var shift in this.shifts)
    {
      if(this.shifts[shift].isVisible())
      {
        this.shifts[shift].hide();
      }
    }
  },


  sleep: function()
  {
    // keep track of all the visible shifts
  },


  wake: function()
  {
    // restore the previously visible shifts
  },


  /*
    Function: setIsVisible
      Setter for internal flag about whether the Space and/or it's shifts are visible.

    Parameters:
      val - a boolean.
  */
  setIsVisible: function(val)
  {
    this.__isVisible__ = val;
  },


  /*
    Function: isVisible
      Returns value of internal flag about wheter the Space's interface or any of its shifts are visible.

    Returns:
      A boolean.
  */
  isVisible: function()
  {
    var visibleShifts = false;
    for(var shift in this.shifts)
    {
      if(this.shifts[shift].isVisible())
      {
        visibleShifts = true;
        continue;
      }
    }
    return this.__isVisible__ || visibleShifts;
  },

  /*
    Function: showInterface
      Show the space interface.  This can be overriden if necessary but you must remember to call this.parent()
      from your overriding method.

    Parameters:
      position (optional) - the x/y position of the mouse.
  */
  showInterface : function(position)
  {
    if(!this.interfaceIsBuilt() )
    {
      if(this.cssIsLoaded())
      {
        this.buildInterface();
        this.setInterfaceIsBuilt(true);
      }
      else
      {
        this.__deferredContent__ = true;
      }
    }
  },

  /*
    Function: hideInterface
      Hide the interface of the space.  If there are any unsaved shifts they will be destroyed. Can be overriden, remember to call
      this.parent() from your overriding method.
  */
  hideInterface : function()
  {
    // remove any unsaved shifts
    var unsavedShifts = [];

    for(var shift in this.shifts)
    {
      if(shift.search('newShift') != -1)
      {
        unsavedShifts.push(this.shifts[shift]);
        delete this.shifts[shift];
      }
    }

    unsavedShifts.each(function(x) {
      x.destroy();
    });
  },

  /*
    Function: buildInterface (abstract)
      subclass should implement this if they want to present a custom interface.

    Example:
      (start code)
      build: function()
      {
        var this.element = new ShiftSpace.Element('div', {
          'class':'MyCSSClass'
        });
        var this.title = new ShiftSpace.Element('span', {
          'class':'MyCSSSpanClass'
        });
        this.title.setText('MyTitle');
        this.title.injectInside(this.element);

        this.setMainView(this.element);
      }
      (end)
  */
  buildInterface : function() {},

  /*
    Function: getName
      Returns the name of the shift.

    Returns:
      The name of the space as a string.
  */
  getName : function()
  {
    return this.attributes.name;
  },

  /*
    Function: addShift (private)
      Adds a shift to an internal array.  Implicity creates a new instance of a shift based on the
      contents of the passed in Object.

    Parameters:
      Takes a shift JSON object and creates and attaches event handlers.

    Returns:
      The internal shift instance.
  */
  addShift : function( aShift )
  {
    // add a backreference
    aShift.parentSpace = this;

    SSLog('constructing');
    SSLog(this.shiftClass);

    // create the new shift
    try
    {
      var newShift = new this.shiftClass( aShift );
    }
    catch(exc)
    {
      SSLog(SSDescribeException(exc));
    }

    //SSLog('a new shift');
    //SSLog(newShift);

    // listen for shift updates
    newShift.addEvent( 'onUpdate', this.updateShift.bind( this ) );
    // Set up events that console will listen to
    newShift.addEvent( 'onShiftShow', function( shiftId ) {
      this.onShiftShow(shiftId);
      this.fireEvent( 'onShiftShow', shiftId );
    }.bind( this ) );
    newShift.addEvent( 'onShiftHide', function( shiftId ) {
      this.onShiftHide(shiftId);
      this.fireEvent( 'onShiftHide', shiftId );
    }.bind( this ) );
    newShift.addEvent( 'onShiftDestroy', function( shiftId ) {
      this.onShiftDestroy(shiftId);
      this.fireEvent( 'onShiftDestroy', shiftId );
    }.bind( this ) );
    newShift.addEvent( 'onShiftFocus', function( shiftId ) {
      this.onShiftFocus(shiftId);
      this.fireEvent( 'onShiftFocus', shiftId );
    }.bind( this ));
    newShift.addEvent( 'onShiftBlur', function( shiftId ) {
      this.onShiftBlur(shiftId);
      this.fireEvent( 'onShiftBlur', shiftId );
    }.bind( this ));
    newShift.addEvent( 'onShiftSave', function( shiftId ) {
      this.onShiftSave(shiftId);
      this.fireEvent( 'onShiftSave', shiftId );
    }.bind( this ));

    //SSLog('events added');

    this.shifts[newShift.getId()] = newShift;

    //SSLog('exiting');

    return this.shifts[newShift.getId()];
  },

  /*
    Function: allocateNewShift
      Used when it necessary to kick off shift allocation from with in a Space
      and not from the ShiftMenu.  ImageSwap uses this.
  */
  allocateNewShift: function()
  {
    if(typeof SSInitShift != 'undefined') SSInitShift(this.getName(), {});
  },

  /*
    Function : createShift (private)
      Create a new shift.

    Parameters :
      newShiftJson - The JSON for the new shift.

    Returns:
      The new Shift object.
  */
  createShift : function( newShiftJson )
  {
    SSLog('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> createShift');
    if(this.cssIsLoaded())
    {
      this.addShift(newShiftJson);
      SSLog('added shift');
      var _newShift = this.shifts[newShiftJson.id];
      SSLog('fire event');
      this.fireEvent( 'onCreateShift', { 'space' : this, 'shift' : _newShift } );
      SSLog('return new baby');
      return _newShift;
    }
    else
    {
      SSLog('++++++++++++++++++++++++++++ css not loaded');
      // we need to load these when the css is done
      this.addDeferredNew( newShiftJson );
    }

    return null;
  },

  /*
    Function : deleteShift
      Delete a shift from the internal array.  Implicity calls SSDeleteShift which will remove this
      shift from the ShiftSpace DB.

    Parameters :
      shiftId - The id of the shift.
  */
  deleteShift : function( shiftId )
  {
    // destroy the shift
    if (this.shifts[shiftId])
    {
        this.shifts[shiftId].destroy();
        delete this.shifts[shiftId];
    }

    this.fireEvent( 'onDeleteShift', shiftId );
  },
  
  unintern: function(shiftId)
  {
    delete this.shifts[shiftId];
  },
  
  intern: function(shiftId, shift)
  {
    this.shifts[shiftId] = shift;
  },

  /*
    Function: editShift
      Tell the shift to go into edit mode.

    Parameters:
      shiftId - a shift id.
  */
  editShift : function( shiftId )
  {
    var theShift = this.shifts[shiftId];

    if(!theShift.isBeingEdited())
    {
      theShift.setIsBeingEdited(true);
      theShift.edit();
    }
  },

  /*
    Function: updateShift
      Update a shift.  Implicity calls the SSUpdateShift in Core to update the ShiftSpace DB.

    Parameters:
      aShift - The shift instance to update.
  */
  updateShift : function( aShift )
  {
    // notify other object such as the console
    var shiftJson = aShift.encode();

    // fix this
    shiftJson.id = aShift.getId();
    shiftJson.space = this.attributes.name;
    shiftJson.username = ShiftSpace.User.getUsername();

    this.fireEvent('onShiftUpdate', shiftJson);
  },


  /*
    Function: canShowShift (abstract)
      Check if the shift json can be shown.  This method returns true unless you override it.

    Parameters:
      shiftJson - a shift JSON object

    Returns:
      A boolean.
  */
  canShowShift: function(shiftJson)
  {
    return true;
  },


  /*
    Function : showShift
      Show a shift.  If a corresponding internal instance does not exist it will be created.

    Parameters :
      shiftId - The JSON representing the shift to show.

    Returns :
      An _ACTUAL_ Shift object, _NOT_ an id.
  */
  showShift : function( aShift )
  {
    if(!this.cssIsLoaded())
    {
      this.__deferredShifts__.push(aShift);
    }
    else
    {
      var cShift;
      if($type(aShift) != 'object')
      {
        cShift = this.shifts[aShift];
      }
      else
      {
        cShift = this.shifts[aShift.id];
      }

      if( !cShift )
      {
        // add the shift if we don't have it already
        try
        {
          this.addShift( aShift );
        }
        catch(exc)
        {
          SSLog(SSDescribeException(exc));
        }
        cShift = this.shifts[aShift.id];
      }

      if( cShift.canShow() )
      {
        // blur the old shift
        if(this.getCurrentShift() &&
           cShift != this.getCurrentShift())
        {
          this.getCurrentShift().onBlur();
        }

        this.setCurrentShift(cShift);

        // show the new shift and focus it
        if(!cShift.isVisible())
        {
          // do some private show setup here, this way subclass don't have to call this.parent() in show
          cShift._show();
          // call the actual show method
          cShift.show();

          // set some state flags
          cShift.setIsVisible(true);
          cShift.setIsBeingEdited(false);
        }

        // focus the shift
        cShift.onFocus();
      }

      // set the currentShift
      return cShift;
    }

    return null;
  },

  /*
    Function: hideShift
      Hides a shift.

    Parameters:
      shiftId - a shift id.
  */
  hideShift : function( shiftId )
  {
    var cShift = this.shifts[shiftId];

    if( cShift )
    {
      if( cShift.canHide() && cShift.isVisible() )
      {
        cShift._hide();
        cShift.hide();
        cShift.setIsBeingEdited(false);
        cShift.setIsVisible(false);
      }
    }
    else
    {
      console.error( "Shift " + shiftId + " does not exist in this the " + this.getName() + " space." );
    }

    // check to see if there are no visible shifts, if not, hide the space interface
    var visibleShifts = false;
    for(var shift in this.shifts)
    {
      if(this.shifts[shift].isVisible())
      {
        visibleShifts = true;
        continue;
      }
    }
    if(!visibleShifts) this.hideInterface();
  },

  /*
    Function: orderFront
      Move a shift back in the display order.  This is generally called by ShiftSpace.

    Parameters:
      shiftId - the id of the Shift.
      layer - not yet implemented.
  */
  orderFront : function( shiftId, layer )
  {
    var mv = this.shifts[shiftId].getMainView();
    if(mv && !mv.hasClass('SSUnordered'))
    {
      mv.setStyle('zIndex', 10000);
    }
  },

  /*
    Function: orderBack
      Move a shift front in the display order.

    Parameters:
      shiftId - the id of the Shift.
      layer - not yet implemented.
  */
  orderBack : function( shiftId, layer )
  {
    var mv = this.shifts[shiftId].getMainView();
    if(mv && !mv.hasClass('SSUnordered'))
    {
      mv.setStyle('zIndex', 9999);
    }
  },

  /*
    Function: setDepth
      Not yet implemented.
  */
  setDepth: function( shiftId, depth )
  {
    var mv = this.shifts[shiftId].getMainView();
    if(mv && !mv.hasClass('SSUnordered'))
    {
      mv.setStyle('zIndex', depth);
    }
  },

  /*
    Function: regionIsObscured
      Not yet implemented.
  */
  regionIsObscured : function( region )
  {
    var len = this.shifts.length;
    for(var i = 0; i < len; i++ )
    {
      var aShift = this.shifts[i];

      if(aShift.mainViewIsVisible())
      {
        var sregion = aShift.getRegion();

        // check to see if any point of the region falls within this shift
        if ( !( sregion.left > region.right
            || sregion.right < region.left
            || sregion.top > region.bottom
            || sregion.bottom < region.top
            ) )
        {
          return true;
        }
      }
    }
    return false;
  },

  /*
    Function: setCurrentShift (private)
      Set the current shift object.

    Parameters:
      newShift - an internal shift instance.
  */
  setCurrentShift : function(newShift)
  {
    this.__currentShift__ = newShift;
  },

  /*
    Function: setCurrentShiftById
      Same as Space.setCurrentShift but can use an id instead.

    Parameters:
      shiftId - a shift id.
  */
  setCurrentShiftById: function(shiftId)
  {
    this.setCurrentShift(this.shifts[shiftId]);
  },

  /*
    Function: getCurrentShift
      Get the current shift.

    Returns:
      The current focused shift instance.
  */
  getCurrentShift : function()
  {
    return this.__currentShift__;
  },

  /*
    Fuction: getShift
      Returns a shift instance from the internal hash.

    Parameters:
      shiftId - a shift id.
  */
  getShift: function(shiftId)
  {
    return this.shifts[shiftId];
  },

  /*
    Function: focusShift
      Focus a shift.  Implicitly calls Space.setCurrentShift.

    Parameters:
      shiftId - a shift id.
  */
  focusShift : function(shiftId)
  {
    this.setCurrentShift(this.shifts[shiftId]);
    this.getCurrentShift().onFocus();
  },

  /*
    Function: blurShift
      Blur a shift. If the shift is being edited it will be taken out of editing mode.

    Parameters:
      shiftId - a shift id.
  */
  blurShift: function(shiftId)
  {
    var theShift = this.shifts[shiftId];
    theShift.onBlur();
    theShift.setIsBeingEdited(false);
  },

  /*
    Function: onShiftPrepare (abstract)
      Called before a shift will be shown.

    Parameters:
      shiftId - a shift id.
  */
  onShiftPrepare : function(shiftId) {},

  /*
    Function: onShiftCreate (abstract)
      Called after a shift has been created.

    Parameters:
      shiftId - a shift id.
  */
  onShiftCreate : function(shiftId) {},

  /*
    Function: onShiftEdit (abstract)
      Called after a shift has been edited.

    Parameters:
      shiftId - a shift id.
  */
  onShiftEdit: function(shiftId) {},

  /*
    Function: onShiftSave (abstract)
      Called after a shift has been saved.

    Parameters:
      shiftId - a shift id.
  */
  onShiftSave : function(shiftId) {},

  /*
    Function: onShiftDelete (abstract)
      Called after a shift has been deleted.

    Parameters:
      shiftId - a shift id.
  */
  onShiftDelete : function(shiftId) {},

  /*
    Function: onShiftDestroy (abstract)
      Called after a shift has been destroyed.

    Parameters:
      shiftId - a shift id.
  */
  onShiftDestroy : function(shiftId) {},

  /*
    Function: onShiftShow (abstract)
      Called after shift has been shown.

    Parameters:
      shiftId - a shift id.
  */
  onShiftShow : function(shiftId) {},

  /*
    Function: onShiftHide (abstract)
      Called after a shift has been hidden.

    Parameters:
      shiftId - a shift id.
  */
  onShiftHide : function(shiftId) {},

  /*
    Function: onShiftFocus (abstract)
      Called after a shift has been focused.

    Parameters:
      shiftId - a shift id.
  */
  onShiftFocus : function(shiftId) {},

  /*
    Function: onShiftBlur (abstract)
      Called after a shift has been blurred.

    Parameters:
      shiftId - a shift id.
  */
  onShiftBlur: function(shiftId) {},

  /*
    Function: setValue
      Safe wrapper around GM_setValue for spaces.

    Parameters:
      key - a string. The actual key is "spaceName.key"
      value - a value to be set.
  */
  setValue : function(key, value)
  {
    SSSetValue.safeCall(this.attributes.name + "." + key, value);
  },

  /*
    Function: getValue
      Safe wrapper around GM_getValue

    Parameters:
      key - returns a key. The real key is "spaceName.key".
      defaultValue - a default value is the key doesn't exist.
      callback - a callback function.
  */
  getValue : function(key, defaultValue, callback)
  {
    SSGetValue.safeCallWithResult(this.attributes.name + '.' + key, defaultValue, callback);
  },

  /*
    Function: updateTitleOfShift (private)
      Update the title of a shift, if appropriate.

    Parameters:
      shiftId - a shift id.
      title - a new title <string>.
  */
  updateTitleOfShift: function(shiftId, title)
  {
    this.shifts[shiftId].updateTitle(title);
  },

  /*
    Function: mainViewForShift (private)
      Returns the main view DOM node of the shift.

    Parameters:
      shiftId - a shift id.

    Returns:
      A DOM node.
  */
  mainViewForShift: function(shiftId)
  {
    return this.shifts[shiftId].getMainView();
  },

  /*
    Function: saveState (private)
      Saves the state of the space. For the moment just saves the currently visible shifts.
      Normally used when a plugin takes over the entire current browser viewport.
  */
  saveState: function()
  {
    // empty the state
    this.__state__.empty();

    var visibleShifts = [];
    for(var shift in this.shifts)
    {
      if(this.shifts[shift].isVisible())
      {
        visibleShifts.push(this.shifts[shift]);
      }
    }
    this.__state__.set('visibleShifts', visibleShifts);
  },

  /*
    Function: restoreState (private)
      Restores the state of the space. Normally used when a plugin has relinquished the
      browser's current viewport.
  */
  restoreState: function()
  {
    this.__state__.get('visibleShifts').each(function(x) { x.show(); });
  },

  /*
    Function: isNewShift
      Used to check whether a shift is unsaved.

    Parameters:
      shiftId - a shift id.
  */
  isNewShift: function(shiftId)
  {
    return SSIsNewShift(shiftId);
  },

  /*
    Function: xmlhttpRequest
      A safe wrapper around GM_xmlhttpRequest.

    Parameters:
      config - object with properties as defined by GM_xmlhttpRequest.
  */
  xmlhttpRequest: function(config)
  {
    SSXmlHttpRequest.safeCall(config);
  },

  /*
    Function: setPref
      Set a space pref.

    Parameters:
      key - a key.
      value - a value to be set. If value is an Object make sure there aren't circular references.
  */
  setPref: function(key, value)
  {
    this.setValue(this.attributes.name+'.prefs.'+key, value);
  },

  /*
    Function: getPref
      Returns a space pref.

    Parameters:
      key - a key.
      defaultValue - a default value.
      callback - a function to be called when the value has been retrieved.
  */
  getPref: function(key, defaultValue, callback)
  {
    this.getValue(this.attributes.name+'.prefs.'+key, defaultValue, callback);
  }

});


// End ../client/Space.js -----------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('Space');

if (SSInclude != undefined) SSLog('Including ../client/Plugin.js...', SSInclude);

// Start ../client/Plugin.js --------------------------------------------------

// ==Builder==
// @required
// @name              Plugin
// @package           ShiftSpaceCore
// ==/Builder==

/*
  Class: ShiftSpace.Plugin
    Abstract class interface for plugin.  Currently only used Trails.
*/
ShiftSpace.Plugin = new Class({
  
  name: 'ShiftSpace.Plugin',
  
  attributes:
  {
    name: null,
    title: null,
    icon: null,
    css: null
  },
  
  /*
    Function: initialize (private)
      Initializes the plugin. Implicitly calls SSRegisterPlugin as well as subclass's setup method.
  */
  initialize: function(json)
  {
    if(ShiftSpace.Plugin.types.has(this.pluginType))
    {
      switch(this.pluginType)
      {
        case 'kMenuTypePlugin':
        break;
        case 'kInterfaceTypePlugin':
        break;
      }
    }
    else
    {
      console.error('Error: Invalid plugin type. ' + this.pluginType);
      return;
    }
    
    // do some stuff
    if(ShiftSpace.Console)
    {
      ShiftSpace.Console.addEvent('select' + this.attributes.name, this.menuForShift.bind(this));
      ShiftSpace.Console.addEvent('closeMenu', this.closeMenu.bind(this));
    }

    SSRegisterPlugin(this);
    this.setup();
  },
  
  /*
    Function: serverCall
      Allows a plugin to make a server call.
      
    Parameters:
      method - the method name to call.
      params - the url parameters to be passed in.
      callback - the function to called when server call is complete.
  */
  serverCall: function(method, params, callback)
  {
    SSServerCall.safeCall('plugins.'+this.attributes.name+'.'+method, params, callback);
  },
  

  xmlHttpRequest: function(request)
  {
    SSXmlHttpRequest.safeCall(request);
  },
  
  /*
    Function: setInterfaceIsBuilt (private)
      Set the internal flag tracking whether the interface has been constructed yet.
      
    Parameters:
      val - a boolean.
  */
  setInterfaceIsBuilt: function(val)
  {
    this.__interfaceIsBuilt__ = val;
  },

  /*
    Function: interfaceIsBuilt (private)
      Returns the value of the internal flag tracking whether the plugin interface has been constructed.
    
    Returns:
      a boolean.
  */
  interfaceIsBuilt: function()
  {
    return this.__interfaceIsBuilt__;
  },
  
  /*
    Function: setup (abstract)
      To be implemented by subclasses.
  */
  setup: function(options) {},
  
  /*
    Function: showInterface (private)
      Show the plugin interface.
  */
  showInterface: function() {},
  
  /*
    Function: hideInterface (private)
      To be implemented by subclasses.
  */
  hideInterface: function() {},
  
  /*
    Function: buildInterface (abstract)
      To be implemented by subclasses.
  */
  buildInterface: function() {},
  
  /*
    Function: menuIcon (abstract)
      Not yet implemented
  */
  menuIcon: function() {},
  
  /*
    Function: menuIconForShift (abstract)
      Returns the icon for a shift.
      
    Parameters:
      shiftId - a shift id.
  */
  menuIconForShift: function(shiftId) {},
  
  /*
    Function: menuForShift
      Return a menu for a shift.
      
    Parameters:
      shiftId - a shift id.
  */
  menuForShift: function(shiftId) {},
  
  /*
    Function: closeMenu
      Close the plugin menu.
  */
  closeMenu: function() 
  {
    ShiftSpace.Console.hidePluginMenu();
  },
  
  /*
    Function: onCssLoad
      not implemented yet.
  */
  onCssLoad: function()
  {
    this.fireEvent('load');
  },
  
  /*
    Function: enterFullScreen
      Used to put the plugin in full screen mode.
  */
  enterFullScreen: function() 
  {
    if(SSCanGoFullScreen() && !ShiftSpaceIsHidden())
    {
      ShiftSpaceHide();
      return true;
    }
    else
    {
      // can't go full screen
      return false;
    }
  },
  
  /*
    Function: exitFullScreen
      Used when the plugin should exit full screen mode.
  */
  exitFullScreen: function() 
  {
    if(SSCanExitFullScreen() && ShiftSpaceIsHidden())
    {
      SSLog('ShiftSpaceShow');
      ShiftSpaceShow();
      return true;
    }
    else
    {
      return false;
    }
  },
  
  /*
    Function: getShift
      Grab shift data for a shift.
      
    Parameters:
      shiftId - a shift id.
      
    Returns:
      A copy of the shift's properties.
  */
  getShift: function(shiftId)
  {
    // heh, no reason to copy now SSGetShiftData returns a copy
    var temp = SSGetShiftData(shiftId);
    var copy = {};
    
    for(var prop in temp)
    {
      copy[prop] = temp[prop];
    }
    copy.href = SSGetUrlForShift(shiftId);
    
    return copy;
  },
  
  /*
    Function: SSGetShifts
      Returns an array of shift properties
      
    Parameters:
      shiftIds - an array of ids.
      callBack - a function to be called when the shifts have been grabbed.
      errorHandler - a function to be called if the operation fails.
  */
  getShifts: function(shiftIds, callBack, errorHandler)
  {
    SSGetShifts(shiftIds, callBack, (errorHandler || this.errorHandler.bind(this)));
  },
  
  /*
    Function: errorHandler (abstract)
      Default error handler for ShiftSpace.Plugin.error.
      
    Parameters:
      error - an error Object.
  */
  errorHandler: function(error)
  {
    console.error("Error: Plugin call to getShifts failed, " + error.message);
  },
  
  /*
    Function: recentlyViewedShifts
      Returns a hash of recently viewed shifts.
    
    Parameters:
      callback - a function to be called when the recently viewed shifts has been returned.
  */
  recentlyViewedShifts: function(callback)
  {
    return SSGetRecentlyViewedShifts(callback);
  },
  
  /*
    Function: delayedMenu
      Returns whether the menu is of the delayed typed.
      
    Returns:
      A javascript object with a delayed property set to true.
  */
  delayedMenu: function()
  {
    return {'delayed': true};
  },
  
  
  loadStyle: function(filename, callback, frame)
  {
    // pass through
    SSLoadStyle.safeCall(['plugins', this.attributes.name, filename].join('/'), callback, frame);
  },
  

  enterModal: function()
  {
    SSEnterModal(this);
  },
  
  
  exitModal: function()
  {
    SSExitModal(this);
  }
  
});

ShiftSpace.Plugin.types = $H(
{
  kMenuTypePlugin: "kMenuTypePlugin",
  kInterfaceTypePlugin: "kInterfaceTypePlugin"
});

ShiftSpace.Plugin.implement(new Events);


// End ../client/Plugin.js ----------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('Plugin');

if (SSInclude != undefined) SSLog('Including ../client/User.js...', SSInclude);

// Start ../client/User.js ----------------------------------------------------

// ==Builder==
// @optional
// @name              User
// @package           ShiftSpaceCore
// ==/Builder==

/*
  Class: User
    A an object wrapping the current ShiftSpace User.  Use this class to check the user's display
    name as well as checking if the user is logged in or out.
*/
var User = new Class({
  
  Implements: Events,
  
  setUsername: function(_username)
  {
    console.log('SETTING USER NAME ' + username + ' ' + _username);
    var fireLogIn = (username == false) && (_username != null);
    username = _username;
    if(fireLogIn)
    {
      this.fireEvent('onUserLogin');
    }
  },

  /*
    Function: getUsername
      Returns the logged in user's name.
      
    Returns:
      User name as string. Returns false if there is no logged in user.
  */
  getUsername: function() 
  {
    return username;
  },
  
  
  setEmail: function(email)
  {
    this.__email__ = email;
  },
  
  
  email: function()
  {
    return this.__email__;
  },
  

  /*
    Function: isLoggedIn
      Checks whether there is a logged in user.
      
    Returns:
      A boolean.
  */
  isLoggedIn: function(showErrorAlert) 
  {
    return (username != false);
  },
  
  /*
    Function: login (private)
      Login a user. Will probably be moved into ShiftSpace.js.

    Parameters:
      credentials - object with username and password properties.
      _callback - a function to be called when login action is complete.
  */
  login: function(credentials, _callback) 
  {
    var callback = _callback;
    
    SSServerCall('user.login', credentials, function(json) {
      if (json.status) 
      {
        SSLog('//////////////////////////////////////////////////////////');
        SSLog(json);
        // set username
        username = credentials.username;
        // set email
        this.setEmail(json.email);
        callback(json);
        this.fireEvent('onUserLogin');
      } 
      else 
      {
        if(callback) callback(json);
      }
    }.bind(this));
  },
  
  /*
    Function: logout (private)
      Logout a user. Will probably be moved into ShiftSpace.js.
  */
  logout: function() 
  {
    username = false;
    SSSetValue('username', '');
    SSServerCall('user.logout');
    this.fireEvent('onUserLogout');
  },
  
  /*
    Function: join (private)
      Join a new user.  Will probably be moved into ShiftSpace.js.
  */
  join: function(userInfo, callback) 
  {
    
    SSServerCall('user.join', userInfo, function(json) {
      if (json.status) 
      {
        username = userInfo.username;
        SSSetValue('username', userInfo.username);
        callback(json);
      } 
      else 
      {
        callback(json);
      }
    }.bind(this));
  },
  
  /*
    Function: update
      Update a user's info.
      
    Parameters:
      info - info to be updated.
      callback - callback function to be run when update server call is complete.
  */
  update: function(info, callback) {
    SSServerCall('user.update', info, callback);
  },
  
  /*
    Function: resetPassword (private)
      Reset a user's password
      
    Parameters:
      info - ?
      callback - callback function to be run when resetPassword is complete.
  */
  resetPassword: function(info, callback) {
    SSServerCall('user.resetPassword', info, callback);
  },
  
  
  setPublishDefault: function()
  {
    
  },
  
  
  setEmailCommentsDefault: function(newValue, callback)
  {
    SSLog('setEmailCommentsDefault ' + newValue);
    // setting the value, can't use zero because of PHP, GRRR - David
    SSSetDefaultEmailComments(newValue+1);
    
    SSServerCall('user.update', {
      email_comments: newValue
    }, function(json) {
      SSLog('>>>>>>>>>>>>>>>>>>>>>>>>>>> Default changed!');
      SSLog(json);
    });
  },
  
  
  getEmailCommentsDefault: function()
  {
    // setting the value, can't user zero because of PHP, GRRR - David
    return (SSGetDefaultEmailComments(true)-1);
  },
  
  
  setDefault: function(aDefault, value)
  {
    
  }

});

ShiftSpace.User = new User();


// End ../client/User.js ------------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('User');

// === END PACKAGE [ShiftSpaceCore] ===


// === START PACKAGE [ShiftSpaceCoreUI] ===

if(__sysavail__) __sysavail__.packages.push("ShiftSpaceCoreUI");

if (SSInclude != undefined) SSLog('Including ../client/SSView.js...', SSInclude);

// Start ../client/SSView.js --------------------------------------------------

// ==Builder==
// @required
// @name	            SSView
// @package           ShiftSpaceCoreUI
// @dependencies      SandalphonCore, SSLog, PreInitDeclarations, UtilityFunctions
// ==/Builder==

var SSView = new Class({

  name: 'SSView',

  Implements: [Events, Options],
  
  defaults: function()
  {
    SSLog('Returning defaults', SSLogViewSystem);
    var temp = {
      context: null,
      generateElement: true,
      suppress: false
    };
    return temp;
  },

  /*
    Function: _genId
      Generate an object id.  Used for debugging.  The instance is indentified by this in the global
      ShiftSpace.Objects hash.
  */
  _genId: function()
  {
    return (this.name+(Math.round(Math.random()*1000000+(new Date()).getMilliseconds())));
  },

  /*
    Function: initialize
      Takes an element and controls it.

    Parameters:
      el - a HTML Element.
  */
  initialize: function(el, options)
  {
    SSLog("Initialize SSView", SSLogViewSystem);
    if(el)
    {
      SSLog('Instantiating SSView with ' + el.getProperty('id'), SSLogMessage);
    }
    
    // get the options first
    this.setOptions(this.defaults(), options);

    // generate an id
    this.__id__ = this._genId();
    this.setIsAwake(false);

    // add to global hash
    if(ShiftSpace.Objects) ShiftSpace.Objects.set(this.__id__, this);
    
    SSLog('Interned view into ShiftSpace.Objects hash', SSLogViewSystem);

    // check if we are prebuilt
    //this.__prebuilt__ = (el && true) || false; // NOT IMPLEMENTED - David
    this.__ssviewcontrollers__ = [];
    this.__delegate__ = null;
    this.__outlets__ = new Hash();
    
    SSLog('SSView internal vars set', SSLogViewSystem);

    this.element = (el && $(el)) || (this.options.generateElement && new Element('div')) || null;
    
    if(this.element)
    {
      // NOTE: the following breaks tables, so we should avoid it for now - David
      //this.element.setProperty('class', 'ShiftSpaceElement '+this.element.getProperty('class'));

      // store a back reference to this class
      SSSetControllerForNode(this, this.element);

      // add to global name look up dictionary
      if(ShiftSpace.NameTable && this.element.getProperty('id').search('generatedId') == -1)
      {
        ShiftSpace.NameTable.set(this.element.getProperty('id'), this);
      }
    }

    // We need to build this class via code - NOT IMPLEMENTED - David
    /*
    if(!this.__prebuilt__)
    {
      this.build();
    }
    */

    this.__subviews__ = [];

    // Call setup or setupTest allowing classes to have two modes
    // For example, SSConsole lives in a IFrame under ShiftSpace
    // but not under the interface tool.
    if(typeof SandalphonToolMode != 'undefined' && this.setupTest)
    {
      this.setupTest();
    }
    else
    {
      this.setup();
    }
    
  },
  
  getContext: function()
  {
    return this.options.context;
  },
  
  
  setup: function() {},
  
  /*
    Function: awake
      Called after the outlets have been attached.
  */
  awake: function()
  {
    SSLog(this.getId() + " awake, outlets " + JSON.encode(this.outlets().getKeys()));
  },
  
  
  setIsAwake: function(val)
  {
    //console.log(this.getId() + ' is awake ' + val);
    this.__isAwake__ = val;
  },
  
  
  isAwake: function()
  {
    return this.__isAwake__;
  },


  /*
    Function: getId
      Returns the id for this instance.

    Returns:
      The instance id as a string.
  */
  getId: function()
  {
    return this.__id__;
  },
  
  
  elId: function()
  {
    return this.element.getProperty('id');
  },


  setOutlets: function(newOutlets)
  {
    this.__outlets__ = newOutlets;
  },


  outlets: function()
  {
    return this.__outlets__;
  },


  addOutlet: function(element)
  {
    var outletKey = element.getProperty('outlet');
    // check if there is a controller
    var controller = this.controllerForNode(element);
    this.outlets().set(element.getProperty('id'), (controller || element));
  },


  addOutletWithName: function(name, outlet)
  {
    SSLog('Setting name ' + name + ' for ' + outlet);
    this.outlets().set(name, outlet);
  },


  /*
    Function: setDelegate
      Set the delegate of this instance.

    Parameters:
      delegate - an Object.
  */
  setDelegate: function(delegate)
  {
    this.__delegate__ = delegate;
  },

  /*
    Function: delegate
      Returns the delegate for this instance.
  */
  delegate: function()
  {
    return this.__delegate__;
  },


  eventDispatch: function(evt)
  {

  },


  checkForMatch: function(_cands, node)
  {
    if(_cands.length == 0) return null;

    var cands = (_cands instanceof Array && _cands) || [_cands];

    var len = cands.length;
    for(var i = 0; i < len; i++)
    {
      if(cands[i] == node) return true;
    }

    return false;
  },


  /*
    Function: hitTest
      Matches a target to see if it occured in an element pointed to by the selector test.

    Parameters:
      target - the HTML node where the event originated.
      selectorOfTest - the CSS selector to match against.
  */
  hitTest: function(target, selectorOfTest)
  {
    var node = target;
    var matches = this.element._getElements(selectorOfTest);

    while(node && node != this.element)
    {
      if(this.checkForMatch(matches, node))
      {
        this.setCachedHit(node);
        return node;
      }
      node = node.getParent();
    }

    return null;
  },

  /*
    Function: setCachedHit
      Used in conjunction with hitTest.  This is because hitTest may be slow, so you shouldn't have to call it twice.
      If there was a successful hit you should get it from cachedHit instead of calling hitTest again.

    See Also:
      hitTest, cachedHit
  */
  setCachedHit: function(node)
  {
    this.__cachedHit__ = node;
  },

  /*
    Function: cachedHit
      Returns the hit match that was acquired in hitTest.

    Returns:
      An HTML Element.
  */
  cachedHit: function()
  {
    return this.__cachedHit__;
  },


  indexOfNode: function(array, node)
  {
    var len = array.length;
    for(var i = 0; i < len; i++)
    {
      if(array[i] == node) return i;
    }
    return -1;
  },


  /*
    Function: controllerForNode
      Returns the view controller JS instance for an HTML Element.
  */
  controllerForNode: function(node)
  {
    //SSLog(('controllerForNode ' + node);
    // return the storage property
    return SSControllerForNode(node);
  },

  // will probably be refactored
  addControllerForNode: function(node, controllerClass)
  {
    // instantiate and store
    this.__ssviewcontrollers__.push(new controllerClass(node));
  },

  // will probably be refactored
  removeControllerForNode: function(node)
  {
    // get the controller
    var controller = SSControllerForNode(node);
    if(controller)
    {
      // clear out the storage
      SSSetControllerForNode(null, node);

      if(this.__ssviewcontrollers__.contains(controller))
      {
        // remove from internal array
        this.__ssviewcontrollers__.remove(controller);
      }
    }
  },

  /*
    Function: show
      Used to show the interface associated with this instance.
  */
  show: function()
  {
    this.element.addClass('SSActive');
    this.element.removeClass('SSDisplayNone');
  },

  /*
    Function: hide
      Used to hide the interface assocaited with this instance.
  */
  hide: function()
  {
    this.element.removeClass('SSActive');
    this.element.addClass('SSDisplayNone');
  },

  isVisible: function()
  {
    return (this.element.getStyle('display') != 'none');
  },

  /*
    Function: destroy
      Used to destroy this instance as well as the interface associated with it.
  */
  destroy: function()
  {
    this.removeControllerForNode(this.element);
    this.element.destroy();
    delete this;
  },

  /*
    Function: refresh (abstract)
      To be implemented by subclasses.
  */
  refresh: function()
  {

  },

  /*
    Function: build (abstract)
      To be implemented by subclasses.
  */
  build: function()
  {

  },


  localizationChanged: function(newLocalization)
  {
    SSLog('localizationChanged');
  }

});

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSView = SSView;
}

// End ../client/SSView.js ----------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSView');

if (SSInclude != undefined) SSLog('Including ../client/views/SSTabView/SSTabView.js...', SSInclude);

// Start ../client/views/SSTabView/SSTabView.js -------------------------------

// ==Builder==
// @uiclass
// @required
// @name              SSTabView
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSTabView = new Class({
  
  name: 'SSTabView',
  
  Extends: SSView,

  initialize: function(el, options)
  {
    this.parent(el, options);
    
    this.__selectedTab__ = -1;

    // check for default tab
    var defaultActiveTab = this.element._getElement('> .SSControlView > .SSButton.SSActive');
    
    if(defaultActiveTab)
    {
      var idx = this.indexOfTab(defaultActiveTab);
      // force selection of default tab
      this.selectTab(idx);
      this.__selectedTab__ = idx;
    }
    
    // if none select the first
    if(this.__selectedTab__ == -1)
    {
      this.selectTab(0);
    }

    this.element.addEvent('click', this.eventDispatch.bind(this));
    
    //SSLog('refresh SSTabView');
    // refresh the dimensions
    this.refresh();
    //SSLog('SSTabView initialized');
  },
  
  
  eventDispatch: function(evt)
  {
    //SSLog('eventDispatch');

    var theEvent = new Event(evt);
    var theTarget = $(evt.target);
    
    switch(true)
    {
      case (this.hitTest(theTarget, '> .SSControlView') != null):
        var hit = this.hitTest(theTarget, '> .SSControlView .SSButton');
        if(hit) this.selectTab(this.indexOfTab(hit));
      break;
      
      default:
      break;
    }
  },
  
  
  indexOfTabByName: function(name)
  {
    var tab = this.element._getElement('> .SSControlView #'+name);
    
    // return tab index if we have it
    if(tab)
    {
      return this.indexOfTab(tab);
    }
    
    tab = this.element._getElement('> .SSContentView #'+name);
    
    // return content view index if we have it
    if(tab)
    {
      return this.indexOfContentView(tab);
    }
    
    // we couldn't find it
    return -1;
  },
  
  
  indexOfTab: function(tabButton)
  {
    return this.indexOfNode(this.element._getElements('> .SSControlView > .SSButton'), tabButton);
  },
  
  
  tabButtonForIndex: function(idx)
  {
    return this.element._getElements('> .SSControlView > .SSButton')[idx];
  },
  
  
  tabButtonForName: function(name)
  {
    return this.element._getElement('> .SSControlView #'+name);
  },
  
  
  indexOfContentView: function(contentView)
  {
    return this.indexOfNode(this.element._getElements('> .SSContentView > .SSTabPane'), contentView);
  },
  
  
  contentViewForIndex: function(idx)
  {
    return this.element._getElements('> .SSContentView > .SSTabPane')[idx];
  },
  

  selectTabByName: function(name)
  {
    this.selectTab(this.indexOfTabByName(name));
  },
  
  
  selectedContentView: function()
  {
    // grab the DOM node
    var contentView = this.contentViewForIndex(this.__selectedTab__);
    // check for a controller
    var controller = this.controllerForNode(contentView);
    return (controller || contentView);
  },
  

  selectTab: function(idx)
  {
    SSLog(this.element.getProperty('id') + ' selectTab ' + idx);
    if(this.__selectedTab__ != idx)
    {
      // hide the last tab button and tab pane only if there was a last selected tab
      if(this.__selectedTab__ != -1)
      {
        this.tabButtonForIndex(this.__selectedTab__).removeClass('SSActive');

        // hide the last tab pane
        var lastTabPane = this.contentViewForIndex(this.__selectedTab__);
        //SSLog('controller for last tab ' + lastTabPane + ' ' + $uid(lastTabPane));
        var lastTabPaneController = this.controllerForNode(lastTabPane);
        SSLog('got controller');
        SSLog(lastTabPaneController);

        if(lastTabPaneController)
        {
          lastTabPaneController.hide();
        }
        else
        {
          lastTabPane.removeClass('SSActive');
        }
      }

      // check to see if there is a view controller for the content view
      var controller = this.contentViewControllerForIndex(idx);
      SSLog('>>>>>>>>>>>>>>>>>>>>>>>> getting tab content view controller');
      SSLog(controller);
      if(controller)
      {
        //SSLog('showing controller');
        controller.show();
        //SSLog('refreshing controller');
        controller.refresh();
      }
      else
      {
        this.contentViewForIndex(idx).addClass('SSActive');
      }
      
      SSLog('Activating tab button');
      SSLog(this.tabButtonForIndex(idx));
      // hide the tab button
      this.tabButtonForIndex(idx).addClass('SSActive');
      
      this.__selectedTab__ = idx;
      
      //SSLog('fire tabSelected');
      this.fireEvent('tabSelected', {tabView:this, tabIndex:this.__selectedTab__});
      //SSLog('exit tabSelected');
    }
    else
    {
      SSLog('Tab already selected');
    }
  },
  
  
  addTab: function(name)
  {
    var tabButton = new Element('div', {
      'id': name,
      'class': "SSButton"
    });
    tabButton.set('text', name);
    var tabContent = new Element('div', {
      'class': 'SSTabPane'
    });
    
    tabButton.injectInside(this.element._getElement('> .SSControlView'));
    tabContent.injectInside(this.element._getElement('> .SSContentView'));
  },
  
  
  contentViewControllerForIndex: function(idx)
  {
    //SSLog('contentViewControllerForIndex ' + idx + ' ' + this.contentViewForIndex(idx));
    return this.controllerForNode(this.contentViewForIndex(idx));
  },
  
  
  activeTab: function()
  {
    return this.indexOfTab(this.element._getElement('> .SSControlView > .SSButton.SSActive'));
  },
  
  
  hideTabByName: function(name)
  {
    this.hideTab(this.indexOfTabByName(name));
  },
  
  
  hideTab: function(index)
  {
    console.log('hideTab ' + index);
    this.tabButtonForIndex(index).addClass('SSDisplayNone');
    this.contentViewForIndex(index).addClass('SSDisplayNone');
  },
  
  
  revealTabByName: function(name)
  {
    this.revealTab(this.indexOfTabByName(name));
  },
  
  
  revealTab: function(index)
  {
    this.tabButtonForIndex(index).removeClass('SSDisplayNone');
    this.contentViewForIndex(index).removeClass('SSDisplayNone');
  },


  removeTabByName: function(name)
  {
    this.removeTab(this.indexOfTabByName(name));
  },


  removeTab: function(idx)
  {
    // if removing selected tab, highlight a different tab
    if(this.activeTab() == idx)
    {
      this.selectTab(0);
    }
    
    // remove tab button
    this.tabButtonForIndex(idx).dispose();

    // Remove the controller
    var contentView = this.contentViewForIndex(idx);
    var controller = this.controllerForNode(contentView);
    
    if(controller)
    {
      // destroy the controller
      controller.destroy();
    }
    else
    {
      // remove the DOM element
      contentView.dispose();
    }
  },
  

  refresh: function()
  {
    var theControlView = this.element._getElement('> .SSControlView');
    var theContentView = this.element._getElement('> .SSContentView');
    
    // resize content view if it's supposed to autoresize
    if(theContentView.getProperty('autoresize'))
    {
      var size = this.element.getSize();
      var controlSize = theControlView.getSize();
    
      /*
      theContentView.setStyles({
        width: size.x-controlSize.x
      });
      */
    }
    
    // refresh the selected content view as well
    var contentView = this.selectedContentView();
    if(contentView.refresh) contentView.refresh();
  }
  
});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSTabView = SSTabView;
}


// End ../client/views/SSTabView/SSTabView.js ---------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSTabView');

if (SSInclude != undefined) SSLog('Including ../client/views/SSTableView/SSTableView.js...', SSInclude);

// Start ../client/views/SSTableView/SSTableView.js ---------------------------

// ==Builder==
// @uiclass
// @required
// @name              SSTableView
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

/*
  Class: SSTableView
    View controller for table views in the ShiftSpace environment
*/
var SSTableView = new Class({

  name: 'SSTableView',

  Extends: SSView,
  
  defaults: function() 
  {
    return $merge(this.parent(), {
      multipleSelection: false,
      toggleSelection: false
    });
  },

  DelegateProtocol: ['userClickedRow, userSelectedRow, itemForRowColumn, rowCount'],

  initialize: function(el, _options)
  {
    // FIXME: figure out why safe JSON.decode doesn't work
    var options = _options || JSON.decode(el.getProperty('options'));
    
    SSLog('SSTableView initialize', SSLogViews);
    // need to pass this up to parent
    this.parent(el, options);

    SSLog('SSTableView parent called ' + this.elId(), SSLogViews);

    // for speed
    SSLog('Grab content view');
    this.contentView = this.element._getElement('> .SSScrollView .SSContentView');
    // set the model row
    SSLog('Extract model row');
    this.setModelRow(this.contentView._getElement('.SSModel').dispose());
    // set the model row controller if there is one
    SSLog('Set model row controller');
    this.setModelRowController(this.controllerForNode(this.modelRow()));
    // set the column names
    SSLog('Set table view column names');
    this.setColumnNames(this.element._getElements('> .SSScrollView .SSDefinition col').map(function(x) {return x.getProperty('name');}));
    // set the column display titles
    SSLog('Set column titles');
    this.setColumnTitles(this.element._getElements('> .SSScrollView .SSDefinition col').map(function(x) {return x.getProperty('title');}));
    SSLog('Initialize column sorting');
    // set up the column orders
    this.initColumnSort();
    // initialize the table header
    SSLog('Initialize table head');
    this.initTableHead();
    // create resize masks
    SSLog('Intialize column resizers'); 
    this.initColumnResizers();

    // give time for double click
    this.element.addEvent('click', function(_evt) {
      this.eventDispatch.delay(300, this, _evt);
    }.bind(this));

    // listen for double click
    this.element.addEvent('dblclick', this.eventDispatch.bind(this));
    // listen for window resize
    window.addEvent('resize', this.refreshColumnHeadings.bind(this));
    /*window.addEvent('keyup', this.eventDispatch.bind(this));*/
    SSLog('Finished initializing table view');
  },


  validateTable: function()
  {
    if(!this.contentView._getElement('> .SSDefinition'))
    {
      throw new SSException(new Error("SSTableView missing table definition, refer to documentation."), this);
    }
  },

  /*
    Function: initTableHead
      Initialize the table head.  This needs lives outside of the scroll view.  It's contents are built based
      on the table definition in the table's colgroup element.
  */
  initTableHead: function()
  {
    var tableHead = this.element._getElement('> .SSControlView');
    if(!tableHead)
    {
      tableHead = new Element('div', {
        "class": "SSControlView"
      });
      tableHead.injectTop(this.element);
    }
    this.initColumnHeadings();
  },

  /*
    Function: initColumnHeadings
      Intializes the actual column headings.
  */
  initColumnHeadings: function()
  {
    var model = this.element._getElement('> .SSControlView .SSModel');
    this.__columnHeadingModel__ = model.dispose();

    if(model)
    {
      var tableHead = this.element._getElement('> .SSControlView');
      
      // get the column names
      this.columnTitles().length.times(function(idx) {
        // grab the column name
        var columnTitle = this.columnTitles()[idx];
        // clone the heading
        var columnHeading = model.clone(true);
        // grab the column definition and set the heading width to it's dimensions
        var columnDefinition = this.columnDefinitionForIndex(idx);
        columnHeading.setStyle('width', columnDefinition.getStyle('width'));
        // put the proper column heading title in there
        columnHeading.getElement('span.SSColumnHeadingTitle').set('text', columnTitle);
        // add it
        tableHead.grab(columnHeading);
      }.bind(this));
    }
    else
    {
      // hmm we really need a table head cell controller
    }
  },
  
  
  columnCount: function()
  {
    return this.contentView._getElements('> .SSDefinition col').length;
  },


  updateColumnTitles: function(columnTitles)
  {
    var tableHead = this.element._getElement('> .SSControlView');
    columnTitles.length.times(function(idx) {
      var columnTitle = columnTitles[idx];
      this.columnHeadingForIndex(idx).getElement('span.SSColumnHeadingTitle').set('text', columnTitle);
    }.bind(this));
  },
  
  /*
    Function: refreshColumnHeadings (private)
      Called after a window resize event.
  */
  refreshColumnHeadings: function()
  {
    // make the column titles refres to the column definition width - David
    this.columnHeadings().length.times(function(idx) {
      var colWidth = this.columnDefinitionForIndex(idx).getSize().x || this.columnDefinitionForIndex(idx).getStyle('width');
      this.columnHeadingForIndex(idx).setStyle('width', colWidth);
    }.bind(this));
  },

  /*
    Function: initColumnResizers
      Intializes the column resizers.
  */
  initColumnResizers: function()
  {
    var resizers = this.element._getElements('> .SSControlView .SSResize');
    var table = this.contentView;

    // setup the column resizers
    resizers.each(function(resizer) {
      resizer.getParent().makeResizable({
        handle:resizer,
        modifiers:{x:'width', y:''},
        onStart: function()
        {
          resizer.addClass('SSActive');
          resizer.getParent().setStyle('cursor', 'col-resize');
          if(resizer.getParent().getNext()) resizer.getParent().getNext().setStyle('cursor', 'col-resize');
        },
        onComplete: function()
        {
          resizer.removeClass('SSActive');
          resizer.getParent().setStyle('cursor', '');
          if(resizer.getParent().getNext()) resizer.getParent().getNext().setStyle('cursor', '');
        }
      });
    });

    // make the columns resizer adjust the table as well
    resizers.length.times(function(idx) {
      resizer = resizers[idx];
      this.columnDefinitionForIndex(idx).makeResizable({
        handle: resizer,
        modifiers:{x:'width', y:''}
      });
      table.makeResizable({
        handle: resizer,
        modifiers:{x:'width', y:''}
      });
    }.bind(this));
  },

  /*
    Function: eventDispatch
      Used to dispatch events to appropiate handlers.

    Parameters:
      theEvent - a raw DOM event.
  */
  eventDispatch: function(theEvent)
  {
    var evt = new Event(theEvent);
    var type;
    
    try
    {
      // capture IE8 error
      type = evt.type;
    }
    catch(err)
    {
      if($type(type) == 'undefined') type = null;
    }
    
    var target = evt.target;

    if(type == 'dblclick')
    {
      this.clickCount = 1;
    }
    else if(type == 'click' && this.clickCount > 0)
    {
      // a multi click event
      this.clickCount--;
      return;
    }

    switch(true)
    {
      case (type == 'click' && this.hitTest(target, '> .SSControlView .SSResize') != null):
        // don't do anything for columing resizing
      break;

      case (type == 'click' && this.hitTest(target, '> .SSControlView .SSColumnOrder') != null):
        // check first for column reordering
        this.handleColumnOrderHit(this.cachedHit());
      break;

      case (type == 'click' && this.hitTest(target, '> .SSControlView .SSColumnHeading') != null):
        // check next for column select
        this.handleColumnSelect(this.cachedHit());
      break;

      case (type == 'click' && this.hitTest(target, '> .SSScrollView .SSContentView .SSRow .SSActionCell') != null):
        // if the click is an row action let them handle it
      break;

      case (type == 'click' && this.hitTest(target, '> .SSScrollView .SSContentView .SSRow') != null):
        // finally check for general row click
        this.handleRowClick(this.cachedHit(), target);
      break;

      case (type == 'dblclick' && this.hitTest(target, '> .SSScrollView .SSContentView .SSRow > *') != null):
        if(this.modelRowController())
        {
          var row = this.cachedHit().getParent('.SSRow');
          var rowIndex = this.indexOfRow(row);
          var canEdit = true;

          if(this.delegate() && this.delegate().canEditRow)
          {
            canEdit = this.delegate().canEditRow({tableView:this, rowIndex:rowIndex});
          }

          if(canEdit) this.modelRowController().editCell(this.cachedHit());
        }
      default:
      break;
    }

    // pass it on
    this.fireEvent(type, evt);
  },

  /*
    Function: handleColumnOrderHit
      Handles a column reordering event.

    Parameters:
      orderButton - the column reodering button that was actually hit.
  */
  handleColumnOrderHit: function(orderButton)
  {
    var index = this.columnIndexForNode(orderButton);
    var columnName = this.columnNames()[index];

    if(this.datasource())
    {
      // udpate the sort order
      if(this.sortOrderForColumn(index) == SSTableViewDatasource.DESCENDING)
      {
        this.setSortOrderForColumn(index, SSTableViewDatasource.ASCENDING);
      }
      else if(this.sortOrderForColumn(index) == SSTableViewDatasource.ASCENDING)
      {
        this.setSortOrderForColumn(index, SSTableViewDatasource.DESCENDING);
      }

      // tell the datasource to sort
      this.datasource().sortByColumn(columnName, this.sortOrderForColumn(index));
    }
  },

  /*
    Function: handleColumnSelect
      Handles column select events.

    Parameters:
      column - the actual DOM element representing the clicked column.
  */
  handleColumnSelect: function(column)
  {
    var index = this.columnIndexForNode(column);
    var lastSelectedColumn = this.selectedColumnIndex();

    if(index == lastSelectedColumn)
    {
      // was the previously selected column, just deselect
      this.deselectAll();
    }
    else
    {
      this.selectColumn(index);

      // update the sort order if not already sorted
      if(this.datasource()) this.datasource().sortByColumn(this.columnNames()[index], this.sortOrderForColumn(index));
    }
  },

  /*
    Function: selectedColumn
      Returns the DOM node representing the selected column.

    Returns:
      An HTML element.
  */
  selectedColumn: function()
  {
    return this.contentView._getElement('> .SSDefinition col.SSActive');
  },

  /*
    Function: selectedColumnIndex
      Returns the index of the current selected column.

    Returns:
      An HTML element.
  */
  selectedColumnIndex: function()
  {
    return this.indexOfNode(this.contentView._getElements('> .SSDefinition col'), this.selectedColumn());
  },

  /*
    Function: selectedRow
      Returns the DOM node representing the select table row.

    Returns:
      An HTML element.
  */
  selectedRow: function()
  {
    return this.contentView._getElement('.SSRow.SSActive');
  },
  
  /*
    Function: rowIsSelected
      Returns true/false if the row is selected.
      
    Returns:
      A boolean value.
  */
  rowIsSelected: function(index)
  {
    return this.rowForIndex(index).hasClass('SSActive');
  },
  
  /*
    Function: selectedRowIndex
      Returns the index of the selected row.

    Returns:
      An integer.
  */
  selectedRowIndex: function()
  {
    return this.indexOfNode(this.contentView._getElements('.SSRow'), this.selectedRow());
  },

  /*
    Function: deselectRow
      Deselects a row.

    Parameters:
      row - an HTML element.
  */
  deselectRow: function(idx)
  {
    var row = this.rowForIndex(idx);
    row.removeClass('SSActive');
    
    if(this.modelRowController()) this.modelRowController().deselect(row);
    
    if(this.delegate() && this.delegate().userDeselectedRow)
    {
      this.delegate().userDeselectedRow({tableView:this, rowIndex:idx, target:row});
    }
  },

  /*
    Function: deselectColumn
      Deselects a column.

    Parameters:
      col - an HTML element.
  */
  deselectColumn: function(col)
  {
    var idx = this.selectedColumnIndex();
    col.removeClass('SSActive');
    this.columnHeadingForIndex(idx).removeClass('SSActive');
  },

  /*
    Function: selectRow
      Select a row by it's index.

    Parameters:
      idx - an integer.
  */
  selectRow: function(idx)
  {
    if(!this.options.multipleSelection)
    {
      SSLog('Deselect all!');
      this.deselectAll();
    }
    
    var target = this.contentView._getElements(".SSRow")[idx];
    target.addClass('SSActive');
    
    if(this.delegate() && this.delegate().userSelectedRow)
    {
      this.delegate().userSelectedRow({tableView:this, rowIndex:idx, target:target});
    }
  },

  /*
    Function: selectColumn
      Select a column by it's index.

    Parameters:
      idx - an integer.
  */
  selectColumn: function(idx)
  {
    this.deselectAll();
    this.contentView._getElements("> .SSDefinition col")[idx].addClass('SSActive');
    this.columnHeadingForIndex(idx).addClass('SSActive');
  },

  /*
    Function: deselectAll
      Deselect all columns and rows.
  */
  deselectAll: function()
  {
    if(this.selectedRow()) this.deselectRow(this.selectedRowIndex());
    if(this.selectedColumn()) this.deselectColumn(this.selectedColumn());
  },

  /*
    Function: columnHeadingForIndex
      Returns the column heading DOM element by index.

    Parameters:
      idx - an integer.

    Returns:
      an HTML Element.
  */
  columnHeadingForIndex: function(idx)
  {
    return this.element._getElements('> .SSControlView .SSColumnHeading')[idx];
  },
  
  
  rowForIndex: function(idx)
  {
    return this.element._getElements('> .SSScrollView .SSContentView .SSRow')[idx];
  },
  
  
  columnHeadings: function()
  {
    return $A(this.element._getElements('> .SSControlView .SSColumnHeading'));
  },


  /*
    Function: columnDefinitionForIndex
      Returns the col DOM element by index.

    Parameters:
      idx - an integer.
  */
  columnDefinitionForIndex: function(idx)
  {
    return this.contentView._getElements('> .SSDefinition col')[idx];
  },

  /*
    Function: columnIndexForNode
      Returns the column index for a particular node.

    Parameters:
      _node - a HTML Element.

    Returns:
      an integer.
  */
  columnIndexForNode: function(_node)
  {
    var node = (_node.hasClass('SSColumnHeading')) ? _node : _node.getParent('.SSColumnHeading');
    return this.indexOfNode(this.element._getElements('> .SSControlView .SSColumnHeading'), node);
  },

  /*
    Function: handleRowClick
      Handles user click on a row.

    Parameters:
      row - the DOM node representing the row.
      target - the actual node that was clicked.
  */
  handleRowClick: function(row, target)
  {
    var rowIndex = this.indexOfRow(row);
    
    SSLog('>>>>>>>>>>>>>>>>>>>>>>>>>>');
    SSLog(row);
    SSLog(this.rowIsSelected(rowIndex));
    
    // deslect all if not multiple selection type table
    if(!this.options.multipleSelection)
    {
      this.deselectAll();
    }

    // check for selection toggling
    if(this.options.toggleSelection && this.rowIsSelected(rowIndex))
    {
      SSLog('deselect');
      this.deselectRow(this.indexOfRow(row));
    }
    else if(!this.rowIsSelected(rowIndex))
    {
      // otherwise if not already selected, select it
      this.selectRow(rowIndex);            
    }

    // notify the delegate
    if(this.delegate() && this.delegate().userClickedRow)
    {
      this.delegate().userClickedRow({tableView:this, rowIndex:rowIndex, target:target});
    }
  },

  /*
    Function: indexOfRow
      Returns the index for a table row HTML Element.

    Parameters:
      row - the HTML element representing the row.
  */
  indexOfRow: function(row)
  {
    return this.indexOfNode(this.contentView._getElements('.SSRow'), row);
  },

  /*
    Function: setDatasource
      Sets the data source for the table.  This should be an instance of <SSTableViewDatasource> or one of it's subclasses.

    Parameters:
      datasource - an instance of <SSTableViewDatasource>.
  */
  setDatasource: function(datasource)
  {
    if(datasource)
    {
      // remove the previous onload from the last datasource
      if(this.__datasource__)
      {
        this.__datasource__.removeEvent('onload');
      }
      this.__datasource__ = datasource;
      // listen for onload events on the new datasource
      this.__datasource__.addEvent('onload', this.refresh.bind(this));
    }
    else
    {
      console.error('Error: SSTableView datasource is null.');
    }
  },

  /*
    Function: datasource
      Getter for the datasource of this table view.

    Returns:
      An instance of <SSTableViewDatasource>.
  */
  datasource: function()
  {
    return this.__datasource__;
  },

  /*
    Function: reload
      Tell the datasource to refetch it's data.
  */
  reload: function()
  {
    // reload from the server
    if(this.datasource()) this.datasource().fetch();
  },


  setColumnTitles: function(columnTitles)
  {
    this.__columnTitles__ = columnTitles;
  },


  columnTitles: function()
  {
    return this.__columnTitles__;
  },

  /*
    Function: setColumnNames
      Sets the column names.

    Parameters:
      columnNames - an Array of string representing the column names in order.
  */
  setColumnNames: function(columnNames)
  {
    this.__columnNames__ = columnNames;
  },

  /*
    Function: setColumnSortOrders
      Set sort orders for each column in the table.

    Parameters:
      newOrders - an Array representing the column sort orders.
  */
  setColumnSortOrders: function(newOrders)
  {
    this.__columnSortOrders__ = newOrders;
  },

  /*
    Function: columnSortOrders
      Getter for the column sort orders.

    Returns:
      An array.
  */
  columnSortOrders: function()
  {
    return this.__columnSortOrders__;
  },

  /*
    Function: initColumnSort
      Initializes the column sort orders.
  */
  initColumnSort: function()
  {
    // initialize the private var
    this.setColumnSortOrders({});
    // intialize the contents
    this.columnNames().each(function(columnName) {
      this.columnSortOrders()[columnName] = SSTableViewDatasource.DESCENDING;
    }.bind(this));
  },

  /*
    Function: sortOrderForColumn
      Returns the sort order for a column by index.

    Parameters:
      index - an integer.
  */
  sortOrderForColumn: function(index)
  {
    return this.columnSortOrders()[this.columnNames()[index]];
  },

  /*
    Function: setSortOrderForColumn
      Sets the sort order for a column.

    Parameters:
      index - an integer.
      order - should be SSTableViewDatasource.ASCENDING or SSTableViewDatasource.DESCENDING.
  */
  setSortOrderForColumn: function(index, order)
  {
    this.columnSortOrders()[this.columnNames()[index]] = order;
  },

  /*
    Function: columnNames
      Getters for the column names property.

    Returns:
      An array of the column names in order.
  */
  columnNames: function()
  {
    return this.__columnNames__;
  },

  /*
    Function: addRow
      Adds a row to the table view.

    Parameters:
      data - data for each column of the row to be created.
  */
  addRow: function(data)
  {
    var columnNames = this.columnNames();
    var controller = this.modelRowController();
    var newRow = (controller && controller.modelRowClone()) || this.modelRow().clone(true);
    
    // Weird the node needs to be in the DOM for this shit to work
    // if after the following, it fails completely
    this.contentView.getElement('tbody').grab(newRow);
    //newRow.injectInside(this.contentView.getElement('thead'));

    for(var i=0; i < columnNames.length; i++)
    {
      var columnName = columnNames[i];

      if(!controller)
      {
        newRow._getElement('> td[name='+columnName+']').set('text', data[columnName]);
      }
      else
      {
        controller.setProperty(newRow, columnName, data[columnName]);
      }
    }
  },

  /*
    Function: setModelRow
      Sets the model row (an instance of <SSTableRow>) for the table.

    Parameters:
      modelRow - the model row.
  */
  setModelRow: function(modelRow)
  {
    this.__modelRow__ = modelRow;
  },

  /*
    Function: modelRow
      Getter for the model row (an instance of <SSTableRow>) used by this table view instance.

    Returns:
      An HTML Element.
  */
  modelRow: function()
  {
    return this.__modelRow__;
  },


  setModelRowController: function(modelRowController)
  {
    modelRowController.setDelegate(this);
  },

  /*
    Function: modelRowController
      Returns the actual view controller for the model row.

    Returns:
      An <SSTableRow> instance.
  */
  modelRowController: function()
  {
    return this.controllerForNode(this.modelRow());
  },


  columnChangedForRow: function(row, columnIndex, data)
  {
    SSLog('columnChangedForRow', SSLogViews);
    if(this.datasource())
    {
      this.datasource().updateRowColumn(this.indexOfRow(row), this.columnNames()[columnIndex], data);
    }
    else
    {
      SSLog('no datasource', SSLogViews);
    }
  },

  /*
    Function: refresh
      Empties out the table content and reloads from the data source.
  */
  refresh: function()
  {
    SSLog('SSTableView refresh', SSLogViews);

    // empty the content view
    this.contentView.getElement('tbody').empty();

    // update the presentation
    var datasource = this.datasource();

    if(datasource)
    {
      datasource.rowCount().times(function(n) {
        this.addRow(datasource.rowForIndex(n));
      }.bind(this));
    }
  },


  isVisible: function()
  {
    return (this.element.getStyle('display') != "none");
  },


  localizationChanged: function()
  {
    var newTitles = this.columnTitles().map(SSLocalizedString);
    this.updateColumnTitles(newTitles);
    if(this.isVisible())
    {
      this.refresh();
    }
  }

});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSTableView = SSTableView;
}

// End ../client/views/SSTableView/SSTableView.js -----------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSTableView');

if (SSInclude != undefined) SSLog('Including ../client/views/SSTableRow/SSTableRow.js...', SSInclude);

// Start ../client/views/SSTableRow/SSTableRow.js -----------------------------

// ==Builder==
// @uiclass
// @required
// @name              SSTableRow
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSTableRow = new Class({
  
  Extends: SSView,
  
  initialize: function(el, options)
  {
    this.parent(el, options);
    SSLog('Preparing model');
    this.prepareAndSetModel(el);
  },
  
  
  setModel: function(model)
  {
    // prepareModel
    this.__model__ = model;
  },
  
  
  model: function()
  {
    return this.__model__;
  },
  
  
  prepareAndSetModel: function(el)
  {
    this.setModel(this.prepareModel(el));
  },
  
  
  prepareModel: function(model)
  {
    // prepare the model
    return model;
  },
  
  
  modelRowClone: function()
  {
    return this.model().clone(true);
  },
  
  
  setDelegate: function(delegate)
  {
    this.parent(delegate);
  },
  
  
  setProperty: function(row, prop, value)
  {
    var propMethod = 'set'+prop.capitalize();
    var cell = row._getElement('> td[name='+prop+']');
    if(this[propMethod])
    {
      this[propMethod](cell, value);
    }
    else
    {
      cell.set('text', value);
    }
  },
  

  getProperty: function(row, prop)
  {
    var propMethod = 'get'+prop.capitalize();
    var cell = row._getElement('> td[name='+prop+']');
    if(this[propMethod])
    {
      return this[propMethod](cell, prop);
    }
    else
    {
      return cell.get('text');
    }
  }
});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSTableRow = SSTableRow;
}

// End ../client/views/SSTableRow/SSTableRow.js -------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSTableRow');

if (SSInclude != undefined) SSLog('Including ../client/views/SSCell/SSCell.js...', SSInclude);

// Start ../client/views/SSCell/SSCell.js -------------------------------------

// ==Builder==
// @uiclass
// @optional
// @name              SSCell
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSCell = new Class({

  name: 'SSCell',
  Extends: SSView,

  initialize: function(el, options)
  {
    this.parent(el, options);
  },


  lock: function(element)
  {
    this.element = element;
  },


  unlock: function()
  {
    this.element = null;
  },


  isLocked: function()
  {
    return (this.element != null);
  },


  getParentRow: function()
  {
    if(this.element) return this.element.getParent('.SSRow');
    return null;
  }

});

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSCell = SSCell;
}

// End ../client/views/SSCell/SSCell.js ---------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSCell');

if (SSInclude != undefined) SSLog('Including ../client/customViews/SSCustomTableRow/SSCustomTableRow.js...', SSInclude);

// Start ../client/customViews/SSCustomTableRow/SSCustomTableRow.js -----------

// ==Builder==
// @uiclass
// @optional
// @name              SSCustomTableRow
// @package           ShiftSpaceCoreUI
// @dependencies      SSTableRow
// ==/Builder==

var SSCustomTableRow = new Class({

  name: 'SSCustomTableRow',
  Extends: SSTableRow,
  

  initialize: function(el)
  {
    this.parent(el);
  },
  

  awake: function(context)
  {
    if(this.outlets().get('editTextCell'))
    {
      this.initEditTextCell();
    }
  },
  
  
  prepareModel: function(model)
  {
    SSLog('Preparing the model, first generating clone');
    var clone = $(model.clone(true));
    SSLog('Cleaning the model');
    // clean up the properties from the editable text cell, it's a singleton, we don't want these to be carried over
    clone.getElement('.SSEditableTextCell').removeProperty('uiclass');
    clone.getElement('.SSEditableTextCell').removeProperty('outlet');
    return clone;
  },
  
  
  modelRowClone: function()
  {
    var clone = this.parent();
    // readonly property gets lost in cloning for some reason, put it back
    clone.getElement('.SSEditableTextCell').setProperty('readonly', '1');
    return clone;
  },
  
  
  initEditTextCell: function()
  {
    this.editCellControl = this.outlets().get('editTextCell');
    
    // listen for value change events
    this.editCellControl.addEvent('SSEditableTextCellDidChange', function(data) {
    }.bind(this));

    // listen for finish events
    this.editCellControl.addEvent('SSEditableTextCellDidFinishEditing', function(data) {
      var delegate = this.delegate();
      if(delegate && this.editCellControl.isLocked())
      {
        delegate.columnChangedForRow(this.rowForNode(this.editCellControl.element), 
                                     this.columnIndexForNode(this.editCellControl.element),
                                     data);
      }
      // unlock the edit control
      this.editCellControl.unlock();
    }.bind(this));
  },
  
  
  editCell: function(cell)
  {
    if(cell)
    {
      // unlock the previous edited field
      if(this.editCellControl.isLocked()) 
      {
        this.editCellControl.unlock();
      }

      this.editCellControl.lock(cell.getFirst());
      this.editCellControl.edit();
    }
  },
  
  
  columnIndexForNode: function(node)
  {
    var rowForNode = this.rowForNode(node);
    var parentCell = (node.get('tag') == 'td') || node.getParent('td');
    
    return this.indexOfNode(rowForNode.getChildren('td'), parentCell);
  },
  
  
  rowForNode: function(node)
  {
    return node.getParent('.SSRow');
  },
  
  
  deselect: function(row)
  {
    console.log('DESELECT');
    if(this.editCellControl.isLocked() && this.editCellControl.getParentRow() == row) this.editCellControl.unlock();
  },
  
  
  setDelegate: function(delegate)
  {
    this.parent(delegate);
    // add some events
    delegate.addEvent('keyup', function(evt) {
    });
    delegate.addEvent('click', function(evt) {
    });
  },
  

  setSelected: function(cell, space)
  {
  },
  

  setSpace: function(cell, space)
  {
    if(cell)
    {
      var image = cell._getElement('> img');
      var span = cell._getElement('> span');
    
      var server = (ShiftSpace.info && ShiftSpace.info().server) || '..';
      
      image.setProperty('src', [server, '/spaces/', space, '/', space, '.png'].join(''));
      
      span.set('text', SSLocalizedString(space));
    } 
  },
  
  
  setUsername: function(cell, username)
  {
    if(ShiftSpace.User.getUsername() == username)
    {
      cell.addClass('SSAuthor');
    }
    else
    {
      cell.removeClass('SSAuthor');
    }
    
    cell.getElement('a').set('text', username);
    cell.getElement('a').setProperty('href', 'http://www.shiftspace.org/shifts/?filter=by&filterBy='+username);
  },


  setSummary: function(cell, summary)
  {
    if(cell)
    {
      var el = cell.getFirst();
      
      switch(el.get('tag'))
      {
        case 'div':
          el.set('text', summary);
          break;
        case 'input':
          el.setProperty('value', summary)
          break;
        default:
          break;
      }
    }
  }
});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSCustomTableRow = SSCustomTableRow;
}

// End ../client/customViews/SSCustomTableRow/SSCustomTableRow.js -------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSCustomTableRow');

if (SSInclude != undefined) SSLog('Including ../client/views/SSEditableTextCell/SSEditableTextCell.js...', SSInclude);

// Start ../client/views/SSEditableTextCell/SSEditableTextCell.js -------------

// ==Builder==
// @uiclass
// @required
// @name              SSEditableTextCell
// @package           ShiftSpaceCoreUI
// @dependencies      SSCell
// ==/Builder==

var SSEditableTextCell = new Class({

  name: 'SSEditableTextCell',
  Extends: SSCell,

  initialize: function(el, options)
  {
    this.parent(el, options);
  },


  setValue: function(value)
  {
    if(this.element) this.element.setProperty('value', value);
  },


  value: function()
  {
    if(this.element) return this.element.getProperty('value');
    return null;
  },


  setEditable: function(value)
  {
    if(this.element)
    {
      if(!value)
      {
        this.element.setProperty('readonly', 1);
      }
      else
      {
        this.element.removeProperty('readonly');
      }
    }
  },


  editable: function()
  {
    if(this.element) this.element.getProperty('enabled');
  },


  observeEvents: function()
  {
    // add key events
    this.element.addEvent('keyup', function(_evt) {
      var evt = new Event(_evt);
      var value = this.value();

      if(this.isEditing)
      {
        if(value != this.originalValue)
        {
          this.fireEvent("SSEditableTextCellDidChange", {sender:this, originalValue:this.originalValue, newValue:value});
        }

        if(evt.key == 'enter')
        {
          this.finishEdit();
          this.fireEvent("SSEditableTextCellDidFinishEditing", value);
        }
      }
    }.bind(this));

    this.element.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if(this.isEditing)
      {
        evt.stopPropagation();
      }
    }.bind(this));
  },


  unobserveEvents: function()
  {
    this.element.removeEvents('keyup');
    this.element.removeEvents('click');
  },


  edit: function()
  {
    if(this.element)
    {
      this.isEditing = true;

      // store the original value
      this.originalValue = this.element.getProperty('value');
      this.observeEvents();
      // make the field editable
      this.setEditable(true);
      this.editStyle();
    }
  },


  cancelEdit: function()
  {
    if(this.isEditing)
    {
      this.isEditing = false;
      // restore original value
      this.setValue(this.originalValue);
      // leave edit mode
      this.finishEdit();
      this.fireEvent("SSEditableTextCellDidCancelEdit", this);
    }
  },


  finishEdit: function()
  {
    if(this.element)
    {
      this.isEditing = false;
      // empty out original value
      this.originalValue = null;
      // make the field uneditable
      this.setEditable(false);
      this.unobserveEvents();
      this.normalStyle();
    }
  },


  normalStyle: function()
  {
    // exit edit style
    this.element.removeClass('SSEdit');
  },


  editStyle: function()
  {
    // style edit mode
    this.element.addClass('SSEdit');
  },


  unlock: function()
  {
    // clean up first
    if(this.isEditing)
    {
      this.cancelEdit();
    }
    // then call parent to clear out element
    this.parent();
  }

});

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSEditableTextCell = SSEditableTextCell;
}

// End ../client/views/SSEditableTextCell/SSEditableTextCell.js ---------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSEditableTextCell');

if (SSInclude != undefined) SSLog('Including ../client/views/SSListView/SSListView.js...', SSInclude);

// Start ../client/views/SSListView/SSListView.js -----------------------------

// ==Builder==
// @uiclass
// @optional
// @name              SSListView
// @package           ShiftSpaceCoreUI
// @dependencies      SSView, SSCell
// ==/Builder==

var SSListView = new Class({
  name: "SSListView",
  
  Extends: SSView,
  
  defaults: function()
  {
    return $merge(this.parent(), {
      cell: null,
      reorderable: false
    });
  },
  

  initiialize: function(el, options)
  {
    this.parent(el, options);
  },
  

  setCells: function()
  {
    
  },
  

  cells: function()
  {
    
  },
  

  addCell: function()
  {
    
  },
  

  insertCell: function()
  {
    
  },
  

  removeCell: function(idx)
  {
    
  }
})

// End ../client/views/SSListView/SSListView.js -------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSListView');

// === END PACKAGE [ShiftSpaceCoreUI] ===


// === START PACKAGE [ShiftSpaceUI] ===

if(__sysavail__) __sysavail__.packages.push("ShiftSpaceUI");

if (SSInclude != undefined) SSLog('Including ../client/customViews/ActionMenu/ActionMenu.js...', SSInclude);

// Start ../client/customViews/ActionMenu/ActionMenu.js -----------------------

// ==Builder==
// @uiclass
// @customView
// @optional
// @name              ActionMenu
// @package           ShiftSpaceUI
// @dependencies      SSView
// ==/Builder==

var ActionMenu = new Class({
  
  Extends: SSView,
  
  initialize: function(el, options) 
  {
    this.parent(el);
    
    this.selected = [];
    this.menuBuilt = false;
    
    ShiftSpace.User.addEvent('onUserLogin', this.updateMenu.bind(this));
    ShiftSpace.User.addEvent('onUserLogout', this.updateMenu.bind(this));
    
    // Load the interface if not in Sandalphon
    if($type(SandalphonToolMode) == 'undefined')
    {
      SSLog('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++', SSLogForce);
      Sandalphon.load('/client/customViews/ActionMenu/ActionMenu.html', this.buildInterface.bind(this));
    }
  },
  
  
  awake: function(context)
  {
    // in Sandalphon tool mode we're not iframed, in ShiftSpace we are
    if((context == window && typeof SandalphonToolMode != 'undefined') ||
       (context == this.element.contentWindow && typeof SandalphonToolMode == 'undefined'))
    {
      this.linkButton = this.outlets().get('SSLinkToShiftButton');
      this.trailButton = this.outlets().get('SSTrailShiftButton');
      this.deliciousButton = this.outlets().get('SSDeliciousButton');
      this.twitterButton = this.outlets().get('SSTwitterButton');
      this.editButton = this.outlets().get('SSEditShiftButton');
      this.deleteButton = this.outlets().get('SSDeleteShiftButton');
      this.privacyButtons = this.outlets().get('privacy');
      this.batchPrivacy = this.outlets().get('SSSetBatchPrivacy');
      this.privateButton = this.outlets().get('SSSetShiftPrivateButton');
      this.publicButton = this.outlets().get('SSSetShiftPublicButton');
      
      // initialize the dropdown
      this.dropdown = this.outlets().get('privacy');
      this.dropdown.addEvent('click', this.updatePrivacyMenu.bind(this, [true]));

      this.attachEvents();
      this.initFx();
    }
  },
  
  
  initFx: function()
  {
    this.element.set('tween', {
      duration: 300,
      transition: Fx.Transitions.linear,
      onStart: function()
      {
        this.element.setStyle('height', 0);
        this.element.setStyle('overflow', 'hidden');
        this.element.setStyle('display', 'block');
      }.bind(this),
      onComplete: function()
      {
        this.element.setStyle('overflow', 'visible');
      }.bind(this)
    });
    
    /*
    $(this.doc.getElementById('scroller')).set('tween', {
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
    */
  },
  
  
  buildMenu: function() 
  {
    this.attachEvents();
  },
  
  
  attachEvents: function()
  {
    this.linkButton.addEvent('click', this.linkToShift.bind(this));
    this.editButton.addEvent('click', this.editShift.bind(this));
    this.deleteButton.addEvent('click', this.deleteShifts.bind(this));
    this.trailButton.addEvent('click', this.trailShift.bind(this));
    //this.initTwitterButton();
    //this.initDeleteButton();
    
    // Privacy changes
    this.privateButton.addEvent('click', this.makePrivate.bind(this));
    this.publicButton.addEvent('click', this.makePublic.bind(this));
  },
  
  
  linkToShift: function()
  {
    // Link
    if(!this.linkButton.hasClass('disabled'))
    {
      window.open(ShiftSpace.info().server + 'sandbox?id=' + this.selected[0]);
    }
    this.clearAndHide();
  },
  
  
  editShift: function()
  {
    // Edit
    if(SSEditShift)
    {
      if(!this.editButton.hasClass('disabled'))
      {
        SSEditShift(this.selected[0]);
      }
      this.clearAndHide();
    }
  },
  
  
  deleteShifts: function()
  {
    // Delete
    if(SSDeleteShift)
    {
      if(!this.deleteButton.hasClass('disabled'))
      {
        var str = 'this shift';
        if(this.selected.length > 1)
        {
          str = 'these shifts';
        }
        if(confirm('Are you sure want to delete ' + str + '? There is no undo'))
        {
          this.selected.each(SSDeleteShift);
          this.selected = [];
        
          this.updateMenu();
          this.hideMenu();
        }
      }
      this.clearAndHide();
    }
  },
  
  
  trailShift: function()
  {
    if(plugins && plugins.attempt)
    {
      plugins.attempt({
        name: 'Trails', 
        method: 'newTrail', 
        args: this.selected[0],
        callback: null
      });
      this.clearAndHide();
    }
  },
  
  
  initDeliciousButton: function()
  {
    if(plugins && plugins.attempt)
    {
      this.deliciousButton.addEvent('click', function(_evt) {
        var evt = new Event(_evt);
      
        plugins.attempt({
          name: "Delicious", 
          method: 'showDeliciousWindow',
          args: this.selected[0],
          callback: null
        });
      }.bind(this));
    }
  },
  
  
  initTwitterButton: function()
  {
    if(plugins && plugins.attempt)
    {
      this.twitterButton.addEvent('click', function(_evt) {
        var evt = new Event(_evt);
      
        plugins.attempt({
          name: 'Twitter', 
          method: "show", 
          args: this.selected[0],
          callback: null 
        });
      }.bind(this));
    }
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

  
  setIsVisible: function(val) 
  {
    this.__visible__ = val;
  },
  

  isVisible: function() 
  {
    return this.__visible__;
  },
  

  select: function(shiftId) 
  {
    this.selected.push(shiftId);
    SSLog('select');
    this.showMenu();
    this.updateMenu();
  },
  

  deselect: function(shiftId) 
  {
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
  

  showMenu: function() 
  {
    if(!this.isVisible())
    {
      this.setIsVisible(true);
      if (!this.menuBuilt) 
      {
        this.buildMenu();
        this.menuBuilt = true;
      }
      
      this.element.tween('height', 22);
      //$(this.doc.getElementById('scroller')).tween('top', 23);
    }
  },
  
  
  hideMenu: function() 
  {
    this.setIsVisible(false);
    this.updatePrivacyMenu();
    
    this.element.tween('height', 0);
    //$(this.doc.getElementById('scroller')).tween('top', 0);
  },

  
  updateMenu: function() 
  {
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

// Add it the global UI class lookup
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.ActionMenu = ActionMenu;
}

// End ../client/customViews/ActionMenu/ActionMenu.js -------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('ActionMenu');

if (SSInclude != undefined) SSLog('Including ../client/views/SSConsole/SSConsole.js...', SSInclude);

// Start ../client/views/SSConsole/SSConsole.js -------------------------------

// ==Builder==
// @uiclass
// @optional
// @name              SSConsole
// @package           ShiftSpaceUI
// ==/Builder==

var SSConsole = new Class({

  name: 'SSConsole',

  Extends: SSView,

  initialize: function(el, options)
  {
    SSLog("INSTANTIATING SSConsole", SSLogMessage);
    SSLog("Calling parent", SSLogMessage);
    
    // only really relevant under Sandalphon
    if(typeof SandalphonToolMode == 'undefined')
    {
      this.parent(el, options);
    }
    else
    {
      this.parent(el, $merge(options, {
        generateElement: false
      }));
    }

    // if not tool mode, we load the interface ourselve
    SSLog("Loading interface", SSLogMessage);
    if(typeof SandalphonToolMode == 'undefined')
    {
      Sandalphon.load('/client/compiledViews/SSConsole', this.buildInterface.bind(this));
    }

    // listen for login/logout events, pass in reference to self
    // so that ShiftSpace notifies after this object's awake method has been called
    // this is because outlets won't be set until that point
    SSLog('Adding SSConsole events', SSLogMessage);
    SSAddEvent('onUserLogin', this.handleLogin.bind(this), this);
    SSAddEvent('onUserLogout', this.handleLogout.bind(this), this);
    
    // listen for shift events
    SSAddEvent('onShiftSave', this.refreshTableViews.bind(this));
    SSAddEvent('onShiftHide', this.deselectShift.bind(this))

    // listen for global events as well

    // allocate datasource for page shifts
    SSLog('Adding datasources', SSLogMessage);
    this.allShiftsDatasource = new SSTableViewDatasource({
      dataKey: 'shifts',
      dataUpdateKey: 'id',
      dataUpdateURL: 'shift.update',
      dataProviderURL: 'shift.query',
      dataNormalizer: this.legacyNormalizer
    });

    // allocate datasource for user shifts
    this.myShiftsDatasource = new SSTableViewDatasource({
      dataKey: 'shifts',
      dataUpdateKey: 'id',
      dataUpdateURL: 'shift.update',
      dataProviderURL: 'shift.query',
      dataNormalizer: this.legacyNormalizer,
      requiredProperties: ['username']
    });
    
    SSLog('Done with initialization', SSLogMessage);
  },
  
  
  awake: function(context)
  {
    this.parent();
    
    // in Sandalphon tool mode we're not iframed, in ShiftSpace we are
    if((context == window && typeof SandalphonToolMode != 'undefined') ||
       (context == this.element.contentWindow && typeof SandalphonToolMode == 'undefined'))
    {
      if(this.outlets().get('AllShiftsTableView')) this.setAllShiftsTableView(this.outlets().get('AllShiftsTableView'));
      if(this.outlets().get('MyShiftsTableView')) this.setMyShiftsTableView(this.outlets().get('MyShiftsTableView'));
      if(this.outlets().get('SSLoginFormSubmit')) this.initLoginForm();
      if(this.outlets().get('SSSignUpFormSubmit')) this.initSignUpForm();
      if(this.outlets().get('SSConsoleLoginOutButton')) this.initConsoleControls();
      if(this.outlets().get('SSSelectLanguage')) this.initSelectLanguage();
      if(this.outlets().get('SSSetServers')) this.initSetServersForm();
      if(this.outlets().get('SSUserLoginStatus')) this.initUserLoginStatus();
    }
  },


  handleLogin: function()
  {
    console.log('HANDLE LOGIN');
    // empty the login form
    this.emptyLoginForm();
    // hide the login tab
    this.outlets().get('MainTabView').hideTabByName('LoginTabView');
    // update the datasource
    if(this.myShiftsDatasource) this.myShiftsDatasource.setProperty('username', ShiftSpace.User.getUsername());
    // switch to the tab view
    this.outlets().get('MainTabView').selectTabByName('ShiftsTabView');
    
    // update login status
    var loginStatus = this.outlets().get('SSUserLoginStatus');
    if(loginStatus)
    {
      loginStatus.getElementById('SSUserIsNotLoggedIn').removeClass('SSActive');
      var isLoggedIn = loginStatus.getElementById('SSUserIsLoggedIn');
      isLoggedIn.addClass('SSActive');
      isLoggedIn.getElement('span').set('text', ShiftSpace.User.getUsername());
    }
  },


  handleLogout: function()
  {
    // empty the login form
    this.emptyLoginForm();
    // reveal the login tab
    this.outlets().get('MainTabView').revealTabByName('LoginTabView');
    // update data source
    if(this.myShiftsDatasource) this.myShiftsDatasource.setProperty('username', null);
    // refresh the main tab view
    this.outlets().get('MainTabView').refresh();
    
    // update login status
    var loginStatus = this.outlets().get('SSUserLoginStatus');
    if(loginStatus)
    {
      loginStatus.getElementById('SSUserIsNotLoggedIn').addClass('SSActive');
      loginStatus.getElementById('SSUserIsLoggedIn').removeClass('SSActive');
    }
  },


  setAllShiftsTableView: function(tableView)
  {
    var properties = (typeof SandalphonToolMode == 'undefined' ) ? {href:window.location} : {href:server+'sandbox/index.php'};

    this.allShiftsTableView = tableView;
    tableView.setDelegate(this);
    tableView.setDatasource(this.allShiftsDatasource);
    this.allShiftsDatasource.setProperties(properties);
    this.allShiftsDatasource.fetch();
  },


  setMyShiftsTableView: function(tableView)
  {
    this.myShiftsTableView = tableView;
    tableView.setDelegate(this);
    tableView.setDatasource(this.myShiftsDatasource);
    this.myShiftsDatasource.fetch();
  },


  initLoginForm: function()
  {
    // catch click
    this.outlets().get('SSLoginFormSubmit').addEvent('click', this.handleLoginFormSubmit.bind(this));

    // catch enter
    this.outlets().get('SSLoginForm').addEvent('submit', function(_evt) {
      var evt = new Event(_evt);
      evt.preventDefault();
      this.handleLoginFormSubmit();
    }.bind(this));

    // listen for tabSelected events so we can clear out the login form
    this.outlets().get('LoginTabView').addEvent('tabSelected', this.handleTabSelect.bind(this));
  },
  
  
  initSetServersForm: function()
  {
    var apiField = this.outlets().get('SSSetApiURLField');
    var spacesDirField = this.outlets().get('SSSetSpaceDirField');
    
    if(ShiftSpace.info)
    {
      apiField.setProperty('value', ShiftSpace.info().server);
      spacesDirField.setProperty('value', ShiftSpace.info().spacesDir);

      // add keydown event handlers on them for carraige return
      apiField.addEvent('keydown', function(_evt) {
        var evt = new Event(_evt);
        var previousValue = SSGetValue('server', ShiftSpace.info().server);
        if(evt.key == 'enter')
        {
          console.log('Update the api variable. prev: ' + previousValue);
        }
      }.bind(this));

      spacesDirField.addEvent('keydown', function(_evt) {
        var evt = new Event(_evt);
        var previousValue = SSGetValue('spacesDir', ShiftSpace.info().spacesDir);
        if(evt.key == 'enter')
        {
          console.log('Update the space dir variable. prev:' + previousValue);
        }
      }.bind(this));
    }
  },
  
  
  initUserLoginStatus: function()
  {
    
  },


  handleTabSelect: function(args)
  {
    if(args.tabView == this.outlets().get('LoginTabView') && args.tabIndex == 0)
    {
      this.emptyLoginForm();
    }
  },


  emptyLoginForm: function()
  {
    this.outlets().get('SSLoginFormUsername').setProperty('value', '');
    this.outlets().get('SSLoginFormPassword').setProperty('value', '');
  },


  handleLoginFormSubmit: function()
  {
    ShiftSpace.User.login({
      username: this.outlets().get('SSLoginFormUsername').getProperty('value'),
      password: this.outlets().get('SSLoginFormPassword').getProperty('value')
    }, this.loginFormSubmitCallback.bind(this));
  },


  loginFormSubmitCallback: function(response)
  {
    console.log('Login call back!');
    console.log(response);
  },


  initSignUpForm: function()
  {
    // catch click
    this.outlets().get('SSSignUpFormSubmit').addEvent('click', this.handleSignUpFormSubmit.bind(this));
    
    // catch enter
    this.outlets().get('SSLoginForm').addEvent('submit', function(_evt) {
      var evt = new Event(_evt);
      evt.preventDefault();
      this.handleSignUpFormSubmit();
    }.bind(this));
  },


  handleSignUpFormSubmit: function()
  {
    var joinInput = {
      username: this.outlets().get('SSSignUpFormUsername').getProperty('value'),
      email: this.outlets().get('SSSignUpFormEmail').getProperty('value'),
      password: this.outlets().get('SSSignUpFormPassword').getProperty('value'),
      password_again: this.outlets().get('SSSignUpFormPassword').getProperty('value')
    };

    ShiftSpace.User.join(joinInput, this.signUpFormSubmitCallback.bind(this));
  },


  signUpFormSubmitCallback: function(response)
  {
    console.log('Joined!');
    console.log(response);
  },


  initConsoleControls: function()
  {
    // init login/logout button
    this.outlets().get('SSConsoleLoginOutButton').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if(ShiftSpace.User.isLoggedIn())
      {
        // logout the user
        ShiftSpace.User.logout();
      }
      else
      {
        // select the login tab view
        this.outlets().get('MainTabView').selectTabByName('LoginTabView');
      }
    }.bind(this));

    // init bug report button

    // init close button
  },


  initSelectLanguage: function()
  {
    // attach events to localization switcher
    this.outlets().get('SSSelectLanguage').addEvent('change', function(_evt) {
      var evt = new Event(_evt);
      SSLoadLocalizedStrings(evt.target.getProperty('value'), this.element.contentWindow);
    }.bind(this));
  },
  

  buildInterface: function(ui)
  {
    SSLog("BUILD SSConsole interface");
    
    if($('SSConsole'))
    {
      throw new Error("Ooops it looks an instace of ShiftSpace is already running. Please turn off Greasemonkey or leave this page.");
    }

    // create the iframe where the console will live
    this.element = new IFrame({
      id: 'SSConsole'
    });
    // since we're creating the frame via code we need to hook up the controller
    // reference manually
    SSSetControllerForNode(this, this.element);
    SSLog("Iframe injected");
    this.element.injectInside(document.body);

    // finish initialization after iframe load
    this.element.addEvent('load', function() {
      SSLog("SSConsole iframe loaded");
      var context = this.element.contentWindow;

      // under GM not wrapped, erg - David
      if(!context.$)
      {
        context = new Window(context);
        var doc = new Document(context.document);
      }

      // add the styles into the iframe
      Sandalphon.addStyle(ui.styles, context);
      
      // grab the interface, strip the outer level, we're putting the console into an iframe
      var fragment = Sandalphon.convertToFragment(ui['interface'], context).getFirst();
      
      // place it in the frame
      $(context.document.body).setProperty('id', 'SSConsoleFrameBody');
      $(context.document.body).grab(fragment);
      
      // activate the iframe context: create controllers hook up outlets
      Sandalphon.activate(context);
      
      // create the resizer
      this.initResizer();
    }.bind(this));
  },
  
  
  initResizer: function()
  {
    // place the resizer above the thing
    var resizer = new ShiftSpace.Element('div', {
      'id': 'SSConsoleResizer'
    });
    $(document.body).grab(resizer);
    
    resizer.makeDraggable({
      modifiers: {x:'', y:'bottom'},
      invert: true,
      onStart: function()
      {
        SSAddDragDiv();
      },
      onComplete: function()
      {
        SSRemoveDragDiv();
      }
    });

    // make the console resizeable
    this.element.makeResizable({
      handle: resizer,
      modifiers: {x:'', y:'height'},
      invert: true
    });
  },


  userClickedRow: function(args)
  {
    
  },


  userSelectedRow: function(args)
  {
    console.log('MyTableViewDelegate, userClickedRow: ' + args.rowIndex);
    var datasource = args.tableView.datasource();
    if(args.tableView == this.allShiftsTableView)
    {
      console.log('all shifts table view, id of shift ' + datasource.data()[args.rowIndex].id);
      // show the shift
      if(typeof SSShowShift != 'undefined') 
      {
        console.log('show shift!');
        SSShowShift(datasource.data()[args.rowIndex].id);
      }
    }
    else if(args.tableView == this.myShiftsTableView)
    {
      console.log('my shifts table view, id of shift ' + datasource.data()[args.rowIndex].id);
      // set a variable for opening this shift on the next page if the url is different
    }
  },


  userDeselectedRow: function(args)
  {
    console.log('userDeselectedRow');
    var datasource = args.tableView.datasource();
    if(args.tableView == this.allShiftsTableView)
    {
      SSHideShift(datasource.data()[args.rowIndex].id);
    }
  },


  canSelectRow: function(data)
  {

  },


  canSelectColumn: function(data)
  {

  },


  canEditRow: function(args)
  {
    console.log('canEditRow');
    // in the all shifts table the user can edit only if she owns the shift
    if(args.tableView == this.allShiftsTableView)
    {
      return (ShiftSpace.User.getUsername() == this.allShiftsDatasource.valueForRowColumn(args.rowIndex, 'username'));
    }

    return true;
  },
  
  
  getVisibleTableView: function()
  {
    if(this.allShiftsTableView.isVisible()) return this.allShiftsTableView;
    if(this.myShiftsTableView.isVisible()) return this.myShiftsTableView;
  },
  
  
  refreshTableViews: function(shiftId)
  {
    var visibleTableView = this.getVisibleTableView();

    if(visibleTableView)
    {
      // reload the table
      visibleTableView.reload();
    }
  },
  
  
  deselectShift: function(shiftId)
  {
    
  }


});

// Create the object right away if we're not running under the Sandalphon tool
if(typeof SandalphonToolMode == 'undefined')
{
  new SSConsole();
}
else
{
  // Add it the global UI class lookup
  if($type(ShiftSpace.UI) != 'undefined')
  {
    ShiftSpace.UI.SSConsole = SSConsole;
  }
}



// End ../client/views/SSConsole/SSConsole.js ---------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('SSConsole');

if (SSInclude != undefined) SSLog('Including ../client/ShiftMenu.js...', SSInclude);

// Start ../client/ShiftMenu.js -----------------------------------------------

// ==Builder==
// @required
// @name              ShiftMenu
// @package           ShiftSpaceUI
// @dependencies      ShiftSpaceElement, EventProxy
// ==/Builder==

/*
  Class: ShiftMenu
    A singleton Class that represents the ShiftMenu. It is used to create new shifts.
*/
var ShiftMenu = new Class({
  
  /*
    Function: initialize
      Initializes the shift menu.
  */
  initialize: function(options) 
  {
    this.menuVisible = false;
    this.spaceButtons = {};
    
    // we want to know about install and uninstall events
    SSAddEvent('onSpaceInstall', this.addSpace.bind(this));
    SSAddEvent('onSpaceUninstall', this.removeSpace.bind(this));
  },
  
  /*
    Function: buildMenu
      Construct the shift menu interface.
  */
  buildMenu: function() 
  {
    this.element = new ShiftSpace.Element('div', {
      id: 'SS_ShiftMenu',
      styles: {
        display: 'none'
      }
    });
    this.element.addEvent('mouseover', function() {
      this.element.style.display = 'block';
      this.element.addClass('hover');
    }.bind(this));
    this.element.addEvent('mouseout', function() {
      this.element.removeClass('hover');
    }.bind(this));
    
    var container = new ShiftSpace.Element('div', {
      'class': 'container',
      styles: {
        width: (26 * SSSpacesCount())
      }
    }).injectInside(this.element);
    this.element.injectInside(document.body);
    
    new ShiftSpace.Element('br', {
      styles: {
        clear: 'both'
      }
    }).injectInside(container);
    
    for (var spaceName in installed) {
      this.addSpace(spaceName);
    }
  },
  
  /*
    Function: addSpace
      Add a new space icon to the menu.
      
    Parameters:
      spaceName - the name of Space as a string.
  */
  addSpace: function(spaceName) 
  {
    // TODO: we need the icon to not be separate from the space so that we can do incremental loading.
    SSLog('adding space ' + spaceName);
    var spaceAttrs = ShiftSpace.info(spaceName);
    var container = this.element.firstChild;
    var clear = container.getElementsByTagName('br')[0];
    var button = new ShiftSpace.Element('div', {
      'class': 'button',
      'title': spaceAttrs.title
    });
    
    var icon = new ShiftSpace.Element('img', {
      src: spaceAttrs.icon
    });
    icon.injectInside(button);
    button.injectBefore(clear);
    this.spaceButtons[spaceName] = button;
    
    icon.addEvent('mouseover', function() {
      button.addClass('hover');
    });
    
    icon.addEvent('mouseout', function() {
      button.removeClass('hover');
    });
    
    icon.addEvent('click', function(e) {
      if (!ShiftSpace.User.isLoggedIn()) {
        window.alert('Sorry, you must be signed in to create new shifts.');
        this.hide(true);
        return;
      }
      if (SSCheckForUpdates()) {
        return;
      }
      var event = new Event(e);
      if(!SSSpaceForName(spaceName))
      {
        // we need to load the space first
        SSLoadSpace(spaceName, function() {
          SSInitShift(spaceName, {position:{x: event.page.x, y:event.page.y}});
        });
      }
      else
      {
        // just show it
        SSInitShift(spaceName, {position:{x: event.page.x, y:event.page.y}});
      }
      this.hide(true);
    }.bind(this));
  },
  
  /*
    Function: removeSpace
      Remove a space icon from the menu.
      
    Parameters:
      spaceName - a space name as a string.
  */
  removeSpace: function(spaceName) 
  {
    this.spaceButtons[spaceName].remove();
  },
  
  /*
    Function: show
      Show the menu.
      
    Parameters:
      x - the current x mouse location.
      y - the current y mouse location.
  */
  show: function(x, y) 
  {
    if (!this.element) 
    {
      return;
    }
    if (!this.menuVisible && !ShiftSpaceIsHidden()) 
    {
      this.menuVisible = true;
      this.element.setStyles({
        left: (x + 10) + 'px',
        top: (y - 5) + 'px',
        display: 'block'
      });
    }
  },
  
  /*
    Function: hide
      hide the menu.
      
    Parameters:
      forceHide - a boolean to force hide the menu.
  */
  hide: function(forceHide) {
    if (!this.element) {
      return;
    }
    if (forceHide || !this.element.hasClass('hover')) {
      this.menuVisible = false;
      this.element.setStyle('display', 'none');
    }
  }
  
});

ShiftSpace.ShiftMenu = new ShiftMenu();


// End ../client/ShiftMenu.js -------------------------------------------------


if (SSInclude != undefined) SSLog('... complete.', SSInclude);

if(__sysavail__) __sysavail__.files.push('ShiftMenu');

// === END PACKAGE [ShiftSpaceUI] ===

      
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
