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


  initTable: function(shiftId)
  {
    this.comments = new SSTable("Comments", {
      resource: {read:'shift/'+shiftId+'/comments'},
      watches: [{
                  events: [{resource:"event", action:"create"},
                           {resource:"event", action:"delete"}],
                  handlers: [SSTable.dirtyTheViews]
                }]
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
    this.initTable(shiftId);
    SSTableForName("Comments").addView(this.SSCommentsListView);
    this.show();
    this.setCurrentShiftId(shiftId);
    this.element.removeClass("SSCommentPaneClosed");
    this.element.addClass("SSCommentPaneOpen");
  },


  'close': function()
  {
    this.hide();
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
  
  
  buildInterface: function()
  {
    this.parent();
    this.attachEvents();
    SSPostNotification('onCommentsLoad', this);
    this.setIsLoaded(true);
  },
  
  
  localizationChanged: function()
  {
  }
});