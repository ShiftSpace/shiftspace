var Vector = new Class({
  
  initialize : function( x, y )
  {
    this.x = x;
    this.y = y;
  },
  
  add : function( other )
  {
    return new Vector( this.x + other.x, this.y + other.y );
  },
  
  sub : function( other )
  {
    return new Vector( this.x - other.x, this.y - other.y );
  }
  
});

Vector.distance = function( v1, v2 )
{
  return Math.sqrt( (v1.x-v2.x)*(v1.x-v2.x) + (v1.y-v2.y)*(v1.y-v2.y) );
}

ShiftSpace.__externals__.Vector = Vector; // For Safari