// ==Builder==
// @required
// @package           System_
// ==/Builder==

// Internal Error Logging, trust me, you don't need this - kisses ShiftSpace Core Robot
var SSNoLogging = 0;

var SSLogMessage        = 1,
    SSLogError          = 1 << 1,
    SSLogWarning        = 1 << 2,
    SSLogPlugin         = 1 << 3,
    SSLogServerCall     = 1 << 4,
    SSLogSpaceError     = 1 << 5,
    SSLogShift          = 1 << 6,
    SSLogSpace          = 1 << 7,
    SSLogViews          = 1 << 8,
    SSLogSandalphon     = 1 << 9,
    SSLogForce          = 1 << 10,
    SSInclude           = 1 << 11,
    SSLogViewSystem     = 1 << 12;
    SSLogSystem         = 1 << 13;

var SSLogAll = 0xfffffff;           // All bits on (if we have at most 32 types)
var __ssloglevel = SSNoLogging;

/*
Function: log
  Logs a message to the console, but only in debug mode or when reporting
  errors.

Parameters:
  msg - The message to be logged in the JavaScript console.
  verbose - Force the message to be logged when not in debug mode.
*/
function SSLog() 
{
  var type = $A(arguments).getLast();
  var args = $A(arguments).drop(1);
  if (typeof console == 'object' && SSLog) 
  {
    if(__ssloglevel == SSLogAll || (type && (__ssloglevel & type)) || 
       type == SSLogForce || 
       type == SSLogError ||
       type == SSLogWarning)
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
  } 
  else if (typeof GM_log != 'undefined') 
  {
    GM_log.apply(null, args);
  }
}

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
