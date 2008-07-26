var SSSubTabView = new Class({
  
  Extends: SSView,

  initialize: function(el)
  {
    this.parent(el);

    this.__selectedTab__ = this.indexOfTab(this.element.getElement('.SSControlView .SSActive').getProperty('id'));
    if(this.__selectedTab__ == -1)
    {
      this.selectTab(0);
    }

    this.element.addEvent('click', this.eventDispatch.bind(this));
  },
  
  
  eventDispatch: function(evt)
  {
    var theEvent = new Event(evt);
    var theTarget = $(evt.target);
    
    if(this.hitTest(theTarget, '.SSControlView'))
    {
      this.selectTabByName(this.hitTest(theTarget, '.SSControlView .SSButton').getProperty('id'));
    }
    else if(this.hitTest(theTarget, '.SSContentView'))
    {
      // if the content view controller exists dispatch the event
      if(this.contentView)
      {
        this.contentView.eventDispatch(evt);
      }
    }
  },
  
  
  indexOfTab: function(name)
  {
    var tab = this.element.getElement('.SSControlView #'+name);
    if(tab) 
    {
      return this.element.getElements('.SSButton').indexOf(tab);
    }
    else
    {
      return -1;
    }
  },
  
  
  selectTabByName: function(name)
  {
    this.selectTab(this.indexOfTab(name));
  },
  

  selectTab: function(idx)
  {
    if(this.__selectedTab__ != idx)
    {
      this.element.getElements('.SSControlView .SSActive').removeClass('SSActive');
      this.element.getElements('.SSContentView .SSActive').removeClass('SSActive');
      
      this.element.getElements('.SSControlView .SSButton')[idx].addClass('SSActive');
      this.element.getElements('.SSContentView div')[idx].addClass('SSActive');
      
      this.__selectedTab__ = idx;
    }
  },
  
  
  addSubTab: function(name)
  {
    
  },
  

  removeSubTab: function(name)
  {
    
  }
  
});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSSubTabView = SSSubTabView;
}
