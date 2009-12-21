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
            {resource:"shift", action:"unfavorite"},
            {resource:"shift", action:"comment"}
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

    new SSTable("DomainShifts", {
      resource: {create:'shift', read:'shifts', update:'shift', 'delete':'shift'},
      watches: [
        {
          events: [
            {resource:"shift", method:"create"},
            {resource:"shift", action:"favorite"},
            {resource:"shift", action:"unfavorite"},
            {resource:"shift", action:"comment"}
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

    new SSTable("GroupShifts", {
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
          events: [{resource:"shift", action:"favorite"}],
          handlers: [function(shift) { SSApplication().setDocument(this.getName(), shift); }]
        },
        {
          events: [{resource:"shift", action:"unfavorite"}],
          handlers: [function(shift) { SSApplication().deleteFromCache(shift._id, this.getName()); }]
        },
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
          events: [{resource:"message", action:"read"},
                   {resource:"message", action:"unread"}],
          handlers: [SSTable.dirtyTheViews]
        }
      ]
    });

    new SSTable("Following", {
      resource: {read:'user/'+ShiftSpaceUser.getUserName()+'/following'},
      watches: [
        {
          events: [{resource:"user", action:"follow"}],
          handlers: [function(user) { SSApplication().setDocument(this.getName(), user); }]
        },
        {
          events: [{resource:"user", action:"unfollow"}],
          handlers: [function(user) { SSApplication().deleteFromCache(user._id, this.getName()); }]
        },
        {
          events: [{resource:"user", action:"follow"},
                   {resource:"user", action:"unfollow"}],
          handlers: [SSTable.dirtyTheViews]
        }
      ]
    });

    new SSTable("Followers", {
      resource: {read:'user/'+ShiftSpaceUser.getUserName()+'/followers'},
      watches: [
        {
          events: [{resource:"user", action:"follow"},
                   {resource:"user", action:"unfollow"}],
          handlers: [SSTable.dirtyTheViews]
        }
      ]
    });

    new SSTable("Users", {
      resource: {read:'users'},
      watches: [
        {
          events: [{resource:"user", action:"follow"},
                   {resource:"user", action:"unfollow"}],
          handlers: [SSTable.dirtyTheViews]
        }
      ]
    });

    new SSTable("Groups", {
      resource: {read:'groups'},
      watches: [
        {
          events: [{resource:"group", method:"create"},
                   {resource:"group", method:"update"}],
          handlers: [SSTable.dirtyTheViews]
        }
      ]
    });

    new SSTable("MyGroups", {
      resource: {read:'user/'+ShiftSpaceUser.getUserName()+'/groups'},
      watches: [
        {
          events: [{resource:"group", method:"create"}],
          handlers: [function(group) { SSApplication().setDocument(this.getName(), group); }]
        },
        {
          events: [{resource:"group", method:"create"},
                   {resource:"group", method:"update"}],
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
    // wipe out user specific tables
    ["FollowShifts",
     "GroupShifts",
     "MyShifts",
     "MyComments",
     "Favorites",
     "Messages",
     "Following",
     "Followers",
     "Users",
     "Groups",
     "MyGroups"].each(SSDeleteTable);
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