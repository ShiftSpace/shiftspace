// ==Builder==
// @optional
// @package           ShiftSpaceCore
// ==/Builder==

var SSPageControl = new Class({

  Implements: [Events, Options],

  name: "SSPageControl",
  
  defaults: {
    listView: null,
    perPage: 25
  }, 

  initialize: function(el, listView, options)
  {
    this.setOptions(this.defaults, options);
    this.element = el;

    this.setInterfaceInitialized(false);
    this.setCurrentPage(0);
    this.setPerPage(this.options.perPage);
    this.attachEvents();
    
    if(listView)
    {
      this.setListView(listView);
      this.listView().setPageControl(this);
      
      // set a filter
      this.listView().setFilter(this.filterItem.bind(this));
      
      if(this.listView().dataIsReady())
      {
        this.initializeInterface();
      }
      
      this.listView().addEvent('onReloadData', this.initializeInterface.bind(this));
    }
  },
  
  
  filterItem: function(x, index)
  {
    if(index == undefined) return false;
    return !(index >= this.lowerBound()) || !(index <= this.upperBound());
  },
  
  
  setCurrentPage: function(page)
  {
    var els = this.element.getElements('.page');
    els.removeClass('SSActive');
    els[page].addClass('SSActive');
    this.__currentPage = page;
    if(this.listView()) this.listView().refresh(true);
    this.updatePreviousAndNext();
  },
  
  
  currentPage: function()
  {
    return this.__currentPage;
  },
  
  
  updatePreviousAndNext: function()
  {
    if(this.currentPage() == 0)
    {
      this.element.getElement('.previous').addClass('SSDisplayNone');
    }
    else
    {
      this.element.getElement('.previous').removeClass('SSDisplayNone');
    }
    
    if(this.currentPage() == (this.numPages()-1))
    {
      this.element.getElement('.next').addClass('SSDisplayNone');
    }
    else
    {
      this.element.getElement('.next').removeClass('SSDisplayNone');
    }
  },
  
  
  setPerPage: function(perpage)
  {
    this.__perpage = perpage;
  },
  
  
  perPage: function()
  {
    return this.__perpage;
  },
  
  
  lowerBound: function()
  {
    return this.currentPage() * this.perPage();
  },
  
  
  upperBound: function()
  {
    return this.lowerBound() + this.perPage();
  },
  
  
  setListView: function(newListView)
  {
    this.__listView = newListView;
  },
  
  
  listView: function()
  {
    return this.__listView;
  },
  
  
  setInterfaceInitialized: function(val)
  {
    this.__interfaceInitialized = val;
  },
  
  
  interfaceInitialized: function()
  {
    return this.__interfaceInitialized;
  },
  
  
  addPages: function(startIndex, n)
  {
    for(var i = 0, j=startIndex; i <= n; i++, j++)
    {
      var link = new Element('a');
      link.set('text', j);
      var newPage = new Element('span', {
        'class': 'page'
      });
      var divider = new Element('span');
      divider.set('text', '|');
      
      newPage.grab(link);
      newPage.inject(this.element.getElements('span').getLast(), 'before');
      divider.inject(newPage, 'after');
    }
  },
  
  
  numPages: function()
  {
    if(this.listView()) return (this.listView().count() / this.perPage()).ceil();
    return 1;
  },
  
  
  attachEvents: function()
  {
    this.element.getElement('.previous').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if(this.currentPage() > 0) this.setCurrentPage(this.currentPage()-1);
    }.bind(this));
    
    this.element.getElement('.next').addEvent('click', function(_evt) {
      var evt = new Event(_evt);
      if((this.currentPage()+1) < this.numPages()) this.setCurrentPage(this.currentPage()+1);
    }.bind(this));
  },
  
  
  initializeInterface: function()
  {
    // initialize the page control
    var count = this.listView().count();
    var numPages = (count / this.perPage()).ceil();
    var remainder = count % this.perPage();
    
    if(numPages > this.element.getElements('.page').length)
    {
      var curCount = this.element.getElements('.page').length;
      this.addPages(curCount+1, numPages-curCount);
    }
    
    this.element.getElements('.page').each(function(x) {
      var idx = this.element.getElements('.page').indexOf(x);
      
      // hide page that beyond the numbe available
      if(idx >= numPages)
      {
        x.addClass('SSDisplayNone');
        if(x.getNext()) x.getNext().addClass('SSDisplayNone');
      }
      else
      {
        x.removeClass('SSDisplayNone');
        x.getNext().removeClass('SSDisplayNone');
        // set up the click event
        x.removeEvents('click');
        x.addEvent('click', function(_evt) {
          var evt = new Event(_evt);
          this.setCurrentPage(idx);
        }.bind(this));
      }
    }.bind(this));
    
    this.updatePreviousAndNext();
    
    // check if no visible page is selected (this would happen from a deletion), if not select the last page in the list
    var currentPage = this.element.getElement('.SSActive');
    if(currentPage.hasClass('SSDisplayNone'))
    {
      this.setCurrentPage(numPages-1);
    }
  },
  
  
  show: function()
  {
    this.element.removeClass('SSDisplayNone');
  },
  
  
  hide: function()
  {
    this.element.addClass('SSDisplayNone');
  }

});