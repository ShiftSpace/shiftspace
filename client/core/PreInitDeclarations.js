// ==Builder==
// @optional
// @name              PreInitDeclarations
// ==/Builder==

// NOTE: This will be preprocessed by preprocess.py and replaced with the proper
// servers

// any environment specific vars
%%VARS%%

// two most important vars
var server = '%%SERVER%%';
var spacesDir = '%%SPACEDIR%%';

var __sys__ = %%SYSTEM_TABLE%%;
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

// new additions for Sandalphon
ShiftSpaceUI = {}; // holds all UI class objects
ShiftSpaceObjects = new Hash(); // holds all instantiated UI objects
ShiftSpaceNameTable = new Hash(); // holds all instantiated UI object by CSS id

// TODO: remove this dependency - David
ShiftSpaceClassPaths = {
  'SSTableViewDatasource': '/client/'
};

// TODO: paths to view controllers, should probably just default unless defined in UserClassPaths - David
ShiftSpaceUIClassPaths = {
  'SSCell': '/client/views/SSCell/',
  'SSEditableTextCell': '/client/views/SSEditableTextCell/',
  'SSTabView': '/client/views/SSTabView/',
  'SSTableView': '/client/views/SSTableView/',
  'SSTableRow': '/client/views/SSTableRow/',
  'SSConsole': '/client/views/SSConsole/'
};

  // path to user defined view controllers
ShiftSpaceUserClassPaths = {
  'SSCustomTableRow': '/client/customViews/SSCustomTableRow/' // TODO: change this to point to the real folder - David
};