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
    
    // add subview class for CSS styling reasons
    if(this.options.subViewSelector != '.SSSubView')
    {
      this.getRawSubViews().each(function(x) { 
        if(!x.hasClass('SSSubView')) x.addClass('SSSubView'); 
      });
    }
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
    return this.element.getElement('> ' + this.options.subViewSelector + '.SSActive');
  },
  

  getCurrentView: function()
  {
    return SSControllerOrNode(this.getRawCurrentView());
  },
  
  
  getViewByIndex: function(idx)
  {
    return this.element.getElements('> ' + this.options.subViewSelector)[idx];
  },
  
  
  indexOfView: function(_view)
  {
    var view = (SSIsController(_view) && _view.element) || _view;
    return this.getRawSubViews().indexOf(view);
  },
  

  showView: function(idx)
  {
    // TODO: throw an error, if index too great! - David
    
    // hide the old view
    var el = this.getRawCurrentView();
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
    el = this.getViewByIndex(idx);
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