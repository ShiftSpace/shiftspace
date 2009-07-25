// ==Builder==
// @optional
// @package           ShiftSpaceCore
// @dependencies      SSTag
// ==/Builder==

// update the tag classes list
SSTag.tagClasses.push("SSCategory");

var SSCategory = new Class({
  
  Extends: SSTag,
  name: "SSCategory",
  
  
  initialize: function(tagName, options)
  {
    this.parent(tagName, options);
  },
  
  
  add: function(tag)
  {
    if(SSTag.isTag(tag))
    {
      this.addTag(tag.id(), "tag", {
        displayString: tag.data().display_string
      });
    }
  }
  
});