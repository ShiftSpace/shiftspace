/*
TODO:
implement canShowRange removeFromVisibleShifts hideInterface addToVisibleShifts
*/
var CutupsSpace = ShiftSpace.Space.extend({
  attributes: {
    name: 'Cutups',
    icon: 'Cutups.png', 
    version: 0.2,
    css: 'spaces/Cutups/Cutups.css'
  },
  
  setup: function(){
  },
  
  isValidSelection: function(){
    var self = this;
    if(window.getSelection().toString().match(/\S+/) != null && self.unsavedShiftOnPage != true) {
      self.allocateNewShift();
      var newRangeRef = ShiftSpace.RangeCoder.toRef(window.getSelection().getRangeAt(0));
      self.unsavedCutupOnPage = true;
    }else{
     //alert("no!");
    }
  },
  
  unsavedCutupOnPage: false,
  
  visibleShifts: [],  //contains all shifts currently show on page
  
  addToVisibleShifts: function(visibleShiftMetaObject){//contains ref to commonAncestor and sscutupid
    // need to implement
  },
  
  removeFromVisibleShifts: function(shiftId){//remove based on sscutupid
    // need to implement
  },
  
  canShowRange: function(range){
    // need to implement should be canShowShift
     return true;
  },
  
  wordPattern: new RegExp("(\\S+(\\s?)+){1,1}","g"), //default chunk is one 'word'
  
  showInterface: function(){
    this.parent();
    $("SSCutupWidget").removeClass('SSDisplayNone');
    $("SSCutupWidget").removeClass('SSHidden');
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
    
    var SSCutupButtonLarger = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonLarger'});
    
    var SSCutupChunkAmount = new ShiftSpace.Element('span',{
      'id':'SSCutupChunkAmount'
    }).appendText("1");
    
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
    
    widget.injectInside(document.body);
    
    widget.makeDraggable({'handle':SSCutupHandle});
    
    this.SSCutupTitle = SSCutupTitle;
    this.SSCutupChunkLabel = SSCutupChunkLabel;
    this.SSCutupButtonSmaller = SSCutupButtonSmaller;
    this.SSCutupButtonLarger = SSCutupButtonLarger;
    this.SSCutupChunkAmount = SSCutupChunkAmount;
    this.SSCutupButtonCutup = SSCutupButtonCutup;
    this.SSCutupButtonCancel = SSCutupButtonCancel;
    this.SSCutupButtonSave = SSCutupButtonSave;
    this.SSCutupButtonClose = SSCutupButtonClose;
    
    this.unsavedCutupOnPage = true; //widget is build new cutup shift created
  },
  
  hideInterface: function(){
    // need to implement
  }
  
});

var CutupsShift = ShiftSpace.Shift.extend({
    //this
    setup: function(json){
      console.log("===================================================Shift setup");
      console.log("===================================================Shift id",json);
      
      if(this.isNewShift() == false){ //if this is a previously created shift
        
        this.sscutupid = json.sscutupid;
        this.range = json.range;
        if(json.range.origText){
          this.range.origText = this.deTokenizeNewline(json.range.origText);
        }
        this.cutupTextArray = json.cutupTextArray;
        this.origTextArray = json.origTextArray;
        this.joinedTextArray = json.joinedTextArray;
        this.sscutupid = json.sscutupid;
        
        this.cutupTextOnPage = false;
        if(json.range.ancestorOrigTextContent){
          this.range.ancestorOrigTextContent = this.deTokenizeNewline(json.range.ancestorOrigTextContent);
        }

      }else if(this.isNewShift() == true){ //if this shift has just been created
        console.log(this);
        this.sscutupid = this.create_sscutupid();
        this.cutupTextOnPage = false; //if shift has cut text
        //a new shift
        //attaches events to widget
        //creates a range from a valid selection
        //on save detaches events from widget
      }
    },
    
    tokenizeNewline: function(text){
      text.replace(new RegExp("\\n","g"),"__newline__");  
      return text;
    },
    
    deTokenizeNewline: function(text){
      text.replace(new RegExp("__newline__","g"),"\n");
      return text;
    },
    
    show: function() {
      console.log("===================================================Shift show");
      console.log("===============",this.range);
      var space = this.getParentSpace();
      //showing a just created shift or a previously created and saved shift
      if(this.cutupTextOnPage == false){
        
        if (this.range) {
          if(space.canShowRange(this.range) == false){
            return false;
          }
          if(this.range.origText){
            this.range.origText = this.deTokenizeNewline(this.range.origText);
          }
          if(this.range.ancestorOrigTextContent){
            this.range.ancestorOrigTextContent = this.deTokenizeNewline(this.range.ancestorOrigTextContent);
          }
          this.turnOnRangeRef(this.range);
        }
      }
      if(this.isNewShift() == true){
        this.attachWidgetButtonEvents()
      }
      //push on visible shifts
      //FX for fading Cutup background-color alpha to transparent
      function fadeToTrans(){
        trans = 0.6;
        function fade(){
          if(trans > 0){       
            trans = trans - 0.02;
            $$('.SSCutup').setStyle('background-color','rgba(167,8,4,' + trans + ')')
            setTimeout(fade,50);
          }
        }
        return fade();
      }
      fadeToTrans();
    },
    
    encode: function(){
      var space = this.getParentSpace();
      
      this.summary = space.SSCutupTitle.value;
      //remove title value after save
      $('SSCutupTitle').value = "";
      // this.unsavedCutupOnPage = false;
      $("SSCutupButtonCutup").setStyle('background-position','center 0px');
      
      this.range.origText = this.tokenizeNewline(this.range.origText);
      if(this.range.ancestorOrigTextContent){
        this.range.ancestorOrigTextContent = this.tokenizeNewline(this.range.ancestorOrigTextContent);
      }
      return {
        sscutupid: this.sscutupid,
        range: this.range,
        cutupTextArray: this.cutupTextArray,
        origTextArray: this.origTextArray,
        joinedTextArray: this.joinedTextArray,
        summary: this.summary
      }
    },
    
    create_sscutupid: function(){
      var now = new Date();
      var month = now.getMonth() + 1;
      var day = now.getDate();
      var year = now.getFullYear();
      var hour = now.getHours();
      var min = now.getMinutes();
      var sec = now.getSeconds();
      var rand = $random(0,1000000);
      return (month + "-" + day + "-" + year + "-" + hour + "-" + min + "-" + sec + "-" + rand);
    },
    
    isValidSelection: function(selection){
      var space = this.getParentSpace();
      if(window.getSelection().toString().match(/\S+/) != null && space.unsavedShiftOnPage != true) {
        // var newRangeRef = ShiftSpace.RangeCoder.toRef(window.getSelection().getRangeAt(0));
        // self.unsavedCutupOnPage = true; 
      }else{
      }
    },
    
    detachWidgetButtonEvents: function(){
      var space = this.getParentSpace();
      var self = this;
      
      space.SSCutupButtonCutup.removeEvents("mousedown");
      space.SSCutupButtonSave.removeEvents("mousedown");
      space.SSCutupButtonCancel.removeEvents("mousedown");   
      space.SSCutupButtonLarger.removeEvents("mousedown");
      space.SSCutupButtonSmaller.removeEvents("mousedown");
    },
    
    attachWidgetButtonEvents: function(){
      var space = this.getParentSpace();
      var self = this;
      
      space.SSCutupButtonCutup.addEvent("mousedown",function(){
          self.fireCutup(); 
      });
      
      space.SSCutupButtonSave.addEvent("mousedown",function(){
          
          if(space.SSCutupTitle.value.match(/\S+/) == null){
            alert("You must give your Cutup a title before saving");
            return false;
          }
          
          self.detachWidgetButtonEvents();
          self.save();
      });
      
      space.SSCutupButtonCancel.addEvent("mousedown",function(){
          self.cancelCutup();
      });
      
      space.SSCutupButtonLarger.addEvent("mousedown",function(){
          self.incrementChunkAmount();
      });
      
      space.SSCutupButtonSmaller.addEvent("mousedown",function(){
          self.decrementChunkAmount();
      });
      
    },
    
    incrementChunkAmount: function(){
      var space = this.getParentSpace();
      var amount = parseInt(space.SSCutupChunkAmount.getText());
      
      if(amount < 20){
        amount = amount + 1;
        space.SSCutupChunkAmount.setText(amount);
      }else{
        amount = 1;
        space.SSCutupChunkAmount.setText(amount);
      }
      this.setWordChunkSize(amount);
    },    
    
    decrementChunkAmount: function(){
      var space = this.getParentSpace();
      var amount = parseInt(space.SSCutupChunkAmount.getText());
      
      if(amount > 1){
        amount = amount - 1;
        space.SSCutupChunkAmount.setText(amount);
      }else{
        amount = 20;
        space.SSCutupChunkAmount.setText(amount);
      }
      this.setWordChunkSize(amount);
    },
    
    cancelCutup: function(){
      // remove from visible shifts!! need to create!
      var space = this.getParentSpace();
      //cancel is to be used during the creation of a shift nowhere else as will
      //cause ConFrusions
      if(this.cutupTextOnPage == false) return false;
      // ignores the specific shift since only one cutup can be on at a given moment 
      // search for all span elements with _shiftspace_cutup attribute and open them
      var xPathResult = document.evaluate(".//span[@sscutupid='" + this.sscutupid + "']", document, null,
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

      space.removeFromVisibleShifts(this.sscutupid);
      
      this.cutupTextOnPage = false;
      
      space.SSCutupButtonCutup.setStyle('background-position','center 0px');
        
    },

    hideCutups: function(json) {
        //console.log("==================================================Space hideCutups");
  
        // ignores the specific shift since only one highlight can be on at a given moment 
        // search for all span elements with _shiftspace_highlight attribute and open them
        var xPathResult = document.evaluate(".//span[@sscutupid='" + json.sscutupid + "']", document, null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        
        var parentNodes = [];
        for (var i=0,l=0; i < xPathResult.snapshotLength; i++) {
          //if is not an empty node grab content from json
          var spanElement = xPathResult.snapshotItem(i);
          if(!xPathResult.snapshotItem(i).textContent.match(/^\s+$/) && this.isValidCutupTextNode(xPathResult.snapshotItem(i))){
            var newTextNode = document.createTextNode(json.range['origArray'][l]);
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
  
    },     
    
    hide: function(){
       //console.log("=================================================Shift hide");
      var space = this.getParentSpace();
      console.log("===============================Shift hide this",this);
      // space.removeFromVisibleShifts(this.json.id);
      this.hideCutups(this);
      this.cutupTextOnPage = false;
    },
    
    setWordChunkSize: function(numOfWords){
      var pattern = "(\\S+(\\s?)+){1," + numOfWords + "}";
      this.wordPattern = new RegExp(pattern,"g");
    },
    
    wordPattern: new RegExp("(\\S+(\\s?)+){1,1}","g"),
    
    fireCutup: function(){
      console.log("=======fireCutup sscutupid",this.sscutupid);
      var space = this.getParentSpace();
      var self = this;
      //if selection exists and there is no an unsaved cutup on the page
      if (!window.getSelection().getRangeAt(0).collapsed && this.cutupTextOnPage == false) {
        
         var newRangeRef = ShiftSpace.RangeCoder.toRef(window.getSelection().getRangeAt(0));
         //if this newRangeRef conflicts with on currently show dont create
         if(!space.canShowRange(newRangeRef)){
           newRangeRef = null;
           return false;
         }
         
         // this.ranges = [];
         
         // this.ranges.push(newRangeRef);
         this.range = newRangeRef;
          
         this.turnOnRangeRef(newRangeRef);
         
          //cutupTextArray contains text in selected range 'cutup'
          newRangeRef.cutupsArray = this.cutupTextArray;
          //origTextArray contains original text selected
          newRangeRef.origArray = this.origTextArray;
          
          // this.unsavedCutupOnPage = true;
          
          // this.visibleShifts.push(newRangeRef);//add to list of visible shifts
          space.SSCutupButtonCutup.setStyle('background-position','center -60px');
          this.cutupTextOnPage = true;
      }else if(this.cutupTextOnPage == true){
        //origTextArray exists so just re-cutup current cutup
          var xPathQuery = "//*[@sscutupid='"  + this.sscutupid + "']";
          var xPathResult = document.evaluate(xPathQuery, document.body, null,
              XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
          this.cutupRange(xPathResult);
      }else{
        return false;
      }
      return false;
    },
    
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
      console.log("=======================================turnonrangeref");
      var self = this;
      
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
          enclosingSpan.id = this.getId();
          
          enclosingSpan.setAttribute("sscutupid",this.sscutupid);
          enclosingSpan.setAttribute("class","SSCutup");
          this.surroundTextNode(xPathResult.snapshotItem(i), range, enclosingSpan);
      }
      //if cutUpArray does not exist call cutupRange on xPathResult of cutups span
      if(!this.cutupTextArray){
        var xPathQuery = "//*[@sscutupid='"  + this.sscutupid + "']";
        var xPathResult2 = document.evaluate(xPathQuery, objAncestor, null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        //iterate through snapshot & rewrite textnodes
        this.cutupRange(xPathResult2);
      }else{
        var xPathQuery = "//*[@sscutupid='"  + this.sscutupid + "']";
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

    cutupRange: function(xPathResult){
      console.log("===================xPathResult",xPathResult);
      var space = this.getParentSpace();
      
      
      //why doesn't this.isNewShift() work?
      
      if(this.cutupTextOnPage == false){
        //if there is no unsaved cutup on page then create new arrays to hold text 
        //otherwise use those current
        this.cutupTextArray = Array();  //contains cutup text nodes
        this.origTextArray = Array();   //contains precutup orig text nodes
        this.joinedTextArray = Array();   //contains text from all text nodes split into single array
        //break up snapshot into arrays of words
        for ( var i=0 ; i < xPathResult.snapshotLength; i++ ){
            if(this.isValidCutupTextNode(xPathResult.snapshotItem(i))){
              var text = xPathResult.snapshotItem(i).textContent;
              console.log("=============cutupRange",text);
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
            trans = trans - 0.02;
            $$('.SSCutup').setStyle('background-color','rgba(167,8,4,' + trans + ')')
            setTimeout(fade,50);
          }
        }
        return fade();
      }
      fadeToTrans();
    },
    
    isValidCutupTextNode: function(node){
     return ($(node) != null && $(node) != undefined && $(node).getParent().nodeName != "SCRIPT"); 
    },
    
});

var Cut = new CutupsSpace(CutupsShift);


