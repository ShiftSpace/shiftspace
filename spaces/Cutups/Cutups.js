/*
TODO:
move most logic to shift out of space.
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
            //if selection exists and there is no an unsaved cutup on the page
            if (!window.getSelection().getRangeAt(0).collapsed && this.unsavedCutupOnPage == false) {
              this.allocateNewShift();
               var newRangeRef = ShiftSpace.RangeCoder.toRef(window.getSelection().getRangeAt(0));
               //if this newRangeRef conflicts with on currently show dont create
               if(!this.canShowRange(newRangeRef)){
                 newRangeRef = null;
                 return false;
               }
                if (!this.getCurrentShift().ranges){
                    this.getCurrentShift().ranges = [];
                }
                
                this.getCurrentShift().ranges.push(newRangeRef);
                
                this.turnOnRangeRef(newRangeRef);
                //cutupTextArray contains text in selected range 'cutup'
                newRangeRef.cutupsArray = this.cutupTextArray;
                //origTextArray contains original text selected
                newRangeRef.origArray = this.origTextArray;
                
                this.unsavedCutupOnPage = true;
                
                this.visibleShifts.push(newRangeRef);//add to list of visible shifts
            }else{
              //origTextArray exists so just re-cutup current cutup
                var xPathQuery = "//*[@id='"  + this.getCurrentShift().getId() + "']";
                var xPathResult = document.evaluate(xPathQuery, document.body, null,
                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                this.cutupRange(xPathResult);
            }
            return false;
    }.bind(this);
  },  
  
  unsavedCutupOnPage: false,
  
  visibleShifts: [],  //contains all shifts currently show on page
  
  removeFromVisibleShifts: function(shiftId){
    for(var shift=0;shift<this.visibleShifts.length;shift++){
      if(this.visibleShifts[shift].id ==  shiftId){
          delete this.visibleShifts[shift];
          var cleanedArray = [];
          //remove undefined values from array
          for(var i=0;i<this.visibleShifts.length;i++){
            if(this.visibleShifts[i] != undefined) cleanedArray.push(this.visibleShifts[i]);
          }
          this.visibleShifts = cleanedArray;
      }
    }
  },
  
  canShowShift: function(json){
     try{
      var tagName = json.ranges[0].ancestorPosition.tagName;
      var ancIndex = json.ranges[0].ancestorPosition.ancIndex - 1;
      var id = json.id;
      var thisCommonAncestor = $$(tagName)[ancIndex];
      
      console.log("=================================canShowShift json",thisCommonAncestor);
      
      for(shift=0;shift<this.visibleShifts.length;shift++){
        var thatTagName = this.visibleShifts[shift].ranges[0].ancestorPosition.tagName;
        var thatAncIndex = this.visibleShifts[shift].ranges[0].ancestorPosition.ancIndex - 1;
        var thatCommonAncestor = $$(thatTagName)[thatAncIndex];
        if(thisCommonAncestor == thatCommonAncestor || thisCommonAncestor.hasChild(thatCommonAncestor) || thatCommonAncestor.hasChild(thisCommonAncestor)){
          alert("You are attempting to display Shifts that conflict with each other." +
            "Try hiding some of the currently displayed Shifts prior to viewing this one.");
          return false;
        }else{
          return true;
        }
      }
    }catch(e){} 
    return true;
  },
  
  canShowRange: function(range){
    /*check other shifts */
    try{ 
      var tagName = range.ancestorPosition.tagName;
      var ancIndex = range.ancestorPosition.ancIndex - 1;
      console.log("===================================tagName ancindex range",tagName,ancIndex,range);
      var thisCommonAncestor = $$(tagName)[ancIndex];
      console.log("===================================canShowRange visibleShifts",this.visibleShifts);
      for(shift=0;shift<this.visibleShifts.length;shift++){
        var thatTagName = this.visibleShifts[shift].ancestorPosition.tagName;
        var thatAncIndex = this.visibleShifts[shift].ancestorPosition.ancIndex - 1;
        var thatCommonAncestor = $$(thatTagName)[thatAncIndex];
        console.log("===================================thisCommonAncestor thatCommonAncestor",thisCommonAncestor,thatCommonAncestor);
        if(thisCommonAncestor == thatCommonAncestor || thisCommonAncestor.hasChild(thatCommonAncestor) || thatCommonAncestor.hasChild(thisCommonAncestor)){
          alert("You are attempting to create a new Cutup that confilicts with " +
            "one currently being viewed on the page. Try hiding some of the currently displayed Cutups.");
          return false;
        }else{
          return true;
        }
      }
    }catch(e){} 
    return true;
  },
  
  //-Thanks Avital-
  surroundTextNode: function(oNode, objRange, surroundingNode){
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
        this.surroundTextNode(xPathResult.snapshotItem(i), range, enclosingSpan);
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
    /* console.log("##############################################CUTUPRANGE",this); */
    this.currentShiftId = this.getCurrentShift().getId();
    /* console.log(this.currentShiftId); */
    if(this.unsavedCutupOnPage == false){
      //if there is no unsaved cutup on page then create new arrays to hold text 
      //otherwise use those current
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
    if(!this.unsavedCutupOnPage){
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
    if(!this.unsavedCutupOnPage){
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
      //cancel is to be used during the creation of a shift nowhere else as will
      //cause ConFrusions
      if(this.unsavedCutupOnPage == false) return false;
      // ignores the specific shift since only one cutup can be on at a given moment 
      // search for all span elements with _shiftspace_cutup attribute and open them
      var currentShiftId = (this.currentShiftId)? this.currentShiftId : this.getCurrentShift().getId();
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
/*       this.cutupTextArray = null;
      this.origTextArray = null; */
      this.unsavedCutupOnPage = false;
      
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
      //console.log("==================================================hideCutups");
      //console.log("==================================================json.id",json.id);
      //console.log("==================================================this.getCurrentShift().getId()",this.getCurrentShift().getId());
      // ignores the specific shift since only one highlight can be on at a given moment 
      // search for all span elements with _shiftspace_highlight attribute and open them
      //var currentShiftId = (this.currentShiftId)? this.currentShiftId : this.getCurrentShift().getId();
      var currentShiftId = json.id;
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
/*       this.origTextArray = null;
      this.cutupTextArray = null; */
  },  
  
  tokenizeNewline: function(text){
    text.replace(new RegExp("\\n","g"),"__newline__")  
  },
  
  deTokenizeNewline: function(ranges){
    text.replace(new RegExp("__newline__","g"),"\n");
  },
  
  save: function() {
    if($('SSCutupTitle').value.match(/\S+/) == null){
      alert("You must give your Cutup a title before saving");
      return false;
    }
    this.getCurrentShift().summary = this.summary.value;
    this.getCurrentShift().save();
    //remove title value after save
    $('SSCutupTitle').value = "";
    this.unsavedCutupOnPage = false;
    //console.log("================================Space save",this);
    //console.log("================================Space save",this.shifts + "");
  }
});

var CutupsShift = ShiftSpace.Shift.extend({
    
    setup: function(json){
      //console.log("===================================================in setup");
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
        this.json = json;
        this.summary = json.summary;
    },
    
    encode: function() {
      //console.log("===================================================in encode");
      //tokenize newline with __newline__
      for(var i=0; i<this.ranges.length; i++){
        this.ranges[i].origText = this.ranges[i].origText.replace(new RegExp("\\n","g"),"__newline__");
        //fix ancestorOrigTextContent null
        if(this.ranges[i].ancestorOrigTextContent){
          this.ranges[i].ancestorOrigTextContent = this.ranges[i].ancestorOrigTextContent.replace(new RegExp("\\n","g"),"__newline__");
        } 
      }
      //console.log("========================================Shift encode return this",this);
      //console.log("========================================Shift encode return this.ranges",this.ranges);
      return {
          ranges: this.ranges,
          summary: this.summary
      };
    },
    
    show: function() {
      //console.log("===================================================Shift show");
      //console.log("===================================================this.json.ranges",this.json.ranges);
      //console.log("===================================================this.ranges",this.ranges);
      //console.log("===================================================space",this.getParentSpace());
      var space = this.getParentSpace();
      //showing a just created shift or a previously created and saved shift
      var ranges = (this.json.ranges)? this.json.ranges : this.ranges; 
      if (ranges) {
        for(var i=0; i<ranges.length; i++){
          ranges[i].origText = ranges[i].origText.replace(new RegExp("__newline__","g"),"\n");
          //ancestorOrigTextContent null
          if(ranges[i].ancestorOrigTextContent){ 
            ranges[i].ancestorOrigTextContent = ranges[i].ancestorOrigTextContent.replace(new RegExp("__newline__","g"),"\n");
          }
        }
        for (var i = 0; i < ranges.length; i++) {
          space.turnOnRangeRef(ranges[i]);
        }
        space.visibleShifts.push(this.json);//push shift onto array of visible shifts
        //console.log("===============================in show",space.visibleShifts); 
      }
      //FX for fading Cutup background-color alpha to transparent
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
    
    onShiftEdit: function(){
      return false;
    },
    
    hide: function(){
       //console.log("=================================================Shift hide");
       //console.log("=================================================this.json",this.json);
       //console.log("===================================================this.ranges",this.ranges);
       //console.log("===================================================this",this);
      
      var space = this.getParentSpace();
      
      if(this.json.ranges == undefined){
       this.json.ranges = this.ranges;
      }
      
      //console.log("===================================================space",space);
      space.removeFromVisibleShifts(this.json.id);
      //console.log("=======in hide=========",this.getId());
      space.hideCutups(this.json);
      this.json.id = this.getId();//updates the change in id after save
    }
    
});

var Cut = new CutupsSpace(CutupsShift);

