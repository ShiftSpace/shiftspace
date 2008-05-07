// Notes does need to manage the rendering order of the notes
var NotesSpace = ShiftSpace.Space.extend({
  attributes :
  {
    name : 'Notes',
    version : 0.1, 
    icon : 'Notes.png',
    css : 'Notes.css'
  }
});

var NotesShift = ShiftSpace.Shift.extend({
  
  getDefaults : function()
  {
    return $merge( this.parent(), {
      position : { x : 50, y : 50 },
      size : { x : 200, y : 200 },
      summary : ''
    });
  },
  
  /*
  */
  setup : function(json)
  {
    // build the DOM
    this.build();
    
    // attach events
    this.attachEvents();
    
    // set the position of the note to the mouse
    this.element.setStyles({
      left : json.position.x,
      top : json.position.y
    });

    // set the size to the defaults size declared above
    this.element.setStyles({
      width : this.defaults.size.x,
      height : this.defaults.size.y
    });

    // fade in
    var fadeFX = this.element.effects({
      duration : 300,
      transition : Fx.Transitions.Cubic.easeIn
    });
    
    fadeFX.start({
      opacity: [0, 1.0]
    });
    
    // set the main view
    this.manageElement(this.element);
    
    // refresh - generally a good idea
    this.refresh();
  },
  
  /*
    Function : attachEvents
      Attach all the needed events to the Notes interface.
  */
  attachEvents : function( e )
  {
    // setup close button
    this.closeButton.addEvent('click', this.cancel.bind(this));
    
    // make the note draggable
    this.element.makeDraggable({ 
      handle : this.top,
      onStart : function() {
        this.fireEvent('onDragStart');
      }.bind(this),
      onComplete : function() {
        this.fireEvent('onDragStop');
      }.bind(this)
    });
    
    // set up the save event
    this.saveButton.addEvent( 'click', this.save.bind( this ) );
    
    // set up the cancel event
    this.cancelButton.addEvent( 'click', this.cancel.bind( this ) );
    
    // make the note resizeable
    this.element.makeResizable({
      handle : this.resizeControl,
      onStart : function() {
        this.fireEvent('onDragStart');
      }.bind(this),
      onComplete : function() {
        this.fireEvent('onDragStop');
      }.bind(this),
      onDrag : this.refresh.bind(this)
    });

    // add areas of the shift that will trigger a focus event on mousedown
    this.setFocusRegions( this.grabber, this.resizeControl );

    // set up the mouse enter/leave events for hiding and reveal controls
    this.element.addEvent('mouseover', this.revealControls.bind(this));
    this.element.addEvent('mouseout', this.hideControls.bind(this));
  },
  
  /*
    Function : handleMouseEnter
      Reveal the Note controls.
  */
  revealControls : function( e )
  {
    // we don't want the event to continue
    var evt = new Event(e);
    evt.stopPropagation();

    this.closeButton.removeClass('SSHidden');
    this.grabber.removeClass('SSHidden');
    this.resizeControl.removeClass('SSHidden');
  },
  
  /*
    Function : handleMouseLeave
      Hide the Note controls.
  */
  hideControls : function( e )
  {
    // we don't want the even to continue
    var evt = new Event(e);
    evt.stopPropagation();

    this.closeButton.addClass('SSHidden');
    this.grabber.addClass('SSHidden');
    this.resizeControl.addClass('SSHidden');
  },

  /*
    Function : cancel
      Handle user cancel operation.
  */
  cancel : function()
  {
    this.hide();
  },
  
  /*
    Function : encode
      Encode the Note into a JSON object.
  */
  encode : function()
  {
    var pos = this.element.getPosition();
    var size = this.element.getSize().size;
    
    return {
      position : pos,
      size : size,
      summary : this.inputArea.value
    };
  },
  
  /*
    Function : refresh
      Refresh the note view.  This should be done if anything changes size.
  */
  refresh : function()
  {
    var size = this.element.getSize().size;
    var topSize = this.top.getSize().size;
    var bottomSize = this.bottom.getSize().size;
    
    this.frame.setStyles({
      width : size.x,
      height : size.y - topSize.y - bottomSize.y
    });
  },
  
  show: function()
  {
    this.parent();
    this.hideEditInterface();
  },
  
  edit: function()
  {
    this.parent();
    this.showEditInterface();
  },
  
  hide: function()
  {
    this.parent();
    this.hideEditInterface();
  },
  
  blur: function()
  {
    this.parent();
    this.hideEditInterface();
  },
  
  showEditInterface: function()
  {
    this.saveButton.setStyle('display', '');
    this.cancelButton.setStyle('display', '');
    this.refresh();
  },
  
  hideEditInterface: function()
  {
    this.saveButton.setStyle('display', 'none');
    this.cancelButton.setStyle('display', 'none');
    this.refresh();
  },
  
  /*
    Function : build
      Builds the top handle area, the text area and the two buttons.
  */
  build : function()
  {
    // create the element
    this.element = new ShiftSpace.Element( 'div', {
      'class' : 'SSNoteShift'
    });
    this.element.setOpacity(0);
    
    // build the top handle and close button
    this.buildTop();
    
    // build the iframe to hold the text
    this.buildFrame();
    
    // build the bottom portion of the note
    this.buildBottom();
    
    // build the drop shadow edges
    this.buildEdges();
    
    this.element.injectInside( document.body );
  },
  
  /*
    Function : buildTop
      Builds the draggle top plus the close button to the note.
  */
  buildTop : function()
  {
    // create the top part where the handle will be
    this.top = new ShiftSpace.Element('div', {
      'class' : 'SSNoteShiftTop'
    });
    
    // create the grabber guide
    this.grabber = new ShiftSpace.Element('div', {
      'class': "SSNoteShiftGrabber SSHidden", 
    });
    
    // create the close button
    this.closeButton = new ShiftSpace.Element('div', {
      'class' : 'SSNoteShiftCloseButton SSHidden'
    });
    
    // add the grabber
    this.grabber.injectInside(this.top);
    // add the close button to the top
    this.closeButton.injectInside(this.top);
    // add top to the main element
    this.top.injectInside(this.element);
  },
  
  /*
    Function : buildFrame
      Builds the frame portion of the notes shift.  We need this to allow
      other encoding inside of the note that are different from the page.
  */
  buildFrame : function()
  {
    var _css = this.getParentSpace().attributes.css;
    
    // create an iframe with the css already loaded
    this.frame = new ShiftSpace.Iframe({
      'class' : 'SSNoteShiftFrame',
      border : 'none' ,
      scroll : 'no',
      rows : 1000,
      cols : 25,
      wrap : 'hard',
      css : _css,
      onload : this.finishFrame.bind(this)
    });

    this.frame.injectInside(this.element);
  },
  
  /*
    Function : finishFrame
      Finishing building the iframe by including the textarea inside.
  */
  finishFrame : function()
  {
    // Get document reference and MooToolize the body
    var doc = this.frame.contentDocument;
    this.frameBody = $(doc.body);
    this.frameBody.setProperty('id', 'SSNoteShiftFrameBody');

    // create the text area
    this.inputArea = $(doc.createElement('textarea'));
    this.inputArea.setProperty('class', 'SSNoteShiftTextArea');
    this.inputArea.injectInside( this.frameBody );
    this.inputArea.setProperty('value', this.defaults.summary);
    this.inputArea.focus();
    
    this.inputArea.addEvent('mousedown', function() {
     this.fireEvent('onFocus', this);
    }.bind(this));
  },
  
  /*
    Function : buildBottom
      Builds the bottom portion of the notes shift. This will contain the save and close button
      as well as the resize button.
  */
  buildBottom : function()
  {
    // create the bottom portion of the note
    this.bottom = new Element('div', {
      'class': "SSNoteShiftBottom"
    });
    
    // create the save button
    this.saveButton = new ShiftSpace.Element( 'input', {
      type : 'button',
      value : 'Save',
      'class' : 'SSNoteShiftButton'
    });
    this.saveButton.injectInside( this.element );
    
    // create the cancel button
    this.cancelButton = new ShiftSpace.Element( 'input', {
      type : 'button',
      value: 'Cancel', 
      'class': 'SSNoteShiftButton'
    });

    // create the resize control
    this.resizeControl = new ShiftSpace.Element('div', {
      'class': "SSNoteShiftResize SSHidden"
    });

    this.pinWidgetDiv = new ShiftSpace.Element('div', {
      'class': "SSPinWidgetButton"
    });
    
    this.buttonDiv = new ShiftSpace.Element('div', {
      'class': "SSNoteShiftButtonDiv"
    });

    // build the bottom
    
    this.cancelButton.injectInside(this.buttonDiv);
    this.saveButton.injectInside(this.buttonDiv);
    this.buttonDiv.injectInside(this.bottom);
    
    this.pinWidgetDiv.injectInside(this.bottom);
    this.pinWidget = new ShiftSpace.PinWidget(this);

    this.resizeControl.injectInside(this.bottom);

    // add it to the note element
    this.bottom.injectInside(this.element);
  },
  
  getPinWidgetButton: function()
  {
    return this.pinWidgetDiv;
  },
  
  getPinWidgetAllowedActions: function()
  {
    return ['relative'];
  },

  onPin: function(pinRef)
  {
    this.pin(this.element, pinRef);
  },
  
  /*
    Function: buildEdges
      Add Mushon's nice little edges.
  */
  buildEdges : function()
  {
    var rightEdge = new ShiftSpace.Element('div', {
      'class': "SSNoteShiftRightEdge"
    });
    
    var bottomEdge = new ShiftSpace.Element('div', {
      'class': "SSNoteShiftBottomEdge"
    });
    
    var corner = new ShiftSpace.Element('div', {
      'class': "SSNoteShiftCorner"
    });
    
    rightEdge.injectInside(this.element);
    bottomEdge.injectInside(this.element);
    corner.injectInside(this.element);
  }
  
});

var Notes = new NotesSpace(NotesShift);
