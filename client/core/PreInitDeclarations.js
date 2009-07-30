// ==Builder==
// @optional
// ==/Builder==

// NOTE: This will be preprocessed by preprocess.py and replaced with the proper
// servers

var __spacesDir = '%%SPACEDIR%%';

SSLog('SERVER: ' + __server, SSLogForce);
SSLog('SPACESDIR: ' + __spacesDir, SSLogForce);

var version = '1.0';
var __cacheFiles = false;

if(typeof ShiftSpaceSandBoxMode != 'undefined' && ShiftSpaceSandBoxMode) 
{
  //TODO: remove - David Nolen
  //server = window.location.href.substr(0, window.location.href.indexOf('sandbox'));
  __cacheFiles = 0;
}

var __displayList = [];
var __SSInvalidShiftIdError = "__SSInvalidShiftIdError";
var __consoleIsWaiting = false;
var __defaultEmailComments = 1;

// Stores initial data for plugins that are needed for the console at startup
// since the plugins won't actually be loaded until they are needed
var __pluginsData = {};

// Default Spaces
var __defaultSpacesList = ['Notes', 'Highlights', 'ImageSwap', 'SourceShift'];

var installedPlugins = {};

// An index of cached files, used to clear the cache when necessary
//var cache = SSGetValue('cache', []);
var alreadyCheckedForUpdate = false;