// ==Builder==
// @uiclass
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSCommentPane = new Class({
  
  Extends: SSView,
  name: 'SSCommentPane',

  initialize: function(el, options)
  {
    this.parent(el, options);
    
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


  cleanupTable: function()
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
    this.delegate().show();
    this.multiView().showViewByName(this.name);
    this.initTable(shiftId);
    SSTableForName("Comments").addView(this.SSCommentsListView);
    this.setCurrentShiftId(shiftId);
    this.element.removeClass("SSCommentPaneClosed");
    this.element.addClass("SSCommentPaneOpen");
  },


  'close': function()
  {
    this.cleanupTable();
    this.delegate().hide();
  },
  
  
  attachEvents: function()
  {
    this.SSPostComment.addEvent("click", this.postComment.bind(this));
    this.SSCommentsListView.addEvent("onReloadData", this.refresh.bind(this));
  },


  postComment: function()
  {
    var shiftId = this.currentShiftId(), text = this.SSCommentText.getProperty("value");
    var p = SSPostComment(shiftId, text);
    p.realize();
  },
  
  
  localizationChanged: function()
  {
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  }
});