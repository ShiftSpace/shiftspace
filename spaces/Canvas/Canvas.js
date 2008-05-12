/*
  Class : CanvasSpace
    A ShiftSpace.Space for doing simple vector graphics anywhere on the web. - David Nolen
*/
var CanvasSpace = ShiftSpace.Space.extend({
  
  attributes : {
    name : 'Canvas',
    title : 'Canvas',
    icon : ShiftSpace.info().server + 'spaces/Canvas/Canvas.png',
    version : 0.1,
    css : 'spaces/Canvas/Canvas.css'
  },
  
  buildInterface: function() 
  {
    this.build();
    this.attachEvents();
    
    // set the default fill and stroke color
    this.setStrokeStyle([0,0,0])
    this.setFillStyle([0,0,0]);
    
    // position the toolbar
    this.toolBar.setStyles({
      top: 100,
      left: 100
    });
    
    // set up the tools
    // TODO : This is silly need to fix this - David
    var theMoveTool = new MoveTool();
    this.getMoveTool = function()
    {
      return theMoveTool;
    }
    var rotateTool = new RotateTool();
    this.getRotateTool = function()
    {
      return rotateTool;
    }
    var arrowTool = new ArrowTool();
    this.getArrowTool = function()
    {
      return arrowTool;
    }
    var scaleTool = new ScaleTool();
    this.getScaleTool = function()
    {
      return scaleTool;
    }
    
    // set default tool to pencil
    this.setTool( 'Pencil' );
    
    // make the toolbar draggable
    this.toolBar.makeDraggable();
    
  },
  
  /*
    Function : build
      Builds the interface for the Canvas space.
  */
  build : function()
  {
    // build the toolbar
    this.toolBar = new ShiftSpace.Element('div', {
      'class': "CSToolBar CSHidden"
    });

    this.stroke = new ShiftSpace.Element('div', {
      id: "CSStroke", 
      'class': "CSColor"
    });
    this.fill = new ShiftSpace.Element('div', {
      id: "CSFill", 
      'class': "CSColor"
    });

    this.noColor = new ShiftSpace.Element('div', {
      id: "CSNoStroke",
      'class' : "CSColor"
    });
    this.noFill = new ShiftSpace.Element('div', {
      id: "CSNoFill",
      'class': "CSColor", 
    });
    
    this.arrow = new ShiftSpace.Element('div', {
      id: "CSArrow",
      'class': "CSTool"
    });
    this.arrow.setText('A');
    
    this.pencil = new ShiftSpace.Element('div', {
      id: "CSPencil",
      'class': "CSTool"
    });
    this.pencil.setText('P');
    
    this.pen = new ShiftSpace.Element('div', {
      id: "CSPen",
      'class': "CSTool"
    });
    this.pen.setText('V');
    
    this.translate = new ShiftSpace.Element('div', {
      id: 'CSMove',
      'class': "CSTool"
    });
    this.translate.setText('M');
    
    this.rotate = new ShiftSpace.Element('div', {
      id: 'CSRotate',
      'class': "CSTool"
    });
    this.rotate.setText('R');
    
    this.scale = new ShiftSpace.Element('div', {
      id: "CSScale", 
      'class' : 'CSTool'
    });
    this.scale.setText('S');
    
    this.circle = new ShiftSpace.Element('div', {
      id: "CSCircle",
      'class': "CSTool"
    });
    this.circle.setText('C');
    
    this.rect = new ShiftSpace.Element('div', {
      id: "CSRect", 
      'class': "CSTool"
    });
    this.rect.setText('R');
    
    this.stroke.injectInside(this.toolBar);
    this.fill.injectInside(this.toolBar);
    this.noColor.injectInside(this.toolBar);
    this.noFill.injectInside(this.toolBar);

    this.arrow.injectInside(this.toolBar);
    this.pencil.injectInside(this.toolBar);
    this.pen.injectInside(this.toolBar);
    this.translate.injectInside(this.toolBar);
    this.rotate.injectInside(this.toolBar);
    this.scale.injectInside(this.toolBar);
    this.circle.injectInside(this.toolBar);
    this.rect.injectInside(this.toolBar);
    
    this.toolBar.injectInside(document.body);
    
    this.buildObjectInspector();

    // build MooRainbow color picker
    this.mooRainbow = new MooRainbow(this.stroke, {
      imgPath : ShiftSpace.info().server + 'spaces/Canvas/images/',
      startColor : [0, 0, 0],
      onChange : function(color)
      {
        this.mooRainbow.element.setStyle('backgroundColor', color.hex);
        this.setStrokeStyle(color.rgb);
      }.bind(this),
      onComplete : function(color)
      {
        this.setStrokeStyle(color.rgb);
      }
    });
  },
  
  /*
    Function : buildObjectInspector
      Builds the object inspector which is used to view and change
      additional properties of drawn objects.
  */
  buildObjectInspector: function()
  {
    // build the object inspect
    this.objectInspector = new ShiftSpace.Element('div', {
      'class': "CSObjectInspector CSHidden"
    });
    
    this.objectInspector.setStyles({
      top: 200, 
      left: 200
    });
    
    /* Opacity slider */
    this.opacitySlider =new ShiftSpace.Element('div', {
      'class': "CSSliderContainer"
    });
    this.opacitySliderLabel = new ShiftSpace.Element('div', {
      'class': "CSPropertySliderLabel"
    });
    this.opacitySliderLabel.setText('Opacity:');
    
    // build the opacity slider
    this.opacityHandle = new ShiftSpace.Element('div', {
      id: "CSOpacityHandle",
      'class': "CSPropertySliderKnob"
    });
    this.opacityTrack = new ShiftSpace.Element('div', {
      id: "CSOpacityTrack",
      'class': "CSPropertySlider"
    });
    this.opacityHandle.injectInside(this.opacityTrack);

    // add the sliders
    this.opacitySliderLabel.injectInside(this.opacitySlider);
    this.opacityTrack.injectInside(this.opacitySlider);
    this.opacitySlider.injectInside(this.objectInspector);
    
    /* Line width slider */
    this.lineWidthSlider =new ShiftSpace.Element('div', {
      'class': "CSSliderContainer"
    });
    this.lineWidthSliderLabel = new ShiftSpace.Element('div', {
      'class': "CSPropertySliderLabel"
    });
    this.lineWidthSliderLabel.setText('Line Width:');
    
    // build the lineWidth slider
    this.lineWidthHandle = new ShiftSpace.Element('div', {
      id: "CSLineWidthHandle",
      'class': "CSPropertySliderKnob"
    });
    this.lineWidthTrack = new ShiftSpace.Element('div', {
      id: "CSLineWidthTrack",
      'class': "CSPropertySlider"
    });
    this.lineWidthHandle.injectInside(this.lineWidthTrack);
    
    /* Arrow checkbox */
    this.arrowOption = new ShiftSpace.Element('input', {
      id: "CSArrowOption",
      'class': 'CSPropertyCheckbox CSHidden',
      type: 'checkbox',
      name: 'arrowhead',
      value: 'Arrowhead',
      checked: ''
    });
    this.arrowOptionLabel = new ShiftSpace.Element('div', {
      'class' : 'CSPropertyLabel CSHidden'
    });
    this.arrowOptionLabel.setText('Arrowhead');

    // add the sliders
    this.lineWidthSliderLabel.injectInside(this.lineWidthSlider);
    this.lineWidthTrack.injectInside(this.lineWidthSlider);
    this.lineWidthSlider.injectInside(this.objectInspector);

    // add the arrow options
    this.arrowOption.injectInside(this.objectInspector);
    this.arrowOptionLabel.injectInside(this.objectInspector);
    
    // make the object inspector draggable
    this.objectInspector.makeDraggable();
    this.objectInspector.injectInside(document.body);

    // we initialize the sliders the first time the inspector becomes visible
    this.slidersInitialized = false;
  },
  
  /*
    Function: updateObjectInspector
      Updates the object inspector interface to reflect the properties of the
      currently selected object.
  */
  updateObjectInspector: function(evt)
  {
    if(evt.layer && evt.layer instanceof Pen)
    {
      this.arrowOption.removeClass('CSHidden');
      this.arrowOptionLabel.removeClass('CSHidden');
    }
    else
    {
      this.arrowOption.addClass('CSHidden');
      this.arrowOptionLabel.addClass('CSHidden');
    }
  },
  /*
    Function: initializeSliders
      Initializes the sliders in the object inspector.
  */
  initializeSliders: function()
  {
    // have to wait for css to construct slider as well
    new Slider(this.opacityTrack, this.opacityHandle, {
      onChange: this.setOpacity.bind(this),
      onComplete: this.setOpacity.bind(this)
    });
    
    // have to wait for css to construct slider as well
    new Slider(this.lineWidthTrack, this.lineWidthHandle, {
      steps: 20,
      onChange: this.setLineWidth.bind(this),
      onComplete: this.setLineWidth.bind(this)
    });
  },
  
  /*
    Function : attachEvents
      Attaches events to the Canvas Space toolbar interface.
  */
  attachEvents : function()
  {
    this.noColor.addEvent('click', this.setStrokeStyle.bind(this, 'none'));
    this.noFill.addEvent('click', this.setFillStyle.bind(this, 'none'));
    
    // set up the tools
    this.arrow.addEvent('click', this.setTool.bind(this, 'Arrow'));
    this.pencil.addEvent('click', this.setTool.bind(this, 'Pencil'));
    this.pen.addEvent('click', this.setTool.bind(this, 'Pen'));
    this.circle.addEvent('click', this.setTool.bind(this, 'Circle'));
    
    this.translate.addEvent('click', this.setTool.bind(this, 'Move'));
    this.rotate.addEvent('click', this.setTool.bind(this, 'Rotate'));
    this.scale.addEvent('click', this.setTool.bind(this, 'Scale'));
  },
  
  /*
    Function : onCssLoad
      Setup MooRainbow. :.clo:fdrop
  */
  onCssLoad : function() {},
  
  showInterface : function()
  {
    this.parent();
    
    this.toolBar.removeClass('CSHidden');
    this.objectInspector.removeClass('CSHidden');
    
    if(!this.slidersInitialized)
    {
      this.initializeSliders();
    }
  },
  
  onShiftCreate : function(shiftId)
  {
    // attach a bunch of events to the new canvas
    var aCanvas = this.shifts[shiftId];
    
    // update the object inspector if the canvas changes layer focus
    aCanvas.addEvent('onSelectLayer', this.updateObjectInspector.bind(this));
  },
  
  onShiftFocus : function(shiftId)
  {
    this.selectedCanvas = this.shifts[shiftId];
  },
  
  hideInterface : function(shiftId)
  {
    this.toolBar.addClass('CSHidden');
    this.objectInspector.addClass('CSHidden');
  },
  
  /*
    Function: setTool
      Set the current tool.
      
    Parameters:
      newTool - a string representing the selected tool.
  */
  setTool : function(newTool) 
  { 
    // update the interface
    if($$('.CSSelectedTool')[0])
    {
      $$('.CSSelectedTool')[0].removeClass('CSSelectedTool');
    }
    $$('#CS'+newTool).addClass('CSSelectedTool');
    
    this.tool = newTool;
    
    this.fireEvent('onToolChange');
  },
  getTool : function() { return this.tool },
  
  setFillStyle : function(newFillStyle) 
  { 
    this.fillStyle = newFillStyle;
    this.fireEvent('onFillChange', [newFillStyle]);
  },
  getFillStyle : function() { return this.fillStyle; },
  
  setStrokeStyle : function(newStrokeStyle) 
  { 
    this.strokeStyle = newStrokeStyle; 
    this.fireEvent('onStrokeChange', [newStrokeStyle]);
  },
  getStrokeStyle : function() { return this.strokeStyle },
  
  setOpacity : function(newOpacity)
  {
    this.opacity = newOpacity/100;
    // check to see if there is a current object and set the opacity
    this.fireEvent('onOpacityChange', this.opacity);
  },
  getOpacity : function() { return this.opacity },
  
  setLineWidth : function(newWidth) 
  {
    this.lineWidth = newWidth;
    this.fireEvent('onLineWidthChange', this.lineWidth)
  },
  getLineWidth : function() { return 2; }
});

// Provides the drawing area. Basically the document.
var CanvasShift = ShiftSpace.Shift.extend({
  getDefaults : function()
  {
    return $merge( this.parent(), {
      size : { x : 200, y : 200 }
    });
  },

  setup : function(json)
  {
    this.hideControls = false;

    this.build();
    this.attachEvents();
    
    // holds the display list
    this.displayList = [];
    
    // undo redo operation queues
    // and operation consists of the tool
    // the method and arguments that need to
    // be applied
    this.redoOperationQueue = [];
    this.undoOperationQueue = [];
    
    if( json.displayList )
    {
      this.loadEncodedDisplayList( json.displayList );
    }
    
    this.element.setStyles({
      left : json.position.x,
      top : json.position.y,
      width : this.defaults.size.x,
      height : this.defaults.size.y
    });
    
    // TODO - This a design ugliness. Fix this The Space should call operationComplete - David
    // these functions should get called.  Canvas should keep track of the focused shift
    this.getParentSpace().addEvent('onStrokeChange', this.setStroke.bind(this));
    this.getParentSpace().addEvent('onOpacityChange', this.setOpacity.bind(this));
    this.getParentSpace().addEvent('onLineWidthChange', this.setLineWidth.bind(this));
    this.getParentSpace().addEvent('onFillChange', this.setFill.bind(this));
    this.getParentSpace().addEvent('onToolChange', this.operationComplete.bind(this));
    
    this.getParentSpace().getMoveTool().addEvent('onComplete', this.operationComplete.bind(this));
    this.getParentSpace().getRotateTool().addEvent('onComplete', this.operationComplete.bind(this));
    this.getParentSpace().getScaleTool().addEvent('onComplete', this.operationComplete.bind(this));
    
    if(json.summary)
    {
      this.title.value = json.summary;
    }
    
    this.manageElement(this.element);
    this.setFocusRegions( this.title, this.handle );
    
    this.refresh();
    this.render();
  },
  
  setStroke : function(stroke)
  {
    if(this.selectedLayer) 
    {
      this.selectedLayer.setStrokeStyle(stroke);
      this.render();
    }
  },
  
  setFill : function(fill)
  {
    if(this.selectedLayer) 
    {
      this.selectedLayer.setFillStyle(fill);
      this.render();
    }
  },
  
  setOpacity : function( opacity )
  {
    if(this.selectedLayer)
    {
      // TODO : For now there are the same but maybe allow them to be different soon. - David
      this.selectedLayer.setFillOpacity(opacity);
      this.selectedLayer.setStrokeOpacity(opacity);
      this.render();
    }
  },
  
  setLineWidth : function( lineWidth )
  {
    if(this.selectedLayer)
    {
      // TODO : For now there are the same but maybe allow them to be different soon. - David
      this.selectedLayer.setLineWidth(lineWidth);
      this.render();
    }
  },
  
  /*
    Function : loadEncodedDisplayList
      Creates all the objects in a serialized display list.
      
    Parameters:
      encodedDL - An array of serialized DrawObjects.
  */
  loadEncodedDisplayList : function( encodedDL )
  {
    encodedDL.each( this.newObject.bind(this) );
  },
  
  anchor : function()
  {
    // anchor to a div an stay in relative position to it.
    // this requires the shift to be absolute positioned in respect
    // to the anchoring div
    // you should be able to anchors different keypoints on the div
  },
  
  newObject : function( json )
  {
    var newObj = null;
    var _p = this.getParentSpace();
    
    var curSettings = $merge(
      {
        fillStyle : _p.getFillStyle(),
        strokeStyle : _p.getStrokeStyle(),
        lineWidth : _p.getLineWidth()
      }, 
      json);
    var graphicObject = false;
    
    // TODO - Design ugliness, Move Rotate and Scale should just be one default function - David
    switch( json.type )
    {
      case 'Pencil':
        newObj = new Pencil(this.canvas, curSettings);
      break;
      
      case 'Pen':
        newObj = new Pen(this.canvas, curSettings);
      break;
      
      case 'Circle':
        newObj = new Circle(this.canvas, curSettings);
      break;
      
      case 'Arrow':
        newObj = this.getParentSpace().getArrowTool();
      break;
      
      case 'Move':
        newObj = this.getParentSpace().getMoveTool();
      break;
      
      case 'Rotate':
        newObj = this.getParentSpace().getRotateTool();
      break;
      
      case 'Scale':
        newObj = this.getParentSpace().getScaleTool();
      break;
      
      default:
      
      break;
    }
    
    // add this to the display list
    if( newObj instanceof DrawObject ) 
    {
      // attach events
      newObj.addEvent('onComplete', this.operationComplete.bind(this));
      newObj.addEvent('displayNeedsUpdate', this.render.bind(this));
      
      this.displayList.push(newObj);
      
      this.updateDrawer(true);
      this.selectLayer(newObj);
    }
    else
    {
      // otherwise a CTM tool
      newObj.setObject( this.selectedLayer );
    }
    
    return newObj;
  },
  
  refresh : function()
  {
    var size = this.element.getSize().size;
    var hsize = this.handle.getSize().size;
    var bsize = this.bottom.getSize().size
    
    this.canvas.setProperty('width', size.x );
    this.canvas.setProperty('height', size.y - hsize.y - bsize.y);
    
    this.updateDrawer();
    
    // redraw after the refresh
    this.render();
  },
  
  encode : function()
  {
    var temp = {
      summary : this.title.value,
      position : this.element.getPosition(),
      displayList : this.displayList.map( function(obj) { return obj.encode() } ),
      size : this.element.getSize().size,
      version : this.getParentSpace().attributes.version
    };
    return temp;
  },
  
  attachEvents : function()
  {
    // set the mouse drag events
    this.canvas.addEvent( 'mousedown', this.handleMouseDown.bind( this ) );
    this.canvas.addEvent( 'mousemove', this.handleMouseMove.bind( this ) );
    this.canvas.addEvent( 'mouseup', this.handleMouseUp.bind( this ) );
    this.canvas.addEvent( 'click', this.handleClick.bind( this ) );
    this.canvas.addEvent( 'dblclick', this.handleDoubleClick.bind( this ) );
    
    // save the drawing
    this.saveButton.addEvent('click', this.save.bind(this));
    this.viewButton.addEvent('click', this.toggleView.bind(this));
    //this.canvas.addEvent('dblclick', this.toggleView.bind(this));
    
    // make the drawing draggable
    this.element.makeDraggable({
      handle : this.handle,
      onStart : function() 
      {
        // turn of any control handles on the current object
        if(this.currentObject) this.currentObject.cleanup();
      }.bind(this),
      onDrag : this.updateDrawer.bind(this)
    });
    
    // make the note resizeable
    this.element.makeResizable({
      handle : this.resizeControl,
      onDrag : this.refresh.bind(this)
    });
  },
  
  /*
    Function : mouseLocation
      Convenience for generating the mouse location relative to the Canvas Shift coordinate system.
      
    Parameters:
      e - A raw DOM event.
  */
  mouseLocation : function( e )
  {
    var evt = new Event( e );
    var pos = this.canvas.getPosition();
    return { x : evt.page.x - pos.x, y: evt.page.y - pos.y };
  },
  
  /*
    Function : toggleView
      Toggle the surrounding interface of the Canvas Shift.
  */
  toggleView : function()
  {
    this.hideControls = !this.hideControls;
    
    if(this.hideControls)
    {
      this.element.setStyle('visibility', 'hidden');
      this.handle.setStyle('visibility', 'hidden');
      this.bottom.setStyle('visibility', 'hidden');
      this.bottom.getChildren().setStyle('visibility', 'hidden');
      this.drawer.addClass('CSHidden');
    }
    else
    {
      this.element.setStyle('visibility', 'visible');
      this.handle.setStyle('visibility', 'visible');
      this.bottom.setStyle('visibility', 'visible');
      this.bottom.getChildren().setStyle('visibility', 'visible');
      this.drawer.removeClass('CSHidden');
    }
  },
  
  handleClick : function( e )
  {
    var curPoint = this.mouseLocation( e );
    if(this.currentObject)
    {
      this.currentObject.onClick( e );
    }
  },
  
  handleDoubleClick : function( e )
  {
    if (this.currentObject) 
    {
      this.currentObject.onDoubleClick( this.mouseLocation( e ) );
    }
  },
  
  /*
    Function : prepare
      Prepare the state of the Shift to act on a user action.
    
    Parmeters :
      A raw DOM event.
  */
  handleMouseDown : function( e )
  {
    this.startPoint = this.mouseLocation( e );
    this.drag = true;
    
    // don't create a new object if currentObject is not null
    // we are in the middle of an operation
    if(this.currentObject == null)
    {
      this.prepareToExecute = true;

      // check to see if the pen tool is selected since it has a different behavior
      if( this.getParentSpace().getTool() == 'Pen' ||
          this.getParentSpace().getTool() == 'Arrow' )
      {
        // turn this flag off
        this.prepareToExecute = false;
        // create the pen tool
        this.currentObject = this.newObject( { type : this.getParentSpace().getTool() } );
        this.currentObject.onMouseDown( this.startPoint );
      }
    }
    else
    {
      if( this.getParentSpace().getTool() == 'Pen' )
      {
        // pass the mouse down point to the pen tool
        this.currentObject.onMouseDown( this.startPoint );
      }
    }

    this.render();
  },
  
  /*
    Function : execute
      Act on the user action.
    
    Parmeters:
      e - A raw DOM event.
  */
  handleMouseMove : function( e )
  {
    var curPoint = this.mouseLocation( e );
    
    if( this.prepareToExecute )
    {
      this.prepareToExecute = false;

      // create the right object for the tool
      this.currentObject = this.newObject( { type : this.getParentSpace().getTool() } );
      
      // pass the original prepare event, and the current drag event
      this.currentObject.onMouseDown( this.startPoint );
      this.currentObject.onDrag( curPoint );
    }
    else if( this.currentObject && this.drag )
    {
      // pass the drag event
      this.currentObject.onDrag( curPoint );
    }
    
    // update the drawing area
    this.render();
  },
  
  handleMouseUp : function( e )
  {
    var curPoint = this.mouseLocation( e );

    this.drag = false;
    this.prepareToExecute = false;
    if( this.currentObject )
    {
      this.currentObject.onMouseUp( curPoint );
    }
    
    // update the drawing area
    this.render();
  },
  
  /*
    Function : operationComplete
      User operation complete, clean up.
  */
  operationComplete : function( e )
  {
    // show bounding box after operation is complete
    if(this.selectedLayer)
    {
      this.selectedLayer.showBoundingBox();
    }

    if( this.currentObject )
    {
      // finish
      if(this.currentObject.finish) this.currentObject.finish();
      // clean up the current object if possible
      if(this.currentObject.cleanup) this.currentObject.cleanup();
      this.currentObject = null;
    }
    
    this.render();
  },
  
  /*
    Function : render
      Render each object in the display list.
  */
  render : function()
  {
    var size = this.canvas.getSize().size;
    // clear the rectangle
    this.context.clearRect( 0, 0, size.x, size.y );
    this.displayList.each( function( obj ) { 
      this.context.save();
      obj.render(); 
      this.context.restore();
    }.bind( this ) );
  },
  
  /*
    Function : updateDrawer
      Updates the position and contents of the layer drawer.
    
    Parmeters :
      newObjectWasCreated - a boolean flag. If set to true the drawer will refresh it content
      to sync with the current display list.
  */
  updateDrawer : function(contentsDidChange)
  {
    if(this.displayList.length > 0)
    {
      var pos = this.element.getPosition();
      var size = this.element.getSize().size;
      
      this.drawer.setStyles({
        top: pos.y, 
        left: pos.x+size.x,
        height: size.y
      });
      this.drawer.removeClass('CSHidden');
    }
    else
    {
      this.drawer.addClass('CSHidden');
    }
    
    this.drawer.getChildren().removeClass('CSSelectedLayer');
    if(this.selectedLayer)
    {
      var idx = this.displayList.indexOf(this.selectedLayer);
      this.drawer.getChildren()[idx].addClass('CSSelectedLayer');
    }
    
    if( contentsDidChange )
    {
      this.drawer.setHTML('');
      this.displayList.each(this.createLayerForObject.bind(this));
    }
  },
  
  /*
    Function : createLayerForObject
      Creates the layer control that goes into the drawer.
      
    Parmeters :
      obj - A DrawObject.
  */
  createLayerForObject : function(obj)
  {
    var layer = new ShiftSpace.Element('div', {
      'class' : 'CSLayer'
    });
    var layerName = new ShiftSpace.Element('input', {
      'class': "CSLayerInput"
    });
    var deleteLayer = new ShiftSpace.Element('div', {
      'class': "CSLayerDelete"
    });
    deleteLayer.setText('X');
    
    layerName.injectInside(layer);
    deleteLayer.injectInside(layer);
    
    layerName.setProperty('value', obj.getName());
    
    // select the layer on click
    layer.addEvent('click', function() {
      this.selectLayer(obj, true);
    }.bind(this));
    // setup layer deletion
    deleteLayer.addEvent('click', this.deleteLayer.bind(this, obj));

    // set the name of the object
    layerName.addEvent('keyup', function(e) {
      obj.setName(layerName.value);
    }.bind(this));

    layer.injectInside(this.drawer);
  },
  
  /*
    Function : selectLayer
      Set the selected layers.
      
    Parmeters :
      layer - A DrawObject.
  */
  selectLayer : function(layer, showBox)
  {
    // hide the old selected layer
    if(this.selectedLayer)
    {
      this.selectedLayer.hideBoundingBox();
    }
    
    this.selectedLayer = layer;

    if( showBox )
    {
      this.selectedLayer.showBoundingBox();
    }

    this.updateDrawer();
    this.fireEvent('onSelectLayer', {canvas: this, layer: this.selectedLayer});
    this.render();
  },
  
  /*
    Function : deleteLayer
      Delete a layer.
    
    Parmeters :
      layer - A DrawObject.
  */
  deleteLayer : function(layer)
  {
    if(this.selectedLayer == layer )
    {
      this.selectedLayer = null;
    }
    
    // cleanup the object
    layer.cleanup();
    
    // remove the layer and update
    this.displayList.remove(layer);
    this.updateDrawer(true);
    this.render();
  },
  
  /*
    Function : clear 
      Empties out the displayList and clears the drawing.
  */
  clear : function()
  {
    this.displayList = [];
    this.render();
  },
  
  /*
    Function : build
      Builds the Canvas interface.
  */
  build : function()
  {
    this.element = new ShiftSpace.Element('div', {
      'class' : 'CSContainer'
    });
    this.element.setStyle('display', 'none');
    
    this.handle = new ShiftSpace.Element('div', {
      'class' : 'CSHandle'
    });
    this.canvas = new ShiftSpace.Element('canvas', {
      'class' : "CSCanvas"
    });
    this.bottom = new ShiftSpace.Element('div', {
      'class' : "CSBottom"
    });
    this.title = new ShiftSpace.Element('input', {
      'class' : 'CSTitle',
      'value' : 'Title',
      'type' : 'text'
    });
    this.saveButton = new ShiftSpace.Element('input', {
      'type': "button", 
      'value' : 'Save',
      'class' : 'CSSaveButton'
    });
    this.viewButton = new ShiftSpace.Element('input', {
      'type': 'button',
      'value': 'View',
      'class' : 'CSSaveButton'
    });
    this.resizeControl = new ShiftSpace.Element('div', {
      'class' : 'CSResizeControl'
    });
    this.drawer = new ShiftSpace.Element('div', {
      'class': "CSDrawer CSHidden"
    });
        
    this.context = this.canvas.getContext( '2d' );
    
    this.title.injectInside(this.bottom);
    this.saveButton.injectInside(this.bottom);
    this.viewButton.injectInside(this.bottom);
    this.resizeControl.injectInside(this.bottom);

    this.handle.injectInside(this.element);
    this.canvas.injectInside(this.element);
    this.bottom.injectInside(this.element);

    this.drawer.injectInside(document.body);
    this.element.injectInside(document.body);
  },
  
  /*
    Function : hide
      Hides the main view and the drawer.
  */
  hide : function()
  {
    this.parent();
    this.drawer.addClass('CSHidden');
  }
});

/*
  Class : DrawTool
*/
var DrawTool = new Class({

  initialize : function() {},
  setObject : function( object ) { this.object = object },

  onClick : function( p ) { this.fireEvent('onComplete'); },
  onDoubleClick : function( p ) { },
  onMouseDown : function( p ) { this.startPoint = p; },
  onDrag : function( p ) { this.dragPoint = p },
  onMouseUp : function( p ) { this.endPoint = p; },
  
  cleanup : function() {}

});
DrawTool.implement( new Events, new Options );

/*
  Class : ArrowTool
*/
var ArrowTool = DrawTool.extend({

  initialize : function() 
  { 
    this.parent() 
  },
  
  onClick : function( p ) 
  {
    this.parent();
    if(this.object) this.object.showHandles();
  },
  
  onMouseDown : function( p ) {},
  onDrag : function( p ) { this.update( p ); },
  onMouseUp : function( p ) { this.update( p ); },
  update : function( p ) {},
  
  cleanup : function()
  {
    if(this.object)
    {
      this.object.cleanup();
    }
  }

});

/*
  Class : MoveTool
*/
var MoveTool = DrawTool.extend({

  initialize : function() { this.parent() },
  
  onMouseDown : function( p )
  {
    this.parent( p );
    
    if(this.object)
    {
      this.origin = { x : this.object.ctm.translate.x, 
                      y : this.object.ctm.translate.y };
    }  
  },
  
  onDrag : function( p ) { this.update( p ); },
  onMouseUp : function( p ) { this.update( p ); },
  
  update : function( p )
  {
    if(this.object)
    {
      var dx = p.x - this.startPoint.x;
      var dy = p.y - this.startPoint.y;
    
      this.object.translate( { x: this.origin.x + dx, y: this.origin.y + dy } );
    }
  }

});

/*
  RotateTool
*/
var RotateTool = DrawTool.extend({

  initialize : function() { this.parent() },
  
  onMouseDown : function( p )
  {
    this.parent( p );
    this.originalRotation = this.object.ctm.rotate;
  },
  onDrag : function( p ) { this.update( p ); },
  onMouseUp : function( p ) { this.update( p ); },
  
  update : function( p )
  {
    var dy = p.y - this.startPoint.y;
    this.object.rotate( ((this.originalRotation + dy)/100) * (2*Math.PI) );
  }

});

/*
  ScaleTool
*/
var ScaleTool = DrawTool.extend({

  initialize : function() { this.parent() },
  
  onMouseDown : function( p )
  {
    this.parent( p );
  },
  onDrag : function( p ) { this.update( p ); },
  onMouseUp : function( p ) { this.update( p ); },
  
  update : function( p )
  {
    var dx = p.x - this.startPoint.x;
    var dy = p.y - this.startPoint.y;
    this.object.scale({x: Math.abs(dx/100), y: Math.abs(dy/100)});
  }

});

/*
  Copy Tool
*/
var CopyTool = DrawTool.extend({
  
  initialize : function() { this.parent() },
  
  onMouseDown : function( p ) { this.parent( p ); },
  onDrag : function( p ) { this.update( p ); },
  onMouseUp: function( p ) 
  { 
    // get the rectangle region to copy.  Create a new image object that shows the result
    // you can place it in an image object and just drag the image object to your desktop?!
    this.update( p ); 
  },

  update : function( p )
  {
    // nothing yet
  }
});

/*
  Class : CanvasObject
*/
var DrawObject = new Class({
  
  getDefaults : function() {
    return {
      name : 'untitled',
      strokeStyle : 'none',
      strokeOpacity : 1.0,
      fillStyle : 'none',
      fillOpacity : 1.0,
      lineWidth : 1,
      ctm : { translate : { x: 0, y: 0 },
              rotate : 0,
              scale : { x: 1.0, y: 1.0 } }
    };
  },

  initialize : function( canvas, options )
  {
    this.setOptions( this.getDefaults(), options);
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    
    this.setName( this.options.name );
    this.setCTM( this.options.ctm );
    this.setStrokeStyle( this.options.strokeStyle );
    this.setFillStyle( this.options.fillStyle );
    this.setLineWidth( this.options.lineWidth );
    this.setStrokeOpacity( this.options.strokeOpacity );
    this.setFillOpacity( this.options.fillOpacity );
    
    this.handles = [];
    this.handlesVisible = false;
  },
  
  encode : function() {
    return {
      name : this.getName(),
      strokeStyle : this.strokeStyle,
      fillStyle : this.fillStyle,
      lineWidth : this.lineWidth,
      ctm : this.ctm
    }
  },

  /*
    Setters and getters for the DrawObject name property.
  */
  setName : function(name) { this.name = name; },
  getName : function() { return this.name; },
  
  /* Current Transformation matrix */
  setCTM : function( newCTM ) { this.ctm = newCTM; },
  translate : function( translation ) { this.ctm.translate = translation; },
  rotate : function( rotation ) { this.ctm.rotate = rotation; },
  scale : function( scale ) { this.ctm.scale = scale; },
  
  /* Stroke and fill styles */
  setStrokeStyle : function(newStrokeStyle) { this.strokeStyle = newStrokeStyle; },
  setStrokeOpacity : function(newOpacity) { this.strokeOpacity = newOpacity },
  setFillStyle : function(newFillStyle) { this.fillStyle = newFillStyle },
  setFillOpacity : function(newOpacity) { this.fillOpacity = newOpacity },
  setLineWidth : function(newLineWidth) { this.lineWidth = newLineWidth; },

  onClick : function(p) { this.fireEvent('onComplete'); },
  onMouseDown : function(p) {},
  onDrag : function(p) {},
  onMouseUp : function(p) {},
  
  boundingBox : function() {},
  showBoundingBox : function() 
  {
    this.boundingBoxVisible = true;
  },
  hideBoundingBox : function()
  {
    this.boundingBoxVisible = false;
  },
  showHandles : function() 
  {
    this.handlesVisible = true;
  },
  hideHandles : function() 
  {
    this.handlesVisible = false;
  },
  
  /*
    Function : mouseLocation
      Convenience for generating the mouse location relative to the Canvas Shift coordinate system.
      
    Parameters:
      e - A raw DOM event.
  */
  mouseLocation : function( e )
  {
    var evt = new Event( e );
    var pos = this.canvas.getPosition();
    return { x : evt.page.x - pos.x, y: evt.page.y - pos.y };
  },
  
  createColorString : function(color, _opacity)
  {
    if( color == 'none' )
    {
      return 'rgba(0, 0, 0, 0)';
    }
    else
    {
      var opacity = (_opacity == null && 1.0) || _opacity;
      return ('rgba('+color.copy().extend([opacity]).join(',')+')');
    }
  },

  render : function() {
    // do the necessary transformations
    this.context.translate( this.ctm.translate.x, this.ctm.translate.y );
    this.context.rotate( this.ctm.rotate );
    this.context.scale( this.ctm.scale.x, this.ctm.scale.y );
    
    if( this.boundingBoxVisible )
    {
      var bbox = this.boundingBox();
      if(bbox)
      {
        this.context.save();
        // render the bounding box
        this.context.strokeStyle = 'rgba(0, 255, 0, 1.0)';
        this.context.lineWidth = 1;
        this.context.strokeRect(bbox.origin.x, bbox.origin.y, bbox.size.width, bbox.size.height)
        this.context.restore();
      }
    }
    
    // set up fill and stroke
    // TODO : optimize don't need to do this everytime, only when the color changes - David
    this.context.fillStyle = this.createColorString(this.fillStyle, this.fillOpacity);
    this.context.strokeStyle = this.createColorString(this.strokeStyle, this.strokeOpacity);
    this.context.lineWidth = this.lineWidth;
  },
  
  cleanup : function() {},
  finish: function() {}
});
DrawObject.implement( new Options, new Events );

var Circle = DrawObject.extend({
  intialize : function( context, options )
  {
    this.parent(context, options);
    this.origin = this.options.origin;
    this.size = this.options.size;
  },
  
  onMouseDown : function( p ) 
  {
    this.startPoint = { x: p.x, y: p.y };
    this.origin = p; 
  },
  onDrag : function( p ) { this.updateSize( p ); },
  onMouseUp : function( p ) { 
    this.updateSize( p );
  },
  
  finish : function()
  {
    // reposition the circle to allow for logical rotation and scaling
  },
  
  updateSize : function( p )
  {
    var temp = { x : p.x, y : p.y };
    
    this.size = Math.abs( this.startPoint.y - p.y );
    
    if( p.x < this.startPoint.x )
    {
      this.origin.x = this.startPoint.x - this.size;
    }
    else
    {
      this.origin.x = this.startPoint.x;
    }
    
    if( p.y < this.startPoint.y )
    { 
      this.origin.y = this.startPoint.y - this.size;
    }
    else
    {
      this.origin.y = this.startPoint.y;
    }
  },
  
  render : function()
  {
    this.parent();
    
    if( this.size )
    {
      this.context.beginPath();
      var r = Math.round(this.size/2);
      this.context.arc(this.origin.x+r, 
                       this.origin.y+r, 
                       r,
                       0,
                       Math.PI*2,
                       true);

      // fill
      this.context.stroke();
      this.context.fill();
    }
  }

});

/*
  Class : Pencil
*/
var Pencil = DrawObject.extend({
  
  getDefaults : function()
  {
    return $merge( this.parent(), {
      strokeStyle : [255, 0, 0],
      lineWidth : 2
    } );
  },
  
  initialize : function( context, options )
  {
    this.parent(context, options);
    this.points = this.options.points || [];
  },
  
  onMouseDown : function( p ) { this.points.push( p ); },
  onDrag : function( p ) { this.points.push( p ); },
  
  onMouseUp : function( p ) { 
    this.points.push( p ); 
    var bbox = this.boundingBox();
    
    var newOrigin = { x : Math.round(bbox.origin.x + bbox.size.width/2),
                      y : Math.round(bbox.origin.y + bbox.size.height/2) };

    this.points = this.points.map( function( op ) {
      return { x : op.x - newOrigin.x, y : op.y - newOrigin.y };
    } );
    
    this.translate( newOrigin );
  },

  encode : function()
  {
    return $merge( this.parent(), {
      type : 'Pencil',
      points : this.points
    } );
  },
  
  boundingBox : function()
  {
    var left = this.points[0].x;
    var right = this.points[0].x;
    var top = this.points[0].y;
    var bottom = this.points[0].y;

    this.points.each( function(p) { 
      if (p.x < left) left = p.x; 
      if (p.x > right ) right = p.x;
      if (p.y < top ) top = p.y;
      if (p.y > bottom ) bottom = p.y;
    } );
    
    var temp =  {
      origin : { x : left, y : top },
      size : { width : right-left, height : bottom - top }
    };
    
    return temp;
  },
  
  render : function()
  {
    this.parent();
    
    if( this.points.length > 0 )
    {
      // begin a path
      this.context.beginPath();
      // move to the first point
      this.context.moveTo( this.points[0].x, this.points[0].y );

      // draw a path from each point of the stroke
      this.points.each( function( aPoint ) {
        this.context.lineTo( aPoint.x, aPoint.y );
      }.bind( this ) );
    
      // render the line
      this.context.stroke();
    }
  }
});

/*
  Class : Pen
*/
var Pen = DrawObject.extend({
  initialize : function(canvas, options)
  {
    this.parent(canvas, options);
    
    this.bezierPoints = this.options.bezierPoints || [];
    
    this.build();
  },
  
  /*
    Function : build
      Create the two control point divs that are use to modify
      the two control points of a bezier curve point.
  */
  build : function()
  {
    this.cpOne = new ShiftSpace.Element('div', {
      'class': "CSEditControlPoint CSHidden"
    });
    this.cpTwo = new ShiftSpace.Element('div', {
      'class': "CSEditControlPoint CSHidden"
    });
    
    // Nutty use of closures here
    var selectedPoint;
    var originalPoint;
    this.setSelectedPoint = function(np)
    {
      selectedPoint = np;
      if( np )
      {
        this.updateEditControlPoints();
      }
      else
      {
        this.hideEditControlPoints();
      }
    }.bind( this );
    this.getSelectedPoint = function()
    {
      return selectedPoint;
    }.bind( this );
    
    var sp;
    this.cpOne.makeDraggable({
      onStart : function()
      {
        originalPoint = {x: selectedPoint.controlPoint1.x, y: selectedPoint.controlPoint1.y };
        sp = this.cpOne.getPosition();
      }.bind(this),
      onDrag : function( e )
      {
        // get the offset location
        var loc = this.cpOne.getPosition();
        var v = { x : loc.x - sp.x, y : loc.y - sp.y };
        
        selectedPoint.controlPoint1.x = originalPoint.x + v.x;
        selectedPoint.controlPoint1.y = originalPoint.y + v.y;
        this.fireEvent('displayNeedsUpdate');
      }.bind(this)
    });
    
    this.cpTwo.makeDraggable({
      onStart : function()
      {
        originalPoint = {x: selectedPoint.controlPoint2.x, y: selectedPoint.controlPoint2.y };
        sp = this.cpTwo.getPosition();
      }.bind(this),
      onDrag : function( e )
      {
        // get the offset location
        var loc = this.cpTwo.getPosition();
        var v = { x : loc.x - sp.x, y : loc.y - sp.y };
        
        selectedPoint.controlPoint2.x = originalPoint.x + v.x;
        selectedPoint.controlPoint2.y = originalPoint.y + v.y;
        this.fireEvent('displayNeedsUpdate');
      }.bind(this)
    });
    
    this.cpOne.injectInside(document.body);
    this.cpTwo.injectInside(document.body);
  },
  
  /*
    Function : updateEditControlPoints
      Update the two bezier control point tools.
  */
  updateEditControlPoints : function()
  {
    var selectedPoint = this.getSelectedPoint();
    var pos = this.canvas.getPosition();
    var t = this.ctm.translate;
    
    if(selectedPoint)
    {
      this.cpOne.setStyles({
        left: selectedPoint.controlPoint1.x + t.x + pos.x-1, 
        top: selectedPoint.controlPoint1.y + t.y + pos.y-2
      });
      this.cpTwo.setStyles({
        left: selectedPoint.controlPoint2.x + t.x + pos.x-1, 
        top: selectedPoint.controlPoint2.y + t.y + pos.y-2
      });
    }
  },
  
  /*
    Function : showEditControlPoints
      Show the bezier control point edit divs.
  */
  showEditControlPoints : function()
  {
    this.cpOne.removeClass('CSHidden');
    this.cpTwo.removeClass('CSHidden');
  },
  
  /*
    Function : hideEditControlPoints
      Hide the bezier control point edit divs.
  */
  hideEditControlPoints : function()
  {
    this.cpOne.addClass('CSHidden');
    this.cpTwo.addClass('CSHidden');
  },
  
  encode : function()
  {
    return $merge( this.parent(), {
      type : 'Pen',
      bezierPoints : this.bezierPoints
    } );
  },
  
  onClick : function(p)
  {
  },
  
  onDoubleClick : function(p)
  {
    this.fireEvent('onComplete', this);
  },
  
  onMouseDown : function(p)
  {
    this.bezierPoints.push({ point : { x: p.x, y: p.y }, 
                             controlPoint1 : { x: p.x, y: p.y },
                             controlPoint2 : { x: p.x, y: p.y } } )
  },
  
  onDrag : function(p)
  {
    var lastPoint = this.bezierPoints.getLast();

    var v = { x : -(p.x - lastPoint.point.x), 
              y : -(p.y - lastPoint.point.y) };

    lastPoint.controlPoint1.x = lastPoint.point.x + v.x;
    lastPoint.controlPoint1.y = lastPoint.point.y + v.y;
    lastPoint.controlPoint2.x = lastPoint.point.x - v.x;
    lastPoint.controlPoint2.y = lastPoint.point.y - v.y;
  },
  
  onMouseUp : function(p)
  {
  },
  
  /*
    Function : showHandles
      Show the control handles for each point on the line.
    
    Parameters :
      p - A bezier control point javascript object.
  */
  showHandles : function(p)
  {
    if(this.handlesVisible) return;

    this.handlesVisible = true;
    this.bezierPoints.each(this.createControlPoint.bind(this));
  },
  
  /*
    Function : createControlPoint
      Create a single point handle.
    
    Parameters :
      aPoint - A single bezier point javascript object.
      
    See Also :
      showHandles
  */
  createControlPoint : function(aPoint)
  {
    // store the original point information
    var op = { x: aPoint.point.x, y: aPoint.point.y };
    var ocp1 = { x: aPoint.controlPoint1.x, y: aPoint.controlPoint1.y };
    var ocp2 = { x: aPoint.controlPoint2.x, y: aPoint.controlPoint2.y };
    
    // create a DOM node, attach an event
    var controlPoint = new ShiftSpace.Element('div', {
      'class': "CSPenControlPoint"
    });
    
    var pos = this.canvas.getPosition();
    controlPoint.setStyles({
      left : pos.x + this.ctm.translate.x + op.x-1,
      top : pos.y + this.ctm.translate.y + op.y-2
    });
    
    var sp;
    
    // set up a click event
    controlPoint.addEvent('click', function() {
      // show the control point editors
      this.setSelectedPoint( aPoint );
      this.showEditControlPoints();
      this.fireEvent('displayNeedsUpdate');
    }.bind(this));

    controlPoint.makeDraggable({

      onStart : function( e )
      {
        // store the original point information
        op = { x: aPoint.point.x, y: aPoint.point.y };
        ocp1 = { x: aPoint.controlPoint1.x, y: aPoint.controlPoint1.y };
        ocp2 = { x: aPoint.controlPoint2.x, y: aPoint.controlPoint2.y };
        
        sp = controlPoint.getPosition();
      }.bind( this ),

      onDrag : function( e )
      {
        // get the offset location
        var loc = controlPoint.getPosition();
        var v = { x : loc.x - sp.x, y : loc.y - sp.y };
        
        // TODO - simplify with getters and setters
        aPoint.point.x = op.x + v.x;
        aPoint.point.y = op.y + v.y;
        aPoint.controlPoint1.x = ocp1.x + v.x;
        aPoint.controlPoint1.y = ocp1.y + v.y;
        aPoint.controlPoint2.x = ocp2.x + v.x;
        aPoint.controlPoint2.y = ocp2.y + v.y;
        
        this.fireEvent('displayNeedsUpdate');
      }.bind( this ),
      
      onComplete : function( e )
      {
        // get the offset location
        var loc = controlPoint.getPosition();
        var v = { x : loc.x - sp.x, y : loc.y - sp.y };
        
        // TODO - simplify with  getters and setters
        aPoint.point.x = op.x + v.x;
        aPoint.point.y = op.y + v.y;
        aPoint.controlPoint1.x = ocp1.x + v.x;
        aPoint.controlPoint1.y = ocp1.y + v.y;
        aPoint.controlPoint2.x = ocp2.x + v.x;
        aPoint.controlPoint2.y = ocp2.y + v.y;
        
        // save new information
        op = { x: aPoint.point.x, y: aPoint.point.y };
        ocp1 = { x: aPoint.controlPoint1.x, y: aPoint.controlPoint1.y };
        ocp2 = { x: aPoint.controlPoint2.x, y: aPoint.controlPoint2.y };
        
        this.fireEvent('displayNeedsUpdate');
      }.bind( this )
    });
    
    // add to the page
    controlPoint.injectInside(document.body);
    
    this.handles.push(controlPoint);
  },
  
  /*
    Function : hideHandles
      Hide the handles used to manipulate this object.
  */
  hideHandles : function()
  {
    if(!this.handlesVisible) return;
    this.handlesVisible = false;
    
    // remove each handle from the DOM
    this.handles.each(function(aHandle) {
      aHandle.remove();
    });
  },
  
  /*
    Function : boundingBox
      Return the bounding box of the bezier curve.
  */
  boundingBox : function()
  {
    var left = this.bezierPoints[0].point.x;
    var right = this.bezierPoints[0].point.x;
    var top = this.bezierPoints[0].point.y;
    var bottom = this.bezierPoints[0].point.y;

    this.bezierPoints.each( function(abp) { 
      var p = abp.point;
      var cp1 = abp.controlPoint1;
      var cp2 = abp.controlPoint2;
      
      var minx = Math.min(p.x, cp1.x, cp2.x);
      if (minx < left) left = minx; 

      var maxx = Math.max(p.x, cp1.x, cp2.x);
      if (maxx > right ) right = maxx;

      var miny = Math.min(p.y, cp1.y, cp2.y);
      if (miny < top ) top = miny;
      
      var maxy = Math.max(p.y, cp1.y, cp2.y) ;
      if (maxy > bottom ) bottom = maxy;
    } );
    
    return {
      origin : { x : left, y : top },
      size : { width : right-left, height : bottom - top }
    };
  },
  
  /*
    Function: renderArrow
      Render the arrow for the pen tool line.
  */
  renderArrow : function()
  {
    // render the arrow for Mushon ;) 
    // calculate the vector from the last point and its control point
    var lastPoint = this.bezierPoints.getLast();
    var dx = lastPoint.point.x - lastPoint.controlPoint1.x;
    var dy = lastPoint.point.y - lastPoint.controlPoint1.y;
    var dist = Math.sqrt( (dx*dx) - (dy*dy) );
    
    // normalized vector
    var v = { x : dx/dist, y : dy/dist };
    
    // draw the triangle, its dimensions are a ratio of the line width
    this.context.beginPath();

    // fill and stroke
    this.fill();
    this.stroke();
  },
  
  render : function()
  {
    this.parent();
    
    if( this.bezierPoints.length > 0 )
    {
      var fp = this.bezierPoints[0];

      // move to the first point
      this.context.beginPath();
      this.context.moveTo(fp.point.x, fp.point.y);
    
      // render each point
      var lastPoint = fp;
      var len = this.bezierPoints.length;
      for( var i = 1; i < len; i++ )
      {
        var aBezierPoint = this.bezierPoints[i];
          
        this.context.bezierCurveTo(lastPoint.controlPoint2.x, 
                                   lastPoint.controlPoint2.y,
                                   aBezierPoint.controlPoint1.x,
                                   aBezierPoint.controlPoint1.y,
                                   aBezierPoint.point.x,
                                   aBezierPoint.point.y);
      
        lastPoint = aBezierPoint;
      }
      this.context.stroke();
      this.context.fill();
    
      // show the bezier point control point editors if there is a selected point
      var selectedPoint = this.getSelectedPoint();
      if( selectedPoint )
      {
        this.updateEditControlPoints(); 
        var p = selectedPoint;
      
        // get the current selected control points
        this.context.strokeStyle = 'rgba(150, 150, 255, 1.0)';
        this.context.lineWidth = 1;
      
        // draw a blue line to them
        this.context.beginPath();
        this.context.moveTo(p.point.x, p.point.y);
        this.context.lineTo(p.controlPoint1.x, p.controlPoint1.y);
        this.context.stroke();

        this.context.beginPath();
        this.context.moveTo(p.point.x, p.point.y);
        this.context.lineTo(p.controlPoint2.x, p.controlPoint2.y);
        this.context.stroke();
      }
    }
    
  },
  
  /*
    Function : cleanup
      A general function that the object should return to it's normal state.
  */
  cleanup : function()
  {
    this.hideHandles();
    // hide the selected point and its control points
    this.setSelectedPoint(null);
    this.fireEvent('displayNeedsUpdate');
  },
  
  /*
    Function : finish
      This function is called when a tool has finished operating on this object.
  */
  finish : function()
  {
    var bbox = this.boundingBox();
    
    var newOrigin = { x : Math.round(bbox.origin.x + bbox.size.width/2),
                      y : Math.round(bbox.origin.y + bbox.size.height/2) };

    this.bezierPoints = this.bezierPoints.map( function( op ) {
      var p = op.point,
          cp1 = op.controlPoint1,
          cp2 = op.controlPoint2;

      return {
        point : { x: p.x - newOrigin.x, y: p.y - newOrigin.y },
        controlPoint1 : { x: cp1.x - newOrigin.x, y: cp1.y - newOrigin.y },
        controlPoint2 : { x: cp2.x - newOrigin.x, y: cp2.y - newOrigin.y }
      };
    });
    
    this.translate( newOrigin );
  }
});

/***
 * MooRainbow
 *
 * @version		1.11
 * @license		MIT-style license
 * @author		w00fz - < w00fzIT [at] gmail.com >
 * @infos		http://moorainbow.woolly-sheep.net
 * @copyright	Author
 * 
 *
 */
 
var MooRainbow = new Class({
	options: {
		id: 'mooRainbow',
		prefix: 'moor-',
		imgPath: 'images/',
		startColor: [255, 0, 0],
		wheel: false,
		onComplete: Class.empty,
		onChange: Class.empty
	},
	
	initialize: function(el, options) {
		this.element = $(el); if (!this.element) return;
		this.setOptions(options);
		
		this.sliderPos = 0;
		this.pickerPos = {x: 0, y: 0};
		this.backupColor = this.options.startColor;
		this.currentColor = this.options.startColor;
		this.sets = {
			rgb: [],
			hsb: [],
			hex: []	
		};
		this.pickerClick = this.sliderClick  = false;
		if (!this.layout) this.doLayout();
		this.OverlayEvents();
		this.sliderEvents();
		this.backupEvent();
		if (this.options.wheel) this.wheelEvents();
    this.targetElement(this.element);
				
		this.layout.overlay.setStyle('background-color', this.options.startColor.rgbToHex());
		this.layout.backup.setStyle('background-color', this.backupColor.rgbToHex());

		this.pickerPos.x = this.snippet('curPos').l + this.snippet('curSize', 'int').w;
		this.pickerPos.y = this.snippet('curPos').t + this.snippet('curSize', 'int').h;
		
		this.manualSet(this.options.startColor);
		
		this.pickerPos.x = this.snippet('curPos').l + this.snippet('curSize', 'int').w;
		this.pickerPos.y = this.snippet('curPos').t + this.snippet('curSize', 'int').h;
		this.sliderPos = this.snippet('arrPos') - this.snippet('arrSize', 'int');

		if (window.khtml) this.hide();
	},
	
	targetElement : function( el )
	{
	  if( el instanceof Array )
	  {
	    
	  }
	  else
	  {
	    // set up the new element
  	  this.element = el;
	    this.element.addEvent('click', function(e) { this.toggle(e); }.bind(this));	    
	  }
	},
	
	toggle: function() {
		this[this.visible ? 'hide' : 'show']()
	},
	
	show: function() {
		this.rePosition();
		this.layout.setStyle('display', 'block');
		this.visible = true;
	},
	
	hide: function() {
		this.layout.setStyles({'display': 'none'});
		this.visible = false;
	},
	
	manualSet: function(color, type) {
		if (!type || (type != 'hsb' && type != 'hex')) type = 'rgb';
		var rgb, hsb, hex;
		if (type == 'rgb') { rgb = color; hsb = color.rgbToHsb(); hex = color.rgbToHex(); } 
		else if (type == 'hsb') { hsb = color; rgb = color.hsbToRgb(); hex = rgb.rgbToHex(); }
		else { hex = color; rgb = color.hexToRgb(true); hsb = rgb.rgbToHsb(); }
		
		this.setMooRainbow(rgb);
		this.autoSet(hsb);
	},
	
	autoSet: function(hsb) {
		var curH = this.snippet('curSize', 'int').h;
		var curW = this.snippet('curSize', 'int').w;
		var oveH = this.layout.overlay.height;
		var oveW = this.layout.overlay.width;
		var sliH = this.layout.slider.height;
		var arwH = this.snippet('arrSize', 'int');
		var hue;
		
		var posx = Math.round(((oveW * hsb[1]) / 100) - curW);
		var posy = Math.round(- ((oveH * hsb[2]) / 100) + oveH - curH);

		var c = Math.round(((sliH * hsb[0]) / 360)); c = (c == 360) ? 0 : c;
		var position = sliH - c + this.snippet('slider') - arwH;
		hue = [this.sets.hsb[0], 100, 100].hsbToRgb().rgbToHex();
		
		this.layout.cursor.setStyles({'top': posy, 'left': posx});
		this.layout.arrows.setStyle('top', position);
		this.layout.overlay.setStyle('background-color', hue);
		this.sliderPos = this.snippet('arrPos') - arwH;
		this.pickerPos.x = this.snippet('curPos').l + curW;
		this.pickerPos.y = this.snippet('curPos').t + curH;
	},
	
	setMooRainbow: function(color, type) {
		if (!type || (type != 'hsb' && type != 'hex')) type = 'rgb';
		var rgb, hsb, hex;

		if (type == 'rgb') { rgb = color; hsb = color.rgbToHsb(); hex = color.rgbToHex(); } 
		else if (type == 'hsb') { hsb = color; rgb = color.hsbToRgb(); hex = rgb.rgbToHex(); }
		else { hex = color; rgb = color.hexToRgb(); hsb = rgb.rgbToHsb(); }

		this.sets = {
			rgb: rgb,
			hsb: hsb,
			hex: hex
		};

		if (!$chk(this.pickerPos.x))
			this.autoSet(hsb);		

		this.RedInput.value = rgb[0];
		this.GreenInput.value = rgb[1];
		this.BlueInput.value = rgb[2];
		this.HueInput.value = hsb[0];
		this.SatuInput.value =  hsb[1];
		this.BrighInput.value = hsb[2];
		this.hexInput.value = hex;
		
		this.currentColor = rgb;

		this.chooseColor.setStyle('background-color', rgb.rgbToHex());
	},
	
	parseColors: function(x, y, z) {
		var s = Math.round((x * 100) / this.layout.overlay.width);
		var b = 100 - Math.round((y * 100) / this.layout.overlay.height);
		var h = 360 - Math.round((z * 360) / this.layout.slider.height) + this.snippet('slider') - this.snippet('arrSize', 'int');
		h -= this.snippet('arrSize', 'int');
		h = (h >= 360) ? 0 : (h < 0) ? 0 : h;
		s = (s > 100) ? 100 : (s < 0) ? 0 : s;
		b = (b > 100) ? 100 : (b < 0) ? 0 : b;

		return [h, s, b];
	},
	
	OverlayEvents: function() {
		var lim, curH, curW, inputs;
		curH = this.snippet('curSize', 'int').h;
		curW = this.snippet('curSize', 'int').w;
		inputs = this.arrRGB.copy().concat(this.arrHSB, this.hexInput);

		document.addEvent('click', function() { 
			if(this.visible) this.hide(this.layout); 
		}.bind(this));

		inputs.each(function(el) {
			el.addEvent('keydown', this.eventKeydown.bindWithEvent(this, el));
			el.addEvent('keyup', this.eventKeyup.bindWithEvent(this, el));
		}, this);
		[this.element, this.layout].each(function(el) {
			el.addEvents({
				'click': function(e) { new Event(e).stop(); },
				'keyup': function(e) {
					e = new Event(e);
					if(e.key == 'esc' && this.visible) this.hide(this.layout);
				}.bind(this)
			}, this);
		}, this);
		
		lim = {
			x: [0 - curW, (this.layout.overlay.width - curW)],
			y: [0 - curH, (this.layout.overlay.height - curH)]
		};

		this.layout.drag = new Drag.Base(this.layout.cursor, {
			limit: lim,
			onStart: this.overlayDrag.bind(this),
			onDrag: this.overlayDrag.bind(this),
			snap: 0
		});	
		
		this.layout.overlay2.addEvent('mousedown', function(e){
			e = new Event(e);
			this.layout.cursor.setStyles({
				'top': e.page.y - this.layout.overlay.getTop() - curH,
				'left': e.page.x - this.layout.overlay.getLeft() - curW
			});
			this.layout.drag.start(e);
		}.bind(this));
		
		this.okButton.addEvent('click', function() {
			if(this.currentColor == this.options.startColor) {
				this.hide();
				this.fireEvent('onComplete', [this.sets, this]);
			}
			else {
				this.backupColor = this.currentColor;
				this.layout.backup.setStyle('background-color', this.backupColor.rgbToHex());
				this.hide();
				this.fireEvent('onComplete', [this.sets, this]);
			}
		}.bind(this));
	},
	
	overlayDrag: function() {
		var curH = this.snippet('curSize', 'int').h;
		var curW = this.snippet('curSize', 'int').w;
		this.pickerPos.x = this.snippet('curPos').l + curW;
		this.pickerPos.y = this.snippet('curPos').t + curH;
		
		this.setMooRainbow(this.parseColors(this.pickerPos.x, this.pickerPos.y, this.sliderPos), 'hsb');
		this.fireEvent('onChange', [this.sets, this]);
	},
	
	sliderEvents: function() {
		var arwH = this.snippet('arrSize', 'int'), lim;

		lim = [0 + this.snippet('slider') - arwH, this.layout.slider.height - arwH + this.snippet('slider')];
		this.layout.sliderDrag = new Drag.Base(this.layout.arrows, {
			limit: {y: lim},
			modifiers: {x: false},
			onStart: this.sliderDrag.bind(this),
			onDrag: this.sliderDrag.bind(this),
			snap: 0
		});	
	
		this.layout.slider.addEvent('mousedown', function(e){
			e = new Event(e);

			this.layout.arrows.setStyle(
				'top', e.page.y - this.layout.slider.getTop() + this.snippet('slider') - arwH
			);
			this.layout.sliderDrag.start(e);
		}.bind(this));
	},

	sliderDrag: function() {
		var arwH = this.snippet('arrSize', 'int'), hue;
		
		this.sliderPos = this.snippet('arrPos') - arwH;
		this.setMooRainbow(this.parseColors(this.pickerPos.x, this.pickerPos.y, this.sliderPos), 'hsb');
		hue = [this.sets.hsb[0], 100, 100].hsbToRgb().rgbToHex();
		this.layout.overlay.setStyle('background-color', hue);
		this.fireEvent('onChange', [this.sets, this]);
	},
	
	backupEvent: function() {
		this.layout.backup.addEvent('click', function() {
			this.manualSet(this.backupColor);
			this.fireEvent('onChange', [this.sets, this]);
		}.bind(this));
	},
	
	wheelEvents: function() {
		var arrColors = this.arrRGB.copy().extend(this.arrHSB);

		arrColors.each(function(el) {
			el.addEvents({
				'mousewheel': this.eventKeys.bindWithEvent(this, el),
				'keydown': this.eventKeys.bindWithEvent(this, el)
			});
		}, this);
		
		[this.layout.arrows, this.layout.slider].each(function(el) {
			el.addEvents({
				'mousewheel': this.eventKeys.bindWithEvent(this, [this.arrHSB[0], 'slider']),
				'keydown': this.eventKeys.bindWithEvent(this, [this.arrHSB[0], 'slider'])
			});
		}, this);
	},
	
	eventKeys: function(e, el, id) {
		var wheel, type;		
		id = (!id) ? el.id : this.arrHSB[0];

		if (e.type == 'keydown') {
			if (e.key == 'up') wheel = 1;
			else if (e.key == 'down') wheel = -1;
			else return;
		} else if (e.type == Element.Events.mousewheel.type) wheel = (e.wheel > 0) ? 1 : -1;

		if (this.arrRGB.test(el)) type = 'rgb';
		else if (this.arrHSB.test(el)) type = 'hsb';
		else type = 'hsb';

		if (type == 'rgb') {
			var rgb = this.sets.rgb, hsb = this.sets.hsb, prefix = this.options.prefix, pass;
			var value = el.value.toInt() + wheel;
			value = (value > 255) ? 255 : (value < 0) ? 0 : value;

			switch(el.className) {
				case prefix + 'rInput': pass = [value, rgb[1], rgb[2]];	break;
				case prefix + 'gInput': pass = [rgb[0], value, rgb[2]];	break;
				case prefix + 'bInput':	pass = [rgb[0], rgb[1], value];	break;
				default : pass = rgb;
			}
			this.manualSet(pass);
			this.fireEvent('onChange', [this.sets, this]);
		} else {
			var rgb = this.sets.rgb, hsb = this.sets.hsb, prefix = this.options.prefix, pass;
			var value = el.value.toInt() + wheel;

			if (el.className.test(/(HueInput)/)) value = (value > 359) ? 0 : (value < 0) ? 0 : value;
			else value = (value > 100) ? 100 : (value < 0) ? 0 : value;

			switch(el.className) {
				case prefix + 'HueInput': pass = [value, hsb[1], hsb[2]]; break;
				case prefix + 'SatuInput': pass = [hsb[0], value, hsb[2]]; break;
				case prefix + 'BrighInput':	pass = [hsb[0], hsb[1], value]; break;
				default : pass = hsb;
			}
			this.manualSet(pass, 'hsb');
			this.fireEvent('onChange', [this.sets, this]);
		}
		e.stop();
	},
	
	eventKeydown: function(e, el) {
		var n = e.code, k = e.key;

		if 	((!el.className.test(/hexInput/) && !(n >= 48 && n <= 57)) &&
			(k!='backspace' && k!='tab' && k !='delete' && k!='left' && k!='right'))
		e.stop();
	},
	
	eventKeyup: function(e, el) {
		var n = e.code, k = e.key, pass, prefix, chr = el.value.charAt(0);

		if (!$chk(el.value)) return;
		if (el.className.test(/hexInput/)) {
			if (chr != "#" && el.value.length != 6) return;
			if (chr == '#' && el.value.length != 7) return;
		} else {
			if (!(n >= 48 && n <= 57) && (!['backspace', 'tab', 'delete', 'left', 'right'].test(k)) && el.value.length > 3) return;
		}
		
		prefix = this.options.prefix;

		if (el.className.test(/(rInput|gInput|bInput)/)) {
			if (el.value  < 0 || el.value > 255) return;
			switch(el.className){
				case prefix + 'rInput': pass = [el.value, this.sets.rgb[1], this.sets.rgb[2]]; break;
				case prefix + 'gInput': pass = [this.sets.rgb[0], el.value, this.sets.rgb[2]]; break;
				case prefix + 'bInput': pass = [this.sets.rgb[0], this.sets.rgb[1], el.value]; break;
				default : pass = this.sets.rgb;
			}
			this.manualSet(pass);
			this.fireEvent('onChange', [this.sets, this]);
		}
		else if (!el.className.test(/hexInput/)) {
			if (el.className.test(/HueInput/) && el.value  < 0 || el.value > 360) return;
			else if (el.className.test(/HueInput/) && el.value == 360) el.value = 0;
			else if (el.className.test(/(SatuInput|BrighInput)/) && el.value  < 0 || el.value > 100) return;
			switch(el.className){
				case prefix + 'HueInput': pass = [el.value, this.sets.hsb[1], this.sets.hsb[2]]; break;
				case prefix + 'SatuInput': pass = [this.sets.hsb[0], el.value, this.sets.hsb[2]]; break;
				case prefix + 'BrighInput': pass = [this.sets.hsb[0], this.sets.hsb[1], el.value]; break;
				default : pass = this.sets.hsb;
			}
			this.manualSet(pass, 'hsb');
			this.fireEvent('onChange', [this.sets, this]);
		} else {
			pass = el.value.hexToRgb(true);
			if (isNaN(pass[0])||isNaN(pass[1])||isNaN(pass[2])) return;

			if ($chk(pass)) {
				this.manualSet(pass);
				this.fireEvent('onChange', [this.sets, this]);
			}
		}
			
	},
			
	doLayout: function() {
		var id = this.options.id, prefix = this.options.prefix;
		var idPrefix = id + ' .' + prefix;

		this.layout = new Element('div', {
			'styles': {'display': 'block', 'position': 'absolute'},
			'id': id
		}).inject(document.body);

		var box = new Element('div', {
			'styles':  {'position': 'relative'},
			'class': prefix + 'box'
		}).inject(this.layout);
			
		var div = new Element('div', {
			'styles': {'position': 'absolute', 'overflow': 'hidden'},
			'class': prefix + 'overlayBox'
		}).inject(box);
		
		var ar = new Element('div', {
			'styles': {'position': 'absolute', 'zIndex': 1},
			'class': prefix + 'arrows'
		}).inject(box);
		ar.width = ar.getStyle('width').toInt();
		ar.height = ar.getStyle('height').toInt();
		
		var ov = new Element('img', {
			'styles': {'background-color': '#fff', 'position': 'relative', 'zIndex': 2},
			'src': this.options.imgPath + 'moor_woverlay.png',
			'class': prefix + 'overlay'
		}).inject(div);
		
		var ov2 = new Element('img', {
			'styles': {'position': 'absolute', 'top': 0, 'left': 0, 'zIndex': 2},
			'src': this.options.imgPath + 'moor_boverlay.png',
			'class': prefix + 'overlay'
		}).inject(div);
		
		if (window.ie6) {
			div.setStyle('overflow', '');
			var src = ov.src;
			ov.src = this.options.imgPath + 'blank.gif';
			ov.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "', sizingMethod='scale')";
			src = ov2.src;
			ov2.src = this.options.imgPath + 'blank.gif';
			ov2.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "', sizingMethod='scale')";
		}
		ov.width = ov2.width = div.getStyle('width').toInt();
		ov.height = ov2.height = div.getStyle('height').toInt();

		var cr = new Element('div', {
			'styles': {'overflow': 'hidden', 'position': 'absolute', 'zIndex': 2},
			'class': prefix + 'cursor'	
		}).inject(div);
		cr.width = cr.getStyle('width').toInt();
		cr.height = cr.getStyle('height').toInt();
		
		var sl = new Element('img', {
			'styles': {'position': 'absolute', 'z-index': 2},
			'src': this.options.imgPath + 'moor_slider.png',
			'class': prefix + 'slider'
		}).inject(box);
		this.layout.slider = $E('#' + idPrefix + 'slider');
		sl.width = sl.getStyle('width').toInt();
		sl.height = sl.getStyle('height').toInt();

		new Element('div', {
			'styles': {'position': 'absolute'},
			'class': prefix + 'colorBox'
		}).inject(box);

		new Element('div', {
			'styles': {'zIndex': 2, 'position': 'absolute'},
			'class': prefix + 'chooseColor'
		}).inject(box);
			
		this.layout.backup = new Element('div', {
			'styles': {'zIndex': 2, 'position': 'absolute', 'cursor': 'pointer'},
			'class': prefix + 'currentColor'
		}).inject(box);
		
		var R = new Element('label').inject(box).setStyle('position', 'absolute');
		var G = R.clone().inject(box).addClass(prefix + 'gLabel').appendText('G: ');
		var B = R.clone().inject(box).addClass(prefix + 'bLabel').appendText('B: ');
		R.appendText('R: ').addClass(prefix + 'rLabel');
		
		var inputR = new Element('input');
		var inputG = inputR.clone().inject(G).addClass(prefix + 'gInput');
		var inputB = inputR.clone().inject(B).addClass(prefix + 'bInput');
		inputR.inject(R).addClass(prefix + 'rInput');
		
		var HU = new Element('label').inject(box).setStyle('position', 'absolute');
		var SA = HU.clone().inject(box).addClass(prefix + 'SatuLabel').appendText('S: ');
		var BR = HU.clone().inject(box).addClass(prefix + 'BrighLabel').appendText('B: ');
		HU.appendText('H: ').addClass(prefix + 'HueLabel');

		var inputHU = new Element('input');
		var inputSA = inputHU.clone().inject(SA).addClass(prefix + 'SatuInput');
		var inputBR = inputHU.clone().inject(BR).addClass(prefix + 'BrighInput');
		inputHU.inject(HU).addClass(prefix + 'HueInput');
		SA.appendText(' %'); BR.appendText(' %');
		new Element('span', {'styles': {'position': 'absolute'}, 'class': prefix + 'ballino'}).setHTML(" &deg;").injectAfter(HU);

		var hex = new Element('label').inject(box).setStyle('position', 'absolute').addClass(prefix + 'hexLabel').appendText('#hex: ').adopt(new Element('input').addClass(prefix + 'hexInput'));
		
		var ok = new Element('input', {
			'styles': {'position': 'absolute'},
			'type': 'button',
			'value': 'Select',
			'class': prefix + 'okButton'
		}).inject(box);
		
		this.rePosition();

		var overlays = $$('#' + idPrefix + 'overlay');
		this.layout.overlay = overlays[0];
		this.layout.overlay2 = overlays[1];
		this.layout.cursor = $E('#' + idPrefix + 'cursor');
		this.layout.arrows = $E('#' + idPrefix + 'arrows');
		this.chooseColor = $E('#' + idPrefix + 'chooseColor');
		this.layout.backup = $E('#' + idPrefix + 'currentColor');
		this.RedInput = $E('#' + idPrefix + 'rInput');
		this.GreenInput = $E('#' + idPrefix + 'gInput');
		this.BlueInput = $E('#' + idPrefix + 'bInput');
		this.HueInput = $E('#' + idPrefix + 'HueInput');
		this.SatuInput = $E('#' + idPrefix + 'SatuInput');
		this.BrighInput = $E('#' + idPrefix + 'BrighInput');
		this.hexInput = $E('#' + idPrefix + 'hexInput');

		this.arrRGB = [this.RedInput, this.GreenInput, this.BlueInput];
		this.arrHSB = [this.HueInput, this.SatuInput, this.BrighInput];
		this.okButton = $E('#' + idPrefix + 'okButton');
		
		if (!window.khtml) this.hide();
	},
	rePosition: function() {
		var coords = this.element.getCoordinates();
		this.layout.setStyles({
			'left': coords.left,
			'top': coords.top + coords.height + 1
		});
	},
	
	snippet: function(mode, type) {
		var size; type = (type) ? type : 'none';
		switch(mode) {
			case 'arrPos':
				var t = this.layout.arrows.getStyle('top').toInt();
				size = t;
				break;
			case 'arrSize': 
				var h = this.layout.arrows.getStyle('height').toInt();
				h = (type == 'int') ? (h/2).toInt() : h;
				size = h;
				break;		
			case 'curPos':
				var l = this.layout.cursor.getStyle('left').toInt();
				var t = this.layout.cursor.getStyle('top').toInt();
				size = {'l': l, 't': t};
				break;
			case 'slider':
				var t = this.layout.slider.getStyle('marginTop').toInt();
				size = t;
				break;
			default :
				var h = this.layout.cursor.getStyle('width').toInt();
				var w = this.layout.cursor.getStyle('height').toInt();
				h = (type == 'int') ? (h/2).toInt() : h;
				w = (type == 'int') ? (w/2).toInt() : w;
				size = {w: w, h: h};
		};
		return size;
	}
});

MooRainbow.implement(new Options);
MooRainbow.implement(new Events);

// Create the Canvas Space
var Canvas = new CanvasSpace(CanvasShift);