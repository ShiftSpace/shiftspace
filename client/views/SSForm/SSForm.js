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
    // initialize the subforms
    this.initSubForms();
  },
  
  
  hide: function()
  {
    this.parent();
    if(this.options.firstSubForm)
    {
      this.showForm(this.options.firstSubForm);
    }
  },
  
  
  awake: function()
  {
    // set the delegate if there is one
    if(this.options.delegate)
    {
      this.setDelegate(SSControllerForNode($(this.options.delegate)));
    }
    
    // connect the anchors to their respective forms
    if(this.options.anchors)
    {
      $H(this.options.anchors).each(function(formName, anchorName) {
        this.element.getElementById(anchorName).addEvent('click', this.showForm.bind(this, [formName]));
      }.bind(this));
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