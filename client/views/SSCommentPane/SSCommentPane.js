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
                  events: [{resource:"shift", action:"comment"},
                           {resource:"comment", method:"delete"}],
                  handlers: [SSTable.dirtyTheViews]
                }]
    });
  },


  cleanupTable: function()
  {
    if(this.comments)
    {
      this.comments.dispose();
      this.comments = null;
    }
  },
  

  setCurrentShiftId: function(id)
  {
    this.__shiftId = id;
  },


  currentShiftId: function()
  {
    return this.__shiftId;
  },
  
  
  'open': function(shift)
  {
    this.cleanupTable();
    if(shift) this.initTable(shift._id);
    if(SSTableForName("Comments")) SSTableForName("Comments").addView(this.SSCommentsListView);
    
    this.delegate().setHeight(445);
    this.delegate().show();
    this.multiView().showViewByName(this.name);
    if(shift) this.setCurrentShiftId(shift._id);

    if(shift) this.update(shift);

    this.element.removeClass("SSCommentPaneClosed");
    this.element.addClass("SSCommentPaneOpen");
  },


  'close': function()
  {
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
    this.update(p);
  },


  update: function(shift)
  {
    this.element.getElement("textarea").set("value", "");
    this.SSCommentsListView.refresh(true);

    if(ShiftSpace.User.isLoggedIn())
    {
      this.element.getElement("#CommentPaneForm").removeClass("SSDisplayNone");
      this.element.getElement("#CommentPaneForm .userName").set("text", ShiftSpace.User.getUserName());
    }
    else
    {
      this.element.getElement("#CommentPaneForm").addClass("SSDisplayNone");
    }
    
    if(shift)
    {
      var attrsp = SSGetSpaceAttributes(shift.space.name);
      (function(attrs) {
        this.element.getElement("#SSCommentShift .spaceIcon").set("src", attrs.icon);
      }.future().bind(this))(attrsp);
      SSTemplate(this.element.getElement("#SSCommentShift"), shift, ['summary']);
    }
  }.future(),
  
  
  localizationChanged: function()
  {
  },


  awake: function()
  {
    this.mapOutletsToThis();
    this.attachEvents();
  }
});