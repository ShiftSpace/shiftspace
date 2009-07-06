window.addEvent('domready', init);

var server = "../shiftserver";

var ops = {
  '/query':                 {method:'get'},
  '/join':                  {method:'post'},
  '/login':                 {method:'post'},
  '/logout':                {method:'post'},
  '/user/update':           {method:'put', json:true},
  '/user/{userName}':       {method:'get'}
}

function req(op, options)
{
  opData = ops[op];

  options.method = opData.method;
  options.async = true;
  options.url = (server + op);

  if(opData.json) options['Content-Type'] = 'application/json';
  
  if(opData.json)
  {
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
  req('/query', {
    onComplete: function(json) 
    {
      console.log(json);
      if(next && $type(next) == 'function') next();
    }
  });
}

function login(next)
{
  req('/login', {
    data: {userName:"dnolen", password:"foobar"},
    onComplete: function(json) 
    {
      console.log(json);
      if(next && $type(next) == 'function') next();
    }
  });
}

function logout(next)
{
  req('/logout', {
    onComplete: function(json) 
    {
      console.log(json);
      if(next && $type(next) == 'function') next();
    }
  });
}