var QuoteSpace = ShiftSpace.Space.extend({
  attributes: {
    name: 'Quote',
    icon: 'Quote.png', 
    version: 0.1,
    css: 'spaces/Quote/Quote.css'
  },
  
  setup: function(){
    var self = this;
    self.buildInterface();
    
  },
  
  buildInterface: function(){
    var self = this;
    //body events
    self.overElem = function(e){
      if(self.isProtectedElement(e.target) == false && !self.quotedElement){
        self.addOverEffect(e.target);
      }
    }
    
    self.outElem = function(e){
      if(self.isProtectedElement(e.target) == false && !self.quotedElement){
        self.removeOverEffect(e.target);
      }
    }
    
    self.downElem = function(e){
      //need to grab styles from children elements as well
      if(self.isProtectedElement(e.target) == false && !self.quotedElement){
        e.target.setStyle('outline','');
        self.quotedElement = self.getClone(e.target);
        
        // store 
        console.log(self);
        self.setValue('SSQ',{'content':'myContent'});
        
      }else{
        
        self.getValue('SSQ',null,function(SSQ){
            console.log(SSQ.content);
        });
        var container = self.createContainer();
        container.appendChild(self.quotedElement);
        container.injectInside(document.body);
        var handle = container.getElementsByClassName('SSQuoteHandle')[0];
        container.makeDraggable({'handle':handle});
        container.setStyles({
            'top':e.clientY,
            'left':e.clientX
        });
        self.quotedElement = null;
        self.removeDocumentEvents();
      }
    }
  },
  
  addDocumentEvents: function(){
    var self = this;
    $(document).addEvents({
        'mouseover':self.overElem,
        'mouseout':self.outElem,
        'mousedown':self.downElem
    });
  },
  
  removeDocumentEvents: function(){
    var self = this;
    $(document).removeEvent('mouseover',self.overElem);
    $(document).removeEvent('mouseout',self.outElem);
    $(document).removeEvent('mousedown',self.downElem);
  },
  
  buildWidget: function(){
    self.SSQuoteWidget = new Element('div',{
        'id': 'SSQuoteWidget',
        'styles':{
          'left':posx,
          'top':posy
        }
    });
    
    self.SSQuoteUI = new Element('div',{
        'id':'SSQuoteUI'
    });
    
    self.SSQuoteHandle = new Element('div',{
        'id':'SSQuoteHandle'
    });
    
    self.SSQuoteButton = new Element('a',{
        'id':'SSQuoteButton'
    });
    
    self.SSQuoteTransparentButton = new Element('a',{
        'id':'SSQuoteTransparentButton'
    });
    
    self.SSQuoteWhiteButton = new Element('a',{
        'id':'SSQuoteWhiteButton'
    });
    
    self.SSQuoteBlackButton = new Element('a',{
        'id':'SSQuoteBlackButton'
    });
    
    self.SSQuoteHandle.injectInside(self.SSQuoteUI);
    self.SSQuoteButton.injectInside(self.SSQuoteUI);
    self.SSQuoteTransparentButton.injectInside(self.SSQuoteUI);
    self.SSQuoteWhiteButton.injectInside(self.SSQuoteUI);
    self.SSQuoteBlackButton.injectInside(self.SSQuoteUI);
    self.SSQuoteUI.injectInside(self.SSQuoteWidget)
    self.SSQuoteWidget.injectInside(document.body);
    self.attachSSQuoteWidgetEvents();
    self.attachSSQuoteButtonEvents();      
  },
  
  attachSSQuoteWidgetEvents: function(){
    var self = this;
    self.SSQuoteWidget.addEvents({
        'mouseleave':function(evt){
          this.setStyle('display','none');
        }
    });
  },
  
  attachSSQuoteButtonEvents: function(){
    var self = this;
    
    var morphObject = new Fx.Morph(self.SSQuoteWidget,{
        duration:'short'
    });
    
    self.SSQuoteButton.addEvents({
        'click':function(evt){
          self.insertQuote(self.SSQuoteWidget);
        }
    });
    
    self.SSQuoteTransparentButton.addEvents({
        'click':function(evt){
          self.SSQuoteWidget.setStyle('background-color','transparent');  
        }
    });
    
    self.SSQuoteWhiteButton.addEvents({
        'click':function(evt){
          morphObject.start({'background-color':'#FFFFFF'});
        }
    });
    
    self.SSQuoteBlackButton.addEvents({
        'click':function(evt){
          morphObject.start({'background-color':'#333333'});
        }
    });
  },
  
  insertQuote: function(container,quote){
    var self = this;
    var quote = new Element('p',{
        'id':'quote',
      'html':'lorem ipsum is dummy text dummmy<br />Hello',
      'styles': {
        'width':'200px',
        'height':'150px'
      }
    });
    
    container.appendChild(quote);
    var efx = new Fx.Morph($(container),{
        duration:'short'
    });
    
    efx.start({
        'width':quote.getComputedStyle('width') ,
        'height':quote.getComputedStyle('height')
    });
  
    container.removeEvents('mouseleave');
    self.SSQuoteButton.removeEvents('click');
    var myDrag = new Drag($(container),{'handle':$('SSQuoteHandle')});
    myDrag.attach();
  },
  
  showInterface: function(){
    var self = this;
    self.addDocumentEvents();
    self.buildWidget();
  },
  
  hideInterface: function(){
    var self = this;
    self.removeDocumentEvents();
  },
  
  isProtectedElement: function(elem){
    var self = this;
    if(!ShiftSpace.isSSElement(elem) && self.isContained(elem) != true && !elem.hasClass("SSQuoteContainer")){
      return false; 
    }else{
      return true;
    }
  },
  
  createContainer: function(){
    var container = new ShiftSpace.Element('div',{
      'class':'SSQuoteContainer',
      'styles':{
        'padding':'3px'
      }
    });
    container.appendChild(new Element('div',{
        'class':'SSQuoteHandle',
        'styles':{
          'background-color':'#777777',
          'width':'100%',
          'height':'20px'
        }
    }));
    return container;
  },
  
  isContained: function(elem){
    var parent = $(elem.getParent());
    while(parent != null)
    {
      if(parent.hasClass && parent.hasClass('SSQuoteContainer')) return true;
      parent = ($(parent).getParent) ? $(parent.getParent()) : null;
    }
    return false;
  },
  
  addOverEffect: function(elem){
    elem.setStyle('outline','1px solid red');
  },
  
  removeOverEffect: function(elem){
    elem.setStyle('outline','');
  },
  
  getClone: function(elem){
    /*does this work on Webkit?*/
    var styles = document.defaultView.getComputedStyle(elem,null);
    var clone = elem.clone();
    for(s in styles){
      this.allImages = $$('img').filter(function(anImage) { return !ShiftSpace.isSSElement(anImage);});
        if(styles[s] != "" && styles[s] != null){
          try{
            clone.setStyle(s + "",styles[s] + "");
          }catch(TypeError){
            /*element does not have setter ignore*/
          }; 
        }
    }
    clone.setStyle('outline','');
    return clone;
  }   
});


var QuoteShift = ShiftSpace.Shift.extend({
    
});

var Quote = new QuoteSpace(QuoteShift);
