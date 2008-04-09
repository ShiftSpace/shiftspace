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
    if (objAncestor)
    {
      return this.generateRange(objAncestor, refObj);
    }
    alert ('Warning: An in-page reference was not recreateable because the webpage has changed. The original referenced text was: ' + refObj.origText);
    return null;
  },

  /*
    Property: toRef
      Given a valid W3C Range, extract relevant info and store.
    
    Arguments:
      range - a W3C Range.
      
  */
  toRef: function(range)
  {    
    //get the common ancestor
    var objCommonAncestor = range.commonAncestorContainer;

    // if the Common Ancestor is text node use the parent node as ancestore since once spliting the text node there will be no ancestor exist for text node
    if(objCommonAncestor.nodeType == 3)
    {
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
  }
});
ShiftSpace.RangeCoder = new RangeCoder();
