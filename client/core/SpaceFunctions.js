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
    SSLog('loading space: ' + space, SSLogSystem);
    if (typeof ShiftSpaceSandBoxMode != 'undefined')
    {
      var url = SSURLForSpace(space) + '?' + new Date().getTime();
      SSLog('loading ' + url);
      var newSpace = new Asset.javascript(url, {
        id: space
      });

      SSLog('Direct inject ' + space, SSLogSystem);
      if(callback) callback();
    }
    else
    {
      SSLog('loading space: ' + space + ' from ' + SSURLForSpace(space), SSLogSystem);
      SSLoadFile(SSURLForSpace(space), function(rx) {
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
  SSLog("SSRegisterSpace", SSLogSystem);
  var spaceName = instance.attributes.name;
  SSLog('Register Space ===================================== ' + spaceName, SSLogSystem);
  SSSetSpaceForName(instance, spaceName);
  instance.addEvent('onShiftUpdate', SSSaveShift.bind(this));

  var spaceDir = SSURLForSpace(spaceName).match(/(.+\/)[^\/]+\.js/)[1];

  instance.attributes.dir = spaceDir;

  if (!instance.attributes.icon) 
  {
    var icon = SSURLForSpace(spaceName).replace('.js', '.png');
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
    SSLog('onShiftShow: ' + shiftId, SSLogForce);
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
  if(!SSURLForSpace(space))
  {
    var url = server + 'spaces/' + space + '/' + space + '.js';
    SSURLForSpace(space) = url;
    SSSetValue('installed', SSInstalledSpaces());
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
  var url = SSURLForSpace(spaceName);
  SSRemoveSpace(spaceName);
  delete __installed[spaceName];
  SSSetValue('installed', SSInstalledSpaces());
  SSClearCache(url);
  // let everyone else know
  SSFireEvent('onSpaceUninstall', spaceName);
};


function SSInstalledSpaces()
{
  return __installed;
}


function SSURLForSpace(spaceName)
{
  return __installed[spaceName];
}


function SSUninstallAllSpaces()
{
  for(var spaceName in SSInstalledSpaces())
  {
    SSUninstallSpace(spaceName);
  }
  SSSetValue('installed', null);
}


function SSResetSpaces()
{
}

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