var ShiftServer = new Class({

  Extends: ApplicationServer,
  name: "ShiftServer",


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
    return this.post({action:"join", data:fakemary, json: true});
  }

});