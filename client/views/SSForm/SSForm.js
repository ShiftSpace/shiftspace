// ==Builder==
// @uiclass
// @required
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

var SSForm = new Class({

  Extends: SSView,

  name: "SSForm",

  initialize: function(el, options)
  {
    this.parent(el, options);
  },
  
  initSubForm: function()
  {
    this.element.getElements('.SSFormStep').each(function(subForm) {
      // prevent default submit behavior
      subForm.addEvent('submit', function(_evt) {
        var evt = new Event(_evt);
        evt.preventDefault();
      }.bind(this));
      
      this.initSubmitButtonForSubForm(aStep, aStep.getElement('input[submit]'));
    });
  },
  
  initSubmitButtonForSubForm: function(step, button)
  {
    
  },
  
  validateSubForm: function(subForm)
  {
    
  }

});