
// off set of the little dot
var gox = 10;
var goy = 10;

var TrailLink = new Class({
  
  // take two pages and link them together
  initialize : function( pageA, pageB, options )
  {
    // create a canvas tag
    this.element = new Element( 'canvas' );
    this.element.addClass( 'TrailLink' );
    
    // add this to the page
    this.element.injectInside( document.body );
    
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
      this.startPos = SSCalcCenter( this.startPage.getLinkPoint() );
    }
    else
    {
      this.startPos = SSCalcCenter( this.startPage );
    }

    if( this.endPage instanceof TrailPage )
    {
      this.endPos = SSCalcCenter( this.endPage.getLinkPoint() )
    }
    else
    {
      this.endPos = SSCalcCenter( this.endPage );
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
    
    // set dimensions taking consideration offset
    this.element.style.left = ( minx-gox ) + "px";
    this.element.style.top = ( miny-goy ) + "px";
    this.element.style.width = ( maxx-minx+gox*2 ) + "px";
    this.element.style.height = ( maxy-miny+goy*2 ) + "px";
    
    // set the width and height attributes to prevent distortion
    this.element.width = ( maxx-minx ) + gox*2;
    this.element.height = ( maxy-miny ) + goy*2;
  },
  
  // render from point a to point b
  render : function()
  {
    var curSize = this.element.getSize().size;
    
    // correct for offset
    curSize.x -= gox*2;
    curSize.y -= goy*2;
    
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
    ctxt.translate( gox, goy );
    
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

function SSCalcCenter( element )
{
  var size = element.getSize().size;
  var loc = element.getPosition();
  
  return new Vector( loc.x + size.x/2, loc.y + size.y/2 );
}

function SSCalcLowerRight( element ) 
{
  var size = element.getSize().size;
  var loc = element.getPosition();
  
  return new Vector( loc.x + size.x, loc.y + size.y );
}

// Link to plugin
TrailsPlugin.TrailLink = TrailLink;