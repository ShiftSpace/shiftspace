var TrailLink = new Class({
  
  // take two pages and link them together
  initialize : function( pageA, pageB, options )
  {
    // create a canvas tag
    this.element = new Element( 'canvas' );
    this.element.addClass( 'TrailLink' );
    
    // if pageA and pageB both instaces of TrailPage, add to trail scroll, and do different calculations
    // serious spaghetti code hack!
    if( pageA instanceof TrailPage && pageB instanceof TrailPage )
    {
      this.element.injectInside( $('SSTrailsPlugInScrollArea') );
    }
    else
    {
      this.element.injectInside( document.body );
      this.element.addClass('TrailDragLink');
    }
    
    // store the rendering context
    this.context = this.element.getContext( '2d' );
    
    // store the pages
    this.startPage = pageA; 
    this.endPage = pageB;
    
    // TODO : overly simplified
    // set the link property
    if( this.startPage instanceof TrailPage )
    {
      this.startPage.addLink( this );
    }

    if( this.endPage instanceof TrailPage )
    {
      this.endPage.addLink( this );
    }
    
    // update 
    this.update();
    this.render();
  },
  
  getPair : function()
  {
    return [this.startPage.id, this.endPage.id];
  },
  
  /*
    Set the end points.
  */
  setEndPoints : function()
  {
    // calculate the start and end of the link
    if( this.startPage instanceof TrailPage )
    {
      this.startPos = TrailLink.SSCalcCenter( this.startPage.getLinkPoint(), true );
    }
    else
    {
      this.startPos = TrailLink.SSCalcCenter( this.startPage, null, true );
    }

    if( this.endPage instanceof TrailPage )
    {
      this.endPos = TrailLink.SSCalcCenter( this.endPage.getLinkPoint(), true )
    }
    else
    {
      this.endPos = TrailLink.SSCalcCenter( this.endPage );
    }
  },
  
  // return the sibiling
  getSibling : function( node )
  {
    if( this.startPage != node )
    {
      return this.startPage;
    }
    else
    {
      return this.endPage;
    }
  },
  
  /*
    Update the trails.
  */
  update : function( sender )
  {
    // set the end points
    this.setEndPoints();
    
    // update the position of the canvas
    var minx = Math.min( this.startPos.x, this.endPos.x );
    var maxx = Math.max( this.startPos.x, this.endPos.x );
    var miny = Math.min( this.startPos.y, this.endPos.y );
    var maxy = Math.max( this.startPos.y, this.endPos.y );
    
    this.element.setStyles({
      left: minx-TrailLink.gox,
      top: miny-TrailLink.goy,
      width: maxx-minx+TrailLink.gox*2,
      height: maxy-miny+TrailLink.goy*2
    });
    
    // set the width and height attributes to prevent distortion
    this.element.setProperty('width', ( maxx-minx ) + TrailLink.gox*2);
    this.element.setProperty('height', ( maxy-miny ) + TrailLink.goy*2);
  },
  
  // render from point a to point b
  render : function()
  {
    var curSize = this.element.getSize().size;
    
    // correct for offset
    curSize.x -= TrailLink.gox*2;
    curSize.y -= TrailLink.goy*2;
    
    // get the context
    var ctxt = this.context;
    
    // clear the rect
    ctxt.clearRect( 0, 0, curSize.x, curSize.y );
    
    var sx = 0, 
        sy = 0, 
        ex = curSize.x, 
        ey = curSize.y;
        
    var mx = 0, 
        my = 25;
    
    if( this.startPos.y > this.endPos.y )
    {
      // reverse
      sy = curSize.y;
      ey = 0;
      
      // flip modifier
      my *= -1;
    }
    
    if( this.startPos.x > this.endPos.x )
    {
      // reverse
      sx = curSize.x;
      ex = 0;
    }
    
    // set up stroke parameters
    ctxt.strokeStyle = "rgba( 246, 59, 2, 1.0 )";
    ctxt.lineWidth = 5;
    ctxt.lineCap = "round";
    
    // translate
    ctxt.save();
    ctxt.translate( TrailLink.gox, TrailLink.goy );
    
    // render a bezier curve from start to end
    ctxt.beginPath();
    ctxt.moveTo( sx, sy );
    ctxt.bezierCurveTo( sx, sy+my, ex, ey-my, ex, ey );
    ctxt.stroke();
    ctxt.closePath();
    
    // do the second stroke
    ctxt.strokeStyle = "rgba( 34, 34, 2, 1.0 )";
    ctxt.lineWidth = 3;
    ctxt.lineCap = "round";
    
    // render a bezier curve from start to end
    ctxt.beginPath();
    ctxt.moveTo( sx, sy );
    ctxt.bezierCurveTo( sx, sy+my, ex, ey-my, ex, ey );
    ctxt.stroke();
    ctxt.closePath();
  },
  
  /*
    Remove this object
  */
  destroy : function()
  {
    if( this.element.getParent() )
    {
      var fadeFX = this.element.effects({
        duration : 300,
        transition : Fx.Transitions.Cubic.easeOut,
        onComplete : function()
        {
          this.element.remove();          
          delete this;
        }.bind( this )
      });
      
      fadeFX.start({
        opacity: [1.0, 0]
      });
    }
  },
  
  destroyImmediate : function()
  {
    this.element.remove();
    delete this;
  },
  
  toString : function()
  {
    return "[TrailLink]";
  }
});

TrailLink.SSCalcCenter = function( element, superBadHackForTrailScrollArea, accountForWindowScroll )
{
  var size = element.getSize().size;
  var loc = element.getPosition();
  var windowScroll = new Vector(0, 0);

  if(accountForWindowScroll)
  {
    windowScroll = window.getSize().scroll;
  }
  
  if(superBadHackForTrailScrollArea)
  {
    // get the linkPoint position and calc it's offset and the parent offset
    var linkPointOffset = element.getStyles('left', 'top');
    var trailPageOffset = element.getParent().getStyles('left', 'top');
    return new Vector( parseInt(linkPointOffset.left)+parseInt(trailPageOffset.left),
                       parseInt(linkPointOffset.top)+parseInt(trailPageOffset.top) );
  }
  else
  {
    // calculate top left for page, and top left for link point, add
    return new Vector( loc.x + size.x/2 + windowScroll.x, loc.y + size.y + windowScroll.y);
  }
}

// off set of the little dot
TrailLink.gox = 10;
TrailLink.goy = 10;

TrailLink.SSCalcLowerRight = function( element ) 
{
  var size = element.getSize().size;
  var loc = element.getPosition();
  var windowScroll = window.getSize().scroll;
  
  return new Vector( loc.x + size.x + windowScroll.x, loc.y + size.y + windowScroll.y);
}

ShiftSpace.__externals.TrailLink = TrailLink; // For Safari