// ==Builder==
// @export            SSElement as Element, SSIframe as Iframe, SSInput as Input
// @package           System
// ==/Builder==

var __window = window;
var __document = document;

function SSSetGlobalContext(aWindow)
{
  __window = aWindow;
  __document = aWindow.document;
}

function SSWindow()
{
  return new Window(__window);
}

function SSDocument()
{
  return new Document(__document);
}

/*
  Class: ShiftSpace.Element
    A wrapper around the MooTools Element class that marks each DOM node with the ShiftSpaceElement CSS
    class.  This is required for identifying which elements on the page belong to ShiftSpace.  In the case
    of iFrames this is also used to make sure that iFrame covers get generated so that drag and resize
    operations don't break.
*/
var SSElement = new Class({
  
  name: "SSElement",
  
  /*
    Function: initialize (private)
      Initialize the element and if necessary add appropiate event handlers.

    Parameters:
      _el - a raw DOM node or a string representing a HTML tag type.
      props - the same list of options that would be passed to the MooTools Element class.

    Returns:
      An ShiftSpace initialized and MooTools wrapped DOM node.
  */
  initialize: function(_el, props)
  {
    var el = (_el == 'iframe') ? new IFrame(null, props) : new Element(_el, props);

    // ShiftSpaceElement style needs to be first, otherwise it overrides passed in CSS classes - David
    el.setProperty( 'class', 'ShiftSpaceElement ' + el.getProperty('class') );

    // remap makeResizable and makeDraggable - might want to look into this more
    var resizeFunc = el.makeResizable,
        dragFunc = el.makeDraggable;

    // override the default behavior
    if(SSAddIframeCovers)
    {
      el.makeDraggable = function(options)
      {
        var dragObj;
        if(!dragFunc)
        {
          dragObj = new Drag.Move(el, options);
        }
        else
        {
          dragObj = (dragFunc.bind(el, options))();
        }

        dragObj.addEvent('onStart', function() {
          SSAddIframeCovers();
        });
        dragObj.addEvent('onDrag', SSUpdateIframeCovers);
        dragObj.addEvent('onComplete', SSRemoveIframeCovers);

        return dragObj;
      };

      // override the default behavior
      el.makeResizable = function(options) {
        var resizeObj;
        if(!resizeFunc)
        {
          resizeObj = new Drag.Base(el, $merge({modifiers: {x: 'width', y: 'height'}}, options));
        }
        else
        {
          resizeObj = (resizeFunc.bind(el, options))();
        }

        resizeObj.addEvent('onStart', SSAddIframeCovers);
        resizeObj.addEvent('onDrag', SSUpdateIframeCovers);
        resizeObj.addEvent('onComplete', SSRemoveIframeCovers);

        return resizeObj;
      };
    }

    return el;
  }
});

/*
  Class : ShiftSpace.Iframe
    This class allows the creation of iframes with CSS preloaded.  This will eventually
    be deprecated by the the forthcoming MooTools Iframe element which actually loads
    MooTools into the Iframe.  Inherits from <ShiftSpace.Element>.  You shouldn't instantiate
    this class directly, just use <ShiftSpace.Element>.
*/
var SSIframe = new Class({
  Extends: SSElement,
  name: "SSIframe",

  /*
    Function: initialize (private)
      Initializes the iframe.

    Parameters:
      props - the same properties that would be passed to a MooTools element.

    Returns:
      A ShiftSpace initialized and MooTools wrapped Iframe.
  */
  initialize: function(el, props)
  {
    // check for the css property
    this.css = props.css;

    // check for cover property to see if we need to add a cover to catch events
    var loadCallback = props.onload || props.load;
    
    delete props.onload;
    delete props.load;

    // eliminate the styles, add on load event
    var finalprops = $merge(props, {
      events: {
        load : function() {
          // load the css
          if(this.css)
          {
            var p = SSLoadStyle(this.css, this.frame);
            if(loadCallback) p.fn(loadCallback);
          }
          else
          {
            if(loadCallback && typeof loadCallback == "function") loadCallback();
          }
        }.bind(this)
      }
    });

    // store a ref for tricking
    this.frame = this.parent(el || 'iframe', finalprops);

    var addCover = true;
    if($type(props.addCover) != 'undefined' && props.addCover == false) addCover = false;

    if(addCover && SSAddCover)
    {
      // let ShiftSpace know about it
      SSAddCover({cover:SSCreateCover(), frame:this.frame});
    }
    else
    {
      SSLog('=========================== No cover to add!');
    }

    // return
    return this.frame;
  }
});

var SSInput = new Class({
  Extends: SSElement
  // Create an iframe
  // Apply the styles
  // Create the requested input field
  // set the input field / textarea to be position absolute, left top right bottom all 0
  // set up event handlers so they get pass up to the developer
});

/*
  Function: SSIsSSElement
    Check wheter a node is a ShiftSpace Element or has a parent node that is.

  Parameters:
    node - a DOM node.

  Returns:
    true or false.
*/
function SSIsSSElement(node)
{
  if(node.hasClass('ShiftSpaceElement'))
  {
    return true;
  }

  var hasSSParent = false,
      curNode = node;

  while(curNode.getParent() && $(curNode.getParent()).hasClass && !hasSSParent)
  {
    if($(curNode.getParent()).hasClass('ShiftSpaceElement'))
    {
      hasSSParent = true;
      continue;
    }
    curNode = curNode.getParent();
  }

  return hasSSParent;
}
this.isSSElement = SSIsSSElement;

/*
  Function: SSIsNotSSElement
    Conveniece function that returns the opposite of SSIsSSElement.  Useful for node filtering.

  Parameters:
    node - a DOM node.

  Returns:
    true or false.
*/
function SSIsNotSSElement(node)
{
  return !SSIsSSElement(node);
}