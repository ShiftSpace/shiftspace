// ==Builder==
// @optional
// @package           ShiftSpaceCore
// @dependencies      SSAbstractStream
// ==/Builder==

var SSCommentsClass = new Class({

  Extends: SSAbstractStream,
  name: "SSComments",


  initialize: function(ref, options)
  {
    this.setRef(ref);
    
    this.objectHasComment(function(json) {
      if(!json.data) this.createCommentThread(this.ref());
    }.bind(this));
  },
  
  
  setRef: function(ref)
  {
    this.__ref = ref;
  },
  
  
  ref: function()
  {
    return this.__ref;
  },
  
  
  comments: function(callback)
  {
    
  },
  
  
  objectHasComment: function(callback)
  {
    
  },
  
  
  createCommentThread: function(callback)
  {
    
  },
  
  
  addComment: function()
  {
    
  },
  
  
  updateComment: function(commentId)
  {
    
  },
  
  
  removeComment: function(commentId)
  {
    
  }

});