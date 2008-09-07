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
    this.loadCommentsForShift(shiftId, this.showInterface.bind(this));
  },
  
  
  loadCommentsForShift: function(shiftId, callback)
  {
    this.serverCall('load', {
      shiftId: shiftId
    }, function(json) {
      // load up the html
      if(!this.frame) 
      {
        this.delayedContent = json;
      }
      else
      {
        this.frame.contentWindow.document.body.innerHTML = json.html;
        $('com-count-span').setText(json.count);
      }
      if(callback && typeof callback == 'function') callback();
      if(callback && typeof callback != 'function') console.error("loadCommentsForShift: callback is not a function.");
    }.bind(this));
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
    console.log('eventDispatch');
    
    switch(true)
    {
      case $(target).hasClass('com-reply'):
        console.log('scroll!');
        this.frame.contentWindow.scrollTo(0, $(this.frame.contentWindow.document.body).getSize().size.y);
      break;
      
      case ($(target).getProperty('id') == 'submit'):
        console.log('add comment!');
        this.addComment();
      break;
      
      default:
      break;
    }
  },
  
  
  addComment: function()
  {
    var newComment = $(this.frame.contentWindow.document.getElementById('comment-reply')).getProperty('value');
    console.log('addComment ' + newComment);
    if(newComment != '')
    {
      this.serverCall('add', {
        shiftId: this.currentShiftId(),
        content: newComment
      }, function(json) {
        this.refresh();
      }.bind(this));
    }
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
    
      if(!this.isVisible())
      {
        ShiftSpace.Console.halfMode(function() {
          var resizeFx = this.element.effects({
            duration: 300,
            transition: Fx.Transitions.Cubic.easeIn,
            onComplete: function()
            {
              this.setIsVisible(true);
              this.setIsShowing(false);
            }.bind(this)
          });
    
          resizeFx.start({
            top: [window.getSize().viewPort.y, window.getSize().viewPort.y-300]
          });
        }.bind(this));
      }
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
          this.setIsShowing(false);
          this.setIsHiding(false);
          // hide ourselves
          this.element.addClass('SSDisplayNone');
          this.setIsVisible(false);
          ShiftSpace.Console.fullMode();
        }.bind(this)
      });
    
      resizeFx.start({
        top: [this.element.getStyle('top'), window.getSize().viewPort.y]
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
  
  
  setIsVisible: function(newValue)
  {
    this.__isVisible__ = newValue;
  },
  
  
  isVisible: function()
  {
    return this.__isVisible__;
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
    console.log('frame loaded');
    this.loadStyle('Comments.css', this.frameCSSLoaded.bind(this), this.frame);
    $(this.frame.contentWindow.document.body).addEvent('click', this.eventDispatch.bind(this));
  },
  
  
  frameCSSLoaded: function()
  {
    // now we can add the html stuff
    console.log('frame CSS loaded');
    
    if(this.delayedContent)
    {
      this.frame.contentWindow.document.body.innerHTML = this.delayedContent.html;
      $('com-count-span').setText(this.delayedContent.count);
      delete this.delayedContent;
    }
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
    
    this.comHeader.setHTML('<div id="com-count"><span id="com-count-span">34</span> Comments</div>' +
		                       '<a href="#" class="com-minimize" title="Minimize console"/></a>'); 
		                       
    this.comHeader.injectInside(this.element);
    this.comBody.injectInside(this.element);
    
    this.element.injectInside(document.body);
    
    this.frameWrapper = new ShiftSpace.Element('div', {
      id: "SSCommentsFrameWrapper"
    });
    
    this.frameWrapper.injectInside(this.comBody);
    
    // add the iframe after the main part is in the DOM
    this.frame = new ShiftSpace.Iframe({
      id: "SSCommentsFrame", 
      onload: this.frameLoaded.bind(this)
    });
    
    this.frame.injectInside(this.frameWrapper);
    
    this.minimizer = $$('.com-minimize')[0];
		console.log(this.minimizer);
    
    this.attachEvents();
  }
  
  
});


var Comments = new CommentsPlugin();
ShiftSpace.__externals__.Comments = Comments; // For Safari & Firefox 3.1