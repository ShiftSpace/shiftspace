// ==Builder==
// @optional
// @name              PersistenceFunctions
// @package           Core
// ==/Builder==

/*
Function: SSSetValue
  A wrapper function for GM_setValue that handles non-string data better.

Parameters:
  key - A unique string identifier
  value - The value to store. This will be serialized by uneval() before
          it gets passed to GM_setValue.

Returns:
    The value passed in.
*/
function SSSetValue(key, value, rawValue) 
{
  SSLog('SSSetValue ' + key, SSLogForce);
  if (rawValue) 
  {
    GM_setValue(key, value);
  } 
  else 
  {
    GM_setValue(key, JSON.encode(value));
  }
  return value;
}

/*
Function: SSGetValue (private, except in debug mode)
  A wrapper function for GM_getValue that handles non-string data better.

Parameters:
  key - A unique string identifier
  defaultValue - This value will be returned if nothing is found.
  rawValue - Doesn't use Json encoding on stored values

Returns:
  Either the stored value, or defaultValue if none is found.
*/
function SSGetValue(key, defaultValue, rawValue)
{
  if (!rawValue) 
  {
    defaultValue = JSON.encode(defaultValue);
  }
  var result = GM_getValue(key, defaultValue);
  var temp = JSON.decode(result);

  if(temp == null || temp == 'null') result = null;
  
  if (result == null) 
  {
    SSLog('is null SSGetValue("' + key + '") = ' + JSON.decode(defaultValue), SSLogForce);
    return JSON.decode(defaultValue);
  } 
  else if (rawValue) 
  {
    SSLog('raw value SSGetValue("' + key + '") = ' + result, SSLogForce);
    return result;
  } 
  else 
  {
    SSLog('real value SSGetValue("' + key + '") = ...' + JSON.decode(result), SSLogForce);
    return JSON.decode(result);
  }
}


/*
  Function: SSSetPref
    Set a user preference. Implicitly calls SSSetValue which will JSON encode the value.

  Parameters:
    pref - the preference name as string.
    value - the value.

  See Also:
    SSSetValue
*/
function SSSetPref(pref, value)
{
  if(ShiftSpace.User.isLoggedIn())
  {
    var key = [ShiftSpace.User.getUsername(), pref].join('.');
    SSSetValue(key, value);
  }
}

/*
  Function: SSGetPref
    Return a user preference.  Implicity calls SSGetValue which will JSON decode the value.

  Parameters:
    pref - the preference key as a string.
    defaultValue - the defaultValue if this preference does not exist.

  Returns:
    A JSON object.
*/
function SSGetPref(pref, defaultValue)
{
  if(ShiftSpace.User.isLoggedIn())
  {
    var key = [ShiftSpace.User.getUsername(), pref].join('.');
    return SSGetValue(key, defaultValue);
  }
  return defaultValue;
}