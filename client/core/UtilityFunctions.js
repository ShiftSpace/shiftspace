// ==Builder==
// @optional
// @name              UtilityFunctions
// @package           Core
// ==/Builder==

// ===============================
// = Function Prototype Helpers  =
// ===============================

// This won't work for GM_getValue of course - David
Function.prototype.safeCall = function() {
  var self = this, args = [], len = arguments.length;
  for(var i = 0; i < len; i++) args.push(arguments[i]);
  setTimeout(function() {
    return self.apply(null, args);
  }, 0);
};

// Work around for GM_getValue - David
Function.prototype.safeCallWithResult = function() {
  var self = this, args = [], len = arguments.length;
  for(var i = 0; i < len-1; i++) args.push(arguments[i]);
  // the last argument is the callback
  var callback = arguments[len-1];
  setTimeout(function() {
    callback(self.apply(null, args));
  }, 0);
};

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