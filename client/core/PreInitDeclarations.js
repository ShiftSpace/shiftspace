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
  'Notes' : spacesDir + 'Notes/Notes.js',
  'ImageSwap': spacesDir + 'ImageSwap/ImageSwap.js',
  'Highlights': spacesDir + 'Highlights/Highlights.js',
  'SourceShift': spacesDir + 'SourceShift/SourceShift.js'
});

SSLog("Installed ================", SSLogSystem | SSLogForce);
SSLog(JSON.encode(installed), SSLogSystem | SSLogForce);

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