var Space = new Class({
  Implements: [Events, Options],

  intialize: function(options) {
     this.target = $('proxy-frame').contentWindow;
  },

  % for method in methods:
  ${method} : function () {
     var data = {method: "${method}", args: $A(arguments)};
     this.target.postMessage(JSON.encode(data), "${server}/safe-proxy");
  },
  % endfor
});
