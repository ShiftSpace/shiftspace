var TrailNav = new Class({
 initialize : function( json, options )
 {
   this.setOptions( options );
   
   // add the loading icon
   this.showLoader();
   
   //this.shifts = this.options.shifts;
   
   this.element = $('trail-navitems');
   // clear out any previous items
   this.element.setHTML( '' );

   // create the nav pages and list them
   var temp = TrailNav.parse( json );
   
   // store the pages array
   this.pages = temp.pages;
   // store the dictionary of the pages
   this.dict = temp.dict;

   // set the width for the number of pages
   this.element.setStyle( 'width', this.pages.length * 85 + 400 );
   
   // add each page to our element
   this.pages.each( function( x ) {
     x.element.injectInside( this.element );
     x.parentNav = this;
   }.bind( this ) );
   
   // scroll the parent element - it has the scroll bar
   var scroll = this.element.getSize().scrollSize;
   if( scroll.x - 400 > 0 ) this.element.getParent().scrollTo( scroll.x - 400, 0 );

   var br = this.element.appendChild(new Element('br'));
   br.className = 'clear';
   
   this.hideLoader();
   
   // add the two left and right control
   //this.createNavControls();
 },
 
 /*
  Show the loader.
 */
 showLoader : function()
 {
   this.loader = new Element( 'div', {
     'class' : 'TrailLoader'
   });
   this.loader.injectInside( document.body );
   this.loader.setStyle( 'bottom', '50' );
 },

 /*
  Remove the loader
 */
 hideLoader : function()
 {
   this.loader.remove();
 },
 
 /*
  Add a shift to the end of the nav
 */
 addShift : function( json )
 {
   // make sure there are no <br> elements
   this.element.getElements( 'br' ).each( function(x) { x.remove(); } );

   var newShift = new TrailNavPage( json );
   
   newShift.element.injectInside( this.element );
   newShift.parentNav = this;
   
   // update data
   this.pages.push( newShift );
   this.dict[newShift.id] = newShift;
   
   // modify the width of the element when a shift is added
   var width = this.element.getSize().size.x;
   this.element.setStyle( 'width', width + 185 );
 },
 
 /*
  Show the shift.
 */
 showShift : function( id )
 {
   this.dict[id].show();

   // modify the width of the element when a shift is added
   var width = this.element.getSize().size.x;
   var newWidth = width + 185;
   
   this.element.setStyle( 'width', newWidth );
 },
 
 /*
  Hide a shift.
 */
 hideShift : function( id )
 {
   // modify the width of the nav area
   var width = this.element.getSize().size.x;
   var newWidth = width - 185;
   
   // make sure the width of the scrollable area is not less than that of the window
   if( newWidth >= window.getWidth()+400 )
   {
     this.element.setStyle( 'width', width - 185 );
   }
 },
 
 /*
  Start the scrolling timer.
 */
 startScrollLeft : function()
 {
   this.isScrollingLeft = true;
   
   // unzoom any of the pages that are zoomed
   this.pages.each( function( x ) {
     if( x.isZoomed ) x.unzoom();
   });
   
   this.scrollLeft();
 },
 
 scrollLeft : function()
 {
   var pos = this.element.getPosition();
   this.element.setStyle( 'left', pos.x - 15 );
   
   if( this.isScrollingLeft ) 
   {
     this.scrollLeft.delay( 41, this );
   }
 },
 
 /*
  Stop the scrolling timer.
 */
 stopScrollLeft : function()
 {
   this.isScrollingLeft = false;
 },
 
 /*
  Start scrolling right.
 */
 startScrollRight : function()
 {
   this.isScrollingRight = true;
   
   // unzoom any of the pages that are zoomed
   this.pages.each( function( x ) {
     if( x.isZoomed ) x.unzoom();
   });
   
   this.scrollRight();
 },
 
 scrollRight : function()
 {
   var pos = this.element.getPosition();
   this.element.setStyle( 'left', pos.x + 15 );
   
   if( this.isScrollingRight ) 
   {
     this.scrollRight.delay( 41, this );
   }
 },
 
 /*
  Stop scrolling right.
 */
 stopScrollRight : function()
 {
   this.isScrollingRight = false;
 },
 
 /* Create the scrolling nav controls */
 createNavControls : function()
 {
   // create the controls
   var leftControl = new Element( 'div' );
   leftControl.addClass( 'TrailNavScrollLeft' );
   leftControl.setText( '<' );
   var rightControl = new Element( 'div' );
   rightControl.addClass( 'TrailNavScrollRight' )
   rightControl.setText( '>' );
   
   leftControl.addEvent( 'mouseenter', function( e ) { 
    this.startScrollLeft();
   }.bind( this ) );
   leftControl.addEvent( 'mouseleave', function( e ) { 
    this.stopScrollLeft();
   }.bind( this ) );
   rightControl.addEvent( 'mouseenter', function( e ) { 
    this.startScrollRight();
   }.bind( this ) );
   rightControl.addEvent( 'mouseleave', function( e ) { 
    this.stopScrollRight();
   }.bind( this ) );
   
   // add the controls into the element
   leftControl.injectInside( document.body );
   rightControl.injectInside( document.body );
 }
});

TrailNav.implement( new Options );

/*
  Parse a json object to fill out the nav.
*/
TrailNav.parse = function( json )
{
  var pages = [];
  var dict = {};

  var navPagePos = 5;
  
  for( id in json )
  {
    json[id].id = id;
    var newNavPage = new TrailNavPage( json[id] );
    newNavPage.element.style.left = navPagePos + 'px';
    pages.push( newNavPage );
    dict[id] = newNavPage;
    navPagePos += 90;
  }

  return { pages : pages, dict : dict };
}