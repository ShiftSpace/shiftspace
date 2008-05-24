var CutupsSpace = ShiftSpace.Space.extend({
  attributes: {
    name: 'Cutups',
    icon: 'HelloWorld.png', 
    version: 0.1,
    css: 'spaces/Cutups/Cutups.css'
  },
  setup: function() {
    this.fireCutup = function(e){
      console.log("fired event");
            if (!window.getSelection().getRangeAt(0).collapsed) {
               var newRangeRef = ShiftSpace.RangeCoder.toRef(window.getSelection().getRangeAt(0));
                if (!this.getCurrentShift().ranges){
                    this.getCurrentShift().ranges = [];
                }
                this.getCurrentShift().ranges.push(newRangeRef);
                this.turnOnRangeRef(newRangeRef);
                newRangeRef.cutupsArray = this.multiLineArray;
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
    if(ref.cutupsArray){
      console.log("array exists");
    }else{
      console.log("no array");
    }
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
      for(var i=0; i<xPathResult2.snapshotLength; i++){
        xPathResult2.snapshotItem(i).textContent = ref.cutupsArray[i].join("");
      }
    }
  },
  cutupRange: function(xPathResult){
    var multiLineArray = Array();//2 dim array contains text for each node
    var joinedArray = Array();//contains all text split into single array
    var pattern = /(\s)?\S+/g;
    //break up snapshot into arrays of words
    for ( var i=0 ; i < xPathResult.snapshotLength; i++ ){
        var text = xPathResult.snapshotItem(i).textContent;
        var lineArray = text.match(pattern);
        joinedArray = joinedArray.concat(lineArray);
        //do not add empty nodes to array
        if(lineArray != null){
          multiLineArray.push(lineArray);
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
    for(var x=0;x<multiLineArray.length;x++){
        for(var y=0;y<multiLineArray[x].length;y++){
            multiLineArray[x][y] = joinedArray[i];
            i++;
        }
    }
    //reinsert sorted array as string back into document
    for ( var i=0,l=0; i < xPathResult.snapshotLength; i++ ){
      //if node is not empty
      if(!xPathResult.snapshotItem(i).textContent.match(/^\s+$/)){
        xPathResult.snapshotItem(i).textContent = multiLineArray[l].join("");
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
    var widgetButtonCut = new ShiftSpace.Element('span',{
      'id':'SSCutupButton'});
    var widgetButtonSave = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonSave'});
    var widgetButtonClose = new ShiftSpace.Element('span',{
      'id':'SSCutupButtonClose'});
    widgetButtonCut.appendText('cutup selection');
    widgetButtonSave.appendText('save');
    widgetButtonClose.appendText('close');
    widget.appendChild(widgetButtonCut);
    widget.appendChild(widgetButtonSave);
    widget.appendChild(widgetButtonClose);
    document.body.appendChild(widget);
    widget.makeDraggable();
    widget.addEvents({
        'mouseenter':function(){
          this.setStyle('opacity',1.0);
        },
        'mouseleave':function(){
          this.setStyle('opacity',0.98);
        }
    });
    widgetButtonCut.addEvents({
        'mouseenter':function(){
          this.setStyle('backgroundColor','#AAAAAA');
        },
        'mouseleave':function(){
          this.setStyle('backgroundColor','#999999');
        },
        'mousedown':function(){
          this.setStyle('backgroundColor','#BBBBBB');
        },
        'mouseup':function(){
          this.setStyle('backgroundColor','#999999');
        }
    });
    widgetButtonSave.addEvents({
        'mouseenter':function(){
          this.setStyle('backgroundColor','#AAAAAA');
        },
        'mouseleave':function(){
          this.setStyle('backgroundColor','#999999');
        },
        'mousedown':function(){
          this.setStyle('backgroundColor','#BBBBBB');
        },
        'mouseup':function(){
          this.setStyle('backgroundColor','#999999');
        }
    });
    widgetButtonClose.addEvents({
        'mouseenter':function(){
          this.setStyle('backgroundColor','#AAAAAA');
        },
        'mouseleave':function(){
          this.setStyle('backgroundColor','#999999');
        },
        'mousedown':function(){
          this.setStyle('backgroundColor','#BBBBBB');
        },
        'mouseup':function(){
          this.setStyle('backgroundColor','#999999');
        }
    });
    this.widget = widget;
    widgetButtonCut.addEvent('mouseup',this.fireCutup.bind(this));
    widgetButtonSave.addEvent('mouseup',this.save.bind(this));
  },
  hideInterface: function(){
    if(this.widget){
      this.widget.addClass('SSDisplayNone');
    }
    document.removeEventListener('mouseup',this.fireCutup,false);
    this.interfaceBuilt = false;
  },
  hideCutups: function() {
      // ignores the specific shift since only one highlight can be on at a given moment 
      // search for all span elements with _shiftspace_highlight attribute and open them
      var xPathResult = document.evaluate(".//span[attribute::_shiftspace_cutups='on']", document, null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);        

      var parentNodes = [];

      for (var i = 0, l = xPathResult.snapshotLength; i < l; i++) {
          var spanElement = xPathResult.snapshotItem(i);
          var newTextNode = document.createTextNode(spanElement.textContent);
          parentNodes[i] = spanElement.parentNode;
          spanElement.parentNode.replaceChild(newTextNode, spanElement);
      } 

      for (var i = 0, l = xPathResult.snapshotLength; i < l; i++) {
          parentNodes[i].normalize();
      } 
  },  
  save: function() {
    this.getCurrentShift().save();
  }
});

var CutupsShift = ShiftSpace.Shift.extend({
    setup: function(json){
      if(json.ranges){
          //replace __newline__ token with \n
          for(var i=0; i<json.ranges.length; i++){
            json.ranges[i].origText = json.ranges[i].origText.replace(new RegExp("__newline__","g"),"\n");
            json.ranges[i].ancestorOrigTextContent = json.ranges[i].ancestorOrigTextContent.replace(new RegExp("__newline__","g"),"\n");
          }
        }
        this.ranges = json.ranges;
    },
    encode: function() {
      //tokenize newline with __newline__
      for(var i=0; i<this.ranges.length; i++){
        this.ranges[i].origText = this.ranges[i].origText.replace(new RegExp("\\n","g"),"__newline__");
        this.ranges[i].ancestorOrigTextContent = this.ranges[i].ancestorOrigTextContent.replace(new RegExp("\\n","g"),"__newline__");
      }        
      return {
          ranges: this.ranges,
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
      this.getParentSpace().hideCutups();
    }
});

var Cut = new CutupsSpace(CutupsShift);
