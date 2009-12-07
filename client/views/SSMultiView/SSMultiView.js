// ==Builder==
// @uiclass
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

// ==============
// = Exceptions =
// ==============

var SSMultiViewError = SSException;

SSMultiViewError.NoSuchSubView = new Class({
  Extends: SSMultiViewError,
  Implements: SSExceptionPrinter,
  name: "SSMultiViewError.NoSuchSubView"
});

SSMultiViewError.OutOfBounds = new Class({
  Extends: SSMultiViewError,
  Implements: SSExceptionPrinter,
  name: "SSMultiViewError.OutOfBounds"
});

// =========
// = Class =
// =========

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
    
    this.initPivots();
    
    // add subview class for CSS styling reasons
    if(this.options.subViewSelector != '.SSSubView')
    {
      this.getRawSubViews().each(function(x) { 
        if(!x.hasClass('SSSubView')) x.addClass('SSSubView'); 
      });
    }
  },


  awake: function()
  {
    // FIXME: confusing between this and SSView.subViews() - David 12/6/09
    var svs = this.getSubViews(), self = this;
    svs.each(function(sv) {
      sv.multiView = function() {
        return self;
      };
    });
  },
  
  
  hide: function()
  {
    this.parent();
    if(this.options.defaultView)
    {
      this.showViewByName(this.options.defaultView);
    }
  },
  
  
  initPivots: function(el, options)
  {
    if(this.options.pivots)
    {
      for(selector in this.options.pivots)
      {
        this.initPivot(selector, this.options.pivots[selector]);
      }
    }
  },
  
  
  initPivot: function(selector, view)
  {
    this.element.getElements(selector).addEvent('click', function(_evt) {
      
      var evt = new Event(_evt);
      if(!this.delegate() ||
         !this.delegate().canPivot ||
          this.delegate().canPivot(this))
         
      if($type(view) == 'number') this.showView(view);
      if($type(view) == 'string') this.showViewByName(view);
      
    }.bind(this));
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
  
  
  getIndexOfCurrentView: function()
  {
    return this.getRawSubViews().indexOf(this.getRawCurrentView());
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
    if(idx >= this.getRawSubViews().length)
    {
      throw new SSMultiViewError.OutOfBounds(new Error(), "index of view out of bounds.");
    }
    
    // hide the old view
    var el = this.getRawCurrentView();
    var controller = SSControllerForNode(el);
    var oldIndex = this.getIndexOfCurrentView();
    if(controller)
    {
      controller.hide();
    }
    else
    {
      el.removeClass('SSActive');
    }
    this.fireEvent('onViewHide', {multiView:this, index:oldIndex});
    
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
    this.fireEvent('onViewShow', {multiView:this, index:idx});
  },
  
  
  showViewByName: function(name)
  {
    if(!this.element.getElementById(name))
    {
      throw new SSMultiViewError.NoSuchSubView(new Error(), this.element.getProperty('id') + "'s controller has no subview with name " + name + ".");
    }
    this.showView(this.getRawSubViews().indexOf(this.element.getElement('> #'+name)));
  }

});