// ==Builder==
// @optional
// @package           ShiftSpaceCore
// ==/Builder==

var SSPageControl = new Class({

  Implements: [Events, Options],

  name: "SSPageControl",
  

  defaults: {
    listView: null,
    perpage: 25
  }, 


  initialize: function(el, options)
  {
    this.setOptions(this.defaults, options);
    this.element = el;
    
    this.setInterfaceInitialized(false);
    
    if(options.listView)
    {
      this.setListView(options.listView);
      
      // set a filter
      this.listView().setFilter(this.filterItem.bind(this));

      if(options.listView.dataIsReady())
      {
        this.initalizeInterface();
      }
      this.listView().addEvent('onReloadData', this.initalizeInterface.bind(this));
    }
  },
  
  
  filterItem: function(x, index)
  {
    return (index >= this.lowerBound()) || (index <= this.upperBound());
  },
  
  
  setCurrentPage: function(page)
  {
    this.__currentPage = page;
    this.listView().refresh(true);
  },
  
  
  currentPage: function()
  {
    return this.__currentPage;
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
  
  
  initalizeInterface: function()
  {
    // initialize the page control
    var count = this.listView().count();
    var numPages = count % this.perPage();
    
    this.element.getElements('.page').each(function(x) {
      var idx = this.element.getElements('.page').indexOf(x);
      
      // hide page that beyond the numbe available
      if(idx > numPages)
      {
        x.addClass('SSDisplayNone');
        if(x.nextSibling()) x.nextSibling().addClass('SSDisplayNone');
      } 
      else
      {
        // set up the click event
        x.removeEvents('click');
        x.addEvent('click', function(_evt) {
          var evt = new Event(_evt);
          x.element.getElements('.page').removeClass('SSActive');
          x.addClass('SSActive');
          this.setCurrentPage(idx);
        }.bind(this));
      }
    });
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