// Notes does need to manage the rendering order of the notes
var NotesSpace = new Class({
  Extends: ShiftSpace.Space,
  onShiftFocus: function(shiftId)
  {
    if(this.isNewShift(shiftId)) this.editShift(shiftId);
  }
});

var NotesShift = new Class({
  Extends: ShiftSpace.Shift,

  defaults: function()
  {
    return $merge(this.parent(), {
      position: {x: 50, y: 50},
      size: {x: 200, y: 200},
      summary: ''
    });
  },

  setup: function(json)
  {
    this.noteText = (json.noteText && json.noteText.replace(/<br\/>/g, "\n")) || null;

    this.element = this.template("shift").toElement();
    $(document.body).grab(this.element);
    this.initUI();
    this.attachEvents();
    
    this.element.setStyles({
      width: this.defaults.size.x,
      height: this.defaults.size.y,
      left: this.defaults.position.x,
      top: this.defaults.position.y,
      position: 'absolute'
    });
    
    this.element.set('tween', {
      duration: 300,
      transition: Fx.Transitions.Cubic.easeIn
    });
    this.element.tween('opacity', [0, 1]);

    this.manageElement(this.element);
    this.refresh();

    // check to see if this note is pinned
    if(ShiftSpace.Pin.isValidRef(json.pinRef))
    {
      this.pin(this.element, json.pinRef);
    }
    else
    {
      // otherwise set the position of the note to the mouse
      // or the last saved absolute position
      if(this.isNewShift())
      {
        this.element.setStyles({
          left: window.getScroll().x + (window.getWidth() - this.defaults.size.x) / 2,
          top: window.getScroll().y + (window.getHeight() - this.defaults.size.y) / 2
        });
      }
      else if(json.position)
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
    this.refresh();
  },

  // only called on broken shifts
  setProperties: function(json) { this.__properties__ = json; },
  getProperties: function() { return this.__properties__; },

  initUI: function()
  {
    this.closeButton = this.element.getElement(".SSNoteShiftCloseButton");    
    this.top = this.element.getElement(".SSNoteShiftTop");
    this.frame = this.element.getElement(".SSNoteShiftFrame");
    this.bottom = this.element.getElement(".SSNoteShiftBottom");
    this.resizeControl = this.element.getElement(".SSNoteShiftResize");
    this.grabber = this.element.getElement(".SSNoteShiftGrabber");
    this.pinWidgetDiv = this.element.getElement(".SSPinWidgetButton");
  },

  /*
    Function : attachEvents
      Attach all the needed events to the Notes interface.
  */
  attachEvents: function( e )
  {

    this.closeButton.addEvent('click', this.cancel.bind(this));

    this.dragRef = this.element.makeDraggable({
      handle: this.top,
      onStart: function() {
        this.fireEvent('onDragStart');
      }.bind(this),
      onComplete: function() {
        this.fireEvent('onDragStop');
      }.bind(this)
    });

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

    this.setFocusRegions(this.grabber, this.resizeControl);
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
    // we don't want the event to continue
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
  cancel: function() { this.hide(); },

  /*
    Function : encode
      Encode the Note into a JSON object.
  */
  encode: function()
  {
    // position and size
    var pos = this.element.getPosition(),
        size = this.element.getSize(),
        text = this.getText();
    // NOTE: We need to store the actual noteText for relative pinned notes because iframe refresh issues - David
    if(this.inputArea) this.noteText = this.inputArea.getProperty('value');
    return {
      position: pos,
      size: size,
      noteText: text,
      summary: this.getTitle(),
      pinRef: this.getEncodablePinRef()
    };
  },

  updateText: function(_evt) { if(this.inputArea) this.noteText = $(this.inputArea).getProperty('value'); },

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
      var size = this.element.getSize(),
          topSize = this.top.getSize(),
          bottomSize = this.bottom.getSize();
    }
    else
    {
      var size = this.element.getSize(),
          topSize = this.top.getSize(),
          bottomSize = this.bottom.getSize();
    }

    this.frame.setStyles({
      width: size.x,
      height: size.y - topSize.y - bottomSize.y
    });
  },

  showNew: function()
  {
    this.show();
  },

  show: function()
  {
    this.update();
    this.hideEditInterface();
    // have to remember to unpin
    if(this.getPinRef() && !this.isPinned()) this.pin(this.element, this.getPinRef());
  },

  edit: function()
  {
    this.showEditInterface();
  },

  editExit: function()
  {
    this.hideEditInterface();
  },

  hide: function()
  {
    this.hideEditInterface();
    if(this.isPinned()) this.unpin();
  },

  blur: function()
  {
    this.update();
    this.hideEditInterface();
  },

  showEditInterface: function()
  {
    this.pinWidgetDiv.setStyle('display', '');
    if(this.inputArea)
    {
      this.inputArea.removeProperty('readonly');
      this.inputArea.setStyle('display', 'block');
    }
    if(this.viewArea) this.viewArea.setStyle('display', 'none');
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
      this.inputArea.setStyle('display', 'none');
    }
    if(this.viewArea) this.viewArea.setStyle('display', 'block');
    this.refresh();
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
    if(props) this.noteText = props.noteText;
    if(this.noteText) text = this.noteText;

    var notedoc = this.frame.contentDocument || this.frame.document;
    this.notedoc = notedoc;
    this.frameBody = $(notedoc.body);
    this.frameBody.setProperty('id', 'SSNoteShiftFrameBody');

    this.inputArea = $(notedoc.createElement('textarea'));
    this.inputArea.setProperty('class', 'SSNoteShiftTextArea');
    this.inputArea.setStyle('display', 'none');
    this.inputArea.injectInside( this.frameBody );
    this.inputArea.setProperty('value', text);
    this.inputArea.focus();

    this.inputArea.addEvent('keyup', this.updateText.bind(this));

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
    this.update();
    if(this.isBeingEdited()) this.edit();
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
    // put the note back on the page
    this.element.injectInside(document.body);
  }
});