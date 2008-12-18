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
    this.parent(el, $merge(options, SSGetInlineOptions(el)));
    // initialize the subforms
    this.initSubForms();
  },
  
  
  awake: function()
  {
    if(this.options.delegate)
    {
      this.setDelegate(SSControllerForNode($(this.options.delegate)));
    }
  },

  
  initSubForms: function()
  {
    // initialize each sub form
    this.element.getElements('.SSSubForm').each(this.initSubForm.bind(this));
  },
  
  
  initSubForm: function(subForm)
  {
    // prevent default submit behavior
    subForm.addEvent('submit', function(_evt) {
      var evt = new Event(_evt);
      evt.stop();
      if(this.validateSubForm(subForm))
      {
        if(this.delegate() && this.delegate().onFormSubmit) this.delegate().onFormSubmit(subForm.getProperty('id'));
      }
    }.bind(this));
  },
  

  validateSubForm: function(subForm)
  {
    return true;
  },
  
  
  showForm: function(formName)
  {
    var subform = this.element.getElementById(formName);
    if(!subform.hasClass('SSActive'))
    {
      this.element.getElement('.SSActive').removeClass('SSActive');
      subform.addClass('SSActive');
    }
  }

});