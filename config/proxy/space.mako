var Space = new Class({
  Implements: [Events, Options],

  intialize: function(options) {
     this.target = $('proxy-frame').contentWindow;
  },

  % for method in methods
  ${method} : function () {
     this.target.postMessage("call", JSON.encode({
       method: "${method}",
       args: $A(arguments)
     });
  },
  % endfor
});
