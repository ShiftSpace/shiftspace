// ==Builder==
// @optional
// ==/Builder==

// NOTE: This will be preprocessed by preprocess.py and replaced with the proper
// servers

var spacesDir = '%%SPACEDIR%%';

SSLog('SERVER: ' + server, SSLogForce);
SSLog('SPACESDIR: ' + spacesDir, SSLogForce);

var version = '0.13';
var cacheFiles = 0;

if(typeof ShiftSpaceSandBoxMode != 'undefined' && ShiftSpaceSandBoxMode) 
{
  //TODO: remove - David Nolen
  //server = window.location.href.substr(0, window.location.href.indexOf('sandbox'));
  cacheFiles = 0;
}

var displayList = [];
var __SSInvalidShiftIdError__ = "__SSInvalidShiftIdError__";
var __consoleIsWaiting__ = false;
var __defaultEmailComments__ = 1;

// Stores initial data for plugins that are needed for the console at startup
// since the plugins won't actually be loaded until they are needed
var __pluginsData__ = {};

// Each space and it's associated metadata
var __installed = SSGetValue('installed', {
  'Notes': 
  {
    name:'Notes', 
    url: spacesDir + 'Notes/Notes.js', 
    position:0, 
    icon:'Notes/Notes.png', 
    attrs: {},
    autolaunch: false
  },
  'ImageSwap': 
  {
    name:'ImageSwap', 
    url: spacesDir + 'ImageSwap/ImageSwap.js', 
    icon:'ImageSwap/ImageSwap.png', 
    position:1, 
    attrs: {},
    autolaunch: false
  },
  'Highlights': 
  {
    name:'Highlights', 
    url: spacesDir + 'Highlights/Highlights.js', 
    icon:'Highlights/Highlights.png', 
    position:2, 
    attrs: {},
    autolaunch: false
  },
  'SourceShift': 
  {
    name:'SourceShift', 
    url: spacesDir + 'SourceShift/SourceShift.js', 
    icon:'SourceShift/SourceShift.png',
    position:3, 
    attrs: {},
    autolaunch: false
  }
});

SSLog("Installed ================", SSLogSystem);
SSLog(JSON.encode(__installed), SSLogSystem);

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