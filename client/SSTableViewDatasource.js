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
  
  Implements: [Events, Options],
  

  options: 
  {
    dataKey: 'shifts',
    dataProviderURL: 'http://metatron.shiftspace.org/api/shiftspace.php?method=shift.query',
    dataNormalizer: null
  },
  

  initialize: function(options)
  {
    console.log('SSTableViewDatasource instantiated.');
    this.setOptions(options);
    
    // set the options
    this.setDataKey(this.options.dataKey)
    this.setDataProviderURL(this.options.dataProviderURL);
    this.setDataNormalizer(this.options.dataNormalizer);
  },
  
  
  setData: function(newData)
  {
    this.__data__ = newData;
  },
  
  
  data: function()
  {
    return this.__data__;
  },
  
  
  setDataKey: function(key)
  {
    this.__dataKey__ = key
  },
  
  
  dataKey: function()
  {
    return this.__dataKey__;
  },
  
  
  setDataNormalizer: function(normalizer)
  {
    if(normalizer && normalizer.normalize)
    {
      this.__dataNormalizer__ = normalizer;      
    }
  },
  
  
  dataNormalizer: function()
  {
    return this.__dataNormalizer__;
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
    return this.data()[rowIndex][column];
  },
  

  sortByColumn: function(column, direction)
  {
    console.log('sort by column ' + column + ', direction ' + direction);
    this.fetch($merge(
      this.properties(), 
      {
        sortBy:{column:column, direction:direction}
      }
    ));
  },

  
  fetch: function(properties)
  {
    var testhref = {href:'http://www.google.com/'};
    new Request({
      url: this.dataProviderURL(),
      method: 'post',
      data: testhref,
      onComplete: function(responseText, responseXML)
      {
        var data = JSON.decode(responseText)[this.dataKey()];

        if(this.dataNormalizer())
        {
          data = this.dataNormalizer().normalize(data);
        }

        this.setData(data);
        this.fireEvent('onload');

      }.bind(this),
      onFailure: function(response)
      {
        console.error('Oops: ' + response);
      }.bind(this)
    }).send();
  }

});

SSTableViewDatasource.DESCENDING = 0;
SSTableViewDatasource.ASCENDING = 1;
