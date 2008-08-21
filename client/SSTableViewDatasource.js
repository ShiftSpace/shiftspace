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
    data: {},
    dataKey: '',
    dataUpdateKey: '',
    dataProviderURL: '',
    dataUpdateURL: '',
    dataNormalizer: null
  },
  

  initialize: function(options)
  {
    console.log('SSTableViewDatasource instantiated.');
    this.setOptions(options);
    
    // set the options
    this.setProperties({});
    this.setUpdateProperties({});
    
    this.setData(options.data);
    
    this.setDataKey(this.options.dataKey)
    this.setDataUpdateKey(this.options.dataUpdateKey);
    
    this.setDataProviderURL(this.options.dataProviderURL);
    this.setDataUpdateURL(this.options.dataUpdateURL);
    
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
  
  
  setDataUpdateKey: function(key)
  {
    this.__dataUpdateKey__ = key
  },
  
  
  dataUpdateKey: function()
  {
    return this.__dataUpdateKey__;
  },
  
  
  updateRowColumn: function(rowIndex, columnName, value)
  {
    console.log('SSTableViewDatasource updateRowColumn');
    // make an update call to the data source
    if(this.dataUpdateURL())
    {
      console.log('we have an update url ' + rowIndex + ", " + columnName + " : " + value);
      
      var params = {};
      var updateKey = this.dataUpdateKey();
      
      params[updateKey] = this.data()[rowIndex][updateKey];
      params[columnName] = value;
      
      console.log(params);
      
      // make an update request
      new Request({
        url: this.dataUpdateURL(),
        data: params,
        method: 'post',
        onComplete: function(responseText, responseXML)
        {
          this.fireEvent('SSTabViewDatasourceDataUpdate', this);
        },
        onFailure: function()
        {
          console.error('SSTableViewDatasource update attempt failed');
        }
      }).send();
    }
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
  
  
  setDataUpdateURL: function(url)
  {
    this.__dataUpdateURL__ = url;
  },
  
  
  dataUpdateURL: function()
  {
    return this.__dataUpdateURL__;
  },
  
  
  setProperties: function(props)
  {
    this.__properties__ = props;
  },
  
  
  properties: function()
  {
    return this.__properties__;
  },
  
  
  setUpdateProperties: function(properties)
  {
    this.__updateProperties__ = properties;
  },
  
  
  updateProperties: function()
  {
    return this.__updateProperties__;
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
        sortByColumn: column,
        sortByDirection: direction
      }
    ));
  },

  
  fetch: function(properties)
  {    
    if(this.dataProviderURL())
    {
      new Request({
        url: this.dataProviderURL(),
        method: 'post',
        data: $merge(this.properties(), properties),
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
    else
    {
      this.fireEvent('onload');
    }
  }

});

SSTableViewDatasource.DESCENDING = 0;
SSTableViewDatasource.ASCENDING = 1;
