// Notes does need to manage the rendering order of the notes
var NotesSpace = new Class({

  name: 'NotesSpace',

  Extends: ShiftSpace.Space,

  attributes:
  {
    name: 'Notes',
    version: 0.1,
    icon: 'Notes.png',
    css: 'Notes.css'
  },

  intialize: function()
  {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>> Notes starting up!');
    this.parent();
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
    var content = brokenShiftJson.content;
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

    // show the broken shift
    this.showShift(brokenShiftJson.id);
    this.editShift(brokenShiftJson.id);

    // save the fixed shift
    //currentShift.save();
  }
});

var NotesShift = new Class({

  name: 'NotesShift',

  Extends: ShiftSpace.Shift,

  getDefaults: function()
  {
    return $merge( this.parent(), {
      position: { x : 50, y : 50 },
      size: { x : 200, y : 200 },
      summary: ''
    });
  },

  /*
  */
  setup: function(json)
  {
    console.log('Create Notes shift');
    console.log(json);

    if(json.legacy)
    {
      json.position = {x: json.x, y: json.y};
      json.noteText = json.content;
    }

    // store a noteText ref
    this.noteText = (json.noteText && json.noteText.replace(/<br\/>/g, "\n")) || null;
    //SSLog('Notes shift about to build');
    this.build();
    console.log('Notes shift built');
    //SSLog('Notes shift built');
    
    // attach events
    this.attachEvents();
    //SSLog('Note shift events attached');

    // set the size to the defaults size declared above
    this.element.setStyles({
      width: this.defaults.size.x,
      height: this.defaults.size.y
    });

    //SSLog('styles set');

    this.element.set('tween', {
      duration: 300,
      transition: Fx.Transitions.Cubic.easeIn
    });
    this.element.tween('opacity', [0, 1]);

    //SSLog('fx about to start');

    // set the main view
    this.manageElement(this.element);

    //SSLog('prepare refresh');
    // refresh - generally a good idea
    this.refresh();
    //SSLog('refresh');

    //SSLog('check pin');
    // check to see if this note is pinned
    if(ShiftSpace.Pin.isValidRef(json.pinRef))
    {
      this.pin(this.element, json.pinRef);
    }
    else
    {
      // otherwise set the position of the note to the mouse
      // or the last saved absolute position
      //SSLog('set position');
      if(json.position)
      {
        this.element.setStyles({
          left: json.position.x,
          top: json.position.y
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

    //SSLog('refresh again');
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
  attachEvents: function( e )
  {
    // setup close button
    this.closeButton.addEvent('click', this.cancel.bind(this));

    // make the note draggable
    this.dragRef = this.element.makeDraggable({
      handle: this.top,
      
      onStart: function() {
        this.fireEvent('onDragStart');
      }.bind(this),
      
      onComplete: function() {
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
      handle: this.resizeControl,
      
      onStart: function() {
        this.fireEvent('onDragStart');
      }.bind(this),
      
      onComplete: function() {
        this.fireEvent('onDragStop');
      }.bind(this),
      
      onDrag: this.refresh.bind(this)
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
  revealControls: function( e )
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
  hideControls: function( e )
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
  cancel: function()
  {
    this.hide();
  },


  /*
    Function : encode
      Encode the Note into a JSON object.
  */
  encode: function()
  {
    // position and size
    var pos = this.element.getPosition();
    var size = this.element.getSize();

    // tokenize newlines for transport
    var text = this.getText();

    // NOTE: We need to store the actual noteText for relative pinned notes because iframe refresh issues - David
    if(this.inputArea)
    {
      this.noteText = this.inputArea.getProperty('value');
    }

    return {
      position: pos,
      size: size,
      noteText: text,
      summary: this.getTitle(),
      pinRef: this.getEncodablePinRef(),
      filters:
      {
        noteText: 'html',
        summary: 'html'
      }
    };
  },


  updateText: function(_evt)
  {
    if(this.inputArea)
    {
      this.noteText = $(this.inputArea).getProperty('value');
    }
  },


  update: function()
  {
    // make the view area is up to date
    if(this.viewArea)
    {
      this.viewArea.set('html', this.getText());
      // rewrite all links to target parent
      $A(this.notedoc.getElementsByTagName('a')).each(function(link) {
        $(link).setProperty('target', 'parent');
      });
    }
  },


  getText: function()
  {
    return (this.inputArea) ? this.inputArea.getProperty('value').replace(/\n/g, "<br/>") : this.noteText;
  },


  defaultTitle: function()
  {
    // if no set user title, get it from the input area
    if(this.inputArea)
    {
      return this.inputArea.getProperty('value').replace(/\n/g, ' ');
    }
    else
    {
      return "Untitled";
    }
  },


  /*
    Function : refresh
      Refresh the note view.  This should be done if anything changes size.
  */
  refresh: function()
  {
    // if inputArea and inputArea visible
    if(this.inputArea)
    {
      this.inputArea.set('text', this.noteText);
    }
    // if viewArea and viewArea visible
    if(this.viewArea && !this.viewArea.hasClass('SSDisplayNone'))
    {
      this.viewArea.set('html', this.noteText);
    }

    if(this.element.getSize())
    {
      var size = this.element.getSize();
      var topSize = this.top.getSize();
      var bottomSize = this.bottom.getSize();
    }
    else
    {
      var size = this.element.getSize();
      var topSize = this.top.getSize();
      var bottomSize = this.bottom.getSize();
    }

    this.frame.setStyles({
      width: size.x,
      height: size.y - topSize.y - bottomSize.y
    });
  },


  show: function()
  {
    this.parent();

    this.update();
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
    this.update();
    this.hideEditInterface();
  },


  showEditInterface: function()
  {
    this.saveButton.setStyle('display', '');
    this.cancelButton.setStyle('display', '');
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
  build: function()
  {
    // create the element
    this.element = new ShiftSpace.Element( 'div', {
      'class': 'SSNoteShift'
    });
    this.element.setOpacity(0);

    //SSLog('built top');
    // build the top handle and close button
    this.buildTop();
    //SSLog('built frame');
    // build the iframe to hold the text
    this.buildFrame();
    //SSLog('built bottom');
    // build the bottom portion of the note
    this.buildBottom();
    //SSLog('built edges');
    // build the drop shadow edges
    this.buildEdges();
    //SSLog('injecting');
    this.element.injectInside( document.body );
  },


  /*
    Function : buildTop
      Builds the draggle top plus the close button to the note.
  */
  buildTop: function()
  {
    // create the top part where the handle will be
    this.top = new ShiftSpace.Element('div', {
      'class': 'SSNoteShiftTop'
    });

    // create the grabber guide
    this.grabber = new ShiftSpace.Element('div', {
      'class': "SSNoteShiftGrabber SSHidden"
    });

    // create the close button
    this.closeButton = new ShiftSpace.Element('div', {
      'class': 'SSNoteShiftCloseButton SSHidden'
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
  buildFrame: function()
  {
    var _css = this.getParentSpace().attributes.css;

    // create an iframe with the css already loaded
    this.frame = new ShiftSpace.Iframe({
      'class': 'SSNoteShiftFrame',
      border: 'none' ,
      scroll: 'no',
      rows: 1000,
      cols: 25,
      wrap: 'hard',
      css: _css,
      onload: this.finishFrame.bind(this)
    });

    this.frame.injectInside(this.element);
  },


  /*
    Function : finishFrame
      Finishing building the iframe by including the textarea inside.
  */
  finishFrame: function()
  {
    // default
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
    this.notedoc = notedoc;
    this.frameBody = $(notedoc.body);
    this.frameBody.setProperty('id', 'SSNoteShiftFrameBody');

    // create the text area
    this.inputArea = $(notedoc.createElement('textarea'));
    this.inputArea.setProperty('class', 'SSNoteShiftTextArea');
    this.inputArea.setStyle('display', 'none');
    this.inputArea.injectInside( this.frameBody );
    this.inputArea.setProperty('value', text);
    this.inputArea.focus();

    this.inputArea.addEvent('keyup', this.updateText.bind(this));

    // create the view text area
    this.viewArea = $(notedoc.createElement('div'));
    this.viewArea.setProperty('class', 'SSNoteShiftViewArea SSDisplayNone');
    this.viewArea.injectInside(this.frameBody);
    this.viewArea.set('html', text);

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

    // update the view
    this.update();

    if(this.isBeingEdited())
    {
      this.edit();
    }

  },


  /*
    Function : buildBottom
      Builds the bottom portion of the notes shift. This will contain the save and close button
      as well as the resize button.
  */
  buildBottom: function()
  {
    //SSLog('YYYYYYYYYYYYYYYYYYYYAAAAAAAAAAAAAAAAAAAAARRRRRRRRRRRRRRRRRRRR');
    // create the bottom portion of the note
    this.bottom = new ShiftSpace.Element('div', {
      'class': "SSNoteShiftBottom"
    });

    //SSLog('1');

    // create the save button
    this.saveButton = new ShiftSpace.Element('input', {
      'type': 'button',
      'value': 'Save',
      'class': 'SSNoteShiftButton'
    });
    //SSLog('1.5');

    this.saveButton.injectInside( this.element );

    //SSLog('2');

    // create the cancel button
    this.cancelButton = new ShiftSpace.Element('input', {
      'type': 'button',
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

    //SSLog('all the els created');

    // build the bottom

    this.cancelButton.injectInside(this.buttonDiv);
    this.saveButton.injectInside(this.buttonDiv);
    this.buttonDiv.injectInside(this.bottom);
    //SSLog('added basics');

    this.pinWidgetDiv.injectInside(this.bottom);
    //SSLog('pin widget div');

    try
    {
      this.pinWidget = new ShiftSpace.PinWidget(this);
      //SSLog('adding pin widget');
    }
    catch(err)
    {
    }

    this.resizeControl.injectInside(this.bottom);
    //SSLog('resizeControl');

    // add it to the note element
    //SSLog('adding into the bottm');
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
  buildEdges: function()
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