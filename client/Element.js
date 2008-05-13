ShiftSpace.Element = new Class({
  initialize: function(_el, props) 
  {
    var el = new Element(_el, props);
    
    // ShiftSpaceElement style needs to be first, otherwise it overrides passed in CSS classes - David
    el.setProperty( 'class', 'ShiftSpaceElement ' + el.getProperty('class') );
    
    // remap makeResizable and makeDraggable - might want to look into this more
    var resizeFunc = el.makeResizable;
    var dragFunc = el.makeDraggable;
    
    // override the default behavior
    if(ShiftSpace.addIframeCovers)
    {
      el.makeDraggable = function(options)
      {
        var dragObj = dragFunc.bind(el, options)();
        dragObj.addEvent('onStart', ShiftSpace.addIframeCovers.bind(ShiftSpace));
        dragObj.addEvent('onDrag', ShiftSpace.updateIframeCovers.bind(ShiftSpace));
        dragObj.addEvent('onComplete', ShiftSpace.removeIframeCovers.bind(ShiftSpace));
      
        return dragObj;
      }
    
      // override the default behavior
      el.makeResizable = function(options)
      {
        var resizeObj = resizeFunc.bind(el, options)();
        resizeObj.addEvent('onStart', ShiftSpace.addIframeCovers.bind(ShiftSpace));
        resizeObj.addEvent('onDrag', ShiftSpace.updateIframeCovers.bind(ShiftSpace));
        resizeObj.addEvent('onComplete', ShiftSpace.removeIframeCovers.bind(ShiftSpace));
      
        return resizeObj;
      }
    }
    
    return el;
  }
});

/*
  Class : ShiftSpace.Iframe
    This class allows the creation of iframes with CSS preloaded.  This will eventually
    be deprecated by the the forthcoming MooTools Iframe element which actually loads
    MooTools into the iframe.
*/
ShiftSpace.Iframe = ShiftSpace.Element.extend({
  initialize: function(props)
  {
    // check for the css property
    this.css = props.css;
    
    // check for cover property to see if we need to add a cover to catch events
    var loadCallBack = props.onload;
    delete props.onload;
    
    // eliminate the styles, add on load event
    var finalprops = $merge(props, {
      events: 
      {
        load : function() {
          // load the css
          if(this.css) 
          {
            loadStyle(this.css, null, this.frame);
          }
          loadCallBack();
        }.bind(this)
      }
    });
    
    // store a ref for tricking
    this.frame = this.parent('iframe', finalprops);
    
    if(ShiftSpace.addCover)
    {
      // add a cover for this object
      var cover = new ShiftSpace.Element('div', {
        'class': "SSIframeCover"
      });
      cover.setStyle('display', 'none');
      // add it to the page
      cover.injectInside(document.body);

      // let ShiftSpace know about it
      ShiftSpace.addCover({cover:cover, frame:this.frame});
    }
    
    // return
    return this.frame;
  }
});