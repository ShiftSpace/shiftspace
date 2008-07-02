var SourceShiftSpace = ShiftSpace.Space.extend({
  attributes : 
  {
    name : 'SourceShift',
    icon : 'SourceShift.png',
    version : 0.1,
    css : 'SourceShift.css'
  },

  setup: function(options) 
  {
    this.mode = 'xhtml';
  },
  
  addShift: function(shift)
  {
    var newShift = this.parent(shift);
    newShift.addEvent('pin', function() {
      this.fireEvent('pin');
    }.bind(this));
    newShift.addEvent('unpin', function() {
      this.fireEvent('unpin');
    }.bind(this));
  },
  
  updateTitleOfShift: function(shiftId, title)
  {
    this.parent(shiftId, title);
    this.titleField.setProperty('value', title);
  },
  
  refresh : function()
  {
    var handleSize = this.handleArea.getSize().size;

    if(this.isMinimized)
    {
      this.origHeight = this.editSourceShift.getSize().size.y;
      this.minHeight = this.editSourceShift.getStyle('min-height');
      
      this.editSourceShift.setStyle('min-height', handleSize.y+4);
      this.editSourceShift.setStyle('height', handleSize.y);
    }
    else if(this.origHeight)
    {
      this.editSourceShift.setStyle('min-height', this.minHeight);
      this.editSourceShift.setStyle('height', this.origHeight);
      this.origHeight = null;
    }
    
    var size = this.editSourceShift.getSize().size;
    var topSize = this.top.getSize().size;
    var bottomSize = this.bottom.getSize().size;
    
    // refresh the edit area
    /*
    this.editSource.setStyles({
      width : size.x - 8,
      height : size.y - handleSize.y - topSize.y - bottomSize.y
    });
    */
    
    // weird browser bug that I can't track
    if(this.editSource.getSize().size.x > size.x)
    {
      this.editSource.setStyle('width', size.x-18);      
    }
  },
  
  onCssLoad: function()
  {
    this.parent();
  },
  
  showInterface : function()
  {
    this.parent();
    if(this.editSourceShift) this.editSourceShift.removeClass('SSDisplayNone');
  },
  
  hideInterface : function()
  {
    this.parent();
    if(this.editSourceShift) this.editSourceShift.addClass('SSDisplayNone');
  },
  
  setMode : function(newMode)
  {
    if(newMode == 'xhtml')
    {
      this.selectTabButton(this.xhtmlButton);
      this.deselectTabButton(this.cssButton);
      this.mode = newMode;
    }
    else if(newMode == 'css')
    {
      this.selectTabButton(this.cssButton);
      this.deselectTabButton(this.xhtmlButton);
      this.mode = newMode;
    }
    else
    {
      console.error('Error: SourceShift.setMode, unknown mode ' + newMode);
    }
  },
  
  onShiftCreate : function(shiftId)
  {
    // if a brand new shift set the title to untitled-#
    var untitledCount = 0;
    
    for(var shift in this.shifts)
    {
      var title = this.shifts[shift].getTitle();
      if(title.search('untitled') != -1)
      {
        untitledCount++;
      }
    }
    
    this.shifts[shiftId].setTitle('untitled-'+untitledCount);
  },
  
  onShiftEdit: function(shiftId)
  {
    // set the mode to xhtml and set to the html of the current shift
    var currentShift = this.shifts[shiftId];
    
    this.setMode('xhtml');
    
    if(this.interfaceIsBuilt() && this.isVisible())
    {
      this.editSource.setProperty('value', currentShift.getMarkup());
      this.titleField.setProperty('value', currentShift.getTitle());
      
      // refresh the interface first
      this.refresh();
      
      // update the location of the editing window
      var position = currentShift.getPosition();
      var size = this.editSourceShift.getSize().size;
      
      this.editSourceShift.setStyles({
        left: position.x - size.x - 10,
        top: position.y
      });
    }

    // update pin widget
    if(currentShift.isPinned())
    {
      this.fireEvent('pin');
    }
    else
    {
      this.fireEvent('unpin');
    }
  },
  
  onShiftFocus: function(shiftId)
  {
    // we are in edit mode
    if(this.isVisible())
    {
      /*
      this.editShift(shiftId);
      this.onShiftEdit(shiftId);
      */
    }
  },
  
  onShiftHide: function(shiftId)
  {
    for(var shift in this.shifts)
    {
      if(this.shifts[shift].isVisible())
      {
        return;
      }
    }
    this.hideInterface();
  },
  
  attachEvents : function()
  {
    // update xhtml/css of shift as user types
    this.editSource.addEvent('keyup', function( _evt ) {
      var currentShift = this.getCurrentShift();
      
      if(this.mode == 'xhtml')
      {
        currentShift.updateMarkup(this.editSource.getProperty('value'));
      }
      else if(this.mode == 'css')
      {
        currentShift.updateCSS(this.editSource.getProperty('value'));
      }
    }.bind(this));
    
    // update title of shift as user types
    this.titleField.addEvent('keyup', function( _evt) {
      if(this.titleField.getProperty('value'))
      {
        this.getCurrentShift().setTitle(this.titleField.getProperty('value'));
      }
    }.bind(this));
    
    this.titleField.addEvent('click', function( _evt) {
    }.bind(this));
    
    this.saveButton.addEvent('click', function( _evt) {
      this.getCurrentShift().save();
    }.bind(this));
    
    this.previewButton.addEvent('click', function( _evt ) {
      if(!this.__previewMode__)
      {
        this.__previewMode__ = true;
        this.getCurrentShift().show();   
        this.highlightButton(this.previewButton);
      }
      else
      {
        this.__previewMode__ = false;
        this.getCurrentShift().edit()
        this.unhighlightButton(this.previewButton);
      }
    }.bind(this));
    
    // setup the resizing behavior
    this.editSourceShift.makeResizable({
      handle: this.resizeControl,
      onDrag: this.refresh.bind(this)
    });
    
    // set up the tab button behavior
    this.xhtmlButton.addEvent('click', function(_evt) {
      var currentShift = this.getCurrentShift();
      
      // set the mode
      this.selectTabButton(this.xhtmlButton);
      this.deselectTabButton(this.cssButton);
      
      currentShift.setCSS(this.editSource.getProperty('value'));
      this.editSource.setProperty('value', currentShift.getMarkup());
      
      // set the mode
      this.mode = 'xhtml';

    }.bind(this));
    
    this.cssButton.addEvent('click', function(_evt) {
      var currentShift = this.getCurrentShift();
      
      // set the mode
      this.selectTabButton(this.cssButton);
      this.deselectTabButton(this.xhtmlButton);

      currentShift.setMarkup(this.editSource.getProperty('value'));
      this.editSource.setProperty('value', currentShift.getCSS());
      
      // set the mode
      this.mode = 'css';
      
    }.bind(this));
    
    // setup minimize
    this.minimizeButton.addEvent('click', function(_evt) {
      if(!this.isMinimized)
      {
        this.isMinimized = true;
        this.top.setStyle('display', 'none');
        this.editSource.setStyle('display', 'none');
        this.bottom.setStyle('display', 'none');
      }
      else
      {
        this.isMinimized = false;
        this.top.setStyle('display', '');
        this.editSource.setStyle('display', '');
        this.bottom.setStyle('display', '');
      }
      this.refresh();
    }.bind(this));
    
    // setup close
    this.closeButton.addEvent('click', function(_evt) {
      this.isMinimized = false;
      this.refresh();
      this.hideInterface();
    }.bind(this));
  },
  
  highlightButton: function(button)
  {
    button.getElement('.SSLeft').addClass('SSLeftActive');
    button.getElement('.middle').addClass('middleActive');
    button.getElement('.SSRight').addClass('SSRightActive');
  },
  
  unhighlightButton: function(button)
  {
    button.getElement('.SSLeft').removeClass('SSLeftActive');
    button.getElement('.middle').removeClass('middleActive');
    button.getElement('.SSRight').removeClass('SSRightActive');
  },
  
  buildHandle : function()
  {
    // create the handle area
    this.handleArea = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditorHandleArea"
    });
    this.handle = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditorHandle", 
    });
    
    // build the window buttons
    this.windowButtons = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditorWindowButtons"
    });
    this.closeButton = new ShiftSpace.Element('div', {
      'class': 'closeButton'
    });
    this.minimizeButton = new ShiftSpace.Element('div', {
      'class': "minimizeButton"
    });
    this.closeButton.injectInside(this.windowButtons);
    this.minimizeButton.injectInside(this.windowButtons);
    
    this.handle.injectInside(this.handleArea);
    this.windowButtons.injectInside(this.handleArea);
    
    this.handleArea.injectInside(this.editSourceShift);
  },
  
  buildTop : function()
  {
    this.top = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditorTop"
    });

    // add the title and the icons
    this.topTitle = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditorTopTitle SSUserSelectNone", 
    });
    this.topTitle.setText('SourceShift');
    
    this.topIcon = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditorIcon"
    });
    
    // add the controls area
    this.controlsArea = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditorControlsArea"
    });
    
    this.titleField = new ShiftSpace.Element('input', {
      'class': "SSSourceShiftTitleInputField", 
      type: "text"
    });
    
    var buttonMarkup = "<div class='SSLeft ShiftSpaceElement SSUserSelectNone'></div><div class='middle'></div><div class='SSRight'></div>";
    this.previewButton = new ShiftSpace.Element('div', {
      value: "Preview", 
      'class': "SSSourceShiftButton SSUserSelectNone", 
      type: "button"
    });
    this.previewButton.setHTML(buttonMarkup);
    this.previewButton.getElement('.middle').setText('Preview');
    if(window.webkit) this.previewButton.addClass('SSSourceShiftButtonWebKit');
    
    this.saveButton = new ShiftSpace.Element('div', {
      value: "Save", 
      'class': "SSSourceShiftButton SSUserSelectNone",
      type: "button"
    });
    this.saveButton.setHTML(buttonMarkup);
    this.saveButton.getElement('.middle').setText('Save');
    if(window.webkit) this.saveButton.addClass('SSSourceShiftButtonWebKit');
    
    // setup hover events for the two buttons
    
    this.titleField.injectInside(this.controlsArea);
    this.saveButton.injectInside(this.controlsArea);
    this.previewButton.injectInside(this.controlsArea);
    
    // add the tab area
    this.tabArea = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditorTabArea"
    });

    this.xhtmlButton = this.createTabButton();
    this.xhtmlButton.getElement('.middle').setText('XHTML');
    this.xhtmlButton.injectInside(this.tabArea);
    
    this.cssButton = this.createTabButton();
    this.cssButton.getElement('.middle').setText('CSS');
    this.cssButton.injectInside(this.tabArea);
    
    // add the pin widget
    this.pinWidgetPrompt = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditorPinPrompt SSUserSelectNone"
    });
    this.pinWidgetPrompt.setText('Pin to element');
    this.pinWidgetPrompt.injectInside(this.tabArea);
    this.pinWidgetDiv = new ShiftSpace.Element('div', {
      'class': 'SSSourceShiftEditorPinWidget'
    });
    this.pinWidgetDiv.injectInside(this.tabArea);
    this.pinWidget = new ShiftSpace.PinWidget(this);

    // build the entire top
    this.topIcon.injectInside(this.top);
    this.topTitle.injectInside(this.top);
    this.controlsArea.injectInside(this.top);
    this.tabArea.injectInside(this.top);
    this.top.injectInside(this.editSourceShift);
  },
  
  getPinRef: function()
  {
    return this.getCurrentShift().getPinRef();
  },
  
  // part of the PinWidget protocol
  getPinWidgetButton: function()
  {
    return this.pinWidgetDiv;
  },
  
  // part of the PinWidget protocol
  getPinWidgetAllowedActions: function()
  {
    return ['before', 'replace', 'after', 'relative'];
  },
  
  // part of the PinWidget protocol
  onPin: function(pinRef)
  {
    var currentShift = this.getCurrentShift();

    // set the pin location of the current shift
    if(currentShift)
    {
      if(pinRef.action == 'unpin') 
      {
        currentShift.unpin();
      }
      else
      {
        currentShift.pin(pinRef);
      }
    }
  },
  
  isPinned: function()
  {
    var currentShift = this.getCurrentShift();
    if(currentShift)
    {
      return currentShift.isPinned();
    }
  },
  
  /*
    Function: selectButton
      Takes a tab button and sets the image styles so it looks focused.
      
    Parameters:
      button - A tab button element.
  */
  selectTabButton: function(button)
  {
    if(this.interfaceIsBuilt())
    {
      // set the font-color of the middle
      button.getElement('.SSLeft').setStyle('backgroundImage', '');
      button.getElement('.middle').setStyle('backgroundImage', '');
      button.getElement('.SSRight').setStyle('backgroundImage', '');
      button.setStyle('z-index', 1);
    }
  },
  
  /*
    Function: deselectTabButton
      Takes a tab button and sets the images style so it looks unfocused.
      
    Parameters:
      button - A tab button element.
  */
  deselectTabButton: function(button)
  {
    if(this.interfaceIsBuilt())
    {
      button.getElement('.SSLeft').setStyle('backgroundImage', 'url(' + ShiftSpace.info().server + 'spaces/SourceShift/images/tab_off-left.png)');
      button.getElement('.middle').setStyle('backgroundImage', 'url(' + ShiftSpace.info().server +'spaces/SourceShift/images/tab_off-body.png)');
      button.getElement('.SSRight').setStyle('backgroundImage', 'url(' + ShiftSpace.info().server + 'spaces/SourceShift/images/tab_off-right.png)');
      button.setStyle('z-index', 0);
    }
  },
  
  /*
    Function: createTabButton
      Creates a tab button for the editor interface.
  */
  createTabButton: function()
  {
    var tabButton = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditorTabButton"
    });
    
    var left = new ShiftSpace.Element('div', {
      'class': "SSLeft SSSourceShiftEditorTabButtonLeft"
    });
    var middle = new ShiftSpace.Element('div', {
      'class': "middle SSSourceShiftEditorTabButtonMiddle SSUserSelectNone"
    });
    var right = new ShiftSpace.Element('div', {
      'class': "SSRight SSSourceShiftEditorTabButtonRight"
    });
    
    left.injectInside(tabButton);
    middle.injectInside(tabButton);
    right.injectInside(tabButton);
    
    return tabButton;
  },
  
  /*
    Function: buildFrame
      Builds the iframe that protects the text encoding.
  */
  buildFrame: function()
  {
    
  },
  
  buildBottom: function()
  {
    this.bottom = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditorBottom"
    });
    
    // add the resize control
    this.resizeControl = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditorResizeControl"
    });
    
    this.resizeControl.injectInside(this.bottom);

    this.bottom.injectInside(this.editSourceShift);
  },
  
  buildInterface : function()
  {
    this.editSourceShift = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditWindow"
    });
    
    this.buildHandle();
    this.buildTop();
    
    this.editSourceWrapper = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftEditorTextAreaDiv" 
    });
    
    this.editSource = new ShiftSpace.Element('textarea', {
      'class': "SSSourceShiftEditorTextArea",
      cols : 1000,
      rows : 1000
    });

    // add the edit source and the bottom
    this.editSource.injectInside(this.editSourceWrapper);
    this.editSourceWrapper.injectInside(this.editSourceShift);
    
    this.buildBottom();

    this.editSourceShift.makeDraggable({
      handle: this.handle
    });
    
    this.editSourceShift.injectInside(document.body);
    
    // the xhtml button should be selected by default
    this.deselectTabButton(this.cssButton);
    
    // attach events and refresh
    this.attachEvents();
    this.refresh();
    
  }
});

var SourceShiftShift = ShiftSpace.Shift.extend({

  setup : function(json)
  {
    this.mode = 'edit';
    
    // set the markup and css and title
    this.markup = (json.markup && json.markup.replace(/<br\/>/g, '\n')) || '';
    this.cssText = (json.css && json.css.replace(/<br\/>/g, '\n')) || '';
    
    this.frameLoaded = false;
    this.build();
    
    this.setTitle( json.title || json.summary || '' );
    
    this.attachEvents();
    
    this.manageElement(this.element);
    
    this.element.setStyles({
      left: json.position.x,
      top: json.position.y
    });
    
    if(json.size)
    {
      this.setSize(json.size);
    }
    
    // pin the shift if necessary
    if(json.pinRef) this.pin(json.pinRef);
    
    // update the way that it looks
    if(this.markup != '')
    {
      this.updateMarkup(this.markup);
    }
    if(this.cssText != '')
    {
      this.updateCSS(this.cssText);
    }
    
    this.setFocusRegions( this.top, this.handle, this.resizeControl );

    this.refresh();
  },
  
  setTitle: function(newTitle)
  {
    this.parent(newTitle);

    if(this.titleTextDiv)
    {
      this.titleTextDiv.setText(newTitle);
      this.refresh();
    }
  },
  
  setSize: function(size)
  {
    this.__size__ = size;

    this.frame.setStyles({
      width: size.x,
      height: size.y
    });
    this.refresh();
  },
  
  getSize: function()
  {
    return this.__size__;
  },
  
  encode : function(markup)
  {
    var pos = (!this.isPinned()) ? this.element.getPosition() :  this.frame.getPosition();
    var cssText = this.cssText.replace(/\n/g, '<br/>');
    var markup = this.markup.replace(/\n/g, '<br/>');
    
    // remove any javascript
    
    return {
      position: pos,
      css: cssText,
      markup: markup,
      summary: this.getTitle(),
      title: this.getTitle(),
      pinRef: this.getEncodablePinRef(),
      size: this.frame.getSize().size
    };
  },
  
  cleanMarkup: function(markup)
  {
    // TODO: strip any js out - David
    return markup;
  },
  
  setCSS : function(css)
  {
    this.cssText = css;
  },
  
  getCSS : function()
  {
    return this.cssText;
  },
  
  setMarkup : function(markup)
  {
    this.markup = markup;
  },
  
  getMarkup : function()
  {
    return this.markup;
  },
  
  /*
    Function: updateMarkup
      Update the markup inside of the iframe.
  */
  updateMarkup : function(markup)
  {
    if(!this.frameLoaded)
    {
      this.markup = markup;
    }
    else
    {
      // store the new markup
      this.markup = markup;

      try
      {
        this.source.setHTML(markup);
      }
      catch(err)
      {
      }

      this.refresh();
    }
  },
  
  updateCSS : function(css)
  {
    this.cssText = css;
    
    // Safari doesn't support empty on CSS elements
    for(var i = 0; i < this.css.childNodes.length; i++)
    {
      this.css.removeChild(this.css.childNodes[i]);
    }
    
    this.css.appendText(css);
    
    // update the iframe css tag
    if(this.iframeCss)
    {
      for(var i = 0; i < this.iframeCss.childNodes.length; i++)
      {
        this.iframeCss.removeChild(this.iframeCss.childNodes[i]);
      }
      
      this.iframeCss.appendText(css);
    }
    
    this.refresh();
  },
  
  resizeToContent : function()
  {
    // if the scroll has changed update the shift dimensions
    var size = this.frame.getSize().size;
    var topy = this.top.getSize().size.y;

    if(this.source)
    {
      var w = this.source.getSize().size.x;
      var h = this.source.getSize().size.y;

      // set the size of the element
      this.frame.setStyles({
        width: w+5,
        height: h+5
      });
    }
  },
  
  refresh: function()
  {
    var size = this.element.getSize().size;
    
    var iconSize = this.titleIcon.getSize().size;
    var titleSize = this.title.getSize().size;
    
    // check the title's actualSize
    this.title.setStyle('width', '');
    this.titleTextDiv.setStyle('width', '');
    var actualTitleHeight = this.titleTextDiv.getSize().size.y;
    
    var nsize = size.x-(iconSize.x+titleSize.x)-13;
    var fsizey = size.y-this.top.getSize().size.y;
    
    var topSize = this.top.getSize().size;

    // TODO: fix this behavior
    if(actualTitleHeight > 20)
    {
      this.title.setStyle('width', size.x - 80);
      this.titleTextDiv.setStyle('width', 10000);
    }
    
    this.updateHandle();

    var frameSize = this.frame.getSize().size;
    this.element.setStyles({
      width: frameSize.x,
      height: frameSize.y+topSize.y
    });
    
    this.cover.setStyles({
      bottom: 0
    });
  },
  
  dragRefresh: function()
  {
    if(!this.getPinRef())
    {
      var size = this.element.getSize().size;
      var fsizey = size.y-this.top.getSize().size.y;
      
      this.updateHandle();

      // set the frame dimensions
      this.frame.setStyles({
        width: size.x,
        height: fsizey-4
      });
    }
  },
  
  updateHandle: function()
  {
    var iconSize = this.titleIcon.getSize().size;
    var titleSize = this.title.getSize().size;
    
    // update the handle
    this.handle.setStyles({
      left: iconSize.x + titleSize.x + 8
    });
  },

  attachEvents: function()
  {
    this.cover.addEvent('mouseover', function(_evt) {
      //this.leavePreview();
    }.bind(this));
    this.cover.addEvent('click', function(_evt) {
      this.show();
    }.bind(this));
  },
  
  show : function()
  {
    this.parent();
    
    this.previewMode = true;
    this.hideFrame();
    
    if(this.getPinRef())
    {
      if(!this.isPinned())
      {
        this.pin(this.getPinRef());
        this.frame.removeClass('SSFrameBorder');
      }
      else
      {
        this.hidePinnedResizer();
        this.hidePinnedHandle();
        this.frame.removeClass('SSFrameBorder');
      }
    }
  },
  
  hide: function()
  {
    this.parent();
    
    if(this.isPinned())
    {
      this.unpin();
    }
    this.element.addClass('SSDisplayNone');
  },
  
  showFrame: function()
  {
    if(!this.frameIsVisible())
    {
      this.top.setStyle('visibility', 'visible');
      this.top.getElements('*').setStyle('visibility', 'visible');
      this.resizeControl.setStyle('visibility', 'visible');
      this.element.setStyle('borderWidth', 2);
    
      if(this.__hiddenFrame__)
      {
        this.__hiddenFrame__ = false;
        var pos = this.element.getPosition();
        this.element.setStyles({
          left: pos.x - 2,
          top: pos.y - 2
        });
      }
    }
  },
  
  hideFrame: function()
  {
    if(this.frameIsVisible())
    {
      this.__hiddenFrame__ = true;

      this.top.setStyle('visibility', 'hidden');
      this.top.getElements('*').setStyle('visibility', 'hidden');
      this.resizeControl.setStyle('visibility', 'hidden');
      this.element.setStyle('borderWidth', 0);

      var pos = this.element.getPosition();

      this.element.setStyles({
        left: pos.x + 2,
        top: pos.y + 2
      });
    }
  },
  
  frameIsVisible: function()
  {
    return this.top.getStyle('visibility') == 'visible';
  },
  
  edit : function()
  {
    this.parent();
    
    this.previewMode = false;

    if(this.isPinned())
    {
      this.frame.addClass('SSFrameBorder');
      this.showPinnedResizer();
      this.showPinnedHandle();
    }
    else
    {
      this.showFrame();
      this.frame.removeClass('SSFrameBorder');
    }
  },
  
  /*
    Function: finishFrame
      Finish the frame. Load the markup if it's not done yet.
  */
  finishFrame : function()
  {
    this.frameLoaded = true;
    
    var doc = this.frame.contentDocument;

    // MooTools-ize the body of the document
    $(doc.body).setProperty('id', 'SSSourceShiftFrameBody');
    this.frameBody = $(doc.body);
    
    if(this.isPinned()) this.frameBody.setStyles({
      left: -8,
      top: -8
    });

    // add the div that will be the source shift
    this.source = $(this.frame.contentDocument.createElement('div'));
    this.source.addClass('SSSourceShiftSource');
    this.source.injectInside(this.frame.contentDocument.body);

    if(this.markup)
    {
      this.updateMarkup(this.markup);
    }
    
    // add a style tag to iframe
    // TODO: this should be convenience function, injectCSS(id, iframeTarget) - David
    if( doc.getElementsByTagName('head').length != 0 )
    {
       var head = doc.getElementsByTagName('head')[0];
    }
    else
    {
      // In Safari iframes don't get the head element by default - David
      // Mootools-ize body
      $(doc.body);
      var head = $(doc.createElement( 'head' ));
      head.injectBefore( doc.body );
    }
    
    this.iframeCss = $(doc.createElement('style'));
    this.iframeCss.setProperty('type', 'text/css');
    this.iframeCss.injectInside(head);

    // update if we have css text
    if(this.cssText)
    {
      this.updateCSS(this.cssText);
    }
  },
  
  buildStyleSheet: function()
  {    
    this.cssId = "SourceShiftStyle" + this.getId();
    this.css = new ShiftSpace.Element('style', {
      id: this.cssId,
      type: 'text/css' 
    });
    this.css.injectInside(document.head);
  },
  
  build : function()
  {
    this.buildStyleSheet();
    
    // the main frame
    this.element = new ShiftSpace.Element('div', {
      'class': "SSSourceShift"
    });
    
    this.top = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftTop"
    });
    this.titleIcon = new ShiftSpace.Element('img', {
      src : ShiftSpace.info().server + 'spaces/SourceShift/images/sourceshift_icon.png',
      'class' : "SSSourceShiftTitleIcon"
    });
    this.titleIcon.injectInside(this.top);
    
    this.title = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftTitle SSUserSelectNone"
    });
    this.titleTextDiv = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftTitleText"
    });
    this.titleTextDiv.injectInside(this.title);
    this.titleTextDiv.appendText('SourceShift');
    
    this.handle = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftHandle"
    });
    this.title.injectInside(this.top);
    this.handle.injectInside(this.top);
    
    this.element.makeDraggable({
      handle: this.handle
    });
    
    this.closeButton = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftCloseButton"
    });
    this.closeButton.injectInside(this.top);
    this.closeButton.addEvent('click', this.hide.bind(this));
    
    this.top.injectInside(this.element);
    
    // create an iframe with the css already loaded
    this.frame = new ShiftSpace.Iframe({
      'class' : 'SSSourceShiftFrame',
      border : 'none' ,
      scroll : 'no',
      rows : 1000,
      cols : 1000,
      css : this.getParentSpace().attributes.css,
      onload : this.finishFrame.bind(this)
    });
    this.frame.injectInside(this.element);
    
    // resize control
    this.resizeControl = new ShiftSpace.Element('div', {
      'class': 'SSSourceShiftResizeControl'
    });
    this.resizeControl.injectInside(this.element);
    
    // pinned resize control
    this.pinnedResizer = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftPinnedResizer SSDisplayNone"
    });
    this.pinnedResizerDragRef = this.frame.makeResizable({
      handle: this.pinnedResizer,
      onDrag: this.refreshPinnedDragResizer.bind(this)
    });
    this.pinnedResizerDragRef.detach();
    
    // pinned handle
    this.pinnedHandle = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftPinnedHandle SSDisplayNone"
    });
    this.pinnedHandleDragRef = this.frame.makeDraggable({
      handle: this.pinnedHandle,
      onDrag: this.refreshPinnedHandle.bind(this)
    });
    this.pinnedHandleDragRef.detach();
    
    // clear out dragging stuff
    this.frame.setStyles({
      position: '',
      left: '',
      top: ''
    });
    
    this.element.makeResizable({
      handle: this.resizeControl,
      onDrag : this.dragRefresh.bind(this)
    });
    
    // build the cover
    this.buildCover();
    
    this.element.injectInside(document.body);
  },
  
  /*
    Function: buildDragCover
      Add the drag cover.  This prevents events from falling into the iframe
      during resize operations.
  */
  buildCover : function()
  {
    this.cover = new ShiftSpace.Element('div', {
      'class': "SSSourceShiftCover"
    });
  },
  
  showPinnedResizer: function()
  {
    // show handy resizer for when source shift is pinned as it's difficult to guess dimensions
    this.pinnedResizer.injectInside(document.body);
    
    // get the frame location
    this.refreshPinnedDragResizer();
    this.pinnedResizer.removeClass('SSDisplayNone');
    
    this.pinnedResizerDragRef.attach();
  },
  
  refreshPinnedDragResizer: function()
  {
    // get the frame location
    var framePos = this.frame.getPosition();
    var frameSize = this.frame.getSize().size;
    
    this.pinnedResizer.setStyles({
      position: 'absolute',
      left: framePos.x + frameSize.x,
      top: framePos.y + frameSize.y
    });
    
    this.pinnedHandle.setStyles({
      position: 'absolute',
      left: framePos.x,
      top: framePos.y - 6,
      width: frameSize.x
    });
  },
  
  hidePinnedResizer: function()
  {
    // hide handy resizer
    this.pinnedResizer.addClass('SSDisplayNone');
    if(this.pinnedResizer.getParent()) this.pinnedResizer.remove();
    this.pinnedResizerDragRef.detach();
  },
  
  showPinnedHandle: function()
  {
    // show handy resizer for when source shift is pinned as it's difficult to guess dimensions
    this.pinnedHandle.injectInside(document.body);
    
    // get the frame location
    this.refreshPinnedHandle();
    this.pinnedHandle.removeClass('SSDisplayNone');
    
    this.pinnedHandleDragRef.attach();
  },
  
  refreshPinnedHandle: function()
  {
    // get the frame location
    var framePos = this.frame.getPosition();
    var frameSize = this.frame.getSize().size;
    
    this.pinnedHandle.setStyles({
      position: 'absolute',
      left: framePos.x,
      top: framePos.y - 5,
      width: frameSize.x
    });
    
    this.pinnedResizer.setStyles({
      position: 'absolute',
      left: framePos.x + frameSize.x,
      top: framePos.y + frameSize.y
    });
  },
  
  hidePinnedHandle: function()
  {
    // hide handy resizer
    this.pinnedHandle.addClass('SSDisplayNone');
    if(this.pinnedHandle.getParent()) this.pinnedHandle.remove();
    this.pinnedHandleDragRef.detach();
  },
  
  pin : function(pinRef)
  {
    // call the parent pin method
    this.parent(this.frame, pinRef);

    // fix some styles
    if(pinRef.targetStyles && pinRef.targetStyles.display == 'inline')
    {
      var action = pinRef.action;
      if(action == 'replace' || action == 'before' || action == 'after')
      {
        this.frame.setStyles({
          display: pinRef.targetStyles.display,
          width: pinRef.targetStyles.width,
          height: pinRef.targetStyles.height,
          position: pinRef.targetStyles.position
        });
      }
      if(action != 'relative')
      {
        if(this.frameBody) this.frameBody.setStyles({
          left: -8,
          top: -8
        });
      }
    }
    
    if(this.isBeingEdited())
    {
      this.frame.addClass('SSFrameBorder');
      this.showPinnedResizer();
      this.showPinnedHandle();
    }

    // hide the element now
    this.element.addClass('SSDisplayNone');
    
    if(this.getSize())
    {
      this.frame.setStyles({
        width: this.getSize().x,
        height: this.getSize().y
      });
    }

    // refresh
    this.refresh();
  },
  
  unpin : function()
  {
    this.hidePinnedResizer();
    this.hidePinnedHandle();
    
    // restore
    this.parent();
    // put it back
    this.element.removeClass('SSDisplayNone');
    this.frame.injectAfter(this.top);
    
    // restore the styles
    this.frame.setStyles({
      float: '',
      width: '',
      height: '',
      position: '',
      display: ''
    });
    
    if(this.frameBody) this.frameBody.setStyles({
      left: '', 
      top: ''
    });
    
    this.showFrame();
    this.frame.removeClass('SSFrameBorder');
    this.frame.removeClass('SSDisplayNone');

    // refresh
    this.refresh();
  },
  
  onFocus : function()
  {
    // update the interface
    this.element.removeClass('SSSourceShiftBorderBlur');
    this.top.removeClass('SSSourceShiftTopBlur');
    this.element.setOpacity(1.0);
  },
  
  onBlur : function()
  {
    // update the interface
    /*
    this.element.addClass('SSSourceShiftBorderBlur');
    this.top.addClass('SSSourceShiftTopBlur');
    this.element.setOpacity(0.5);
    */
  },
  
  getPosition: function()
  {
    if(this.isPinned())
    {
      return this.frame.getPosition();
    }
    else
    {
      return this.element.getPosition();
    }
  },
  
  getMainView: function()
  {
    if(this.isPinned())
    {
      return this.frame;
    }
    else
    {
      return this.element;
    }
  }
});

var SourceShift = new SourceShiftSpace(SourceShiftShift);