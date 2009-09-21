// ==Builder==
// @required
// @package           App
// @dependencies      ApplicationServer
// ==/Builder==

var ShiftServer = new Class({

  Extends: ApplicationServer,
  name: "ShiftServer",


  defaults: function()
  {
    return $merge(this.parent(), {
      server: SSInfo().server+'server/'
    });
  },


  initialize: function(options)
  {
    this.parent(options);
  },

  
  login: function(userData)
  {
    userData = $H(userData).extract(['userName', 'password'], true);
    return this.post({action:"login", data:userData});
  },
  

  logout: function()
  {
    return this.post({action:"logout"});
  },
  

  join: function(userData)
  {
    userData = $H(userData).extract(['userName', 'email', 'password', 'passwordVerify'], true);
    return this.post({action:"join", data:userData, json: true});
  },
  
  
  query: function()
  {
    return this.get({action:"query"});
  },
  
  
  shifts: function()
  {
    return this.get({action:"shifts", data:{href:window.location.href}});
  }

});

var __ssapplication = null;
function SSApplication()
{
  if(!__ssapplication) __ssapplication = new ShiftServer();
  return __ssapplication;
}