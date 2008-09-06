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
    if(!this.interfaceIsBuilt())
    {
      this.buildInterface();
    }
    
    this.element.removeClass('SSDisplayNone');
    
    // show ourselves
    // put the console to half width
    ShiftSpace.Console.halfMode(function() {
      var resizeFx = this.element.effects({
        duration: 300,
        transition: Fx.Transitions.Cubic.easeIn
      });
      
      resizeFx.start({
        height: [0, 300]
      });
    }.bind(this));
  },
  
  
  hideInterface: function()
  {    
    // put the Console back to normal width
    var resizeFx = this.element.effects({
      duration: 300,
      transition: Fx.Transitions.Cubic.easeIn,
      onComplete: function() {
        // hide ourselves
        this.element.addClass('SSDisplayNone');
        ShiftSpace.Console.fullMode();
      }.bind(this)
    });
    
    resizeFx.start({
      height: [300, 0] 
    });
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
      id: "com-header"
    });
    this.comBody = new ShiftSpace.Element('div', {
      id: "com-body"
    });
    
    this.comHeader.injectInside(this.element);
    this.comBody.injectInside(this.element);
    
    this.element.injectInside(document.body);
  }
  
  
});


var Comments = new CommentsPlugin();
ShiftSpace.__externals__.Comments = Comments; // For Safari & Firefox 3.1