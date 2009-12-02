// ==Builder==
// @package           App
// @dependencies      ApplicationServer
// ==/Builder==

var __ssapplication = null;

function SSApplication()
{
  if(!__ssapplication) return new ShiftServer();
  return __ssapplication;
}

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


  initUserTables: function()
  {
    new SSTable("FollowShifts", {
      resource: {read:"shifts"},
      watches: [
        {
          events: [
            {resource:"shift", action:"favorite"},
            {resource:"shift", action:"unfavorite"},
            {resource:"shift", action:"comment"}
          ],
          handlers: [SSTable.dirtyTheViews]
        }
      ]
    });

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
      watches: [
        {
          events: [{resource:"shift", action:"comment"}],
          handlers: [SSTable.dirtyTheViews]
        }
      ]
    });
    
    new SSTable("Messages", {
      resource: {read:'user/'+ShiftSpaceUser.getUserName()+'/messages', 'delete':'event'},
      watches: [
        {
          events: [{resource:"event", action:"read"},
                   {resource:"event", action:"unread"}],
          handlers: [SSTable.dirtyTheViews]
        }
      ]
    });
  },

  
  login: function(userData)
  {
    return this.post({
      action:"login",
      data:{userName:userData.userName, password:userData.password}
    });
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
    // wipe out tables
    ["FollowShifts", "MyShifts", "MyComments", "Favorites", "Messages"].each(SSDeleteTable);
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