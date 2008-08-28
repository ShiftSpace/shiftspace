var SSTabView = new Class({
  
  name: 'SSTabView',
  
  Extends: SSView,

  initialize: function(el)
  {
    this.parent(el);
    
    this.__selectedTab__ = -1;

    // check for default tab
    var defaultActiveTab = this.element._getElement('> .SSControlView .SSButton.SSActive');
    
    if(defaultActiveTab)
    {
      var idx = this.indexOfTab(defaultActiveTab);
      // force selection of default tab
      this.selectTab(idx);
      this.__selectedTab__ = idx;
    }
    
    // if none select the first
    if(this.__selectedTab__ == -1)
    {
      this.selectTab(0);
    }

    this.element.addEvent('click', this.eventDispatch.bind(this));
    
    //console.log('refresh SSTabView');
    // refresh the dimensions
    this.refresh();
    //console.log('SSTabView initialized');
  },
  
  
  eventDispatch: function(evt)
  {
    //console.log('eventDispatch');

    var theEvent = new Event(evt);
    var theTarget = $(evt.target);
    
    switch(true)
    {
      case (this.hitTest(theTarget, '> .SSControlView') != null):
        var hit = this.hitTest(theTarget, '> .SSControlView .SSButton');
        if(hit) this.selectTab(this.indexOfTab(hit));
      break;
      
      default:
      break;
    }
  },
  
  
  indexOfTabByName: function(name)
  {
    var tab = this.element._getElement('> .SSControlView #'+name);
    
    // return tab index if we have it
    if(tab)
    {
      return this.indexOfTab(tab);
    }
    
    tab = this.element._getElement('> .SSContentView #'+name);
    
    // return content view index if we have it
    if(tab)
    {
      return this.indexOfContentView(tab);
    }
    
    // we couldn't find it
    return -1;
  },
  
  
  indexOfTab: function(tabButton)
  {
    return this.indexOfNode(this.element._getElements('> .SSControlView > .SSButton'), tabButton);
  },
  
  
  tabButtonForIndex: function(idx)
  {
    return this.element._getElements('> .SSControlView > .SSButton')[idx];
  },
  
  
  tabButtonForName: function(name)
  {
    return this.element._getElement('> .SSControlView #'+name);
  },
  
  
  indexOfContentView: function(contentView)
  {
    return this.indexOfNode(this.element._getElements('> .SSContentView > div'), contentView);
  },
  
  
  contentViewForIndex: function(idx)
  {
    return this.element._getElements('> .SSContentView > div')[idx];
  },
  

  selectTabByName: function(name)
  {
    this.selectTab(this.indexOfTabByName(name));
  },
  
  
  selectedContentView: function()
  {
    // grab the DOM node
    var contentView = this.contentViewForIndex(this.__selectedTab__);
    // check for a controller
    var controller = this.controllerForNode(contentView);
    return (controller || contentView);
  },
  

  selectTab: function(idx)
  {
    //console.log(this.element.getProperty('id') + ' selectTab ' + idx);
    if(this.__selectedTab__ != idx)
    {
      // hide the last tab button and tab pane only if there was a last selected tab
      if(this.__selectedTab__ != -1)
      {
        this.tabButtonForIndex(this.__selectedTab__).removeClass('SSActive');

        // hide the last tab pane
        var lastTabPane = this.contentViewForIndex(this.__selectedTab__);
        //console.log('controller for last tab ' + lastTabPane + ' ' + $uid(lastTabPane));
        var lastTabPaneController = this.controllerForNode(lastTabPane);
        //console.log('got controller');

        if(lastTabPaneController)
        {
          lastTabPaneController.hide();
        }
        else
        {
          lastTabPane.removeClass('SSActive');
        }
      }

      // check to see if there is a view controller for the content view
      var controller = this.contentViewControllerForIndex(idx);
      //console.log('>>>>>>>>>>>>>>>>>>>>>>>> getting tab content view controller');
      if(controller)
      {
        //console.log('showing controller');
        controller.show();
        //console.log('refreshing controller');
        controller.refresh();
      }
      else
      {
        this.contentViewForIndex(idx).addClass('SSActive');
      }
      
      //console.log('Activating tab button');
      // hide the tab button
      this.tabButtonForIndex(idx).addClass('SSActive');
      
      this.__selectedTab__ = idx;
      
      //console.log('fire tabSelected');
      this.fireEvent('tabSelected', {tabView:this, tabIndex:this.__selectedTab__});
      //console.log('exit tabSelected');
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
    
    tabButton.injectInside(this.element._getElement('> .SSControlView'));
    tabContent.injectInside(this.element._getElement('> .SSContentView'));
  },
  
  
  contentViewControllerForIndex: function(idx)
  {
    //console.log('contentViewControllerForIndex ' + idx + ' ' + this.contentViewForIndex(idx));
    return this.controllerForNode(this.contentViewForIndex(idx));
  },
  
  
  activeTab: function()
  {
    return this.indexOfTab(this.element._getElement('> .SSControlView > .SSActive'));
  },
  
  
  hideTabByName: function(name)
  {
    this.hideTab(this.indexOfTabByName(name));
  },
  
  
  hideTab: function(index)
  {
    this.tabButtonForIndex(index).addClass('SSDisplayNone');
    this.contentViewForIndex(index).addClass('SSDisplayNone');
  },
  
  
  revealTabByName: function(name)
  {
    this.revealTab(this.indexOfTabByName(name));
  },
  
  
  revealTab: function(index)
  {
    this.tabButtonForIndex(index).removeClass('SSDisplayNone');
    this.contentViewForIndex(index).removeClass('SSDisplayNone');
  },


  removeTabByName: function(name)
  {
    this.removeTab(this.indexOfTabByName(name));
  },


  removeTab: function(idx)
  {
    // if removing selected tab, highlight a different tab
    if(this.activeTab() == idx)
    {
      this.selectTab(0);
    }
    
    // remove tab button
    this.tabButtonForIndex(idx).dispose();

    // Remove the controller
    var contentView = this.contentViewForIndex(idx);
    var controller = this.controllerForNode(contentView);
    
    if(controller)
    {
      // destroy the controller
      controller.destroy();
    }
    else
    {
      // remove the DOM element
      contentView.dispose();
    }
  },
  

  refresh: function()
  {
    var theControlView = this.element._getElement('> .SSControlView');
    var theContentView = this.element._getElement('> .SSContentView');
    
    // resize content view if it's supposed to autoresize
    if(theContentView.getProperty('autoresize'))
    {
      var size = this.element.getSize();
      var controlSize = theControlView.getSize();
    
      /*
      theContentView.setStyles({
        width: size.x-controlSize.x
      });
      */
    }
    
    // refresh the selected content view as well
    var contentView = this.selectedContentView();
    if(contentView.refresh) contentView.refresh();
  }
  
});

// add it to the UI object if possible
if($type(ShiftSpace.UI) != 'undefined')
{
  ShiftSpace.UI.SSTabView = SSTabView;
}
