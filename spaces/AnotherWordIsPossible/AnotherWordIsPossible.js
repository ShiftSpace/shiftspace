var AnotherWordIsPossibleSpace = Space({
  setup: function(options) {
    // Your space code goes here:
    
    var words = {
    ///////////////////////////////////////////////////////
    // Syntax: 'Search word' : 'Replace word',
    "first" : "last",
    "friend" : "contact",
    "friends" : "contacts",
    "ignore" : "skip",
    "unfriend" : "disconnect",
    "Friend" : "Contact",
    "Friends" : "Contacts ",
    "Ignore" : "Skip",
    "Unfriend" : "Disconnect",
    ///////////////////////////////////////////////////////
    "":""};
    
    //////////////////////////////////////////////////////////////////////////////
    // This is where the real code is
    // Don't edit below this
    //////////////////////////////////////////////////////////////////////////////
    
    // prepareRegex by JoeSimmons
    // Used to take a string and ready it for use in new RegExp()
    String.prototype.prepareRegex = function() {
      return this.replace(/([\[\]\^\&\$\.\(\)\?\/\\\+\{\}\|])/g, "\\$1");
    };
    
    function isOkTag(tag) {
      return (",pre,blockquote,code,input,button,textarea".indexOf(","+tag) == -1);
    }
    
    var regexs=new Array(),
    replacements=new Array();
    for(var word in words) {
      if(word != "") {
        regexs.push(new RegExp("\\b"+word.prepareRegex().replace(/\*/g,'[^ ]*')+"\\b", 'gi'));
        replacements.push(words[word]);
      }
    }
    
    var texts = document.evaluate(".//text()[normalize-space(.)!='']",document.body,null,6,null), text="";
    for(var i=0,l=texts.snapshotLength; (this_text=texts.snapshotItem(i)); i++) {
    	if(isOkTag(this_text.parentNode.tagName.toLowerCase()) && (text=this_text.textContent)) {
    	 for(var x=0,l=regexs.length; x<l; x++) {
    	   text = text.replace(regexs[x], replacements[x]);
    	   this_text.textContent = text;
    	 }
    	}
    }
    
  } //end setup
});

var AnotherWordIsPossibleShift = Shift({
  setup: function(json) {
    //Your Shift code goes here:
    
        
    this.setPosition(json);
    //this.makeDraggable({handle: $('drag_it')});
    //this.save();

  }
});