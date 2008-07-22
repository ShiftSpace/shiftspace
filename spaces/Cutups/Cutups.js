/*
  add onShiftEdit
  
  refactor widget button names to reflect CSS names instead
  
  Currently it is not possible to change word chunk amount after performing a 
  cut. Should this change or should I just keep the user from changing the amount
  after a cutup has been performed.
  
  regex for multiple words: /(\S+(\s?)+){1,5}/
*/

var CutupsSpace = ShiftSpace.Space.extend({
  attributes: {
    name: 'Cutups',
    icon: 'Cutups.png', 
    version: 0.1,
    css: 'spaces/Cutups/Cutups.css'
  },
  
  setup: function() {
    this.fireCutup = function(e){
            //added check for multLineArray if exists there is a change that part
            //of the cutup is still selected
            if (!window.getSelection().getRangeAt(0).collapsed && !this.origTextArray) {
               var newRangeRef = ShiftSpace.RangeCoder.toRef(window.getSelection().getRangeAt(0));
                if (!this.getCurrentShift().ranges){
                    this.getCurrentShift().ranges = [];
                }
                this.getCurrentShift().ranges.push(newRangeRef);
                this.turnOnRangeRef(newRangeRef);
                //cutupTextArray contains text in selected range 'cutup'
                newRangeRef.cutupsArray = this.cutupTextArray;
                //origTextArray contains original text selected
                newRangeRef.origArray = this.origTextArray;
            }else{
            /*
            Need to add functionality so that multiple ranges can be created.
            */                
                var xPathQuery = "//*[@id='"  + this.getCurrentShift().getId() + "']";
                var xPathResult = document.evaluate(xPathQuery, document.body, null,
                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                this.cutupRange(xPathResult);               
            }
            return false;
    }.bind(this);
  },  
  
  //-Thanks Avital-
  surround_text_node: function(oNode, objRange, surroundingNode){
      var tempRange;
      //if this selection starts and ends in the same node
      if((oNode==objRange.startContainer)&&(oNode==objRange.endContainer)) {
          objRange.surroundContents(surroundingNode);
      }
      else
      {
          if(objRange.isPointInRange(oNode,1) || oNode==objRange.startContainer)
          {
              //check if the node is in the middle of the selection 
              if((oNode!=objRange.startContainer)&&(oNode!=objRange.endContainer))//surround the whole node
              {
                  surroundingNode.textContent = oNode.textContent;
                  oNode.parentNode.replaceChild(surroundingNode, oNode);
              }
              else //if start at suppply surround text from start point to end
              if(oNode==objRange.startContainer)//surround the node from the start point
              {
                  tempRange = document.createRange();
                  tempRange.setStart(oNode, objRange.startOffset);
                  tempRange.setEnd(oNode, oNode.textContent.length);
                  tempRange.surroundContents(surroundingNode);
              }
              else      //if endAt supply surround text node from 0 to End location 
              if(oNode==objRange.endContainer)//surround the node from the start point
              {
                  tempRange = document.createRange();
                  tempRange.setStart(oNode, 0);
                  tempRange.setEnd(oNode, objRange.endOffset);
                  tempRange.surroundContents(surroundingNode);
              }
          }
      }        
  },  
  
  turnOnRangeRef: function(ref) {
    var range = ShiftSpace.RangeCoder.toRange(ref);
    var objAncestor = range.commonAncestorContainer;
    
    if (objAncestor.nodeType == 3) // text node
        objAncestor = objAncestor.parentNode;
      
    var xPathResult = document.evaluate(".//text()", objAncestor, null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);        
    // iteratate on all the text nodes in the document and mark if they are in the selection range
    for (var i = 0, l = xPathResult.snapshotLength; i < l; i++) {
        // we need clean styles so we don't use ShiftSpace.Element
        var enclosingSpan = document.createElement("span");
        enclosingSpan.id = this.getCurrentShift().getId();
        enclosingSpan.setAttribute("class","SSCutup");
        enclosingSpan.setAttribute("_shiftspace_cutups", "on");
        this.surround_text_node(xPathResult.snapshotItem(i), range, enclosingSpan);
    }
    //if cutUpArray does not exist call cutupRange on xPathResult of cutups span
    if(!ref.cutupsArray){
      var xPathQuery = "//*[@id='"  + this.getCurrentShift().getId() + "']";
      var xPathResult2 = document.evaluate(xPathQuery, objAncestor, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      //iterate through snapshot & rewrite textnodes
      this.cutupRange(xPathResult2);
    }else{
      var xPathQuery = "//*[@id='"  + this.getCurrentShift().getId() + "']";
      var xPathResult2 = document.evaluate(xPathQuery, objAncestor, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      //reinsert sorted array as string back into document
      for ( var i=0,l=0; i < xPathResult2.snapshotLength; i++ ){
        //if node is not empty and nodes parent is not a script tag
        if(!xPathResult2.snapshotItem(i).textContent.match(/^\s+$/) && this.isValidCutupTextNode(xPathResult2.snapshotItem(i))){
          xPathResult2.snapshotItem(i).textContent = ref.cutupsArray[l].join("");
          l++
        }
      }
    }
  },
  
  isValidCutupTextNode: function(node){
   return (node != null && node.getParent().nodeName != "SCRIPT"); 
  },
  
  wordPattern: new RegExp("(\\S+(\\s?)+){1,1}","g"), //default chunk is one 'word'
  
  setWordChunkSize: function(numOfWords){
    var pattern = "(\\S+(\\s?)+){1," + numOfWords + "}";
    this.wordPattern = new RegExp(pattern,"g");
  },
  
  cutupRange: function(xPathResult){
    if(!this.origTextArray){
      this.cutupTextArray = Array();
      this.origTextArray = Array();
      this.joinedTextArray = Array();//contains all text split into single array
      /* var pattern = /(\s)?\S+/g; */ 
      //break up snapshot into arrays of words
      for ( var i=0 ; i < xPathResult.snapshotLength; i++ ){
          if(this.isValidCutupTextNode(xPathResult.snapshotItem(i))){
            var text = xPathResult.snapshotItem(i).textContent;
            var lineArray = text.match(this.wordPattern);
            //joinedTextArray contains all arrays of words from text nodes in a single
            //array.
            this.joinedTextArray = this.joinedTextArray.concat(lineArray);
            //do not add empty nodes to array or is content is javascript
            if(lineArray != null){ 
              this.cutupTextArray.push(lineArray);
              this.origTextArray.push(text);
            }
          }
      }
      //filter out null values and SCRIPT content
      this.joinedTextArray = this.joinedTextArray.filter(function(item,index){
          return item != null;
      });
    }
    //randomly sort joined arrays
    this.joinedTextArray.sort(function(a,b){
        return Math.random() - 0.5;
    });
    //break up reinsert sorted item into multiline array
    //this keeps the same number of words in each node
    //while the actual words change (if 1 word chunks are selected)
    var i = 0;
    for(var x=0;x<this.cutupTextArray.length;x++){
        for(var y=0;y<this.cutupTextArray[x].length;y++){
            this.cutupTextArray[x][y] = this.joinedTextArray[i];
            i++;
        }
    }
    //reinsert sorted array as string back into document
    for ( var i=0,l=0; i < xPathResult.snapshotLength; i++ ){
      //if node is not empty
      if(!xPathResult.snapshotItem(i).textContent.match(/^\s+$/) && this.isValidCutupTextNode(xPathResult.snapshotItem(i))){
        xPathResult.snapshotItem(i).textContent = this.cutupTextArray[l].join("");
        l++
      }
    } 
    //FX for fading Cutup background-color to transparent
    function fadeToTrans(){
      trans = 0.6;
      function fade(){
        if(trans > 0){       
          trans = trans - 0.01;
          $$('.SSCutup').setStyle('background-color','rgba(167,8,4,' + trans + ')')
          setTimeout(fade,50);
        }
      }
      return fade();
    }
    fadeToTrans();
  },
  
  incrementChunkAmount: function(){
    var amount = parseInt($("SSCutupChunkAmount").getText());
    if(amount < 20){
      amount = amount + 1;
      $("SSCutupChunkAmount").setText(amount);
    }else{
      amount = 1;
      $("SSCutupChunkAmount").setText(amount);
    }
    this.setWordChunkSize(amount);
  },
  
  decrementChunkAmount: function(){
    var amount = parseInt($("SSCutupChunkAmount").getText());
    if(amount > 1){
      amount = amount - 1;
      $("SSCutupChunkAmount").setText(amount);
    }else{
      amount = 20;
      $("SSCutupChunkAmount").setText(amount);
    }
    this.setWordChunkSize(amount);
  },
  
  cancelCutup: function(){
      // ignores the specific shift since only one highlight can be on at a given moment 
      // search for all span elements with _shiftspace_highlight attribute and open them
      var xPathResult = document.evaluate(".//span[attribute::_shiftspace_cutups='on']", document, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      
      var parentNodes = [];
      for (var i=0,l=0; i < xPathResult.snapshotLength; i++) {
          var spanElement = xPathResult.snapshotItem(i);
          //if is not an empty node grab content from json
          if(!xPathResult.snapshotItem(i).textContent.match(/^\s+$/) && this.isValidCutupTextNode(xPathResult.snapshotItem(i))){
            var newTextNode = document.createTextNode(this.origTextArray[l]);
            l++;
          }else{
            var newTextNode = document.createTextNode(spanElement.textContent);
          }
          parentNodes[i] = spanElement.parentNode;
          spanElement.parentNode.replaceChild(newTextNode, spanElement);
      } 

      for (var i = 0, l = xPathResult.snapshotLength; i < l; i++) {
          parentNodes[i].normalize();
      } 
      this.cutupTextArray = null;
      this.origTextArray = null;
      
  },
  
  close: function(){
    this.cancelCutup();
    $("SSCutupWidget").addClass('SSHidden');
    $("SSCutupWidget").addClass('SSDisplayNone');
  },
  
  showInterface: function(){
    this.parent();
    this.widget.removeClass('SSDisplayNone');
    this.widget.removeClass('SSHidden');
  },
  
  buildInterface: function(){
    var widget = new ShiftSpace.Element('div',{
      'id':'SSCutupWidget'});
    
    var SSCutupHandle = new ShiftSpace.Element('span',{
      'id':'SSCutupHandle'});
    
    var SSCutupTitleLabel = new ShiftSpace.Element('label',{
      'for':'SSCutupTitle'}).appendText('title:');
    
    var SSCutupTitle = new ShiftSpace.Element('input',{
      'id':'SSCutupTitle'
    });
    
    var SSCutupControls = new ShiftSpace.Element('div',{
      'id':'SSCutupControls'});
    
    var SSCutupChunkLabel = new ShiftSpace.Element('span',{
    'id':'SSCutupChunkLabel'});
    
    var SSCutupButtonSmaller = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonSmaller'});
    
    var SSCutupChunkAmount = new ShiftSpace.Element('span',{
      'id':'SSCutupChunkAmount'
    }).appendText("1");
    
    var SSCutupButtonLarger = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonLarger'});
    
    var SSCutupButtonCutup = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonCutup'});
    
    var SSCutupButtonCancel = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonCancel'});
    
    var SSCutupButtonSave = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonSave'});
    
    var SSCutupButtonClose = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonClose'});
    
    SSCutupControls.appendChild(SSCutupChunkLabel);
    SSCutupControls.appendChild(SSCutupButtonSmaller);
    SSCutupControls.appendChild(SSCutupChunkAmount);
    SSCutupControls.appendChild(SSCutupButtonLarger);
    SSCutupControls.appendChild(SSCutupButtonCutup);
    SSCutupControls.appendChild(SSCutupButtonCancel);
    SSCutupControls.appendChild(SSCutupButtonSave);
    SSCutupControls.appendChild(SSCutupButtonClose);
    
    widget.appendChild(SSCutupHandle);
    widget.appendChild(SSCutupTitleLabel);
    widget.appendChild(SSCutupTitle);
    widget.appendChild(SSCutupControls);
    
    document.body.appendChild(widget);
    
    widget.makeDraggable({'handle':SSCutupHandle}); 
    
    this.widget = widget;
    this.summary = SSCutupTitle;
    
    SSCutupButtonSmaller.addEvent('mouseup',this.decrementChunkAmount.bind(this));
    SSCutupButtonLarger.addEvent('mouseup',this.incrementChunkAmount.bind(this));
    SSCutupButtonCutup.addEvent('mousedown',this.fireCutup.bind(this));
    SSCutupButtonCancel.addEvent('mouseup',this.cancelCutup.bind(this));
    SSCutupButtonSave.addEvent('mouseup',this.save.bind(this));
    SSCutupButtonClose.addEvent('mouseup',this.close.bind(this));
  },
  
  hideInterface: function(){
    if(this.widget){
      this.widget.addClass('SSDisplayNone');
    }
    document.removeEventListener('mousedown',this.fireCutup,false);
    this.interfaceBuilt = false;
  },
  
  hideCutups: function(json) {
      // ignores the specific shift since only one highlight can be on at a given moment 
      // search for all span elements with _shiftspace_highlight attribute and open them
      
      //change to look for specific shift id
      var xPathResult = document.evaluate(".//span[attribute::_shiftspace_cutups='on']", document, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      
      var parentNodes = [];
      for (var i=0,l=0; i < xPathResult.snapshotLength; i++) {
        //if is not an empty node grab content from json
        var spanElement = xPathResult.snapshotItem(i);
        if(!xPathResult.snapshotItem(i).textContent.match(/^\s+$/) && this.isValidCutupTextNode(xPathResult.snapshotItem(i))){
          var newTextNode = document.createTextNode(json[0]['origArray'][l]);
          l++;
        }else{
          var newTextNode = document.createTextNode(spanElement.textContent);
        }
        parentNodes[i] = spanElement.parentNode;
        spanElement.parentNode.replaceChild(newTextNode, spanElement);
      } 

      for (var i = 0, l = xPathResult.snapshotLength; i < l; i++) {
          parentNodes[i].normalize();
      } 
      this.origTextArray = null;
      this.cutupTextArray = null;
  },  
  
  save: function() {
    this.getCurrentShift().summary = this.summary.value;
    this.getCurrentShift().save();
    //remove title value after save
    $('SSCutupTitle').value = "";
  }
});

var CutupsShift = ShiftSpace.Shift.extend({
    
    setup: function(json){
      if(json.ranges){
          //replace __newline__ token with \n
          for(var i=0; i<json.ranges.length; i++){
            json.ranges[i].origText = json.ranges[i].origText.replace(new RegExp("__newline__","g"),"\n");
            //fix ancestorOrigTextContent null
            if(json.ranges[i].ancestorOrigTextContent){ 
              json.ranges[i].ancestorOrigTextContent = json.ranges[i].ancestorOrigTextContent.replace(new RegExp("__newline__","g"),"\n");
            }
          }
        }
        this.ranges = json.ranges;
        this.summary = json.summary;
    },
    
    encode: function() {
      //tokenize newline with __newline__
      for(var i=0; i<this.ranges.length; i++){
        this.ranges[i].origText = this.ranges[i].origText.replace(new RegExp("\\n","g"),"__newline__");
        //fix ancestorOrigTextContent null
        if(this.ranges[i].ancestorOrigTextContent){
          this.ranges[i].ancestorOrigTextContent = this.ranges[i].ancestorOrigTextContent.replace(new RegExp("\\n","g"),"__newline__");
        } 
      }        
      return {
          ranges: this.ranges,
          summary: this.summary
      };
    },
    
    show: function() {
      var space = this.getParentSpace();
      if (this.ranges) {
        for(var i=0; i<this.ranges.length; i++){
          this.ranges[i].origText = this.ranges[i].origText.replace(new RegExp("__newline__","g"),"\n");
          //probably a range coder problem for some reason ancestorOrigTextContent null
          if(this.ranges[i].ancestorOrigTextContent){ 
            this.ranges[i].ancestorOrigTextContent = this.ranges[i].ancestorOrigTextContent.replace(new RegExp("__newline__","g"),"\n");
          }
        }
        for (var i = 0; i < this.ranges.length; i++) {
          space.turnOnRangeRef(this.ranges[i]);
        }
      }
      window.location.hash = this.getId();
      //FX for fading Cutup background-color to transparent
      function fadeToTrans(){
        trans = 0.6;
        function fade(){
          if(trans > 0){       
            trans = trans - 0.01;
            $$('.SSCutup').setStyle('background-color','rgba(167,8,4,' + trans + ')')
            setTimeout(fade,50);
          }
        }
        return fade();
      }
      fadeToTrans();
    },
    
    hide: function(){
      this.getParentSpace().hideCutups(this.ranges);
    }
    
});

var Cut = new CutupsSpace(CutupsShift);
