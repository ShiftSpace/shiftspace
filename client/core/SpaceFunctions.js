// ==Builder==
// @optional
// @name              SpaceFunctions
// @package           Core
// ==/Builder==

var __spaces = $H();
var __focusedSpace = null;
var __defaultSpaces = null;
var __installedSpaces = null;

/*
Function: SSSpaceIsLoaded
  Check whether a space has actually been loaded.

Parameters:
  spaceName - a space name.

Returns:
  boolean.
*/
function SSSpaceIsLoaded(spaceName)
{
  return __spaces[spaceName] != null; 
}

/*
Function: SSLoadSpace
  Loads the space's source code, evals it and stores an instance of the
  space class in __spaces by name.

Parameters:
  spaceName - the Space name to load

Returns:
  a promise or the space instance.
*/
function SSLoadSpace(spaceName)
{
  if(spaceName && SSSpaceIsLoaded(spaceName))
  {
    return SSSpaceForName(spaceName);
  }
  else if(spaceName)
  {
    var url = String.urlJoin(SSURLForSpace(spaceName), spaceName + '.js');
    var codep = SSLoadFile(url);
    var cssp = SSLoadStyle(SSGetSpaceAttributes(spaceName).css);
    var spacep = $if($and(SSApp.noErr(codep), SSApp.noErr(cssp)),
        function() {
          try
          {
            var space = SSRegisterSpace(ShiftSpace.__externals.evaluate('(function(){'+codep.value()+' return '+spaceName+';})()'));
          }
          catch(exc)
          {
            console.error('Error loading ' + spaceName + ' Space - ' + SSDescribeException(exc));
            //throw exc;
          }
          SSPostNotification("onSpaceLoad", space);
	  return space;
        });
    return spacep;
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
  var spaceName = instance.name;
  SSSetSpaceForName(instance, spaceName);
  instance.addEvent('onShiftUpdate', SSSaveShift.bind(this));
  var spaceDir = SSURLForSpace(spaceName);

  // This exposes each space instance to the console
  if (typeof ShiftSpaceSandBoxMode != 'undefined') 
  {
    ShiftSpace[instance.attributes().name + 'Space'] = instance;
  }

  instance.addEvent('onShiftHide', function(id) {
    SSPostNotification('onShiftHide', id);
  });
  instance.addEvent('onShiftShow', function(id) {
    SSPostNotification('onShiftShow', id);
  });
  instance.addEvent('onShiftBlur', function(id) {
    SSBlurShift(SSSpaceForShift(id), SSGetShift(id));
    SSPostNotification('onShiftBlur', id);
  });
  instance.addEvent('onShiftFocus', function(id) {
    SSFocusShift(SSSpaceForShift(id), SSGetShift(id));
    SSPostNotification('onShiftFocus', id);
  });
  instance.addEvent('onShiftSave', function(id) {
  });

  return instance;
}

/*
Function: SSIsAbsoluteURL
  Test a string to see if it is an absolute url.

Parameters:
  string - a string to test.

Returns:
  boolean.
*/
function SSIsAbsoluteURL(string)
{
  return (string.search("http://") == 0);
}

/*
  Function: SSLoadDefaultSpacesAttributes
    Loads all the attrs.json files for the default spaces. Only call if this is
    the first time ShiftSpace has been launched.

  Returns:
    An promise of promises for the attrs.json files for all the default spaces.
*/
function SSLoadDefaultSpacesAttributes()
{
  var defaultSpaces = {};
  var ps = []
  __defaultSpacesList.length.times(function(i) {
    var spaceName = __defaultSpacesList[i];
    var p = SSLoadSpaceAttributes(spaceName);
    ps.push(p);
    $if(SSApp.noErr(p),
        function() {
          var attrs = p.value();
          defaultSpaces[spaceName] = attrs;
          defaultSpaces[spaceName].position = i;
          if(i == (__defaultSpacesList.length-1)) 
          {
            SSInitDefaultSpaces(defaultSpaces);
            SSPostNotification("onDefaultSpacesAttributesLoad", defaultSpaces);
          }
        },
        function() {
          SSLog("Error attempting to load attributes for " + spaceName + ".", SSLogError);
        });
  });
  return new Promise(ps);
}

/*
Function: SSLoadSpaceAttributes
  Loads the attributes for the space. This is a json file named attrs.json
  that sits in that space's directory.
  
Returns:
  A Promise.
*/
function SSLoadSpaceAttributes(spaceName)
{
  var p = SSLoadFile(String.urlJoin(ShiftSpace.info().spacesDir, spaceName, 'attrs.json'));
  var p2 = $if(p,
               function() {
                 // check to see that the resources urls are full
                 var json = JSON.decode(p.value());
                 if(!json.name) throw new SSException("No name for " + json.name + " space specified.");
                 if(json.url) json.url = json.url.trim();
                 if(!json.url)
		 {
		   json.url = String.urlJoin(ShiftSpace.info().spacesDir, spaceName);
		 }
		 else if(!SSIsAbsoluteURL(json.url)) 
		 {
		   throw new SSException(spaceName + " attr.json defines url which is not absolute.");
		 }
                 if (!json.icon) json.icon = String.urlJoin(json.url, json.name + '.png');
                 // clear whitespace
                 if(json.icon) json.icon = json.icon.trim();
                 if(json.css) json.css = json.css.trim();
                 if(!SSIsAbsoluteURL(json.icon)) json.icon = String.urlJoin(json.url, json.icon);
                 if(!SSIsAbsoluteURL(json.css)) json.css = String.urlJoin(json.url, json.css);
                 // position default to end
                 json.position = $H(SSInstalledSpaces()).getLength();
                 return json;
               });
  return p2;
}

/*
Function: SSGetSpaceAttributes
  Returns the attrs.json data for the space. The space must be installed.

Parameters:
  spaceName - the space name as a string.

Returns:
  A JSON object representing a spaces attrs.json file.
*/
function SSGetSpaceAttributes(spaceName)
{
  return SSInstalledSpaces()[spaceName];
}

/*
Function: SSInstallSpace
  Loads the JavaScript source of a Space, then loads the space into memory.
  The source URL is saved in the 'installed' object for future reference.

Parameters:
  space - The name of the space to install.
*/
function SSInstallSpace(space)
{
  if(!SSURLForSpace(space))
  {
    var url = String.urlJoin(SSInfo().spacesDir, space, space + '.js');
    var count = $H(SSInstalledSpaces()).getLength();
    var p = SSLoadSpaceAttributes(space);
    $if(p,
	function(attrs) {
	  // TODO: throw an error if no attributes file - David
	  if(!attrs)
	  {
            var attrs = {
              url:url, 
              name:space, 
              position: count, 
              icon: space+'/'+space+'.png',
              autolaunch: false
            };
	  }
	  
	  var installed = SSInstalledSpaces();
	  installed[space] = attrs;
	  
	  SSSetInstalledSpaces(installed);
	  var p = SSLoadSpace(space);
	  $if(p,
	      function() { 
		alert(space + " space installed.");
		SSPostNotification('onSpaceInstall', space); 
	      });
	});
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
  var url = SSURLForSpace(spaceName);
  SSRemoveSpace(spaceName);
  var installed = SSInstalledSpaces();

  delete installed[spaceName];

  if($H(installed).getLength() == 0)
  {
    SSSetInstalledSpaces(null);
  }
  else
  {
    SSSetInstalledSpaces(installed);
  }

  SSPostNotification('onSpaceUninstall', spaceName);
};

/*
Function: SSSetInstalledSpaces
  Set the installed spaces for a user.

Paramters:
  installed - a JSON object of space attributes.

See Also:
  SSGetSpaceAttributes, SSLoadSpaceAttributes, SSLoadDefaultSpacesAttributes
*/
function SSSetInstalledSpaces(installed)
{
  ShiftSpace.User.setInstalledSpaces(installed);
}

/*
Function: SSInstalledSpaces
  Return the JSON object of the installed spaces. Each entry
  in the object corresponds to that space's attrs.json file.

Returns:
  A JSON object.
*/
function SSInstalledSpaces()
{
  return __installedSpaces || SSDefaultSpaces();
}

/*
Function: SSUpdateInstalledSpaces
  Update the JSON object of installed spaces.

Parameters:
  controlp (optional) - can be executed asynchronously if passed a promise.
*/
var SSUpdateInstalledSpaces = function(controlp)
{
  __installedSpaces = ShiftSpace.User.installedSpaces();
}.asPromise()

/*
Function: SSInitDefaultSpaces
  Initializes the list of default space attributes.

Parameters:
  defaults - a JSON object of space attributes by space name.
*/
function SSInitDefaultSpaces(defaults)
{
  if(defaults) { SSSetValue('defaultSpaces', defaults); }
  __defaultSpaces = defaults || SSGetValue('defaultSpaces');
}

/*
Function: SSDefaultSpaces
  Returns JSON object of the default spaces attributes.

Returns:
  A JSON object of the default space attributes.
*/
function SSDefaultSpaces()
{
  return __defaultSpaces;
}

/*
Function: SSURLForSpace
  Returns the url for a space.

Parameters:
  spaceName - a space name.

Returns:
  Returns the url of a space.
*/
function SSURLForSpace(spaceName)
{
  var installed = SSInstalledSpaces();
  return (installed[spaceName] && installed[spaceName].url) || null;
}

/*
Function: SSUninstallAllSpaces
  Removes all the installed space attribute entries.
*/
function SSUninstallAllSpaces()
{
  for(var spaceName in SSInstalledSpaces())
  {
    SSUninstallSpace(spaceName);
  }
}

/*
  Function: SSpaceForName
    Returns the space associated with a particular name.
    
  Parameters:
    space - the name of the space.
    
  Returns:
    The space instance.
*/
var SSSpaceForName = function(name)
{
  var space = __spaces[name];
  if(space)
  {
    return space;
  }
  else
  {
    return SSLoadSpace(name);
  }
}.asPromise();

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
  __spaces[name] = space;
}

/*
Function: SSSpacesByPosition
  Returns an array of the installed space attributes sorted by
  position. Used in conjunction with SSSpacesMenu

Returns:
  An array of space attributes.
*/
function SSSpacesByPosition()
{
  var spaces = SSInstalledSpaces();
  var result = [];
  $H(spaces).each(function(v, k) {
    result.push(v);
  });
  result.sort(function(a, b) {
    return a.position - b.position;
  });
  return result;
}

/*
Function: SSSpacesByPosition
  Return the space attribute for the specified position. Used
  in conjunction with SSSpacesMenu
*/
function SSSpaceForPosition(index)
{
  return SSSpaceForName(SSSpacesByPosition()[index].name);
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
  delete __spaces[name];
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
  for(var space in __spaces) length++;
  return length;
}

/*
Function: SSAllSpaces
  Return the JSON object of the attributes of all the currently installed spaces.
*/
function SSAllSpaces()
{
  return __spaces;
}

/*
SSFocusSpace
Focuses a space.

Parameter:
  space - a ShiftSpace.Space instance
*/
function SSFocusSpace(space, position)
{
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
  return __focusedSpace;
}

/*
  Function: SSSetFocusedSpace
    Should never be called

  Parameters:
    newSpace - a space object.
*/
function SSSetFocusedSpace(newSpace)
{
  __focusedSpace = newSpace;
}

/*
  Function: SSSpaceForShift
    Returns the space singleton for a shift.

  Parameters:
    shiftId - a shift id.

  Returns:
    The space singleton.
*/
function SSSpaceForShift(id)
{
  var shift = SSGetShift(id);
  var spaceName = (Promise.isPromise(shift)) ? shift.get('space', 'name') : shift.space.name;
  return SSSpaceForName(spaceName);
}

/*
*/
function SSSpaceNameForShift(shiftId)
{
  var shift = SSGetShift(shiftId);
  return shift.space.name;
}

/*
Function: SSCheckForInstallSpaceLinks
  Check the page for links that trigger space install.
*/
function SSCheckForInstallSpaceLinks()
{
  $$('.SSInstallFirstLink').setStyle('display', 'none');
  $$('.SSInstallSpaceLink').each(function(x) {
    x.setStyle('display', 'block');
    x.addEvent('click', SSHandleInstallSpaceLink);
  });
}

/*
Function: SSHandleInstallSpaceLink
  Handle user click on a space install link.

Parameters:
  evt - the browser click event.
*/
function SSHandleInstallSpaceLink(evt)
{
  evt = new Event(_evt);
  var target = evt.target;
  var spaceName = target.getAttribute('title');
  // first check for the attributes file
  SSInstallSpace(spaceName);
}