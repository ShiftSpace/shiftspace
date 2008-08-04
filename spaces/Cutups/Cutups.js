/*
  add onShiftEdit
  onshowshift
  canshowshift
  regex for multiple words: /(\S+(\s?)+){1,5}/
  getParents contains parests
  hasChild
  
  add json to space everytime a new shift is shown
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
            //if selection exists and origTextArray does not
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
                
                this.visibleRanges.push(newRangeRef);//add to list of visible shifts
            }else{
              //origTextArray exists so just re cutup current cutup
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
  
  visibleShifts: [],  //contains all shifts currently show on page
  
  removeFromVisibleShifts: function(shiftId){
    for(var shift=0;shift<this.visibleShifts;shift++){
      if(visibleShifts[shift].id ==  shiftId){
          delete visibleShifts[shift];
      }
    }
  },
  
  canShowShift: function(json){
    /*check other shifts */
     try{
      console.log("==========================canShowShift");
      console.log("==========================JSON",json);
      console.log("==========================JSON id",json.id);
      console.log("==========================visibleShifts",this.visibleShifts);
      var tagName = json.ranges[0].ancestorPosition.tagName;
      var ancIndex = json.ranges[0].ancestorPosition.ancIndex;
      var id = json.id;
      var thisCommonAncestor = $$(tagName)[ancIndex];
      console.log("====this.visibleShifts.length",this.visibleShifts.length);
      for(shift=0;shift<this.visibleShifts.length;shift++){
        console.log(this.visibleShifts[shift]);
        var thatTagName = this.visibleShifts[shift].ranges[0].ancestorPosition.tagName;
        var thatAncIndex = this.visibleShifts[shift].ranges[0].ancestorPosition.ancIndex;
        var thatCommonAncestor = $$(thatTagName)[thatAncIndex];
        if(thisCommonAncestor == thatCommonAncestor || thisCommonAncestor.hasChild(thatCommonAncestor) || thatCommonAncestor.hasChild(thisCommonAncestor)){
          console.log("=======================================CONFLICTS");
          return false;
        }else{
          console.log("=======================================NO-CONFLICTS");
          return true;
        }
      }
    }catch(e){} 
    return true;
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
    console.log("################################TURNONRANGEREF");
    this.currentShiftId = this.getCurrentShift().getId();
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
   return ($(node) != null && $(node) != undefined && $(node).getParent().nodeName != "SCRIPT"); 
  },
  
  wordPattern: new RegExp("(\\S+(\\s?)+){1,1}","g"), //default chunk is one 'word'
  
  setWordChunkSize: function(numOfWords){
    var pattern = "(\\S+(\\s?)+){1," + numOfWords + "}";
    this.wordPattern = new RegExp(pattern,"g");
  },
  
  cutupRange: function(xPathResult){
    console.log("##############################################CUTUPRANGE");
    this.currentShiftId = this.getCurrentShift().getId();
    console.log(this.currentShiftId);
    if(!this.origTextArray){
      this.cutupTextArray = Array();  //contains cutup text nodes
      this.origTextArray = Array();   //contains precutup orig text nodes
      this.joinedTextArray = Array();   //contains text from all text nodes split into single array
      //break up snapshot into arrays of words
      for ( var i=0 ; i < xPathResult.snapshotLength; i++ ){
          if(this.isValidCutupTextNode(xPathResult.snapshotItem(i))){
            var text = xPathResult.snapshotItem(i).textContent;
            var lineArray = text.match(this.wordPattern);
            //joinedTextArray contains all arrays of words from text nodes in a single array.
            this.joinedTextArray = this.joinedTextArray.concat(lineArray);
            //do not add empty nodes to array or is content is javascript
            if(lineArray != null){ 
              this.cutupTextArray.push(lineArray); //push array of words into cutupTextArray
              this.origTextArray.push(text);  //push original text into origTextArray
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
    for(var arr=0; arr<this.cutupTextArray.length; arr++){
        for(var arrItem=0; arrItem<this.cutupTextArray[arr].length; arrItem++){
            this.cutupTextArray[arr][arrItem] = this.joinedTextArray[i];
            i++;
        }
    }
    //reinsert sorted array as string back into document
    for(var i=0,l=0; i < xPathResult.snapshotLength; i++){
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
    if(!this.cutupTextArray){
      var amount = parseInt($("SSCutupChunkAmount").getText());
      if(amount < 20){
        amount = amount + 1;
        $("SSCutupChunkAmount").setText(amount);
      }else{
        amount = 1;
        $("SSCutupChunkAmount").setText(amount);
      }
      this.setWordChunkSize(amount);
    }else{
      alert("You cannot change chunk size while a cutup exists on page. Cancel or hide current cutup to change.");
    }
  },
  
  decrementChunkAmount: function(){
    if(!this.cutupTextArray){
      var amount = parseInt($("SSCutupChunkAmount").getText());
      if(amount > 1){
        amount = amount - 1;
        $("SSCutupChunkAmount").setText(amount);
      }else{
        amount = 20;
        $("SSCutupChunkAmount").setText(amount);
      }
      this.setWordChunkSize(amount);
    }else{
      alert("You cannot change chunk size while a cutup exists on the page. Cancel or hide current cutup to change.");
    }
  },
  
  cancelCutup: function(){
      // ignores the specific shift since only one cutup can be on at a given moment 
      // search for all span elements with _shiftspace_cutup attribute and open them
    console.log("###################SETUP");
    console.log(this.currentShiftId);
    var currentShiftId = (this.currentShiftId)? this.currentShiftId : this.getCurrentShift().getId();
    console.log("#######################################CURRENTSHIFTID",this.currentShiftId);
      var xPathResult = document.evaluate(".//span[@id='" + currentShiftId + "']", document, null,
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
      
      //var currentShiftId = (this.currentShiftId)? this.currentShiftId : this.getCurrentShift().getId();
      var currentShiftId = json.id;
      console.log("=======================================in hideCutups json id",json.id); 
      console.log("####################################CURRENTSHIFTID",this.getCurrentShift().getId());
      console.log("==json",json);
      var xPathResult = document.evaluate(".//span[@id='" + currentShiftId + "']", document, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      
      var parentNodes = [];
      for (var i=0,l=0; i < xPathResult.snapshotLength; i++) {
        //if is not an empty node grab content from json
        var spanElement = xPathResult.snapshotItem(i);
        if(!xPathResult.snapshotItem(i).textContent.match(/^\s+$/) && this.isValidCutupTextNode(xPathResult.snapshotItem(i))){
          //shift is pulled from database : shift was just created and still have the newShiftXXXX id
          var newTextNode = (json.ranges)? document.createTextNode(json.ranges[0]['origArray'][l]) : document.createTextNode(json.parentSpace.origTextArray[l]);;
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
  
  tokenizeNewline: function(text){
    text.replace(new RegExp("\\n","g"),"__newline__")  
  },
  
  deTokenizeNewline: function(ranges){
    text.replace(new RegExp("__newline__","g"),"\n");
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
          console.log("###FROM SETUP###");
          console.log(json.ranges[0]);
          //replace __newline__ token with \n
          for(var i=0; i<json.ranges.length; i++){
            json.ranges[i].origText = json.ranges[i].origText.replace(new RegExp("__newline__","g"),"\n");
            //fix ancestorOrigTextContent null
            if(json.ranges[i].ancestorOrigTextContent){ 
              json.ranges[i].ancestorOrigTextContent = json.ranges[i].ancestorOrigTextContent.replace(new RegExp("__newline__","g"),"\n");
            }
          }
        }
        this.json = json;
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
      console.log("###IN SHOW###");
      if (this.json.ranges) {
        for(var i=0; i<this.json.ranges.length; i++){
          this.json.ranges[i].origText = this.json.ranges[i].origText.replace(new RegExp("__newline__","g"),"\n");
          //probably a range coder problem for some reason ancestorOrigTextContent null
          if(this.json.ranges[i].ancestorOrigTextContent){ 
            this.json.ranges[i].ancestorOrigTextContent = this.json.ranges[i].ancestorOrigTextContent.replace(new RegExp("__newline__","g"),"\n");
          }
        }
        for (var i = 0; i < this.json.ranges.length; i++) {
          space.turnOnRangeRef(this.json.ranges[i]);
        }
        this.getParentSpace().visibleShifts.push(this.json.ranges);//push shift onto array of visible shifts
        console.log("===============================in show",this.getParentSpace().visibleShifts);
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
      console.log("=================================================Shift hide",this.json.id);
      this.getParentSpace().removeFromVisibleShifts(this.json.id);
      this.getParentSpace().hideCutups(this.json);
    }
    
});

var Cut = new CutupsSpace(CutupsShift);
