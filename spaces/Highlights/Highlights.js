var HighlightsSpace = new Class({
  Extends: ShiftSpace.Space,

  colors: ["#ff0", "#0f0", "#6dcff6", "#fea600", "#ff43bf", "#c443ff"],

  setup: function() {
    // we can longer use bound functions as event handler in FF3
    // bound functions will throw a security error. Instead we just
    // manually create a closure.
    var self = this;

    this.initUI();

    this.mousemove = function(e) {
      self.cursor.style.left = (e.pageX + 6) + 'px';
      self.cursor.style.top = (e.pageY - 8) + 'px';
    };

    this.mousedown = function(e) {
      self.cursor.style.display = 'none';
    };

    this.highlight_end = function(e) {
      if ($(e.target).hasClass('ShiftSpaceElement')) return null;
      if (!window.getSelection().getRangeAt(0).collapsed) {
        self.cursor.style.display = 'block';
        var range = window.getSelection().getRangeAt(0),
            newRangeRef = ShiftSpace.RangeCoder.toRef(range);
        newRangeRef.color = self.color;
        if (!self.getCurrentShift().ranges) self.getCurrentShift().ranges = [];
        if (!self.summary.get("value")) self.summary.set("value", range.toString());
        self.getCurrentShift().ranges.push(newRangeRef);
        self.turnOnRangeRef(newRangeRef);
      }
      return false;
    };
  },

  initUI: function() {
    this.element = this.template("space").toElement();
    this.element.addClass("SSDisplayNone");
    $(document.body).grab(this.element);

    var colorEls = this.element.getElements(".GenericHighlightsColor");
    // TODO: will probably cause trouble in GreaseMonkey - David
    colorEls.addEvent("click", function(e) {
      e = new Event(e);
      var target = e.target;
      this.selectColor(colorEls.indexOf(target)+1);
    }.bind(this));
    
    this.cursor = new ShiftSpace.Element('span', {
      'id': 'HighlightsCursor'
    });
    this.cursor.injectInside(document.body);

    this.summary = this.element.getElement(".HighlightsSummary");
    
    this.attachEvents();
    this.selectColor(1);
  },

  attachEvents: function() {
    this.element.getElement('.HighlightsClose').addEvent('click', this.cancel.bind(this));
  },

  showShift: function(aShift) {
    var currentShift = this.getCurrentShift();
    if(currentShift) currentShift.hide();
    this.parent(aShift);
  },

  onShiftShow: function(shiftId) {
    if(this.interfaceIsBuilt()) {
      var title = this.getShift(shiftId).getTitle();
      $$('.HighlightsInput')[0].setProperty('value', title);
    }
  },

  selectColor: function(n) {
    this.color = this.colors[n-1];
    var colorEls = this.element.getElements(".GenericHighlightsColor").removeClass("selected");
    colorEls[n-1].addClass("selected");
  },

  addColor: function(style, selectedColor) {
    var self = this,
        colorElement = new ShiftSpace.Element('span', {
          'class': 'GenericHighlightsColor ' + style
        });
    colorElement.injectInside(this.colorsSpan);
    colorElement.addEvent('click', function(e) {
      self.selectColor(e.target);
    });
    if (selectedColor) this.selectColor(colorElement, selectedColor);
  },

  showInterface: function() {
    // need to call the parent first
    this.parent();
    this.element.removeClass('SSDisplayNone');
    this.cursor.setStyle('display', 'block');
    this.addHighlightEvents();
  },

  hideInterface: function() {
    this.parent();
    this.element.addClass('SSDisplayNone');
    this.cursor.setStyle('display', 'none');
    this.removeHighlightEvents();
  },

  addHighlightEvents: function() {
    // we need to add mouse listening events here
    window.addEvent('mousemove', this.mousemove);
    window.addEvent('mousedown', this.mousedown);
    window.addEvent('mouseup', this.highlight_end);
  },

  removeHighlightEvents: function() {
    // remove the mouse events
    window.removeEvent('mousemove', this.mousemove);
    window.removeEvent('mousedown', this.mousedown);
    window.removeEvent('mouseup', this.highlight_end);
  },

  getTitle: function() {
    return $$('.HighlightsInput')[0].getProperty('value');
  },

  buildInterface: function() {
  },

  surround_text_node: function(oNode, objRange, surroundingNode) {
    var tempRange;
    //if this selection starts and ends in teh same node
    if((oNode==objRange.startContainer) &&
       (oNode==objRange.endContainer)) {
      objRange.surroundContents(surroundingNode);
    } else {
      if(objRange.isPointInRange(oNode,1) || oNode==objRange.startContainer) {
        //check if the node is in the middle of the selection
        if((oNode!=objRange.startContainer)&&(oNode!=objRange.endContainer)) {
          //surround the whole node
          surroundingNode.textContent = oNode.textContent;
          oNode.parentNode.replaceChild(surroundingNode, oNode);
        } else if(oNode==objRange.startContainer) {
          //surround the node from the start point
          tempRange = document.createRange();
          tempRange.setStart(oNode, objRange.startOffset);
          tempRange.setEnd(oNode, oNode.textContent.length);
          tempRange.surroundContents(surroundingNode);
        } else if(oNode==objRange.endContainer) {
          //surround the node from the start point
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
    // check to make sure the range is actually valid
    if(range) {
      var objAncestor = range.commonAncestorContainer;
      if (objAncestor.nodeType == 3) // text node
      objAncestor = objAncestor.parentNode;
      var xPathResult = document.evaluate(".//text()", objAncestor, null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
      // iteratate on all the text nodes in the document and mark if they are in the selection range
      for (var i = 0, l = xPathResult.snapshotLength; i < l; i++) {
        String.clean(xPathResult.snapshotItem(i).textContent);
      }
      for (i = 0, l = xPathResult.snapshotLength; i < l; i++) {
        // we need clean styles so we don't use ShiftSpace.Element
        var enclosingSpan = document.createElement("span");
        enclosingSpan.id = this.getCurrentShift().getId();
        enclosingSpan.setAttribute("_shiftspace_highlight", "on");
        enclosingSpan.style.backgroundColor = ref.color;
        this.surround_text_node(xPathResult.snapshotItem(i), range, enclosingSpan);
      }
    }
  },

  cancel: function() {
    this.getCurrentShift().hide();
    this.hideInterface();
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
    for (i = 0, l = xPathResult.snapshotLength; i < l; i++) {
      parentNodes[i].normalize();
    }
  },

  save: function() {
    // update the title
    this.getCurrentShift().setTitle($(this.summary).getProperty('value'));
    // save the shift
    this.getCurrentShift().save();
  }
});


var HighlightsShift = new Class({
  Extends: ShiftSpace.Shift,

  setup: function(json) {
    if(json.ranges) {
      //replace __newline__ token with \n
      for(var i=0; i<json.ranges.length; i++) {
        json.ranges[i].origText = this.deTokenizeNewline(json.ranges[i].origText);
        json.ranges[i].ancestorOrigTextContent = this.deTokenizeNewline(json.ranges[i].ancestorOrigTextContent);
      }
    }
    this.ranges = json.ranges;
    this.summary = json.summary;
  },

  encode: function() {
    if (this.ranges) {
      //tokenize newline char with __newline__
      for(var i=0; i<this.ranges.length; i++) {
        this.ranges[i].origText = this.tokenizeNewline(this.ranges[i].origText);
        this.ranges[i].ancestorOrigTextContent = this.tokenizeNewline(this.ranges[i].ancestorOrigTextContent);
      }
    }
    return {
      ranges: this.ranges,
      summary: this.getTitle()
    };
  },

  show: function() {
    // call to parent
    this.parent();
    var space = this.getParentSpace();
    space.hideHighlights();
    if (this.ranges) {
      //space.summary.value = this.summary;
      for (var i = 0; i < this.ranges.length; i++) {
        if(this.ranges[i].origText){
          this.ranges[i].origText = this.deTokenizeNewline(this.ranges[i].origText);
        }
        if(this.ranges[i].ancestorOrigTextContent){
          this.ranges[i].ancestorOrigTextContent = this.deTokenizeNewline(this.ranges[i].ancestorOrigTextContent);
        }
        space.turnOnRangeRef(this.ranges[i]);
      }
    }
    window.location.hash = this.getId();
  },

  hide: function() {
    // call to parent
    this.parent();

    this.getParentSpace().hideHighlights();
  },

  defaultTitle: function() {
    return "Untitled";
  },

  tokenizeNewline: function(text){
    var tokenizedText = text.replace(new RegExp("\\n","g"),"__newline__");
    return tokenizedText;
  },

  deTokenizeNewline: function(text){
    var deTokenizedText = text.replace(new RegExp("__newline__","g"),"\n");
    return deTokenizedText;
  }
});