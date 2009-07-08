// ==Builder==
// @test
// ==/Builder==

var server = "../shiftserver";

var AlreadyLoggedInError = "AlreadyLoggedInError";
var AlreadyLoggedOutError = "AlreadyLoggedOutError";
var InvalidUserNameError = "InvalidUserNameError";
var IncorrectPasswordError = "IncorrectPasswordError";

function jsonFormat(json)
{
  return JSON.encode(JSON.decode(json));
}

var ack = jsonFormat({"message":"ok"});

function req(options)
{
  options.async = false;
  options.url = (server + options.url);
  options.url = (options.resourceId) ? options.url + '/' + options.resourceId : options.url
  
  if(options.resourceId) delete options.resourceId;

  if(options.json)
  {
    options.headers = {};
    options.headers['Content-type'] = 'application/json';
  }
  
  if(options.json)
  {
    delete options.json;
    new Request.JSON(options).send((options.data && JSON.encode(options.data)) || null);
  }
  else
  {
    new Request.JSON(options).send()
  }
}