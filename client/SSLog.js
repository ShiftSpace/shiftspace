// ==Builder==
// @required
// @name              SSLog
// @package           System_
// @dependencies      GreaseMonkeyApi
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
var __ssloglevel__ = SSNoLogging;

/*
Function: log
  Logs a message to the console, but only in debug mode or when reporting
  errors.

Parameters:
  msg - The message to be logged in the JavaScript console.
  verbose - Force the message to be logged when not in debug mode.
*/
function SSLog(msg, type) 
{
  if (typeof console == 'object' && SSLog) 
  {
    var messageType = '';

    if(type == SSLogError)
    {
      messageType = 'ERROR: ';
    }
    
    if(type == SSLogWarning)
    {
      messageType = 'WARNING: ';
    }
    
    if(__ssloglevel__ == SSLogAll || (type && (__ssloglevel__ & type)) || type == SSLogForce)
    {
      if($type(msg) != 'string')
      {
        console.log(msg);
      }
      else
      {
        console.log(messageType + msg);
      }
    }
  } 
  else if (typeof GM_log != 'undefined') 
  {
    GM_log(msg);
  } 
  else 
  {
    setTimeout(function() {
      throw(msg);
    }, 0);
  }
}

function SSSetLogLevel(level)
{
  SSLog('SSSetLogLevel ' + level);
  __ssloglevel__ = level;
}
