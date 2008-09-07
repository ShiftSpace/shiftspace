var CommentsPlugin = ShiftSpace.Plugin.extend({
  pluginType: ShiftSpace.Plugin.types.get('kInterfaceTypePlugin'),

  attributes:
  {
    name: 'Comments',
    title: null,
    icon: null,
    css: 'Comments.css',
    version: 0.2
  },
  
  setup: function()
  {
    // intialize
  },
  
  
  setCurrentShiftId: function(newShiftId)
  {
    this.__currentShiftId__ = newShiftId;
  },
  
  
  currentShiftId: function()
  {
    return this.__currentShiftId__;
  },
  
  
  showCommentsForShift: function(shiftId)
  {
    this.setCurrentShiftId(shiftId);

    this.loadCommentsForShift(shiftId, function() {
      this.showInterface();
    });
  },
  
  
  loadCommentsForShift: function(shiftId, callback)
  {
    this.serverCall('load', {
      shiftId: shiftId
    }, function(json) {
      this.element.setHtML(json.html);
      if(callback && typeof callback == 'function') callback();
      if(callback && typeof callback != 'function') console.error("loadCommentsForShift: callback is not a function.");
    });
  },
  
  
  refresh: function()
  {
    this.loadCommentsForShift(this.currentShiftId());
  },
  
  
  eventDispatch: function(_evt)
  {
    var evt = new Event(_evt);
    var target = evt.target;
    
    // switch on target class
  },
  
  
  addComment: function()
  {
    this.serverCall('add', {
      shiftId: this.currentShiftId(),
      content: 'Hello world!'
    }, function(json) {
      console.log('comment added');
    });
  },
  
  
  deleteComment: function(debugId)
  {
    this.serverCall('delete', {
      id: debugId,
      shiftId: this.currentShiftId()
    });
  },
  
  
  updateComment: function(debugId)
  {
    this.serverCall('update', {
      id: debugId,
      comment: 'Updated comment!'
    });
  },
  
    
  editComment: function()
  {
    // show the editing interface
  },
  
  
  showInterface: function()
  {
    if(!this.isShowing())
    {
      this.setIsShowing(true);
      
      if(!this.interfaceIsBuilt())
      {
        this.buildInterface();
      }
    
      this.element.removeClass('SSDisplayNone');
    
      var resizeFx = this.element.effects({
        duration: 300,
        transition: Fx.Transitions.Cubic.easeIn,
        onComplete: function()
        {
          this.setIsShowing(false);
        }.bind(this)
      });
    
      resizeFx.start({
        top: [window.getSize().size.y, window.getSize().size.y-300]
      });
    }
  },
  

  hideInterface: function()
  { 
    if(!this.isHiding())
    {
      this.setIsHiding(true);
      
      // put the Console back to normal width
      var resizeFx = this.element.effects({
        duration: 300,
        transition: Fx.Transitions.Cubic.easeIn,
        onComplete: function() {
          this.setIsHiding(false);
          // hide ourselves
          this.element.addClass('SSDisplayNone');
        }.bind(this)
      });
    
      resizeFx.start({
        top: [this.element.getStyle('top'), window.getSize().size.y]
      });
    }
  },
  

  setIsHiding: function(newValue)
  {
    this.__isHiding__ = newValue;
  },
  
  
  isHiding: function()
  {
    return this.__isHiding__;
  },
  
  
  setIsShowing: function(newValue)
  {
    this.__isShowing__ = newValue;
  },


  isShowing: function()
  {
    return this.__isShowing__;
  },
  

  attachEvents: function()
  {
    console.log('+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++');
    console.log('attachEvents ' + this.minimizer);
    this.minimizer.addEvent('click', this.hideInterface.bind(this));
    this.element.makeResizable({
      modifiers: {x:'', y:'top'},
      handle: this.comHeader
    });
  },
  
  
  frameLoaded: function()
  {
    
  },
  
  
  buildInterface: function()
  {
    this.setInterfaceIsBuilt(true);
    
    this.element = new ShiftSpace.Element('div', {
      id: 'SSComments',
      'class': 'InShiftSpace SSDisplayNone',
      'height': 0
    });
    
    this.comHeader = new ShiftSpace.Element('div', {
      id: "com-header",
      'class': "InShiftSpace"
    });
    this.comBody = new ShiftSpace.Element('div', {
      id: "com-body",
      'class': "InShiftSpace"
    });
    
    this.comHeader.setHTML('<div id="com-count"><span>34</span> Comments</div>' +
		                       '<a href="#" class="com-minimize" title="Minimize console"/></a>'); 
		                       
    this.comHeader.injectInside(this.element);
    this.comBody.injectInside(this.element);
    
    this.element.injectInside(document.body);
    
    // add the iframe after the main part is in the DOM
    this.frame = new ShiftSpace.Iframe({
      onload: this.frameLoaded.bind(this)
    });
    
    this.frame.injectInside(this.comBody);
    
    this.minimizer = $$('.com-minimize')[0];
		console.log(this.minimizer);
    
    this.attachEvents();
  }
  
  
});


var Comments = new CommentsPlugin();
ShiftSpace.__externals__.Comments = Comments; // For Safari & Firefox 3.1