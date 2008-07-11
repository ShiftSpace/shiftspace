Console.ContentView = new Class({
  initialize: function()
  {
    
  },
  
  refresh: function()
  {
    
  }
});


Console.TableView = Console.ContentView.extend({
  intiialize: function(columns)
  {
    
  },
  
  setDataSource: function(dataSource)
  {
    if(dataSource instanceof Console.DataSource)
    {
      this.dataSource = dataSource;
    }
  },
  
  updateData: function(options)
  {
    this.dataSource.update();
  },
  
  refresh: function()
  {
    // re-render the table
  }
});


Console.TabView = Console.ContentView.extend({
  initialize: function()
  {
    
  },
  
  addTab: function(tabName)
  {
    
  },
  
  selectTab: function(tabName)
  {
    
  },
  
  setContentViewForTab: function(tabName, contentView)
  {
    
  }
});


Console.SubTabView = new Class({
  initialize: function()
  {
    
  },
  
  addSubTab: function(subTabName)
  {
    
  }
});


Console.DataSource = new Class({
  
});