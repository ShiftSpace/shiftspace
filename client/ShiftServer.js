var ShiftServer = new Class({

  Extends: ApplicationServer,
  name: "ShiftServer",


  defaults: function()
  {
    return $merge(this.parent(), {
      server: SSInf().server
    });
  },


  initialize: function(options)
  {
    this.parent(options);
  },

  
  login: function(userData)
  {
    return this.post({action:"login", data:userData});
  },
  

  logout: function()
  {
    return this.post({action:"logout"});
  },
  

  join: function(userData)
  {
    return this.post({action:"join", data:userData, json: true});
  }

});