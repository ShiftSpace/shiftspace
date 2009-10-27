// ==Builder==
// @required
// @package           App
// @dependencies      ApplicationServer
// ==/Builder==

var ShiftServer = new Class({

  Extends: ApplicationServer,
  name: "ShiftServer",

  getId: function() { return this.name; },

  defaults: function()
  {
    return $merge(this.parent(), {
      server: SSInfo().server+'server/'
    });
  },
  
  
  initialize: function(options) {
    __ssapplication = this;
    this.parent(options);
    SSAddObserver(this, 'onUserLogin', this.onLogin.bind(this));
    SSAddObserver(this, 'onUserJoin', this.onLogin.bind(this));
    SSAddObserver(this, 'onUserLogout', this.onLogout.bind(this));
    SSAddObserver(this, 'onUserQuery', this.onQuery.bind(this));
  },
  
  
  initTables: function()
  {
    new SSTable("AllShifts", {
      resource: {create:'shift', read:'shifts', update:'shift', 'delete':'shift'},
      watches: [
        {
          events: [
            {resource:"shift", method:"create"},
            {resource:"shift", action:"favorite"},
            {resource:"shift", action:"unfavorite"}
          ],
          handlers: [
            function(shift) { SSApplication().setDocument(this.getName(), shift); }
          ]
        },
        {
          events: [
            {resource:"shift", method:"create"},
            {resource:"shift", method:"update"},
            {resource:"shift", method:"delete"},
            {resource:"shift", action:"comment"},
            {resource:"shift", action:"publish"},
            {resource:"shift", action:"unpublish"},
            {resource:"shift", action:"favorite"},
            {resource:"shift", action:"unfavorite"}
          ],
          handlers: [SSTable.dirtyTheViews]
        }
      ]
    });
  },
  
  
  favoriteTransform: function(data)
  {
    var content = data.content;
    data.summary = content.text;
    return data;
  },


  commentTransform: function(data)
  {
    var content = data.content;
    data.userName = content.user.userName;
    data.space = content.shift.space;
    data.href = content.href;
    data.domain = content.domain;
    data.text = content.text;
    return data;
  },
  
  
  initUserTables: function()
  {
    new SSTable("MyShifts", {
      resource: {read:'user/'+ShiftSpaceUser.getUserName()+'/shifts', update:'shift', 'delete':'shift'},
      watches: [
        {
          events: [{resource:"shift", method:"create"}],
          handlers: [function(shift) { SSApplication().setDocument(this.getName(), shift); }]
        },
        {
          events: [{resource:"shift", method:"create"},
                   {resource:"shift", method:"update"},
                   {resource:"shift", method:"delete"},
                   {resource:"shift", action:"comment"},
                   {resource:"shift", action:"publish"},
                   {resource:"shift", action:"unpublish"}],
          handlers: [SSTable.dirtyTheViews]
        }
      ]
    });

    new SSTable("Favorites", {
      resource: {read:'user/'+ShiftSpaceUser.getUserName()+'/favorites'},
      transforms: [this.favoriteTransform],
      watches: [
        {
          events: [{resource:"shift", action:"favorite"},
                   {resource:"shift", action:"unfavorite"}],
          handlers: [SSTable.dirtyTheViews]
        }
      ]
    });

    new SSTable("MyComments", {
      resource: {read:'user/'+ShiftSpaceUser.getUserName()+'/comments'},
      transforms: [this.commentTransform],
      watches: [
        {
          events: [{resource:"shift", action:"comment"}],
          handlers: [SSTable.dirtyTheViews]
        }
      ]
    });
  },

  
  login: function(userData)
  {
    userData = $H(userData).extract(['userName', 'password'], true);
    return this.post({action:"login", data:userData});
  },
  
  
  onLogin: function()
  {
    this.initUserTables();
  },
  

  logout: function()
  {
    return this.post({action:"logout"});
  },
  
  
  onLogout: function()
  {
    
  },
  

  join: function(userData)
  {
    userData = $H(userData).extract(['userName', 'email', 'password', 'passwordVerify'], true);
    return this.post({action:"join", data:userData, json: true});
  },
  
  
  onJoin: function()
  {
    
  },
  
  
  query: function()
  {
    return this.get({action:"query"});
  },
  
  
  onQuery: function()
  {
    
  },
  
  
  shifts: function()
  {
    return this.get({action:"shifts", data:{href:window.location.href}});
  }

});

var __ssapplication = null;
function SSApplication()
{
  if(!__ssapplication) return new ShiftServer();
  return __ssapplication;
}