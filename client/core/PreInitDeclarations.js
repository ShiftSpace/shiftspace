// ==Builder==
// ==/Builder==

// NOTE: This will be preprocessed by preprocess.py and replaced with the proper
// servers

var __spacesPath = '%%SPACES_PATH%%';
var __mediaPath = '%%MEDIA_PATH%%';
var __imagesPath = '%%IMAGES_PATH%%';
var __build = '%%BUILD%%';
var __name = '%%NAME%%';

SSLog('SERVER: ' + __server, SSLogForce);
SSLog('SPACES_PATH: ' + __spacesPath, SSLogForce);

var version = '1.0';

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
var alreadyCheckedForUpdate = false;