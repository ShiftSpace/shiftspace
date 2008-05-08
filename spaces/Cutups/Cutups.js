var CutupsSpace = ShiftSpace.Space.extend({
  attributes: {
    name: 'Cutups',
    icon: 'HelloWorld.png', 
    version: 0.1,
    css: 'Cutups.css'
  },
  setup: function() {
    this.mouseup = function(e){
          if (!window.getSelection().getRangeAt(0).collapsed) {
             var newRangeRef = ShiftSpace.RangeCoder.toRef(window.getSelection().getRangeAt(0));
             //save scrambled text as array
              newRangeRef.cutUpArray = this.cutUpArray;
              if (!this.getCurrentShift().ranges){
                  this.getCurrentShift().ranges = [];
              }
              this.getCurrentShift().ranges.push(newRangeRef);
              this.turnOnRangeRef(newRangeRef);
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
        enclosingSpan.setAttribute("_shiftspace_cutups", "on");
        this.surround_text_node(xPathResult.snapshotItem(i), range, enclosingSpan);
    }
    //call cutupRange on xPathResult of cutups span
    var xPathQuery = "//*[@id='"  + this.getCurrentShift().getId() + "']";
    var xPathResult2 = document.evaluate(xPathQuery, objAncestor, null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    //iterate through snapshot & rewrite textnodes
    this.cutupRange(xPathResult2);
  },
  cutupRange: function(xPathResult){
    var multiLineArray = Array();//2 dim array contains text for each node
    var joinedArray = Array();//contains all text split into single array
    var pattern = /(\s)?S+/g;
    //break up snapshot into arrays of words
    for ( var i=0 ; i < xPathResult.snapshotLength; i++ ){
        var pattern = /(\s)?\S+/g;
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
  },
  showInterface: function(){
    //create widget here
    document.addEventListener('mouseup',this.mouseup,false);
  },
  save: function() {
    this.getCurrentShift().summary = this.summary.value;
    this.getCurrentShift().save();
  }
});

var CutupsShift = ShiftSpace.Shift.extend({
    setup: function(json) {
        this.ranges = json.ranges;
        this.summary = json.summary;
    },
    encode: function() {
        return {
            ranges: this.ranges,
            summary: this.summary
        };
    },
    show: function() {
        var space = this.getParentSpace();
        space.showInterface();
        if (this.ranges) {
            space.summary.value = this.summary;
        
            for (var i = 0; i < this.ranges.length; i++) {
                space.turnOnRangeRef(this.ranges[i]);
            }
        }
        window.location.hash = this.getId();
    }
});

var Cut = new CutupsSpace(CutupsShift);
