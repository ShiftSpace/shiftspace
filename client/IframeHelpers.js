// ==========================
// = Iframe Cover Functions =
// ==========================

// Used to cover iframes so that resize and drag operations don't get borked
var __iframeCovers__ = [];

/*
  Function: SSCheckForPageIframes
    Check for already existing iframes on the page and add covers to them.
*/
function SSCheckForPageIframes()
{
  $$('iframe').filter(SSIsNotSSElement).each(function(aFrame) {
    SSAddCover({cover:SSCreateCover(), frame:aFrame});
  });
}

/*
  Function: SSCreateCover
    Create a cover.  Should probably be refactored.
    
  Returns:
    a DOM node.
*/
function SSCreateCover()
{
  var cover = new ShiftSpace.Element('div', {
    'class': "SSIframeCover"
  });
  cover.setStyle('display', 'none');
  cover.injectInside(document.body);
  return cover;
}

/*
  Function: SSAddCover
    Add a iframe cover object to an internal array.
*/
function SSAddCover(newCover)
{
  // create covers if we haven't already
  __iframeCovers__.push(newCover);
}

/*
  Function: SSAddIframeCovers
    Add the iframe covers to the page.
*/
function SSAddIframeCovers() 
{
  __iframeCovers__.each(function(aCover) {
    aCover.cover.setStyle('display', 'block');
  });
}

/*
  Function: SSUpdateIframeCovers
    Update the position of the iframe covers.
*/
function SSUpdateIframeCovers() 
{
  __iframeCovers__.each(function(aCover) {
    var pos = aCover.frame.getPosition();
    var size = aCover.frame.getSize().size;
    aCover.cover.setStyles({
      left: pos.x,
      top: pos.y,
      width: size.x+3,
      height: size.y+3
    });
  });
}

/*
  Function: SSRemoveIframeCovers
    Remove the covers for the iframe.
*/
function SSRemoveIframeCovers() 
{
  __iframeCovers__.each(function(aCover) {
    aCover.cover.setStyle('display', 'none');
  });
}