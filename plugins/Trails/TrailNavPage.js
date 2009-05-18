var TrailNavPage = new Class({
  initialize : function( options )
  {
    this.setOptions( options );
    
    this.element = new Element( 'div' );
    this.element.addClass( 'TrailNavPage' );
    
    this.id = this.options.id;
    this.title = this.options.summary;
    this.user = this.options.username;
    this.href = this.options.href;
    this.descr = this.options.descr;
    this.space = this.options.space;
    this.icon = Trails.attributes.dir+'images/'+this.space.toLowerCase()+'_trailsicon.png';
    this.thumb = Trails.attributes.dir+'images/'+this.space.toLowerCase()+'_thumb.png';
    
    this.thumbEl = new Element('img');
    this.thumbEl.addClass('TrailNavPageView');
    this.thumbEl.setProperty( 'width', 80 );
    this.thumbEl.setProperty( 'src', this.thumb );
    
    this.thumbEl.injectInside( this.element );
    
    this.createDescription();

    // handle mouseenter
    this.element.addEvent( 'mouseenter', this.zoom.bind( this ) );
    this.element.addEvent('mouseover', function(_evt) {
      var evt = new Event(_evt);
      this.zoom();
    }.bind(this));

    // handle mouseleave
    this.element.addEvent( 'mouseleave', this.unzoom.bind( this ) );
    this.element.addEvent('mouseout', function(_evt) {
      var evt = new Event(_evt);
      this.unzoom();
    }.bind(this));

    // handle dragging a shift onto the stage
    this.element.addEvent( 'mousedown', this.startDrag.bind( this ) );
  },
    
  // create the description area
  createDescription : function()
  {
    this.descriptionEl = new Element('div');
    this.descriptionEl.className = 'TrailNavPageDescription';
    this.descriptionEl.setHTML('<div class="TrailPageDescriptionTitleUserText">' +
                               '<div class="TrailPageDescriptionTitleText">' +
                               this.title +
                               '</div>' +
                               '<div class="TrailPageDescriptionUserText">' +
                               this.user +
                               '</div>' +
                               '<br class="clear"/>' +
                               '</div>' +
                               '<div class="TrailPageDescriptionLink">' +
                               this.href +
                               '</div>');
                               
    this.descriptionEl.setStyles({
      visibility: 'hidden',
      display: 'block'
    });
    
    this.descriptionEl.inject( document.body );
    
    var divs = this.descriptionEl.getElementsByTagName('div');
    var title = divs[1];
    var user = divs[3];
    
    if (title.offsetWidth > 255 - user.offsetWidth) {
      title.style.width = (255 - user.offsetWidth) + 'px';
    }
    
    this.descriptionEl.setStyles({
      visibility: 'visible',
      display: 'none'
    });
  },
  
  zoom : function()
  {
    // set up animation for the size
    var sizeFX = this.thumbEl.effects({
      duration : 300,
      transition : Fx.Transitions.Cubic.easeOut,
      onComplete: function() {
        this.isZoomed = true;
        
        // get the nav scroll
        var scroll = this.element.getParent().getParent().getSize().scroll;

        // unzoom all other pages.
        var others = this.parentNav.pages.filter( function( x ) { return x != this }.bind( this ) );
        others.each( function( x ) { if( x.isZoomed ) x.unzoom(); } );
        
        this.parentNav.pages.each( function( p ) {
          p.descriptionEl.setStyle( 'display', 'none' );
        });
        
        // set the position of the description
        this.descriptionEl.setStyles({
          left : (this.element.getPosition().x + 250 - scroll.x),
          top : this.element.getPosition().y - 145,
          display : 'block'
        });
        
        this.draggable = true;

      }.bind( this )
    });
    
    sizeFX.start({
      width : [ TrailPage.kPageMinSize.width,  TrailPage.kPageMaxSize.width ],
      height : [ TrailPage.kPageMinSize.height, TrailPage.kPageMaxSize.height ]
    });
  },
  
  zoomComplete : function()
  {
    
  },
  
  unzoom : function()
  {
    this.draggable = false;
    this.descriptionEl.setStyle( 'display', 'none' );
    
    // set up animation for the size
    var sizeFX = this.thumbEl.effects({
      duration : 300,
      transition : Fx.Transitions.Cubic.easeOut,
      onComplete : function()
      {
        this.isZoomed = false;

        this.parentNav.pages.each( function( p ) {
          p.descriptionEl.setStyle( 'display', 'none' );
        });

      }.bind( this )
    });

    // shrink!
    sizeFX.start({
      width : [ TrailPage.kPageMaxSize.width, TrailPage.kPageMinSize.width ],
      height : [ TrailPage.kPageMaxSize.height, TrailPage.kPageMinSize.height  ],
    });

  },
  
  unzoomComplete : function()
  {
    
  },
  
  destroy : function()
  {
    this.clone.remove();
    this.element.remove();
    delete this;
  },
  
  startDrag : function(event)
  {
    if (!this.draggable)
    {
      return;
    }
    
    // get the nav scroll
    var scroll = this.element.getParent().getParent().getSize().scroll;
    
    var clone = new Element('div');
    clone.injectInside( document.body );
    clone.addClass( 'TrailNavClone' );
    
    clone.setStyles( {
      left : this.element.getPosition().x - scroll.x,
      background : 'transparent url(' + this.thumb + ') no-repeat'
    });
    
    var shiftIcon = new Element('img');
    shiftIcon.addClass( 'TrailSpaceThumbExpanded' );
    shiftIcon.setProperty( 'src', this.icon );
    shiftIcon.injectInside( clone );
    
    this.clone = clone;
    
    // create the dragging object
    this.dragObject = new Drag.Move( this.clone, {
      onDrag : function() 
      {
        this.descriptionEl.setStyle( 'display', 'none' );
        this.element.setStyle('opacity', '0.5');
        this.isDragging = true;
      }.bind( this ),
          
      onComplete : function()
      {
        this.isDragging = false;
        this.userDrop();
      }.bind( this )
    } );
    
    this.dragObject.start( new Event(event) );
  },
  
  /*
    User dropped nav page create a real trail page.
  */
  userDrop : function()
  {
    if( Trail.gFocusedNode )
    {
      Trail.gFocusedNode.unzoom();
    }
    
    // get the scroll offset of the background
    var scrollOffset = $('SSTrailsPlugInScrollArea').getPosition();
    var diff = {x: -500000-scrollOffset.x, y: -500000-scrollOffset.y};
    var pos = this.clone.getPosition();

    // add a loction property
    this.options.loc = {x: pos.x+diff.x, y: pos.y+diff.y};
    
    // add this to the current trail
    Trails.currentTrail().addShift( this.options );
    
    this.clone.remove();

    // hide this nav shift
    // TODO: this sux! refactor!
    this.parentNav.hideShift( this.id );
    this.hide();
  },
  
  /*
    Show the element.
  */
  show : function()
  {
    this.element.removeClass( 'hidden' );
    
    // set up animation for the size
    var shrinkFX = this.thumbEl.effects({
      duration : 300,
      transition : Fx.Transitions.Cubic.easeOut,
      onComplete : function()
      {
        this.element.setOpacity( 1 );
      }.bind( this )
    });

    // shrink!
    shrinkFX.start({
      width : [0, 80],
    });
  },

  /*
    Hide the element.
  */
  hide : function()
  {
    // set up animation for the size
    var shrinkFX = this.thumbEl.effects({
      duration : 300,
      transition : Fx.Transitions.Cubic.easeOut,
      onComplete : function()
      {
        this.element.addClass( 'hidden' );
      }.bind( this )
    });

    // shrink!
    shrinkFX.start({
      width : [80, 0],
    });
  },
  
  update : function( doNoUpdateOthers )
  {
    var size = this.element.getSize().size;
    
    // make sure the image size is right
    this.thumbEl.setProperty( 'width', size.x );
    
    // update the position of the trail icon
    var pos = this.element.getPosition();
  }
});

TrailNavPage.implement( new Options );

ShiftSpace.__externals.TrailNavPage = TrailNavPage; // For Safari