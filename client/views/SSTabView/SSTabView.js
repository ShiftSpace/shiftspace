// ==Builder==
// @uiclass
// @package           ShiftSpaceCoreUI
// @dependencies      SSView
// ==/Builder==

/*
  Class: SSTabView
    SSTabView controls the view and function of tabs within the console. 
*/
var SSTabView = new Class({
  
  Extends: SSView,
  name: 'SSTabView',
    
  initialize: function(el, options)
  {
    this.setOptions(this.defaults(), options);
    this.parent(el, options);
    var defaultActiveTab = this.element.getElement('> .SSControlView > .SSButton.SSActive'),
        idx = this.indexOfTab(defaultActiveTab);
    if(idx == -1) idx = 0;
    this.__selectedTab = idx;
    this.element.addEvent('click', this.eventDispatch.bind(this));
  },


  afterAwake: function()
  {
    this.selectTab(this.__selectedTab, true);
  },
  

  controlView: function()
  {
    return this.element.getElement('> .SSControlView');
  },
  
  
  contentView: function()
  {
    return this.element.getElement('> .SSContentView');
  },
  
  /*
    Function: eventDispatch (private)
      Dispatches the selectTab event when tab when hit. selectTab is only called if the SSControlView class name is not null. 
      
    Paremeters:
      evt - A DOM node event 
  */
  eventDispatch: function(evt)
  {
    var theEvent = new Event(evt);
        theTarget = $(evt.target);
    
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
  
  /*
    Function: indexOfTabByName
      Takes the tab's class name and returns its index
    
    Pararmeter:
      name - class name of tab
    
    Return:
      Returns the index of a tab node if a contentView or tabPane name exists
      If a tab name doesn't exist, return -1
    
    See Also: 
      indexOfTab
  */
  indexOfTabByName: function(name)
  {
    var tab = this.element.getElement('> .SSControlView #'+name);
    if(tab) return this.indexOfTab(tab);
    tab = this.element.getElement('> .SSContentView #'+name);
    if(tab) return this.indexOfTabPane(tab);
    return -1;
  },
  
  /*
    Funtion: indexOfTab
      Takes the class name of a tab and returns the tab's node index 
    
    Parameters:
      tabButton -  SSButton class name of tab button
    
    Returns:
      Index node of tab 
      
    See Also:
      indexOfTabByName 
  */
  indexOfTab: function(tabButton)
  {
    if(!tabButton) return -1;
    return this.indexOfNode(this.element.getElements('> .SSControlView > .SSButton'), tabButton);
  },
  
  /*
    Funtion: tabButtonForIndex
      Takes the index of tab and returns its DOM node
    
    Parameters:
      idx - index of tab button 
    
    Returns:
      DOM node of tab
      
    See Also: 
      tabButtonForName
  */
  tabButtonForIndex: function(idx)
  {
    return this.element.getElements('> .SSControlView > .SSButton')[idx];
  },
  
  /*
    Funtion: tabButtonForName
      Takes the class name of tab and returns its DOM node 
    
    Parameters:
      name - id name of tab button 
    
    Returns:
      DOM node of tab
      
    See Also: 
      tabButtonForIndex
      
  */
  tabButtonForName: function(name)
  {
    return this.element.getElement('> .SSControlView #'+name);
  },
  
  /*
    Funtion: indexOfTabPane
      Takes the class name of contentView Div and returns its index
    
    Parameters:
      contentView - class name of contentView Div
    
    Returns:
      Index of contentView Div
      
    See Also: 
      indexOfTab
  */
  indexOfTabPane: function(contentView)
  {
    return this.indexOfNode(this.element.getElements('> .SSContentView > .SSTabPane'), contentView);
  },
  
  /*
    Funtion: tabPaneForIndex
      Takes the index of a SSContentView Div and returns its DOM node
    
    Parameters:
      idx - index of Tab
    
    Returns:
      DOM node of SSContentView
      
    See Also: 
      indexOfTabPane
  */
  tabPaneForIndex: function(idx)
  {
    return this.element.getElements('> .SSContentView > .SSTabPane')[idx];
  },
  
  /*
    Funtion: selectTabByName
      Selects a tab by its name
      
    Parameters:
      name - class name of Tab 
      
    See Also: 
      selectTab
  */
  selectTabByName: function(name)
  {
    this.selectTab(this.indexOfTabByName(name));
  },
  
  /*
    Function: selectedTabPane
      Checks the currently selected tab's for a controller. Returns the selected tab's controller if it exsists, or else returns the contentView. 
      
    Returns: 
      Selected tab's controller or contentView
   */
  selectedTabPane: function()
  {
    var contentView = this.tabPaneForIndex(this.__selectedTab),
        controller = this.controllerForNode(contentView);
    return (controller || contentView);
  },
  
  /*
    Function: selectedTab
      Returns the currenlty selected tab
      
    Returns: 
      Currently selected tab
    
    See Also:
      SelectTab
  */
  selectedTab: function()
  {
    return this.__selectedTab;
  },
  
  /*
    Function: selectTab
      Takes the index of a tab, makes it active, and displays content of the new selected tab if it exists. Removes the active class from the previously selected tab. 
    
    Parameters:
      idx - index of Tab
  */
  selectTab: function(idx, force )
  {
    if(this.__selectedTab != idx || force)
    {
      if(this.__selectedTab != -1)
      {
        this.tabButtonForIndex(this.__selectedTab).removeClass('SSActive');
        var lastTabPane = this.tabPaneForIndex(this.__selectedTab),
            lastTabPaneController = this.controllerForNode(lastTabPane);
        if(lastTabPaneController)
        {
          lastTabPaneController.hide();
        }
        else
        {
          lastTabPane.removeClass('SSActive');
          this.subViews(lastTabPane).each(Function.msg("willHide"), this);
        }
        this.fireEvent('tabDeselected', {tabView:this, tabIndex:this.__selectedTab});
      }

      var controller = this.tabPaneControllerForIndex(idx);
      if(controller)
      {
        controller.show();
      }
      else
      {
        var node = this.tabPaneForIndex(idx);
        node.addClass('SSActive');
        this.visibleSubViews(node).each(Function.comp(Function.msg('willShow'), Function.msg('__refresh__')));
      }
      this.tabButtonForIndex(idx).addClass('SSActive');
      this.__selectedTab = idx;
      this.fireEvent('tabSelected', {tabView:this, tabIndex:this.__selectedTab});
    }
    else
    {
      this.fireEvent('tabClicked', {tabView:this, tabIndex:idx});
    }
  },
  
  /*
    Function: addTab
      Creates a new tab and applies the passed argument to its id name. 
      
    Parameters:
      name - Name of the new tab
  */
  addTab: function(name)
  {
    var tabButton = new Element('div', {
      'id': name,
      'class': "SSButton"
    });
    tabButton.set('text', name);
    var tabContent = new Element('div', {
      'class': 'SSTabPane'
    });
    tabButton.injectInside(this.element.getElement('> .SSControlView'));
    tabContent.injectInside(this.element.getElement('> .SSContentView'));
  },
  
  /*
    Function: tabPaneControllerForIndex
      Takes the index of a contentView and returns the controller's DOM node
      
    Parameters:
      idx - index of contentView 
      
    Returns:
      DOM node of controller 
  */
  tabPaneControllerForIndex: function(idx)
  {
    return this.controllerForNode(this.tabPaneForIndex(idx));
  },
  
  /*
    Function: activeTab
      Returns the index of the currently active tab
      
    Returns:
      Index of tab
  */
  activeTab: function()
  {
    return this.indexOfTab(this.element.getElement('> .SSControlView > .SSButton.SSActive'));
  },
  
  /*
    Function: hideTabByName
      Takes a tab's id name and hides the tab.
    
    Parameters:
      name - Tab id name
      
    See Also:
      hideTab
  */
  hideTabByName: function(name)
  {
    this.hideTab(this.indexOfTabByName(name));
  },
  
  /*
    Function: hideTab
      Takes a tab's node index and hides the tab.
    
    Parameters:
      index - Tab node index
      
    See Also:
      hideTabByName
  */
  hideTab: function(index)
  {
    this.tabButtonForIndex(index).addClass('SSDisplayNone');
    this.tabPaneForIndex(index).addClass('SSDisplayNone');
  },
  
  /*
    Function: revealTabByName
      Takes a tab's id name and reveals the tab.
    
    Parameters:
       name - Tab id name
      
    See Also:
      revealTab
  */
  revealTabByName: function(name)
  {
    this.revealTab(this.indexOfTabByName(name));
  },
  
  /*
    Function: revealTab
      Takes a tab's node index and reveals the tab.
    
    Parameters:
       name - Tab node index
      
    See Also:
      revealTabByName
  */
  revealTab: function(index)
  {
    this.tabButtonForIndex(index).removeClass('SSDisplayNone');
    this.tabPaneForIndex(index).removeClass('SSDisplayNone');
  },

  /*
    Function: removeTabByName
      Takes a tab's id name and removes the tab.
    
    Parameters:
       name - Tab id name
      
    See Also:
      removeTab
  */
  removeTabByName: function(name)
  {
    this.removeTab(this.indexOfTabByName(name));
  },

  /*
    Function: removeTab
      Takes a tab's node index and removes the tab and its controller. If the currently selected tab is being removed, the first tab is selected.
    
    Parameters:
       idx - Tab node index 
      
    See Also:
      removeTabByName
  */
  removeTab: function(idx)
  {
    if(this.activeTab() == idx) this.selectTab(0);
    this.tabButtonForIndex(idx).dispose();
    var contentView = this.tabPaneForIndex(idx),
        controller = this.controllerForNode(contentView);
    if(controller)
    {
      controller.destroy();
    }
    else
    {
      contentView.dispose();
    }
  }
});