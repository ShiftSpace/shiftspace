// ==Builder==
// @optional
// ==/Builder==

// NOTE: This will be preprocessed by preprocess.py and replaced with the proper
// servers

var __spacesDir = '%%SPACEDIR%%';

SSLog('SERVER: ' + __server, SSLogForce);
SSLog('SPACESDIR: ' + __spacesDir, SSLogForce);

var version = '1.0';
var __cacheFiles = 0;

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
var __defaultSpaces = {
  'Notes': 
  {
    name:'Notes', 
    url: __spacesDir + 'Notes/', 
    icon: __spacesDir + 'Notes/' + 'Notes.png', 
    css: __spacesDir + 'Notes/' + 'Notes.css',
    position:0, 
    attrs: {},
    autolaunch: false
  },
  'ImageSwap': 
  {
    name:'ImageSwap', 
    url: __spacesDir + 'ImageSwap/', 
    icon: __spacesDir + 'ImageSwap/' + 'ImageSwap.png', 
    css: __spacesDir + 'ImageSwap/' + 'ImageSwap.css',
    position:1, 
    attrs: {},
    autolaunch: false
  },
  'Highlights': 
  {
    name:'Highlights', 
    url: __spacesDir + 'Highlights/', 
    icon: __spacesDir + 'Highlights/' + 'Highlights.png', 
    css: __spacesDir + 'Highlights/' + 'Highlights.css',
    position:2, 
    attrs: {},
    autolaunch: false
  },
  'SourceShift': 
  {
    name:'SourceShift', 
    url: __spacesDir + 'SourceShift/', 
    icon: __spacesDir + 'SourceShift/' + 'SourceShift.png',
    css: __spacesDir + 'SourceShift/' + 'SourceShift.css',
    position:3, 
    attrs: {},
    autolaunch: false
  }
};

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
*/

// installedPlugins = {
//   'Trails' : myFiles + 'plugins/Trails/NewTrail.js'
// };

// An index of cached files, used to clear the cache when necessary
var cache = SSGetValue('cache', []);
var alreadyCheckedForUpdate = false;