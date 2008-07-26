/*
  Class: RangeCoder
    A convenience class to encode and decode W3C Ranges <-> opaque objects.
*/
var RangeCoder = new Class({
  /*
    Property: toRange
      Takes a reference object and returns a W3C range.  The reference object is 
      JavaScript object composed of the following properties ancestorOrigTextContent, 
      ancestorPosition, startContainerXPath, startContainerOffset, endContainerXPath, 
      endContainerOffset, origText.
      
    Arguments:
      refObj
      
    Returns:
      W3C Range.
      
    Example:
      (start code)
      var userSelection = window.getSelection();
      var myRange = userSelection.getRangeAt(0);
      console.log(ShiftSpace.RangeCoder.toRef(myRange));
      (end)
  */
  toRange: function(refObj)
  {
    //turn on highlight
    var objAncestor = this.getRangeAncestorNode(refObj);
    console.log(objAncestor);
    if (objAncestor)
    {
      console.log('generating range');
      return this.generateRange(objAncestor, refObj);
    }
    var recovered = this.recoverBrokenRange(refObj);
    if (recovered)
	return recovered;
    alert ('Warning: An in-page reference was not recreateable because the webpage has changed. The original referenced text was: ' + refObj.origText);
    return null;
  },

  /*
    Property: toRef
      Given a valid W3C Range, extract relevant info and store.
    
    Arguments:
      range - a W3C Range.
      
  */
  cleanWhitespace: function(node){
    node.innerHTML = node.innerHTML.replace(new RegExp("\\n","g"));
  },
  toRef: function(range)
  {    
    //get the common ancestor
    var objCommonAncestor = range.commonAncestorContainer;
    var origCommonAncestor = false;

    // if the Common Ancestor is text node use the parent node as ancestore since once spliting the text node there will be no ancestor exist for text node
    if(objCommonAncestor.nodeType == 3)
    {
      origCommonAncestor = objCommonAncestor;
      objCommonAncestor = objCommonAncestor.parentNode
    }
    
    var colAncestorPosition = this.getAncestorPosition(objCommonAncestor);
    
    // Create new object for this highlight
    var newRef = 
    {
      // XXX: is this orig_html hack still relevant >=0.11 ??
      ancestorOrigTextContent: (objCommonAncestor.tagName.toLowerCase()=="body")?ShiftSpace.orig_html:objCommonAncestor.textContent,   //to avoid adding the toolbarhtml
      ancestorPosition: colAncestorPosition,
      startContainerXPath: this.generateRelativeXPath(objCommonAncestor, range.startContainer),
      startContainerOffset: range.startOffset,         
      endContainerXPath: this.generateRelativeXPath(objCommonAncestor, range.endContainer),
      endContainerOffset: range.endOffset,   
      origText: range.toString()
    };
    /* newRef.ancestorOrigTextContent = String.clean(newRef.ancestorOrigTextContent); */  
    /* newRef.origText = String.clean(newRef.origText); */
    // Save some extra info which might be useful for recovering if load fails
    // TODO: extra data to save that might be helpful:
    //   xpath from root to common ancestor?  find it even if textcontent changes
    //   location as % within DOM / page / source.  useful to disambiguate
    newRef.startText = range.startContainer.textContent;
    newRef.endText = range.endContainer.textContent;
    newRef.startTag = range.startContainer.tagName;
    newRef.endTag = range.endContainer.tagName;

    // save original ancestor text if stored ancestor is not original
    if (newRef.origCommonAncestor)
      newRef.origAncestorOrigTextContent =  (origCommonAncestor.tagName.toLowerCase()=="body")?ShiftSpace.orig_html:origCommonAncestor.textContent;   //to avoid adding the toolbarhtml

    return newRef;
  },

  //returns the count of nodes that are similar to the ancestor, the index of the ancestor in this array, and the ancestore tagname
  getAncestorPosition: function(oNode)
  {
    //get the array of items with the same tag name
    var iLength,iIndex;
    var nl = document.getElementsByTagName(oNode.tagName);
    var iOccurance=0;
    for (var i=0;i<nl.length;i++)
    if(nl.item(i).textContent==oNode.textContent)
    {
      iOccurance++;
      //check if this is the same Node than set the index
      if(nl.item(i)==oNode)
      iIndex = iOccurance;
    }
    return {tagName:oNode.tagName,
      length:iOccurance,
      ancIndex:iIndex
    };
  },

  generateRelativeXPath: function(contextNode, textNode) 
  {
    var saveTextNode = textNode;

    for (i = 0; textNode; ) 
    {
      if (textNode.nodeType == 3)
      i++;

      textNode = textNode.previousSibling;
    }

    var xpath = '/text()[' + i + ']';
    textNode = saveTextNode.parentNode;

    while (textNode != contextNode && 
           textNode != null) 
    {
      var i;
      var saveTextNode = textNode;

      for (i = 0; textNode; ) {
        if (textNode.nodeType == 1)
        i++;

        textNode = textNode.previousSibling;
      }

      xpath = '/*[' + i + ']' + xpath;
      textNode = saveTextNode.parentNode;
    }

    return '.' + xpath;
  },

  // Generates a proper W3C range from some xpath elements and other
  // bits of data
  generateRange: function(ancestor, refObj) 
  {
    var startContainer = document.evaluate( refObj.startContainerXPath, 
                                            ancestor, 
                                            null,
                                            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, 
                                            null).snapshotItem(0);

    var endContainer = document.evaluate( refObj.endContainerXPath, 
                                          ancestor, 
                                          null,
                                          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, 
                                          null).snapshotItem(0);
    
    var range = document.createRange();
    range.setStart(startContainer, refObj.startContainerOffset);
    range.setEnd(endContainer, refObj.endContainerOffset);

    return range;
   },

  getRangeAncestorNode: function(refObj)
  {
    var returnAncestor;
    var colAncestorPosition   = refObj.ancestorPosition;
    
    //get all the elements with the ancestor tagname
    var nl                    = document.getElementsByTagName(colAncestorPosition.tagName);
    var iIndex                = colAncestorPosition.ancIndex;
    var iOccuranceLength      = 0;
    var targetTextContent     = refObj.ancestorOrigTextContent;

    //check if the tag Name is the body then compare differently
    if (colAncestorPosition.tagName.toLowerCase()=="body")
    {
      //return (targetTextContent==ShiftSpace.orig_text_content)?document.getElementsByTagName('body')[0]:null;
      return document.body;
    }
    else
    {
      //check the number of occurances of the similar nodes
      for (var i=0;i<nl.length;i++)
      {
        if(nl.item(i).textContent==targetTextContent)
        {
          iOccuranceLength++;
          //if this is the occurance index mark the node as the ancestor node
          if (iIndex==iOccuranceLength)
          returnAncestor = nl.item(i);
        }
      }
    }        
    //validate that the page has the same number of occurances to make sure we highlight the right one
    if (iOccuranceLength==colAncestorPosition.length)
    {
      return returnAncestor;          
    }
    else
    {
      return null;
    }
  },

  // simple count of non-overlapping instances of substring within string
  countSubStrings: function(substring, string)
  {
    var offset = 0;
    var count = 0;
    var idx = string.indexOf(substring, offset);
    while (idx >= 0) {
      count++;
      offset = idx + substring.length;
      idx = string.indexOf(substring, offset);
    }
    return count;
  },


  // Count string matches within a node, or within its children if it has them.
  // Counting criteria matches the criteria used when matching range endpoints:
  // We only count matches which are intact within a child (ignore if substring
  // is broken by non-text DOM elements).
  // Don't count if it doesn't have children.  Justification: text node refs
  // are always saved relative to parent, and our recovery method only supports
  // text.  Therefore we are only interested in children.
  countStringMatchesInNodeList: function(nl, text)
  {
    var count = 0;

    for (var i = 0; i < nl.length; i++) 
    {
      var element = nl.item(i);
      if (element.hasChildNodes() && 0 <= element.textContent.indexOf(text))
      {
	for (var j = 0; j < element.childNodes.length; j++) 
	   count += this.countSubStrings (text, element.childNodes[j].textContent);
      }
    }
    return count;
  },

  // Given a string, make it as short as possible while keeping it
  // unique within the content of a nodelist
  shortenUniqueString: function(nl, text, shortenFromEnd)
  {
    // TODO: improve efficiency, split-the-difference rather than shrink-by-one
    var bestText = text;
    var textCount = this.countStringMatchesInNodeList(nl, bestText);
    while (text.length > 4 && textCount <= 1) {
      bestText = text;
      text = shortenFromEnd ? text.substring(0,text.length-2) : text = text.substring(1);
      textCount = this.countStringMatchesInNodeList(nl, text);
    }
    return bestText;
  },

  /*
   * Given pre- and post-text, find corresponding point within a list of DOM elements.
   *
   * Strategy: first minimize pre/posttext to smallest possible unique string.
   * if unique pre or posttext, match pre-then-post.  Else give up.
   */
  DOMPointerFromContext: function(nl, pretext, posttext)
  {
    // XXX don't use if empty/small
    //if (pretext.length < 5)
      //console.log("WARNING, pretext is too short");

    pretext = this.shortenUniqueString(nl, pretext, false);
    var pretextCount = this.countStringMatchesInNodeList(nl, pretext);
    var pretextUnique = (pretextCount == 1) ? true : false;
    posttext = this.shortenUniqueString(nl, posttext, true);
    var posttextCount = this.countStringMatchesInNodeList(nl, posttext);

    // TODO: could minimize even further, pre and post don't need to be unique as long as there is
    // a unique pre-post match.  This yields an even greater chance of matching both within
    // single children (eg not broken by other shifts)
    // console.log("pretext '" + pretext + "' posttext '" + posttext + "'");

    //check the number of occurances of the similar nodes
    for (var i=0;i<nl.length;i++)
    {
      if(0 <= nl.item(i).textContent.indexOf(pretext))
      {
	if (nl.item(i).hasChildNodes()) 
	{
	  var children = nl.item(i).childNodes;
	  for (var j = 0; j < children.length; j++) 
	  {
	    var idxOf =  children[j].textContent.indexOf(pretext);
	    if (idxOf >= 0) 
	    {
		  // if unique or not unique but posttext matches, we've found it
	       var postIdx = children[j].textContent.substring(idxOf + pretext.length).indexOf(posttext);
	       if (pretextUnique || postIdx == 0)
		 return { obj: children[j], offset: idxOf + pretext.length };
	    }
	  }
	}
      }
    }
    
    // Check for posttext
    // XXX: this isn't sorted out yet... should only run if pretext is missing, short, useless
    // perhaps merged with above.  this might not even run currently.
    for (var i=0;i<nl.length;i++)
    {
      if(0 <= nl.item(i).textContent.indexOf(posttext))
      {
	var element = nl.item(i);
	if (element.hasChildNodes()) {
	  var children = element.childNodes;
	  for (var j = 0; j < children.length; j++) 
	  {
	     var idxOf =  children[j].textContent.indexOf(posttext);
	     if (idxOf >= 0)
		  return { obj: children[j], offset: idxOf};
	  }
	}
      }
    }
    return null;
  },

  // Given some data, attempt to return reference to corresponding point in DOM
  DOMPointerFromData: function(nl, text, offset, containerXPath, orig)
  {
      // Handling legacy shifts (without sufficient info to always match text)
      // if the xpath is to the first text element, then we can treat parent text
      // to calculate text contect.  Empirically this is [1].
    if (text || containerXPath == "./text()[1]") {
      var pretext = orig.substring(0,offset);
      var posttext = orig.substring(offset);

      if (text) {
	pretext = text.substring(0,offset);
	posttext = text.substring(offset);
      }

      return this.DOMPointerFromContext(nl, pretext, posttext)
    }
    return null;
  },


  // Given a range, attempt to reconstruct it by examining the original context
  recoverBrokenRange: function(refObj)
  {
    try
    {
      var colAncestorPosition   = refObj.ancestorPosition;
      
      //get all the elements with the ancestor tagname
      var nl                    = document.getElementsByTagName(colAncestorPosition.tagName);

      // Get pointers to range start and end withing DOM
      var startRv =  this.DOMPointerFromData (nl, refObj.startText, refObj.startContainerOffset, 
			      refObj.startContainerXPath, refObj.ancestorOrigTextContent);
      // TODO: optimize if end == start
      var endRv =  this.DOMPointerFromData (nl, refObj.endText, refObj.endContainerOffset, 
			      refObj.endContainerXPath, refObj.ancestorOrigTextContent);

      var noPartialRange = true;
      if (noPartialRange)
      {
	// Return range only if we matched both endpoints
        if (startRv && endRv) {
	  var range = document.createRange();
	  range.setStart(startRv.obj, startRv.offset);
	  range.setEnd(endRv.obj, endRv.offset);
	  return range;
        }
      } else
      {
	// Return range.  If we only matched one endpoint, 
	// return an empty range at that point.
	if (startRv || endRv) {
	  var range = document.createRange();

	  if (startRv)
	    range.setStart(startRv.obj, startRv.offset);
	  else
	    range.setStart(endRv.obj, endRv.offset);

	  if (endRv)
	    range.setEnd(endRv.obj, endRv.offset);
	  else
	    range.setEnd(startRv.obj, startRv.offset);

	  return range;
	}
      }
    } catch(err) {
      // Commonly caused by invalid offset when creating range
      //console.log ("ERROR recovering range");
    }

    return null;
  }
});
ShiftSpace.RangeCoder = new RangeCoder();
