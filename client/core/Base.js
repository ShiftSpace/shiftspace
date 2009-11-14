// ==Builder==
// ==/Builder==

var __server = '%%SERVER%%';
var __env = '%%ENV_NAME%%';

// new additions for Sandalphon
ShiftSpaceUI = {}; // holds all UI class objects
ShiftSpaceObjects = new Hash(); // holds all instantiated UI objects
ShiftSpaceNameTable = new Hash(); // holds all instantiated UI object by CSS id

var __sys__ = %%SYSTEM_TABLE%%;
var __sysavail__ = {
  files: [],
  packages: []
};

var __membermemo = {};
function $memberof(_subclass, superclass)
{
  if(_subclass == superclass) return true;
  
  var subclass = ($type(_subclass) == 'object' && _subclass.name) || _subclass;
  var tag = subclass+':'+superclass;
  
  // check memo
  if(__membermemo[tag] != null) 
  {
    return __membermemo[tag];
  }
  
  // check deps
  var deps = __sys__.files[subclass].dependencies;
  if(deps == null || deps.length == 0) return false;
  var memberof = false;
  
  if(deps.contains(superclass))
  {
    // memoize
    __membermemo[tag] = true;
    return true;
  }
  
  // each dep
  for(var i = 0, l = deps.length; i < l; i++)
  {
    if($memberof(deps[i], superclass)) return true;
  }
  
  // memoize
  __membermemo[tag] = false;
  return false;
}