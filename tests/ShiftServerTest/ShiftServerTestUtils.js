// ==Builder==
// @test
// ==/Builder==

var server = "../shiftserver";

var AlreadyLoggedInError = "AlreadyLoggedInError";
var AlreadyLoggedOutError = "AlreadyLoggedOutError";
var InvalidUserNameError = "InvalidUserNameError";
var IncorrectPasswordError = "IncorrectPasswordError";
var UserNotLoggedInError = "UserNotLoggedInError";

var NoEmailError = "NoEmailError";
var MissingUserNameError = "MissingUserNameError";
var ShortUserNameError = "ShortUserNameError";
var UserNameAlreadyExistsError = "UserNameAlreadyExistsError";
var MissingPasswordError = "MissingPasswordError";
var MissingPasswordVerifyError = "MissingPasswordVerifyError";
var PasswordMatchError = "PasswordMatchError";
var FollowError = "FollowError";

var UserDoesNotExistError = "UserDoesNotExistError";
var PermissionError = "PermissionError";

var ack = JSON.encode({"message":"ok"});

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


function admin()
{
  req({
    url: "/join",
    method: 'post',
    json: true,
    data:
    {
      userName: 'shiftspace',
      email: 'info@shiftspace.org',
      password: 'changetheweb',
      passwordVerify: 'changetheweb'
    },
    onComplete: function(json)
    {
      console.log(json);
    }
  });
}


function adminLogin()
{
  req({
    url: "/login",
    method: 'post',
    data:
    {
      userName: 'shiftspace',
      password: 'changetheweb'
    },
    onComplete: function(json)
    {
      console.log(json);
    }
  });
}