var QuoteSpace = ShiftSpace.Space.extend({
  attributes: {
    name: 'Quote',
    icon: 'Quote.png', 
    version: 0.1,
    css: 'spaces/Quote/Quote.css'
  }
});


var QuoteShift = ShiftSpace.Shift.extend({
  setup: function(){
    var self = this;
    self.addBodyListener();
  },
  
  addBodyListener: function(){
    var self = this;
    var bod = document.getElement("body");
    $(bod).addEvents({  
      "mouseover": function(e){
        if(self.isProtectedElement(e.target) == false && !self.quotedElement){
          self.addOverEffect(e.target);
        }
      },
      "mouseout":function(e){
        if(self.isProtectedElement(e.target) == false && !self.quotedElement){
          self.removeOverEffect(e.target);
        }
      },
      "mousedown":function(e){
        //need to grab styles from children elements as well
        if(self.isProtectedElement(e.target) == false && !self.quotedElement){
          e.target.setStyle('outline','');
          self.quotedElement = self.getClone(e.target);
          
          // store 
          GM_setValue('SSQuote','test me!');
          
        }else{
          
          console.log(GM_getValue('SSQuote'));
          var container = self.createContainer();
          self.quotedElement.removeEvent('mouseover');
          self.quotedElement.removeEvent('mouseout');
          self.quotedElement.removeEvent('mousedown');
          container.appendChild(self.quotedElement);
          container.injectInside(document.body);
          var handle = container.getElementsByClassName('SSQuoteHandle')[0];
          container.makeDraggable({'handle':handle});
          container.setStyles({
              'top':e.clientY,
              'left':e.clientX
          });
          self.quotedElement = null;
        }
      }
    });
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

var Quote = new QuoteSpace(QuoteShift);
