// Notes does need to manage the rendering order of the notes
var NotesSpace = ShiftSpace.Space.extend({
  attributes :
  {
    name : 'Notes',
    version : 0.1, 
    icon : 'Notes.png',
    css : 'Notes.css'
  },
  
  onShiftFocus: function(shiftId)
  {
    if(this.isNewShift(shiftId))
    {
      this.editShift(shiftId);
    }
  },
  
  fix: function(brokenShiftJson)
  {
    var fixedShift = brokenShiftJson;
    var content = brokenShiftJson.content
    var noteText = content.match(/content:"[\s|\S]+?", x:/m);
    var fixedJson;
    
    // extract the note text
    if(noteText && noteText.length > 0)
    {
      function unescapeHTML(html) {
        var htmlNode = new ShiftSpace.Element('div');
        htmlNode.innerHTML = html;
        if(htmlNode.innerText)
        return htmlNode.innerText; // IE
        return htmlNode.textContent; // FF
      }
      
      var noteTextFinal = unescapeHTML(noteText[0].substr(9, noteText[0].length-14));
      
      fixedJson = content.replace(noteText[0].substr(0, noteText[0].length-2), "");
      // replace new lines
      //fixedJson = fixedJson.replace(/\n/g, '');
      // remove the summary might include HTML markup
      fixedJson = fixedJson.replace(/, summary:"[\s|\S]+?"\}\)/, "})");
      
      // grab the other props
      var otherProps = Json.evaluate(fixedJson);
    }
    
    var currentShift = this.getCurrentShift();
    currentShift.setProperties($merge(otherProps, {noteText: noteTextFinal}));
    
    this.showShift(brokenShiftJson.id);
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
    //console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> HERE WE ARE!');
    
    if(json.legacy)
    {
      json.position = {x: json.x, y: json.y};
      json.noteText = json.content;
    }
    
    // store a noteText ref
    this.noteText = (json.noteText && json.noteText.replace(/<br\/>/g, "\n")) || null;
    
    //console.log('Notes shift about to build');
    // build the DOM
    this.build();
    //console.log('Notes shift built');
    
    // attach events
    this.attachEvents();
    //console.log('Note shift events attached');
    
    // set the size to the defaults size declared above
    this.element.setStyles({
      width : this.defaults.size.x,
      height : this.defaults.size.y
    });
    
    //console.log('styles set');

    // fade in
    var fadeFX = this.element.effects({
      duration : 300,
      transition : Fx.Transitions.Cubic.easeIn
    });
    
    //console.log('fx about to start');
    
    fadeFX.start({
      opacity: [0, 1.0]
    });
    
    // set the main view
    this.manageElement(this.element);
    
    //console.log('prepare refresh');
    // refresh - generally a good idea
    this.refresh();
    //console.log('refresh');
    
    //console.log('check pin');
    // check to see if this note is pinned
    if(ShiftSpace.Pin.isValidRef(json.pinRef))
    {
      this.pin(this.element, json.pinRef);
    }
    else
    {
      // otherwise set the position of the note to the mouse
      // or the last saved absolute position
      //console.log('set position');
      if(json.position)
      {
        this.element.setStyles({
          left : json.position.x,
          top : json.position.y
        });
      }
      // oops fix borked note sizes
      if(json.size && json.size.scroll)
      {
        json.size = json.size.size;
      }
      if(json.size)
      {
        this.element.setStyles({
          width: json.size.x,
          height: json.size.y
        });
      }
    }

    //console.log('refresh again');
    this.refresh();
  },
  
  // only called on broken shifts
  setProperties: function(json)
  {
    this.__properties__ = json;
  },
  
  
  getProperties: function()
  {
    return this.__properties__;
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
    this.dragRef = this.element.makeDraggable({ 
      handle : this.top,
      onStart : function() {
        this.fireEvent('onDragStart');
      }.bind(this),
      onComplete : function() {
        this.fireEvent('onDragStop');
      }.bind(this)
    });
    
    // set up the save event
    this.saveButton.addEvent( 'click', function() {
      this.save();
    }.bind(this));
    
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
    var text = this.inputArea.getProperty('value').replace(/\n/g, "<br/>");
    var titleText = this.inputArea.getProperty('value').replace(/\n/g, '');
    
    // NOTE: We need to store this for relative pinned notes - David
    this.noteText = text;
    
    return {
      position : pos,
      size: size,
      noteText: text,
      summary : this.getTitle() || titleText,
      pinRef: this.getEncodablePinRef(),
      filters: 
      {
        noteText: 'html',
        summary: 'html'
      }
    };
  },
  
  
  /*
    Function : refresh
      Refresh the note view.  This should be done if anything changes size.
  */
  refresh : function()
  {
    // if inputArea and inputArea visible
    if(this.inputArea)
    {
      this.inputArea.setText(this.noteText);
    }
    // if viewArea and viewArea visible
    if(this.viewArea && !this.viewArea.hasClass('SSDisplayNone'))
    {
      this.viewArea.setHTML(this.noteText);
    }
    
    if(this.element.getSize().size)
    {
      var size = this.element.getSize().size;
      var topSize = this.top.getSize().size;
      var bottomSize = this.bottom.getSize().size;
    }
    else
    {
      var size = this.element.getSize();
      var topSize = this.top.getSize();
      var bottomSize = this.bottom.getSize();
    }
    
    this.frame.setStyles({
      width : size.x,
      height : size.y - topSize.y - bottomSize.y
    });
  },
  
  
  show: function()
  {
    this.parent();
    this.hideEditInterface();
    
    // have to remember to unpin
    if(this.getPinRef() && !this.isPinned())
    {
      // TODO: Instead of setting this over over again, should just methods to set these up once - David
      this.pin(this.element, this.getPinRef());
    }
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
    
    // have to remember to pin
    if(this.isPinned())
    {
      this.unpin();
    }
  },
  
  
  onBlur: function()
  {
    this.parent();
    this.hideEditInterface();
  },
  
  
  showEditInterface: function()
  {
    this.saveButton.setStyle('display', '');
    this.cancelButton.setStyle('display', '');
    this.resizeControl.setStyle('display', '');
    this.pinWidgetDiv.setStyle('display', '');
    
    if(this.inputArea)
    {
      this.inputArea.removeProperty('readonly');
      // show the input area
      this.inputArea.setStyle('display', 'block');
    }

    if(this.viewArea)
    {
      // hide the viewing area
      this.viewArea.setStyle('display', 'none');
    }

    this.refresh();
  },
  
  
  hideEditInterface: function()
  {
    this.saveButton.setStyle('display', 'none');
    this.cancelButton.setStyle('display', 'none');
    this.resizeControl.setStyle('display', 'none');
    this.pinWidgetDiv.setStyle('display', 'none');
    
    if(this.inputArea)
    {
      this.inputArea.setProperty('readonly', 1);
      // hide the input area
      this.inputArea.setStyle('display', 'none');
    }

    if(this.viewArea)
    {
      // show the viewing area
      this.viewArea.setStyle('display', 'block');
    }
    
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
    
    //console.log('built top');
    // build the top handle and close button
    this.buildTop();
    
    //console.log('built frame');
    // build the iframe to hold the text
    this.buildFrame();
    
    //console.log('built bottom');
    // build the bottom portion of the note
    this.buildBottom();
    
    //console.log('built edges');
    // build the drop shadow edges
    this.buildEdges();
    
    //console.log('injecting');
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
      'class': "SSNoteShiftGrabber SSHidden"
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
    var text = 'Leave a note';
    var props = this.getProperties();
    
    // if properties from borked json grab them
    if(props)
    {
      this.noteText = props.noteText;
    }
    
    if(this.noteText)
    {
      text = this.noteText;
    }
    
    // Get document reference and MooToolize the body
    var notedoc = this.frame.contentDocument || this.frame.document;
    this.frameBody = $(notedoc.body);
    this.frameBody.setProperty('id', 'SSNoteShiftFrameBody');

    // create the text area
    this.inputArea = $(notedoc.createElement('textarea'));
    this.inputArea.setProperty('class', 'SSNoteShiftTextArea');
    this.inputArea.setStyle('display', 'none');
    this.inputArea.injectInside( this.frameBody );
    this.inputArea.setProperty('value', text);
    this.inputArea.focus();
    
    // create the view text area
    this.viewArea = $(notedoc.createElement('div'));
    this.viewArea.setProperty('class', 'SSNoteShiftViewArea SSDisplayNone');
    this.viewArea.injectInside(this.frameBody);
    this.viewArea.setHTML(text);
  
    this.inputArea.addEvent('mousedown', function() {
      this.focus();
      // clear out Leave a note
      if(this.inputArea.getProperty('value') == "Leave a note")
      {
        this.inputArea.setProperty('value', '');
      }
    }.bind(this));
    
    this.inputArea.setProperty('readonly', 1);
        
    if(props)
    {
      this.element.setStyles({
        left: props.x, 
        top: props.y,
        width: props.width, 
        height: props.height
      });
    }
    
    // rewrite all links to target parent
    $A(notedoc.getElementsByTagName('a')).each(function(link) {
      $(link).setProperty('target', 'parent');
    });

    if(this.isBeingEdited())
    {
      this.edit();
    }
    else
    {
      this.show();
    }
    
  },
  
  
  /*
    Function : buildBottom
      Builds the bottom portion of the notes shift. This will contain the save and close button
      as well as the resize button.
  */
  buildBottom : function()
  {
    //console.log('YYYYYYYYYYYYYYYYYYYYAAAAAAAAAAAAAAAAAAAAARRRRRRRRRRRRRRRRRRRR');
    // create the bottom portion of the note
    this.bottom = new ShiftSpace.Element('div', {
      'class': "SSNoteShiftBottom"
    });
    
    //console.log('1');
    
    // create the save button
    this.saveButton = new ShiftSpace.Element('input', {
      'type' : 'button',
      'value' : 'Save',
      'class' : 'SSNoteShiftButton'
    });
    //console.log('1.5');
    
    this.saveButton.injectInside( this.element );
    
    //console.log('2');
    
    // create the cancel button
    this.cancelButton = new ShiftSpace.Element('input', {
      'type' : 'button',
      'value': 'Cancel', 
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
    
    //console.log('all the els created');

    // build the bottom
    
    this.cancelButton.injectInside(this.buttonDiv);
    this.saveButton.injectInside(this.buttonDiv);
    this.buttonDiv.injectInside(this.bottom);
    //console.log('added basics');
    
    this.pinWidgetDiv.injectInside(this.bottom);
    //console.log('pin widget div');
    
    try
    {
      this.pinWidget = new ShiftSpace.PinWidget(this);
      //console.log('adding pin widget');
    }
    catch(err)
    {
    }

    this.resizeControl.injectInside(this.bottom);
    //console.log('resizeControl');

    // add it to the note element
    //console.log('adding into the bottm');
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
    if(pinRef.action == 'unpin')
    {
      this.unpin();
    }
    else
    {
      this.pin(this.element, pinRef);
    }
  },
  
  
  unpin: function()
  {
    this.parent();
    // put the note back on the page
    this.element.injectInside(document.body);
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