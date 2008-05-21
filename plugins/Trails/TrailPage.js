var kNULL = 'null';
var kPageMinSize = { width: 80, height: 50 };
var kPageMaxSize = { width: 240, height: 150 };

/*
  Possible spaces are:
    notes
    highlight
    sourceshift
    imageswap
*/
var kNotesSpace = 'notes';
var kHighlightSpace = 'highlight';
var kSourceShiftSpace = 'sourceshift';
var kImageSwapSpace = 'imageswap';

var TrailPage = new Class({
  
  // let's have some default options
  getOptions : function()
  {
    return {
      title : 'default',
      loc : { x : 0, y : 0 },
      offset : { x: 500000, y: 500000 },
      scroll : { x: 0, y: 0 },
      href : 'http://www.shiftspace.org',
      thumb : null,
      user : 'shiftspace',
      nodes : [],
      space : null
    }
  },

  // intialize this puppy
  initialize : function( el, options )
  {
    // set our options
    this.setOptions( this.getOptions(), options );

    // set up our data
    this.id = this.options.id;
    this.title = this.options.summary;
    this.loc = this.options.loc;
    this.href = this.options.href
    this.nodes = this.options.nodes;
    this.user = this.options.username;
    
    if(this.options.space)
    {
      this.space = this.options.space;
    }
    else
    {
      // legacy trail
      var space = this.options.icon.split('/').getLast().split('_');
      if(space == 'highlight') space += 's';
      this.space = space;
    }
    
    this.icon = Trails.attributes.dir+'images/'+this.space.toLowerCase()+'_trailsicon.png';
    this.thumb = Trails.attributes.dir+'images/'+this.space.toLowerCase()+'_thumb.png';

    // make sure we have an element if not create one
    // and add it to the page
    if( el == kNULL || el == undefined || el == null )
    {
      el = new ShiftSpace.Element( 'div' );

      // add the thumb
      if( this.thumb )
      {
        this.thumbEl = new Element( 'img' );
        this.thumbEl.addClass( 'TrailPageView' );
        this.thumbEl.setProperty( 'src', this.thumb );

        this.thumbEl.injectInside( el );
        this.thumbEl.setProperty( 'width', kPageMinSize.x );
        
        // add an event on click on the image
        this.thumbEl.addEvent( 'click', function( e ) {
            this.isDragging = false;
        }.bind( this ) );
      }
      
      // add this to the apge
      el.injectInside( $('SSTrailsPlugInScrollArea') );
      
      // set the initial width and height
      el.setStyle( 'width', kPageMinSize.width );
      el.setStyle( 'height', kPageMinSize.height );
      
      // add the zoom event
      el.addEvent('mouseenter', this.zoom.bind(this));
      el.addEvent('mouseover', this.zoom.bind(this));
      el.addEvent('mouseleave', this.unzoom.bind(this));
      el.addEvent('mouseout', function(_evt) {
        var evt = new Event(_evt);

        var contains = false;
        var children = el.getElements('*');
        var len = children.length;
        for(var i = 0; i < len; i++)
        {
          if(children[i] == evt.target)
          {
            contains = true;
            continue;
          }
        }

        if(!contains || evt.relatedTarget == $('SSTrailsPlugInScrollArea'))
        {
          this.unzoom();
        }
      }.bind(this));
    }

    this.element = el;
    this.element.parentObject = this;
    
    // prevent clicks from moving up to window
    this.element.addEvent( 'click', function( e ) { 
      e.stopPropagation();
    }.bind( this ) );
    
    this.element.addClass( 'TrailPage' );
    
    // create the link point
    this.createLinkPoint();
    this.createDescription();
    this.createSpaceThumb();
    this.createDelete();
    this.createRemoveButton();

    // create the dragging object, store the ref
    // since we might want to turn off dragging behavior
    // later
    this.dragObject = new Drag.Move( this.element, {
      onDrag : function() 
      {
        this.isDragging = true;
        this.update();
      }.bind( this ),
      
      onComplete : function()
      {
        this.isDragging = false;
      }.bind( this ),

      lockRegions : [this.linkPoint]
    });
    
    // put in the initial position
    this.setPosition( this.loc );

    // create a slot for a link
    this.links = [];
    
    this.update();

    return this;
  },
  
  /*
    Create a remove button.
  */
  createRemoveButton : function()
  {
    this.removeButton = new Element( 'div' );
    this.removeButton.addClass( 'TrailPageRemove' );
    this.removeButton.addClass( 'hidden' );
    this.removeButton.injectInside( this.element );
    
    this.removeButton.addEvent( 'mouseenter', function( e ) { 
      this.removeButton.removeClass( 'TrailPageRemove' );
      this.removeButton.addClass( 'TrailPageRemoveHover' );
    }.bind( this ) );
    this.removeButton.addEvent( 'mouseleave', function( e ) { 
      this.removeButton.removeClass( 'TrailPageRemoveHover' );
      this.removeButton.addClass( 'TrailPageRemove' );
    }.bind( this ) );
    this.removeButton.addEvent( 'click', this.close.bind( this ) );
  },
  
  /*
    Create a space thumb.
  */
  createSpaceThumb : function()
  {
    this.spaceThumb = new Element( 'img' );
    this.spaceThumb.addClass( 'TrailSpaceThumb' );
    this.spaceThumb.setProperty( 'src', this.icon );
    this.spaceThumb.injectInside( this.element );
  },
  
  /*
    Create the floating and transparent text area
  */
  createDescription : function()
  {
    this.description = new Element( 'a' );
    this.description.setAttribute( 'href', this.href );
    this.description.addClass( 'TrailPageDescription' );
    this.description.addClass( 'hidden' );
    
    // hover effect
    this.description.addEvent( 'mouseover', function() {
      this.element.setOpacity( 1.0 );
    }.bind(this));
    this.description.addEvent( 'mouseout', function() {
      this.element.setOpacity( 0.8 );
    }.bind(this));
    
    // create title
    var descTextArea = new Element( 'div' );
    descTextArea.addClass( 'TrailPageDescriptionTextArea' );

    var descTitleText = new Element( 'div' );
    descTitleText.addClass( 'TrailPageDescriptionTitleText' );
    descTitleText.setHTML( this.title );
    this.descriptionTitle = descTitleText;
    
    var descUserText = new Element( 'div' );
    descUserText.addClass( 'TrailPageDescriptionUserText' );
    descUserText.setHTML( this.user );
    this.descriptionUser = descUserText;
    
    //var descTitleUserSeparator = new Element( 'div' );
    //descTitleUserSeparator.addClass( 'TrailPageDescriptionTitleUserSeparator' );
    //descTitleUserSeparator.setHTML( '|' );
    
    var descTitleUserText = new Element( 'div' );
    descTitleUserText.addClass( 'TrailPageDescriptionTitleUserText' );
    descTitleUserText.appendChild(descTitleText);
    //descTitleUserText.appendChild(descTitleUserSeparator);
    descTitleUserText.appendChild(descUserText);
    var br = descTitleUserText.appendChild(new Element('br'));
    br.className = 'clear';
    
    var url = new Element( 'a' );
    url.addClass( 'TrailPageDescriptionLink' );
    url.setProperty( 'href', this.href );
    url.setText( this.href );

    // add the description string and the user
    descTitleUserText.injectInside( descTextArea );
    // add the actual url
    url.injectInside( descTextArea );
    
    descTextArea.injectInside( this.description );
    
    // add an event on click on the image
    this.description.addEvent( 'click', function( e ) {
      if( !this.isDragging )
      {
        this.loadURL();
      }
      else
      {
        this.isDragging = false;
      }
    }.bind( this ) );
    
    this.description.injectInside( this.element );
  },
  
  /*
    Add the big delete button
  */
  createDelete : function()
  {
    this.deleteButton = new Element( 'div' );
    this.deleteButton.addClass( 'TrailPageDelete' );
    this.deleteButton.addClass( 'hidden' );
    this.deleteButton.injectInside( this.element );
  },
  
  /*
    Create link point, this is for creating the first and also for one that
    are generated when creating new links.
  */
  createLinkPoint : function()
  {
    var el = this.element;
    
    // add the link point
    this.linkPoint = new Element( 'div' );
    this.linkPoint.addClass( 'TrailPageLinkPoint' );
    // add the link point to the el
    this.linkPoint.injectInside( el );
    
    // create the minus link point
    this.minusLinkPoint = new Element( 'div' );
    this.minusLinkPoint.addClass( 'TrailPageMinusLinkPoint' );
    this.minusLinkPoint.injectInside( el );
    this.minusLinkPoint.addClass( 'hidden' );
    
    // change the style of the link point and check
    // for the start of dragging
    this.linkPoint.addEvent( 'mousedown', function( e ) {
      var evt = new Event(e);
      // stop this event so it doesn't get to scrolling
      evt.stopPropagation();
      
      if( this == gFocusedNode )
      {
        this.linkClicked = true;
        this.startDragEvent = e;
      }
    }.bind( this ) );
    // check for mouse up
    this.linkPoint.addEvent( 'mouseup', this.cancelCreateLink.bind( this ) );
    
    // update the focused nodes hovered link point just in case of drop
    this.linkPoint.addEvent( 'mouseenter', function( e ) {
      if( this.parentTrail.isEditable ) this.linkPoint.addClass( 'TrailPageLinkPointLargeHover' );

      if( gFocusedNode && gFocusedNode.linkPoint != this.linkPoint )
      {
        gFocusedNode.lastHoveredLinkPoint = this.linkPoint
      }
    }.bind( this ));
    
    // remove the hover
    this.linkPoint.addEvent( 'mouseleave', function( e ) { 
      this.linkPoint.removeClass( 'TrailPageLinkPointLargeHover' );
    }.bind( this ) );
    
    // start dragging
    this.linkPoint.addEvent( 'mousemove', function( e ) {
      if( this.linkClicked && !this.isCreatingLink && !this.parentTrail.deleteMode )
      {
        // add a window.mouse up event
        window.addEvent( 'mouseup', this.cancelCreateLink.bind( this ) );
        
        // only if the trail is editable, this should probably be moved into Trails
        if( this.parentTrail.isEditable )
        {
          this.createLink( e );
        }
      }
    }.bind( this ) );
    
    // do the hover for the minus sign
    this.minusLinkPoint.addEvent( 'mouseenter', function( e ) { 
      this.minusLinkPoint.addClass( 'TrailPageMinusLinkPointHover' );
    }.bind( this ) );
    this.minusLinkPoint.addEvent( 'mouseleave', function( e ) { 
      this.minusLinkPoint.removeClass( 'TrailPageMinusLinkPointHover' );;
    }.bind( this ) );
    this.minusLinkPoint.addEvent( 'click', function( e ) { 
      this.deleteLinkMode();
    }.bind( this ) );

    // set the parentNode
    this.linkPoint.linkNode = this;
  },
  
  /*
    Return the link point.
  */
  getLinkPoint : function()
  {
    return this.linkPoint;
  },
  
  /*
    Create a link and handle the dragging operation
  */
  createLink : function( e )
  {
    // we're creating a link, prevent unzooming
    this.isCreatingLink = true;
    
    // lock the position of the page
    this.lock();
    
    // create a draggable link
    this.createDragLinkPoint( e );
  },
  
  /*
    Cancel link creation.
  */
  cancelCreateLink : function( e ) 
  {
    this.linkClicked = false;
    this.isCreatingLink = false;
  },
  
  /*
    Create the drag link point which is used for making links
  */
  createDragLinkPoint : function( e )
  {
    window.addEvent( 'mousemove', this.handleLinkDrag.bind( this ) );

    // create the drag link point
    this.dragLinkPoint = new Element( 'div' );
    this.dragLinkPoint.addClass( 'TrailPageDragLinkPoint' );
    this.dragLinkPoint.injectInside(document.body);
    //this.dragLinkPoint.injectInside( $('SSTrailsPlugInScrollArea') );
    
    this.dragLinkPoint.setStyles({
      top : -5,
      left : -5
    });
    
    this.dragLinkPoint.addEvent( 'mouseup', function( e ) { 
      this.releaseEvent = e;
    }.bind( this ) );

    var newLink = new TrailLink( this.linkPoint, this.dragLinkPoint );

    // handle the dragging link behavior
    this.dragLinkPointRef = new Drag.Move( this.dragLinkPoint, {
      onDrag : function( e ) 
      {
        newLink.update();
        newLink.render();
      },
      
      onComplete : function( e )
      {
        var evt = new Event( this.releaseEvent );
        
        if( gHoveredNode )
        {
          if( ElementContainsPoint( gHoveredNode.element, new Vector( evt.page.x, evt.page.y ) ) )
          {
            // create a real link between the two nodes
            var final = new TrailLink( this, gHoveredNode );
            this.update();
            
            var success = true;
          }
        }

        // clean up
        this.dragLinkPoint.remove();
        newLink.destroyImmediate();
        
        // clear flag
        this.isCreatingLink = false;
        // unlock
        this.unlock();

        // unzoom ourselves
        if( success ) this.unzoom();

      }.bind( this )
    });

    this.dragLinkPointRef.start( new Event( this.startDragEvent ) );
  },
  
  /*
    Handle dragging the link.
  */
  handleLinkDrag : function( e )
  {
    /*
    var mouse = e.page;
    
    log( mouse );
    */
  },
  
  /*
    Lock the draggable.
  */
  lock : function()
  {
    // lock the drag object to our current location
    this.dragObject.detach();
  },
  
  /*
    Unlock the the draggable.
  */
  unlock : function()
  {
    // allow for dragging on any place on the stage
    this.dragObject.attach();
  },

  /*
    Set the position with a vector-like object
  */
  setPosition : function( newPos )
  {
    // include scroll offset
    this.element.setStyles({
      left : this.options.offset.x + newPos.x,
      top : this.options.offset.y + newPos.y
    });
    
    this.getPosition();
  },
  
  /*
    Get the position of the page, a convenience method.
  */
  getPosition : function()
  {
    var temp = {
      x : parseInt(this.element.getStyle('left')),
      y : parseInt(this.element.getStyle('top'))
    };
    
    return temp;
  },
  
  getRealPosition : function()
  {
    var pos = this.getPosition();
    var fpos = { x : pos.x - this.options.offset.x, 
                 y : pos.y - this.options.offset.y };
    return fpos;
  },
  
  /*
    Load the page's URL.
  */
  loadURL : function( e )
  {
    window.open( this.href );
  },

  /*
    Add a link and update the links list.  Add link is a bit gnarly. Right now we create a link
    the link tells the page to add a link, and the page tells the parent that a new link was created
    this is a bit gnarly, should simplify at some point.
  */
  addLink : function( newLink )
  {
  
    // add this to our links
    this.links.push( newLink );

    var nodeId = newLink.getSibling( this ).id;
    
    if( !this.nodes.contains(nodeId) )
    {
      this.nodes.push( nodeId );
    }
    
    // update the trail
    if( this.parentTrail )
    {
      this.parentTrail.addLink( newLink );
    }
  },
  
  /*
    Zoom the page.
  */
  zoom : function()
  {
    console.log('zoom');
    if( !this.isZooming && 
        !this.isZoomed &&
        !gFocusedNode &&
        !this.isClosing )
    {
      gFocusedNode = this;
      
      // change the border to red
      if (this.thumbEl) 
      {
        this.thumbEl.addClass( 'TrailPageZoomBorder' );
      }
      
      this.element.setStyle( 'zIndex', 99 );
      this.element.setOpacity( 0.8 );

      this.isZooming = true;
      // store our old position
      this.oldPosition = this.getPosition();
    
      var dx = ( kPageMaxSize.width - kPageMinSize.width ) / 2;
      var dy = ( kPageMaxSize.height - kPageMinSize.height ) / 2;
      
      // get the new top left
      var newPos = { x : this.oldPosition.x - Math.round( dx ),
                     y : this.oldPosition.y - Math.round( dy ) };
                     
      // set up animation for the size
      var sizeFX = this.element.effects({
        duration : 300,
        transition : Fx.Transitions.Cubic.easeOut
      });
      
      sizeFX.start({
        width : [ kPageMinSize.width, kPageMaxSize.width ],
        height : [ kPageMinSize.height, kPageMaxSize.height ]
      });

      // set up animation for the top left
      var posFX = this.element.effects({
        duration : 300,
        transition : Fx.Transitions.Cubic.easeOut
      });
      
      posFX.start({
        left : [ this.oldPosition.x, newPos.x ],
        top : [ this.oldPosition.y, newPos.y ]
      });
      
      // set up animation for thumb
      var thumbFX = this.spaceThumb.effects({
        duration : 300,
        transition : Fx.Transitions.Cubic.easeOut
      })
      thumbFX.start({
        left: [60, 198],
        top: [32, 110],
        width: [22, 44],
        height: [22, 44]
      });
      
      // wait for all the fx to change then updae
      var updateGroup = new Group( sizeFX, posFX, thumbFX );
      updateGroup.addEvent( 'onChange', function() {
        this.update();
      }.bind( this ) );

      // wait for these to complete
      var completeGroup = new Group( sizeFX, posFX );
      completeGroup.addEvent( 'onComplete', this.zoomComplete.bind( this ) );
    }
    
    if( gFocusedNode && gFocusedNode != this )
    {
      gHoveredNode = this;
    }
  },
  
  /*
    Handle zoom completion.
  */
  zoomComplete : function()
  {
    // set the vars
    this.isZooming = false;
    this.isZoomed = true;
    
    // need to switch the image to the other style
    if( this.parentTrail.isEditable )
    {
      // show the link creation button
      this.linkPoint.removeClass( 'TrailPageLinkPoint' );
      this.linkPoint.addClass( 'TrailPageLinkPointLarge' );
      
      // reveal the minus link point
      this.minusLinkPoint.removeClass( 'hidden' );
      // show the remove button
      this.removeButton.removeClass( 'hidden' );
    }
    
    // show the description
    this.description.removeClass( 'hidden' );
    if ( this.descriptionTitle.offsetWidth > 255 - this.descriptionUser.offsetWidth ) 
    {
      this.descriptionTitle.style.width = ( 255 - this.descriptionUser.offsetWidth ) + 'px';
    }
    
    // update!
    this.update();
  },
  
  /*
    Unzoom the thumb on mouse exit.
  */
  unzoom : function()
  {
    if( !this.isZooming && 
        this.isZoomed && 
        !this.isDragging && 
        !this.isCreatingLink &&
        !this.parentTrail.deleteMode )
    {
      gFocusedNode = null;

      // hide the remove button
      this.removeButton.addClass( 'hidden' );

      // hide the description area
      this.description.addClass( 'hidden' );
      
      // hide the minus link point
      this.minusLinkPoint.addClass( 'hidden' );
      
      // change the border to red
      this.thumbEl.removeClass( 'TrailPageZoomBorder' );
      
      // set the zindex and the opacity
      this.element.setStyle( 'zIndex', 2 );
      this.element.setOpacity( 1 );

      // need to switch the image to the other style
      this.linkPoint.removeClass( 'TrailPageLinkPointLarge' );
      this.linkPoint.addClass( 'TrailPageLinkPoint' );

      this.isZooming = true;

      // get the old position
      var curPos = this.getPosition();

      // set up animation for the size
      var sizeFX = this.element.effects({
        duration : 300,
        transition : Fx.Transitions.Cubic.easeOut,
      });
  
      // shrink!
      sizeFX.start({
        width : [ kPageMaxSize.width, kPageMinSize.width  ],
        height : [ kPageMaxSize.height, kPageMinSize.height  ]
      }).chain(function() {
        this.element.setStyle( 'zIndex', 2 );
      }.bind(this));

      // set up animation for the top left
      var posFX = this.element.effects({
        duration : 300,
        transition : Fx.Transitions.Cubic.easeOut
      });
  
      posFX.start({
        left : [ curPos.x, this.oldPosition.x ],
        top : [ curPos.y , this.oldPosition.y ]
      });
      
      // set up animation for thumb
      var thumbFX = this.spaceThumb.effects({
        duration : 300,
        transition : Fx.Transitions.Cubic.easeOut
      })
      thumbFX.start({
        left: [118, 60],
        top: [60, 32],
        width: [44, 22],
        height: [44, 22]
      });
    
      // wait for all the fx to change then update
      var updateGroup = new Group( sizeFX, posFX, thumbFX );
      updateGroup.addEvent( 'onChange', function() {
        this.update();
      }.bind( this ) );

      // wait for these to complete
      var completeGroup = new Group( sizeFX, posFX );
      completeGroup.addEvent( 'onComplete', this.unzoomComplete.bind( this ) );
    }
  },
  
  unzoomComplete : function()
  {
    this.isZooming = false;
    this.isZoomed = false;
    
    // need to remove the drag stuff
    
    // update!
    this.update();
  },

  // calc the start and stop location of the link
  update : function()
  {
    var len = this.links.length;
    for( var i = 0; i < len; i++ )
    {
      var curLink = this.links[i];
      curLink.update( this );
      curLink.render();
    }
    
    var size = this.element.getSize().size;

    // update the thumb
    if( this.thumbEl )
    {
      this.thumbEl.setProperty( 'width', size.x - 2 );
      this.thumbEl.setProperty( 'height', size.y - 2 );
    }
    
    // keep the space thumb proportional
    if( this.spaceThumb )
    {
      this.spaceThumb.setProperty( 'width', ( size.x / 80 ) * 22 );
    }
    
    // update the linking point
    if( this.linkPoint )
    {
      var lsize = this.linkPoint.getSize().size;
      
      // set the position
      this.linkPoint.setStyles({
        left : Math.round( size.x - ( lsize.x / 2 ) + 2 ),
        top : Math.round( size.y - ( lsize.y / 2 ) + 3 )
      })
    }

    // need to update the oldPosition value
    if( this.isDragging )
    {
      // get the position
      var curPos = this.getPosition();
      
      var dx = ( kPageMaxSize.width - kPageMinSize.width ) / 2;
      var dy = ( kPageMaxSize.height - kPageMinSize.height ) / 2;
      
      this.oldPosition = { x : curPos.x + Math.round( dx ), y : curPos.y + Math.round( dy ) };
    }
  },
  
  /*
    The delete link mode
  */
  deleteLinkMode : function()
  {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> deleteLinkMode');
    
    // not a good idea
    this.parentTrail.deleteMode = true;

    // get all the other nodes which need to be deleted
    var connectedNodes = this.parentTrail.getLinkedNodes( this.nodes );

    // add window click listener for checking for cancel deletion
    window.addEvent( 'click', function( e ) { 
      if( !gDeleteFocusNode )
      {
        // clear deletions
        connectedNodes.each( function( x ) {
          x.cancelDelete();
        });
       
        // unzoom
        this.parentTrail.deleteMode = false;
        this.unzoom();
        
        window.removeEvent( 'click' );
      }
    }.bind( this ) );
    
    // tell each one to prepare for delete
    connectedNodes.each( function( x ) {
      
      // reveal delete button
      x.deleteButton.removeClass( 'hidden' );

      // make the delete button work
      x.deleteButton.addEvent( 'click', function( e ) { 
        gDeleteFocusNode = x;

        x.parentTrail.deleteLink( x, this );

        // remove the node ref
        x.nodes.remove( this.id );
        this.nodes.remove( x.id );

        x.parentTrail.deleteMode = false;
        // cancel delete
        connectedNodes.each( function( x ) {
          x.cancelDelete();
        })
        
        // unzoom ourselves
        this.unzoom();

      }.bind( this ) );
      
    }.bind( this ) );
  },
  
  /*
    Show the deletion box.
  */
  prepareDeleteTo : function( aNode ) 
  {
    this.deleteButton.removeClass( 'hidden' );
    
    this.deleteButton.addEvent( 'click', function( e ) { 
      this.parentTrail.deleteLink( this, aNode );
      aNode.finishDeletion();
    }.bind( this ) );
  },
  
  /*
    Clean up the deletion.
  */
  finishDeletion : function()
  {
    // delete mode is false
    this.parentTrail.deleteMode = false;
  },
  
  /*
    Close the trail and put it into the nav
  */
  close : function()
  {
    this.isClosing = true;

    gFocusedNode = null;
    gHoveredNode = null;
    
    // if this already in the nav reveal it
    if( window.nav )
    {
      if( nav.dict[this.id] )
      {
        // just reveal it
        if( nav.showShift ) nav.showShift( this.id );
      }
      else
      {
        // add a page to the nav
        nav.addShift( this.encode() );
      }
    }
    
    this.parentTrail.removeShift( this );
  },
  
  cancelDelete : function()
  {
    this.deleteButton.addClass( 'hidden' );
  },
  
  destroy : function()
  {
    var fadeFX = this.element.effects({
      duration : 300,
      transition : Fx.Transitions.Cubic.easeOut,
      onComplete : function () 
      {
        this.element.remove();
        delete this;        
      }.bind( this )
    });
    
    fadeFX.start({
      opacity: [1.0, 0]
    });
  },
  
  /*
    Convert to JSON.
  */
  encode : function()
  {
    var pos = this.getPosition();
    var fpos = { x : pos.x - this.options.offset.x, 
                 y : pos.y - this.options.offset.y };
                 
    return {
      id : this.id,
      title : this.title,
      loc : fpos,
      href : this.href,
      nodes : this.nodes.copy(),
      thumb : this.thumb,
      user : this.user,
      space : this.space,
      icon : this.icon
    };
  }
});

TrailPage.implement( new Options );

/*
  Utility function to check to see if a point is inside an element.
*/
function ElementContainsPoint( el, v )
{
  var pos = el.getPosition();
  var size = el.getSize().size;
  
  return ( v.x >= pos.x &&
           v.x <= pos.x + size.x &&
           v.y >= pos.y &&
           v.y <= pos.y + size.y )
}