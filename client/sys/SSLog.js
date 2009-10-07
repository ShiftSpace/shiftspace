// ==Builder==
// @required
// ==/Builder==

// Internal Error Logging, trust me, you don't need this - kisses ShiftSpace Core Robot
var SSNoLogging = 0;

/*
  Constants: Logging levels
    SSNoLogging - log nothing
    SSLogError - log errors
    SSLogWarning - log warninggs
    SSLogRequest - log remote requests
    SSLogForce - force logging
    SSLogInclude - log file includes
    SSLogSystem - system level logging
    SSLogAll - log everything
 */
var SSLogMessage        = 1,
    SSLogError          = 1 << 1,
    SSLogWarning        = 1 << 2,
    SSLogRequest        = 1 << 4,
    SSLogForce          = 1 << 10,
    SSInclude           = 1 << 11,
    SSLogSystem         = 1 << 13;

var SSLogAll = 0xfffffff;           // All bits on (if we have at most 32 types)
var __ssloglevel = SSNoLogging;

/*
Function: SSLog
  Logs a message to the console, but only in debug mode or when reporting
  errors. Takes a variable list of arguments, the last of which is the type
  of logging to done.
*/
function SSLog()
{
  var type = $A(arguments).getLast();
  var args = $A(arguments).slice(0, arguments.length-1);
  if(__ssloglevel == SSLogAll || (type && (__ssloglevel & type)) || 
     type == SSLogForce || 
     type == SSLogError ||
     type == SSLogWarning)
  {
    if(typeof ShiftSpaceSandBoxMode != 'undefined')
    {
       if(!Browser.Engine.webkit)
       {
         if(type == SSLogError)
         {
           console.error.apply(null, args);
         }
         else if(type == SSLogWarning)
         {
           console.warn.apply(null, args);
         }
         else
         {
           console.log.apply(null, args);
         }
       }
       else
       {
         if(type == SSLogError)
         {
           console.error(args);
         }
         else if(type == SSLogWarning)
         {
           console.warn(args);
         }
         else
         {
           console.log(args);
         }
       }
    }
    else
    {
      if(type == SSLogError)
      {
	GM_log(['ERROR:'].combine(args));
      }
      else if(type == SSLogWarning)
      {
	GM_log(['WARNING:'].combine(args));
      }
      else
      {
	GM_log(args);
      }
    }
  } 
}

/*
  Function: SSSetLogLevel
    Set the current log level. Affects all logging output.

  Parameters:
    level - a bit mask
*/
function SSSetLogLevel(level)
{
  SSLog('SSSetLogLevel ' + level);
  __ssloglevel = level;
}

if(typeof %%LOG_LEVEL%% != 'undefined')
{
  SSSetLogLevel(%%LOG_LEVEL%%);
}
else
{
  throw new Error("Bailing: No such logging level %%LOG_LEVEL%%, please fix the config/env/%%ENV_NAME%%.json file.");
}
