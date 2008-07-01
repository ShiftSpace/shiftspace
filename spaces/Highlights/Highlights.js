var HighlightsSpace = ShiftSpace.Space.extend({
    attributes: {
        name: 'Highlights',
        version: 0.1, 
        icon: 'Highlights.png',
        css: 'spaces/Highlights/Highlights.css'
    },
    
    setup: function() {
        this.mousemove = function(e) {
            this.cursor.style.left = (e.pageX + 6) + 'px';
            this.cursor.style.top = (e.pageY - 8) + 'px';
        }.bind(this);
        
        this.mousedown = function(e) {
            this.cursor.style.display = 'none';
        }.bind(this);
    
        this.highlight_end = function(e) {
            if (!window.getSelection().getRangeAt(0).collapsed) {
                this.cursor.style.display = 'block';
		var range = window.getSelection().getRangeAt(0);
                var newRangeRef = ShiftSpace.RangeCoder.toRef(range);
                newRangeRef.color = this.color; 
                if (!this.getCurrentShift().ranges)
                    this.getCurrentShift().ranges = [];

		if (this.summary.value == '')
			this.summary.value = range.toString();
                
                this.getCurrentShift().ranges.push(newRangeRef);
                this.turnOnRangeRef(newRangeRef);
            }
            
            return false;
        }.bind(this);
    },

    selectColor: function(colorElement, color) {
        if (!color)
            this.color = document.defaultView.getComputedStyle(colorElement, "").borderBottomColor;
        else
            this.color = color;

        if (this.colorElement) { 
            this.colorElement.style.borderBottomStyle = 'none';
        }
                
        this.colorElement = colorElement;
        colorElement.style.borderBottomStyle = 'solid';
    },

    addColor: function(style, selectedColor) {
        var colorElement = this.colorsSpan.appendChild(new ShiftSpace.Element('span', {
            'class': 'GenericHighlightsColor ' + style}));
            
        colorElement.addEventListener('click', function(e) {
            this.selectColor(e.target);
        }.bind(this), false);
  
        if (selectedColor)
            this.selectColor(colorElement, selectedColor);
    },

    showInterface: function() 
    {
        this.parent();
        this.container.removeClass('SSDisplayNone');
    },
    
    buildInterface: function() {
        // create a table to function as the highlight tool bar
        var tableContainer = new ShiftSpace.Element('span', {
            'class': 'TableContainer'});
        
        tableContainer.appendChild(new ShiftSpace.Element('span', {
            'class': 'HighlightsSummary'}));        
            
        this.summary = tableContainer.appendChild(new ShiftSpace.Element('input', {
            'class': 'HighlightsInput'}));
        
        this.colorsSpan = new ShiftSpace.Element('span', {
            'class': 'HighlightsColors'});
        
        document.body.appendChild(tableContainer);
        tableContainer.appendChild(this.colorsSpan);

        {
            this.addColor('HighlightsColor1', '#FF0'); // hack!
            // try to see why getComputedStyle in selectColor doesn't work
            // the first time!

            this.addColor('HighlightsColor2');
            this.addColor('HighlightsColor3');
            this.addColor('HighlightsColor4');
            this.addColor('HighlightsColor5');
            this.addColor('HighlightsColor6');
        }


        var closeButton = new ShiftSpace.Element('span', {
            'class': 'HighlightsClose'});
      
        closeButton.addEventListener('click', this.cancel.bind(this), false);            
        tableContainer.appendChild(closeButton);

        var saveButton = new ShiftSpace.Element('button', {
            'class': 'HighlightsGenericButton HighlightsSaveButton'});
            
        saveButton.appendText('Save highlight');
        saveButton.addEventListener('click', this.save.bind(this), false);
        tableContainer.appendChild(saveButton);
        
        var cancelButton = new ShiftSpace.Element('button', {
            'class': 'HighlightsGenericButton HighlightsCancelButton'});
            
        cancelButton.appendText('Cancel');
        cancelButton.addEventListener('click', this.cancel.bind(this), false);
        tableContainer.appendChild(cancelButton);
        
        this.container = tableContainer;

        this.cursor = document.body.appendChild(new ShiftSpace.Element('span', {
            'class': 'HighlightsCursor'}));
        
        document.addEventListener('mousemove', this.mousemove, false);
        document.addEventListener('mousedown', this.mousedown, false);
        document.addEventListener('mouseup', this.highlight_end, false);
    },
    
    surround_text_node: function(oNode, objRange, surroundingNode)
    {
        var tempRange;
        //console.log(surroundingNode);

        //if this selection starts and ends in teh same node
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
          String.clean(xPathResult.snapshotItem(i).textContent);
        }
        for (var i = 0, l = xPathResult.snapshotLength; i < l; i++) {
            // we need clean styles so we don't use ShiftSpace.Element
            var enclosingSpan = document.createElement("span");
            enclosingSpan.id = this.getCurrentShift().getId();
            enclosingSpan.setAttribute("_shiftspace_highlight", "on");
            enclosingSpan.style.backgroundColor = ref.color; 

            this.surround_text_node(xPathResult.snapshotItem(i), range, enclosingSpan);
        }
    },

    cancel: function() {
        this.hideHighlights();
        this.hideInterface();        
    },

    hideInterface: function() {
        if(this.container)
        {
          this.container.addClass('SSDisplayNone');
          this.cursor.style.display = 'none';
        }
        
        document.removeEventListener('mousemove', this.mousemove, false);
        document.removeEventListener('mousedown', this.mousedown, false);
        document.removeEventListener('mouseup', this.highlight_end, false);
        
        this.interfaceBuilt = false;
    },
    
    hideHighlights: function() {
        // ignores the specific shift since only one highlight can be on at a given moment 
        // search for all span elements with _shiftspace_highlight attribute and open them
        var xPathResult = document.evaluate(".//span[attribute::_shiftspace_highlight='on']", document, null,
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
        this.getCurrentShift().summary = this.summary.value;
        this.getCurrentShift().save();
    }
});

var HighlightsShift = ShiftSpace.Shift.extend({
    setup: function(json) {
        if(json.ranges){
          //replace __newline__ token with \n
          for(var i=0; i<json.ranges.length; i++){
            json.ranges[i].origText = json.ranges[i].origText.replace(new RegExp("__newline__","g"),"\n");
            json.ranges[i].ancestorOrigTextContent = json.ranges[i].ancestorOrigTextContent.replace(new RegExp("__newline__","g"),"\n");
          }
        }
        this.ranges = json.ranges;
        this.summary = json.summary;
    },
    encode: function() {
        //tokenize newline char with __newline__
        for(var i=0; i<this.ranges.length; i++){
          this.ranges[i].origText = this.ranges[i].origText.replace(new RegExp("\\n","g"),"__newline__");
          this.ranges[i].ancestorOrigTextContent = this.ranges[i].ancestorOrigTextContent.replace(new RegExp("\\n","g"),"__newline__");
        }
        return {
            ranges: this.ranges,
            summary: this.summary
        };
    },
    show: function() {
        var space = this.getParentSpace();
        space.hideHighlights();
        //space.showInterface();
    
        if (this.ranges) {
            //space.summary.value = this.summary;
            for (var i = 0; i < this.ranges.length; i++) {
                space.turnOnRangeRef(this.ranges[i]);
            }
        }
        
        window.location.hash = this.getId();
    },
    
    hide: function() {
        this.getParentSpace().hideHighlights();
    }
});
var Highlights = new HighlightsSpace(HighlightsShift);

