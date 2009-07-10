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
var ResourceDoesNotExistError = "ResourceDoesNotExistError";

var ack = JSON.encode({"message":"ok"});

var noteShift = {
  space: "Notes",
  position: {x:150, y:150},
  size: {x:200, y:200},
  summary: "Foo!",
  text: "Hello world!"
};

var fakemary = {
  userName: "fakemary",
  email: "fakemary@gmail.com",
  password:"foobar",
  passwordVerify:"foobar"
};

var admin = {
  userName: 'shiftspace',
  email: 'info@shiftspace.org',
  password: 'changetheweb',
  passwordVerify: 'changetheweb'
};

function req(options)
{
  options.async = false;
  options.emulation = false;
  options.url = (server + options.url);
  options.url = (options.resourceId) ? options.url + '/' + options.resourceId : options.url;
  
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

function SSGetData(json)
{
  return json.data;
}


function SSGetType(json)
{
  return json.type;
}


var CouchDBApp = new Class({
  create: function(type, data)
  {
    var result;
    req({
      url:'/'+type,
      method: 'post',
      data: data,
      json: true,
      onComplete: function(json)
      {
        result = json;
      }
    });
    return result;
  },
  
  read: function(type, id)
  {
    var result;
    req({
      url:'/'+type,
      resourceId: id,
      method: 'get',
      onComplete: function(json)
      {
        result = json;
      }
    });
    return result;
  },
  
  update: function(type, id, data)
  {
    var result;
    req({
      url:'/'+type,
      resourceId: id,
      method: 'put',
      data: data,
      json: true,
      onComplete: function(json)
      {
        result = json;
      }
    });
    return result;
  },
  
  delete: function(type, id)
  {
    var result;
    req({
      url:'/'+type,
      resourceId: id,
      method: 'delete',
      onComplete: function(json)
      {
        result = json;
      }
    });
    return result;
  },
  
  action: function(url, data)
  {
    var result;
    req({
      url:'/'+url,
      method: 'post',
      json: true,
      data: data,
      onComplete: function(json)
      {
        result = json;
      }
    });
    return result;
  }
});

var app = new CouchDBApp();

function adminJoin()
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
    }
  });
}

function login(user)
{
  var result;
  req({
    url: "/login",
    method: 'post',
    data:
    {
      userName: user.userName,
      password: user.password
    },
    onComplete: function(json)
    {
      result = json;
    }
  });
  return result;
}

function logout()
{
  return app.action('logout');
}