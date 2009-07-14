var ImageSwapSpace = new Class({

  Extends: ShiftSpace.Space,
  name: "ImageSwap",

  setup : function()
  {
    // need to use a closure to prevent FF3 security problem
    var self = this;
    this.focusRef = function(_evt) {
      var image = $((new Event(_evt)).target);
      var pos = image.getPosition();
      var size = image.getSize().size;

      // store the url to this image
      self.currentImage = image;

      self.focusDiv.setStyles({
        left: pos.x,
        top: pos.y,
        width: size.x,
        height: size.y
      });

      self.focusDiv.injectInside(document.body);
    };

    this.blurRef = this.blurImage.bind(this);

    this.imageEventsAttached = false;

    this.allImages = $$('img').filter(function(anImage) { return !ShiftSpace.isSSElement(anImage);});
    this.allEventHandlers = [];
  },


  fix: function(brokenShiftJson)
  {
    //SSLog('Image Swap fix! ' + Json.toString(brokenShiftJson));
    var content = brokenShiftJson.content;

    // extract the target
    var targetSrcMatches = content.match(/img\[@src=".+?"\]/);
    var targetSrc;

    if(targetSrcMatches && targetSrcMatches[0])
    {
      targetSrc = targetSrcMatches[0].substr(10, targetSrcMatches[0].length-12);
    }

    // extract the swapped image
    var swappedSrcMatches = content.match(/"swapped":".+?"/);
    var swappedSrc;

    if(swappedSrcMatches && swappedSrcMatches[0])
    {
      swappedSrc = swappedSrcMatches[0].substr(11, swappedSrcMatches[0].length-12);
    }

    // check to see that both images are still valid
    SSLog('targetSrc:' + targetSrc + ', swappedSrc:' + swappedSrc);
    var targetImage = $$('img[src=' + targetSrc + ']')[0];

    // we could get the target node
    if(!targetImage)
    {
      SSLog('could not resolve target image');
      var fixStr = "We could not locate the original target image. We have loaded the grabbed image.  Would you like to update this shift?";

      if(confirm(fixStr))
      {
        // load this image
        this.setValue('grabbedImage', {
          src: swappedSrc
        });
        this.showInterface();
      }
      else
      {
        // delete the current shift and return
        this.deleteShift(brokenShiftJson.id);
        return;
      }
    }
    else
    {
      this.swapImage(targetImage);
    }

  },

  buildInterface : function()
  {
    // setup the image cover interface
    this.focusDiv = new ShiftSpace.Element('div', {
      'class': "SSImageSwapFocusDiv"
    });

    this.grabSwapButton = new ShiftSpace.Element('div', {
      'class': "SSImageSwapButton"
    });
    this.grabSwapButton.injectInside(this.focusDiv);

    this.leftTarget = new ShiftSpace.Element('div', {
      'class': "SSImageSwapButtonLeft"
    });
    this.leftTarget.injectInside(this.grabSwapButton);
    this.middleTarget = new ShiftSpace.Element('div', {
      'class': "SSImageSwapButtonMiddle"
    });
    this.middleTarget.injectInside(this.grabSwapButton);
    this.rightTarget = new ShiftSpace.Element('div', {
      'class': "SSImageSwapButtonRight"
    });
    this.rightTarget.injectInside(this.grabSwapButton);

    this.attachEvents();
  },

  attachEvents : function()
  {
    this.focusDiv.addEvent('mouseout', this.blurRef);

    this.grabSwapButton.addEvent('click', function(_evt) {
    });

    // left part of the image swap button
    this.leftTarget.addEvent('mouseover', function(_evt) {
      this.grabSwapButton.addClass('swap');
    }.bind(this));
    this.leftTarget.addEvent('mouseout', function(_evt) {
      this.grabSwapButton.removeClass('swap');
    }.bind(this));
    this.leftTarget.addEvent('click', function(_evt) {
      var target = $((new Event(_evt)).target);
      if(this.grabSwapButton.hasClass('swap'))
      {
        this.swapImage(target);
      }
    }.bind(this));

    // middle part of the image swap button
    this.middleTarget.addEvent('mouseover', function(_evt) {
      this.grabSwapButton.addClass('middle');
    }.bind(this));
    this.middleTarget.addEvent('mouseout', function(_evt) {
      this.grabSwapButton.removeClass('middle');
    }.bind(this));

    // right part of the imageswap button
    this.rightTarget.addEvent('mouseover', function(_evt) {
      this.grabSwapButton.addClass('grab');
    }.bind(this));
    this.rightTarget.addEvent('mouseout', function(_evt) {
      this.grabSwapButton.removeClass('grab');
    }.bind(this));

    var self = this;
    this.rightTarget.addEvent('click', function(_evt) {
      if(self.grabSwapButton.hasClass('grab'))
      {
        var currentShift = self.getCurrentShift();

        // store this across windows
        self.setValue('grabbedImage', {
          src: self.currentImage.src,
          alt: self.currentImage.getProperty('alt'),
          title: self.currentImage.getProperty('title')
        });

        if(currentShift.getSrc() && currentShift.isPinned())
        {
          // we need a new shift
          self.allocateNewShift();
        }
      }
    });
  },

  showInterface : function()
  {
    this.parent();
    if(!this.imageEventsAttached)
    {
      this.imageEventsAttached = true;
      this.attachImageEvents();
    }
  },

  hideInterface : function()
  {
    this.parent();
    if(this.imageEventsAttached)
    {
      this.imageEventsAttached = false;
      this.removeImageEvents();
    }
  },

  attachImageEvents : function()
  {
    // listen for mouse events when the interface is shown
    this.allImages.each(function(anImage) { anImage.addEvent('mouseover', this.focusRef); }.bind(this));
  },

  removeImageEvents : function()
  {
    this.allImages.each(function(anImage) { anImage.removeEvent('mouseover', this.focusRef); }.bind(this));
  },

  grabImage : function()
  {
    var currentShift = this.getCurrentShift();

    // store this across windows
    this.setValue('grabbedImage', {
      src: this.currentImage.src,
      alt: this.currentImage.getProperty('alt'),
      title: this.currentImage.getProperty('title')
    });

    if(currentShift.getSrc() && currentShift.isPinned())
    {
      // we need a new shift
      this.allocateNewShift();
    }
  },

  swapImage : function(targetImage)
  {
    //SSLog('swapImage');

    // get the current shift
    var currentShift = this.getCurrentShift();

    // set up the shift!
    this.getValue('grabbedImage', null, function(grabbedImageRef) {
      var grabbedImage = grabbedImageRef.src;

      // we want a reference to the image node with the replace action
      var pinRef = ShiftSpace.Pin.toRef(this.currentImage, 'replace');

      // tell the current shift to swap
      currentShift.setSrc(grabbedImage);
      currentShift.setSwappedSourceRef(grabbedImageRef);
      currentShift.setOriginalSource(this.currentImage);

      currentShift.swap(pinRef);

      // clear out the selection interface
      this.blurImage();

      // remove the image handlers
      this.removeImageEvents();
    }.bind(this));

  },

  blurImage : function()
  {
    if(this.focusDiv.getParent())
    {
      this.grabSwapButton.removeClass('swap');
      this.grabSwapButton.removeClass('middle');
      this.grabSwapButton.removeClass('grab');
      this.focusDiv.remove();
    }
  }
});


var ImageSwapShift = new Class({
  Extends: ShiftSpace.Shift,

  setup : function(json)
  {
    //SSLog('setting up image swap shift');
    //SSLog(Json.toString(json));

    // build the interface
    this.buildInterface();

    // manage the main view
    this.manageElement(this.element);

    // get the scroll
    if(json.scroll)
    {
      this.image.setStyles({
        left: json.scroll.x,
        top: json.scroll.y
      });
    }

    this.setPinRef(json.pinRef);
    this.setZoom(json.zoom || 0);
    this.setSrc(json.src);
  },


  setZoom : function(newZoom)
  {
    this.zoomVal = newZoom;
  },


  getZoom : function()
  {
    return this.zoomVal;
  },


  encode : function()
  {
    // store the pin ref
    // the size/zoom
    // and the scroll offset
    return {
      scroll : {x: this.image.offsetLeft, y: this.image.offsetTop},
      pinRef : this.getEncodablePinRef(),
      src : this.image.getProperty('src'),
      summary : this.getTitle(),
      zoom : this.getZoom()
    };
  },


  defaultTitle: function()
  {
    var originalSource = this.originalSource();
    var swappedSource = this.swappedSourceRef();

    var originalTitle = originalSource.getProperty('alt') || originalSource.getProperty('title') || originalSource.getProperty('src').split("/").getLast();
    var swappedTitle = swappedSource.alt || swappedSource.title || swappedSource.src.split("/").getLast();

    return (originalTitle + " swapped to " + swappedTitle);
  },


  setSrc : function(src)
  {
    //SSLog('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> set src: ' + src);
    if(src) this.image.setProperty('src', src);
  },


  setOriginalSource: function(image)
  {
    this.__originalSource__ = image;
  },


  originalSource: function()
  {
    return this.__originalSource__;
  },


  setSwappedSourceRef: function(ref)
  {
    this.__swappedSource__ = {
      src: ref.src,
      alt: ref.alt,
      title: ref.title
    };
  },


  swappedSourceRef: function()
  {
    return this.__swappedSource__;
  },


  getSrc : function()
  {
    var src;
    if(this.image)
    {
      src = this.image.getProperty('src');
    }
    return src;
  },


  swap : function(pinRef)
  {
    // set the image to that property
    this.pin(this.element, pinRef);
    this.isSwapped = true;

    if(this.isBeingEdited())
    {
      SSLog('is being edited saving');

      // save the shift!
      this.save();
      // show the edit interface if not already visible
      this.edit();
    }
  },


  unswap: function()
  {
    this.unpin();
    this.isSwapped = false;
  },


  pin : function(element, pinRef)
  {
    //SSLog('pinning');

    // we want the exact dimensions of the old image
    var targetNode = ShiftSpace.Pin.toNode(pinRef);
    // take the dimensions from the target
    var styles = targetNode.getStyles('width', 'height');
    this.element.setStyles(styles);

    // we call this last since we want the styles first!
    this.parent(element, pinRef);
  },


  show : function()
  {
    this.parent();

    this.element.removeClass('SSDisplayNone');

    // detach the dragging
    if(this.dragRef) this.dragRef.detach();

    // remove the
    this.zoomButton.addClass('SSDisplayNone');
    this.unzoomButton.addClass('SSDisplayNone');

    if(!this.isSwapped && this.getPinRef() && this.getSrc())
    {
      this.swap(this.getPinRef());
    }
  },


  edit: function()
  {
    // only show the interface if we are actually swapped on the page
    if(this.isSwapped)
    {
      // show the interface and make draggable
      if(this.dragRef) this.dragRef.attach();

      // show the zoom buttons
      this.zoomButton.removeClass('SSDisplayNone');
      this.unzoomButton.removeClass('SSDisplayNone');
    }
  },


  hide : function()
  {
    this.parent();

    if(this.isSwapped && this.getPinRef() && this.getSrc())
    {
      this.unswap();
    }
  },


  zoom: function()
  {
    // increment the zoom level, increase the image size by ten percent
    this.setZoom(this.getZoom()+1);
    this.updateImageDimensions();
    this.update();
  },


  unzoom: function()
  {
    // decrement the zoom level, decrease the image size by ten percent
    this.setZoom(this.getZoom()-1);
    this.updateImageDimensions();
    this.update();
  },


  updateImageDimensions: function()
  {
    var incrx = this.actualImageSize.x * 0.1;
    var incry = this.actualImageSize.y * 0.1;

    this.imageSize.x = (this.actualImageSize.x + incrx * this.getZoom()).round();
    this.imageSize.y = (this.actualImageSize.y + incry * this.getZoom()).round();
  },


  refresh: function()
  {
    // increment by percentage
    if(this.imageSize)
    {
      this.image.setProperty('width', this.imageSize.x);
      this.image.setProperty('height', this.imageSize.y);
      this.image.setStyles({
        width: this.imageSize.x,
        height: this.imageSize.y
      });
    }
  },


  update: function()
  {
    this.refresh();
    this.save();
  },


  imageLoaded: function(evt)
  {
    // get the actual dimensions of the image
    this.imageSize = this.image.getSize().size;
    this.actualImageSize = this.image.getSize().size;
    this.updateImageDimensions();
    this.refresh();
  },


  attachEvents: function()
  {
    this.zoomButton.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      evt.stop();
      // Forward it to ShiftSpace only?
      this.zoom();
    }.bind(this));
    this.unzoomButton.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      evt.stop();
      // Forward it to ShiftSpace?
      this.unzoom();
    }.bind(this));
    this.image.addEvent('load', this.imageLoaded.bind(this));
  },


  buildInterface : function()
  {
    //SSLog('buildInterface');
    this.element = new ShiftSpace.Element('div', {
      'class': "SSImageSwapShift SSUnordered"
    });
    //SSLog('element created');
    this.image = new ShiftSpace.Element('img', {
      'class': "SSImageSwapShiftImage"
    });
    //SSLog('image div created');

    // add the zoom buttons
    this.zoomButton = new ShiftSpace.Element('div', {
      'class': "SSImageSwapShiftZoom SSDisplayNone"
    });
    this.unzoomButton = new ShiftSpace.Element('div', {
      'class': "SSImageSwapShiftUnzoom SSDisplayNone"
    });

    // add them to the shift element
    this.zoomButton.injectInside(this.element);
    this.unzoomButton.injectInside(this.element);

    //SSLog('ImageSwap elements created');

    // show the zooming interface
    this.image.injectInside(this.element);
    this.dragRef = new Drag.Move(this.image, {
      onComplete : function()
      {
        this.save();
      }.bind(this)
    });
    // prevent dragging until the user is in edit mode
    this.dragRef.detach();

    this.image.addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      evt.stop();
    });

    this.attachEvents();
  },


  getMainView: function()
  {
    // only return the main view if we are pinned
    if(this.isPinned())
    {
      return this.parent();
    }
    
    return null;
  }

});

var ImageSwap = new ImageSwapSpace(ImageSwapShift);