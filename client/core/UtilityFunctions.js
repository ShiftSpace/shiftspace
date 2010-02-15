// ==Builder==
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
  // DELETE - superseded by attrs.json - David 10/10/09
  if (spaceName) 
  {
    var defaults = {
      title: spaceName,
      icon: __server + 'images/unknown-space.png',
      version: '1.0'
    };
    if (!SSURLForSpace(spaceName)) 
    {
      defaults.unknown = true;
      return defaults;
    }
    // TODO - this must be fixed, we need to cache space attributes, the only way to capture the icon for a space! - David 5/13/09
    defaults.icon = String.urlJoin(__spacesPath, spaceName, spaceName + '.png');
    var spaceInfo = $merge(defaults, {});
    delete spaceInfo.name; // No need to send this back
    spaceInfo.url = SSURLForSpace(spaceName);
    return spaceInfo;
  }

  if(typeof SandalphonToolMode == 'undefined' && 
     typeof SSInstalledSpaces != 'undefined')
  {
    var spaceIndex = [];
    for (var aSpaceName in SSInstalledSpaces()) 
    {
      spaceIndex.push(aSpaceName);
    }
  }

  var info =  {
    server: __server,
    mediaPath: __mediaPath,
    imagesPath: __imagesPath,
    spacesPath: (typeof __spacesPath != 'undefined' && __spacesPath) || null,
    spaces: (spaceIndex && spaceIndex.join(', ')) || null,
    version: (typeof version != 'undefined' && version) || null,
    build: {
      name: __name,
      rev: __build
    }
  };

  return (typeof ShiftSpaceProxyMode == 'undefined') ? $merge(info, {env: __env}) : info;
};

// ===============================
// = Function Prototype Helpers  =
// ===============================

Function.prototype.safeCall = function() {
  var bind = $A(arguments).first(),
      args = $A(arguments).rest(),
      self = this;
  setTimeout(function() {
    return self.apply(bind, args);
  }, 0);
};

/*
  Function: Function.prototype.safeCallWithResult
    You only need to use this if the function you're calling
    doesn't already return a value via callback.
*/
Function.prototype.safeCallWithResult = function() {
  var bind = $A(arguments).first(),
      callback = $A(arguments).second(),
      args = $A(arguments).rest(2),
      self = this;
  setTimeout(function() {
    callback(self.apply(bind, args));
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

var __dragDiv;
function SSCreateDragDiv()
{
  __dragDiv = new ShiftSpace.Element('div', {
    id: 'SSDragDiv'
  });
  __dragDiv.addEvent('mouseup', SSRemoveDragDiv);
}

function SSAddDragDiv()
{
  $(document.body).grab(__dragDiv);
}

function SSRemoveDragDiv()
{
  if(__dragDiv && $(__dragDiv).getParent()) __dragDiv = $(__dragDiv).dispose();
}

function SSHasResource(resourceName)
{
  return __sysavail__.files.contains(resourceName) || __sysavail__.packages.contains(resourceName);
}

function SSResourceExists(resourceName)
{
  return __sys__.files[resourceName] != null || __sys__.packages[resourceName] != null;
}

function SSResetCore()
{
  // reset all internal state
  __spaces = {};
}
