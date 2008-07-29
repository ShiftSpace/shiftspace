/*
  Class: SSTableViewDatasource
    Properties passed to the data providing url should send a json object with the following structure
    
    (start code)
    {
      ids: '*',
      users: ['mushon', 'dphiffer'],
      hrefs: '*',
      created: '*',
      summary: '*'
    }
    (end)
*/
var SSTableViewDatasource = new Class({
  
  Implements: Events,

  initialize: function()
  {
    console.log('SSTableViewDatasource instantiated.');
    // set the default data provider URL
    this.setDataProviderURL('http://metatron.shiftspace.org/shiftspace.php?method=shift.query');
  },
  
  
  setData: function(newData)
  {
    this.__data__ = newData;
  },
  
  
  data: function()
  {
    return this.__data__;
  },
  
  
  setDataProviderURL: function(url)
  {
    this.__url__ = url;
  },
  
  
  dataProviderURL: function()
  {
    return this.__url__;
  },
  
  
  setProperties: function(props)
  {
    this.__properties__ = props;
  },
  
  
  properties: function()
  {
    return this.__properties__;
  },


  rowCount: function()
  {
    return this.data().length;
  },
  
  
  rowForIndex: function(rowIndex)
  {
    return this.data()[rowIndex];
  },

  
  itemForRowIndexColumn: function(rowIndex, column)
  {
    this.data()[rowIndex][column];
  },
  

  sortByColumn: function(column, direction)
  {
    this.fetch($merge(
      this.properties(), 
      {
        sortBy:{column:column, direction:ascending}
      }
    ));
  },

  
  fetch: function(properties)
  {
    var testhref = {href:'http://google.com'};
    new Request({
      url: this.dataProviderURL(),
      data: testhref,
      onComplete: function(responseText, responseXML)
      {
        this.setData(Json.decode(responseText));
        this.fireEvent('onload');
      },
      onFailure: function(response)
      {
        console.error('Oops: ' + response);
      }
    }).send()
  }

});