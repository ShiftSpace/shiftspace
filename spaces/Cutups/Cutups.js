var CutupsSpace = ShiftSpace.Space.extend({
  attributes: {
    name: 'Cutups',
    icon: 'Cutups.png', 
    version: 0.1,
    css: 'spaces/Cutups/Cutups.css'
  },
  setup: function() {
    this.fireCutup = function(e){
            if (!window.getSelection().getRangeAt(0).collapsed) {
               var newRangeRef = ShiftSpace.RangeCoder.toRef(window.getSelection().getRangeAt(0));
                if (!this.getCurrentShift().ranges){
                    this.getCurrentShift().ranges = [];
                }
                this.getCurrentShift().ranges.push(newRangeRef);
                this.turnOnRangeRef(newRangeRef);
                //multiLineArray contains textnodes as they appear in their original
                //form and broken into a randomized array of words
                newRangeRef.cutupsArray = this.multiLineArray['cutup'];
                newRangeRef.origArray = this.multiLineArray['orig'];
            }else{
            /*
            Changed code so that user can press cutup multiple times to 
            change text until desired result. Need to add functionality so that
            multiple ranges can be created.
            */                
                var xPathQuery = "//*[@id='"  + this.getCurrentShift().getId() + "']";
                var xPathResult2 = document.evaluate(xPathQuery, document.body, null,
                    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                this.cutupRange(xPathResult2);               
            }
            return false;
    }.bind(this);
  },  
  surround_text_node: function(oNode, objRange, surroundingNode){
      var tempRange;
      //console.log(surroundingNode);
  
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
    //if cutUpArray does not exist
    //call cutupRange on xPathResult of cutups span
    if(!ref.cutupsArray){
      var xPathQuery = "//*[@id='"  + this.getCurrentShift().getId() + "']";
      var xPathResult2 = document.evaluate(xPathQuery, objAncestor, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      //iterate through snapshot & rewrite textnodes
      //need to move this otherwise randomizaton operation will be applied every
      //time the shift is shown
      this.cutupRange(xPathResult2);
    }else{
      var xPathQuery = "//*[@id='"  + this.getCurrentShift().getId() + "']";
      var xPathResult2 = document.evaluate(xPathQuery, objAncestor, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    //reinsert sorted array as string back into document
      for ( var i=0,l=0; i < xPathResult2.snapshotLength; i++ ){
        //if node is not empty
        if(!xPathResult2.snapshotItem(i).textContent.match(/^\s+$/)){
          xPathResult2.snapshotItem(i).textContent = ref.cutupsArray[l].join("");
          l++
        }
      }
    }
  },
  cutupRange: function(xPathResult){
    var multiLineArray = Array();//2 dim array contains text for each node
    multiLineArray['cutup'] = Array();
    multiLineArray['orig'] = Array();
    var joinedArray = Array();//contains all text split into single array
    var pattern = /(\s)?\S+/g;
    //break up snapshot into arrays of words
    for ( var i=0 ; i < xPathResult.snapshotLength; i++ ){
        var text = xPathResult.snapshotItem(i).textContent;
        var lineArray = text.match(pattern);
        joinedArray = joinedArray.concat(lineArray);
        //do not add empty nodes to array
        if(lineArray != null){
          multiLineArray['cutup'].push(lineArray);
          multiLineArray['orig'].push(text);
        }
    }
    //filter out null values
    joinedArray = joinedArray.filter(function(item,index){
        return item != null;
    });
    //randomly sort joined arrays
    joinedArray.sort(function(a,b){
        return Math.random() - 0.5;
    });
    //break up reinsert sorted item into multiline array
    //this keeps the same number of words in each node
    //while the actual words change
    var i = 0;
    for(var x=0;x<multiLineArray['cutup'].length;x++){
        for(var y=0;y<multiLineArray['cutup'][x].length;y++){
            multiLineArray['cutup'][x][y] = joinedArray[i];
            i++;
        }
    }
    //reinsert sorted array as string back into document
    for ( var i=0,l=0; i < xPathResult.snapshotLength; i++ ){
      //if node is not empty
      if(!xPathResult.snapshotItem(i).textContent.match(/^\s+$/)){
        xPathResult.snapshotItem(i).textContent = multiLineArray['cutup'][l].join("");
        l++
      }
    }
    //this is a bad idea.
    this.multiLineArray = multiLineArray;
  },
  showInterface: function(){
    this.parent();
    this.widget.removeClass('SSDisplayNone');
  },
  buildInterface: function(){
    var widget = new ShiftSpace.Element('div',{
      'id':'SSCutupWidget'});
    
    var widgetHandle = new ShiftSpace.Element('span',{
      'id':'SSCutupHandle'});
    
    var widgetInputLabel = new ShiftSpace.Element('label',{
      'for':'SSCutupTitle'}).appendText('title:');
    
    var widgetInputTitle = new ShiftSpace.Element('input',{
      'id':'SSCutupTitle',
      'type':'text'
    });
    
    var widgetControls = new ShiftSpace.Element('div',{
      'id':'SSCutupControls'});
    
    var widgetButtonCut = new ShiftSpace.Element('span',{
      'id':'SSCutupButton'});
    
    var widgetButtonSave = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonSave'});
    
    var widgetButtonClose = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonCancel'});
    
    widgetButtonCut.appendText('cutup selection');
    widgetButtonSave.appendText('save');
    widgetButtonClose.appendText('close');
    
    widgetControls.appendChild(widgetButtonCut);
    widgetControls.appendChild(widgetButtonSave);
    widgetControls.appendChild(widgetButtonClose);
    
    widget.appendChild(widgetHandle);
    widget.appendChild(widgetInputLabel);
    widget.appendChild(widgetInputTitle);
    widget.appendChild(widgetControls);
    
    document.body.appendChild(widget);
    
    widget.makeDraggable({'handle':widgetHandle}); 
     widget.addEvents({
         'mouseenter':function(){
          this.setStyle('opacity',1.0);
        },
        'mouseleave':function(){
          this.setStyle('opacity',0.80);
        } 
    });
    var buttonStyleEvents = {
        'mouseenter':function(){
          this.setStyle('backgroundColor','#858585');
        },
        'mouseleave':function(){
          this.setStyle('backgroundColor','#999999');
        },
        'mousedown':function(){
          this.setStyle('backgroundColor','#777777');
          this.setStyle('color','#222222');
        },
        'mouseup':function(){
          this.setStyle('backgroundColor','#999999');
          this.setStyle('color','#333333');
        }
    }
    
    widgetButtonCut.addEvents(buttonStyleEvents);
    widgetButtonSave.addEvents(buttonStyleEvents);
    widgetButtonClose.addEvents(buttonStyleEvents);
    
    this.widget = widget;
    this.summary = widgetInputTitle;
    widgetButtonCut.addEvent('mousedown',this.fireCutup.bind(this));
    widgetButtonSave.addEvent('mouseup',this.save.bind(this));
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
      var xPathResult = document.evaluate(".//span[attribute::_shiftspace_cutups='on']", document, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      
      var parentNodes = [];
      for (var i=0,l=0; i < xPathResult.snapshotLength; i++) {
        if(!xPathResult.snapshotItem(i).textContent.match(/^s+$/)){//HERE
          var spanElement = xPathResult.snapshotItem(i);
          //if is not an empty node grab content from json
          if(!xPathResult.snapshotItem(i).textContent.match(/^\s+$/)){
            var newTextNode = document.createTextNode(json[0]['origArray'][l]);
            l++;
          }else{
            var newTextNode = document.createTextNode(spanElement.textContent);
          }
          parentNodes[i] = spanElement.parentNode;
          spanElement.parentNode.replaceChild(newTextNode, spanElement);
        }
      } 

      for (var i = 0, l = xPathResult.snapshotLength; i < l; i++) {
          parentNodes[i].normalize();
      } 
  },  
  save: function() {
    this.getCurrentShift().summary = this.summary.value;
    this.getCurrentShift().save();
  }
});

var CutupsShift = ShiftSpace.Shift.extend({
    setup: function(json){
      console.log('in shift: ',json);
      if(json.ranges){
          //replace __newline__ token with \n
          for(var i=0; i<json.ranges.length; i++){
            json.ranges[i].origText = json.ranges[i].origText.replace(new RegExp("__newline__","g"),"\n");
            //probably a range coder problem for some reason ancestorOrigTextContent null
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
        //probably a range coder problem for some reason ancestorOrigTextContent null
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
      space.hideCutups();
      if (this.ranges) {
        for (var i = 0; i < this.ranges.length; i++) {
          space.turnOnRangeRef(this.ranges[i]);
        }
      }
      window.location.hash = this.getId();
    },
    hide: function(){
      window.json = this.ranges;
      this.getParentSpace().hideCutups(this.ranges);
    }
});

var Cut = new CutupsSpace(CutupsShift);
