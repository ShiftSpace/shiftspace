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
        if(!ShiftSpace.isSSElement(e.target)){
          self.addOverEffect(e.target);
        }
      },
      "mouseout":function(e){
        if(!ShiftSpace.isSSElement(e.target)){
          self.removeOverEffect(e.target);
        }
      },
      "mousedown":function(e){
        //need to grab styles from children elements as well
        if(!ShiftSpace.isSSElement(e.target) && !self.quotedElement){
          self.quotedElement = self.getClone(e.target);
        }else{
          console.log(self.quotedElement);
          self.quotedElement = null;
        }
      }
    });
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
        if(styles[s] != "" || styles[s] != null || s != 'outline'){
          try{
            clone.setStyle(s + "",styles[s] + "");
          }catch(TypeError){
            /*element does not have setter ignore*/
          }; 
        }
    }
    return clone;
  }
});

var Quote = new QuoteSpace(QuoteShift);
