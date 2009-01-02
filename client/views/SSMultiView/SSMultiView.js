// ==Builder==
// @required
// @uiclass
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==


var SSMultiView = new Class({

  Extends: SSView,

  name: "SSMultiView",
  
  defaults: function()
  {
    return $merge(this.parent(), {
      subViewSelector: '.SSSubView'
    });
  },
  

  initialize: function(el, options)
  {
    this.parent(el, options);
  },
  
  
  getRawSubViews: function()
  {
    return this.element.getElements('> ' + this.options.subViewSelector);
  },
  
  
  getSubViews: function()
  {
    return this.getRawSubViews().map(function(x) { return SSControllerOrNode(x); });
  },
  
  
  getRawCurrentView: function()
  {
    return this.element.getElement('> ' + this.option.subViewSelector + '.SSActive');
  },
  

  getCurrentView: function()
  {
    return SSControllerOrNode(this.getRawCurrentView());
  },
  

  showView: function(idx)
  {
    // hide the old view
    var el = this.element.getElement('> .SSActive');
    var controller = SSControllerForNode(el);
    if(controller)
    {
      controller.hide();
    }
    else
    {
      el.removeClass('SSActive');
    }
    
    // show the new view
    el = this.element.getElements(this.options.subViewSelector)[idx];
    controller = SSControllerForNode(el);
    if(controller)
    {
      controller.show();
    }
    else
    {
      el.addClass('SSActive');
    }
  },
  
  
  showViewByName: function(name)
  {
    this.showView(this.element.getChildren().indexOf(this.element.getElement('> #'+name)));
  }

});