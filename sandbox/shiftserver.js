window.addEvent('domready', init);

var server = "../shiftserver";

function req(options)
{
  options.async = true;
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

function init()
{
  console.log('Starting up!');
  query();
}

function query(next)
{
  req({
    url: '/query', 
    method: 'get',
    onComplete: function(json) 
    {
      console.log(json);
      if(next && $type(next) == 'function') next();
    }
  });
}

function login(next)
{
  req({
    url: '/login',
    method: 'post',
    data: {userName:"fakebob", password:"bazbaz"},
    onComplete: function(json) 
    {
      console.log(json);
      if(next && $type(next) == 'function') next();
    }
  });
}

function login2(next)
{
  req({
    url: '/login',
    method: 'post',
    data: {userName:"fakejohn", password:"barbar"},
    onComplete: function(json) 
    {
      console.log(json);
      if(next && $type(next) == 'function') next();
    }
  });
}

function logout(next)
{
  req({
    url: '/logout', 
    method: 'post',
    onComplete: function(json) 
    {
      console.log(json);
      if(next && $type(next) == 'function') next();
    }
  });
}

function join(next)
{
  req({
    url: "/join",
    method: 'post',
    json: true,
    data:
    {
      userName: 'fakebob',
      email: 'fakebob@gmail.com',
      password: 'bazbaz',
      passwordVerify: 'bazbaz'
    },
    onComplete: function(json)
    {
      console.log(json);
      if(next && $type(next) == 'function') next();
    }
  });
}

function join2(next)
{
  req({
    url: "/join",
    method: 'post',
    json: true,
    data:
    {
      userName: 'fakejohn',
      email: 'junk@gmail.com',
      password: 'barbar',
      passwordVerify: 'barbar'
    },
    onComplete: function(json)
    {
      console.log(json);
      if(next && $type(next) == 'function') next();
    }
  });
}

function deleteAccount(next)
{
  req({
    url: "/user/", 
    resourceId: "fakebob",
    method: "delete",
    onComplete: function(json)
    {
      console.log(json);
      if(next && $type(next) == 'function') next();
    }
  });
}

var shiftId = null;
function createShift(next)
{
  req({
    url: "/shift", 
    method: 'post',
    json: true,
    data: 
    {
      space:"Highlights",
      summary: "On the nytimes.com today",
      content:
      {
        range: {}
      }
    },
    onComplete: function(json)
    {
      console.log(json);
      shiftId = json.data;
      if(next && $type(next) == 'function') next();
    }
  });
}

function publishShift(next)
{
  req({
    url: "/publish",
    resourceId: shiftId,
    method: 'post',
    json: true,
    data: 
    {
      streams: [],
      private: false
    },
    onComplete: function(json)
    {
      console.log(json);
      shiftId = json.data;
      if(next && $type(next) == 'function') next();
    }
  });
}

function follow(next)
{
  req({
    url: "/follow",
    resourceId: "fakebob",
    method: 'post',
    onComplete: function(json)
    {
      console.log(json);
      if(next && $type(next) == 'function') next();
    }
  });
}