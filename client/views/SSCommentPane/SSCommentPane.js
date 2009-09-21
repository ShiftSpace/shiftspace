// ==Builder==
// @uiclass
// @package           ShiftSpaceCoreUI
// @dependencies      SSFramedView
// ==/Builder==

var SSCommentPane = new Class({
  
  Extends: SSFramedView,
  name: 'SSCommentPane',

  initialize: function(el, options)
  {
    this.parent(el, options);
    this.setIsOpen(false);
    this.setIsVisible(false);

    SSAddObserver(this, "showComments", this['open'].bind(this));
    SSAddObserver(this, "hideComments", this['close'].bind(this));
  },


  transform: function(data)
  {
    data.text = data.content.text;
    data.userName = data.content.userName;
    return data;
  },


  initResource: function(shiftId)
  {
    this.comments = new SSResource("Comments", {
      resource: {read:'shift/'+shiftId+'/comments'},
      transforms: [this.transform],
      watches: [{
                  events: [{resource:"event", action:"create"},
                           {resource:"event", action:"delete"}],
                  handlers: [SSResource.dirtyTheViews]
                }],
      views: [this.SSCommentsListView]
    });
  },


  cleanupResource: function()
  {
    this.comments.dispose();
  },
  

  setCurrentShiftId: function(id)
  {
    this.__shiftId = id;
  },


  currentShiftId: function()
  {
    return this.__shiftId;
  },

 
  'open': function(shiftId)
  {
    SSLog("Show comments for", shiftId, SSLogForce);
    this.setCurrentShiftId(shiftId);
    this.initResource(shiftId);
    this.element.removeClass("SSCommentPaneClosed");
    this.element.addClass("SSCommentPaneOpen");
  },


  'close': function()
  {
    SSLog("Hide comments", SSLogForce);
    this.cleanupResource();
    this.element.removeClass("SSCommentPaneOpen");
    this.element.addClass("SSCommentPaneClosed");
  },
  
  
  setIsVisible: function(val)
  {
    this.__visible = val;
  },
  
  
  isVisible: function()
  {
    return this.__visible;
  },
  
  
  setIsOpen: function(val)
  {
    this.__isOpen = val;
  },
  
  
  isOpen: function()
  {
    return this.__isOpen;
  },
  
  
  setIsOpening: function(val)
  {
    this.__isOpening = val;
  },
  
  
  isOpening: function()
  {
    return this.__isOpening;
  },
  
  
  setIsClosing: function(val)
  {
    this.__isClosing = val;
  },
  
  
  isClosing: function()
  {
    return this.__isClosing;
  },
  
  
  setIsShowing: function(val)
  {
    this.__isShowing = val;
  },
  
  
  isShowing: function()
  {
    return this.__isShowing;
  },
  

  setIsHiding: function(val)
  {
    this.__isHiding = val;
  },
  
  
  isHiding: function()
  {
    return this.__isHiding;
  },


  setIsAnimating: function(val)
  {
    this.__isAnimating = val;
  },
  
  
  isAnimating: function()
  {
    return this.__isAnimating;
  },
  
  
  attachEvents: function()
  {
    var context = this.contentWindow();
    var doc = this.contentDocument();

    this.SSCloseComments.addEvent("click", this['close'].bind(this));
    this.SSPostComment.addEvent("click", this.postComment.bind(this));

    this.SSCommentsListView.addEvent("onReloadData", this.refresh.bind(this));
  },


  refresh: function()
  {
    var size = this.contentDocument().body.getSize();
    this.element.setStyles({
      hieght: size.y
    });
  },


  postComment: function()
  {
    var shiftId = this.currentShiftId(), text = this.SSCommentText.getProperty("value");
    var p = SSPostComment(shiftId, text);
    p.realize();
  },
  
  
  onInterfaceLoad: function(ui)
  {
    this.parent(ui);
    this.element.setProperty('id', 'SSCommentPane');
    this.element.addClass("SSCommentPaneClosed");
  }.asPromise(),
  
  
  awake: function(context)
  {
  },
  
  
  onContextActivate: function(context)
  {
    if(context == this.element.contentWindow)
    {
      this.mapOutletsToThis();
    }
  },
  
  
  initAnimations: function()
  {
  },
  
  
  buildInterface: function()
  {
    this.parent();

    this.initAnimations();
    this.attachEvents();
    
    SSPostNotification('onCommentsLoad', this);
    this.setIsLoaded(true);
  },
  
  
  localizationChanged: function()
  {
  }
});