var SSTabView = new Class({
  
  Extends: SSView,

  initialize: function(el)
  {
    this.parent(el);

    // a new hash object
    this.__contentViewControllers__ = new Hash();
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
  
  
  indexOfTabByNode: function(tabButton)
  {
    return this.element.getElements('.SSControlView .SSButton').indexOf(tabButton);
  },
  
  
  tabButtonForIndex: function(idx)
  {
    return $(this.element.getElements('.SSControlView .SSButton')[idx]);
  },
  
  
  tabButtonForName: function(name)
  {
    return $(this.element.getElement('.SSControlView #'+name));
  },
  
  
  contentViewForIndex: function(idx)
  {
    return $(this.element.getElements('.SSContentView div')[idx]);
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
  
  
  addTab: function(name)
  {
    var tabButton = new Element('div', {
      'id': name,
      'class': "SSButton"
    });
    tabButton.set('text', name);
    var tabContent = new Element('div');
    
    tabButton.injectInside(this.element.getElement('.SSControlView'));
    tabContent.injectInside(this.element.getElement('.SSContentView'));
  },
  
  
  addControllerForContentView: function(name, controllerClass)
  {
    this.__contentViewControllers__[name] = new controllerClass();
  },
  
  
  activeTab: function()
  {
    return this.indexOfTabByNode(this.element.getElement('.SSControlView .SSActive'));
  },
  

  removeTab: function(name)
  {
    var idx = this.indexOfTab(name);
    
    // if removing selected tab, highlight a different tab
    if(this.activeTab() == idx)
    {
      this.selectTab(0);
    }
    
    this.tabButtonForIndex(idx).dispose();

    // remove the content view controller is there is one
    if(this.__contentViewControllers__[name])
    {
      delete this.__contentViewControllers__[name];
    }
    // remove the DOM element
    this.contentViewForIndex(idx).dispose();
  }
  
});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSTabView = SSTabView;
}
