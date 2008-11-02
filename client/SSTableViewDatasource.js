// ==Builder==
// @optional
// @name              SSTableViewDatasource
// @package           ShiftSpaceCore
// ==/Builder==

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
    data: [],
    dataKey: null,
    dataUpdateKey: null,
    dataProviderURL: null,
    dataUpdateURL: null,
    dataNormalizer: null,
    requiredProperties: []
  },


  initialize: function(options)
  {
    SSLog('SSTableViewDatasource instantiated.');
    this.setOptions(options);

    // set the options
    this.setProperties($H());
    this.setRequiredProperties(this.options.requiredProperties);
    this.setUpdateProperties({});

    this.setData(options.data);

    this.setDataKey(this.options.dataKey);
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


  hasData: function()
  {
    return (this.data() && this.data.length > 0);
  },


  setDataKey: function(key)
  {
    this.__dataKey__ = key;
  },


  dataKey: function()
  {
    return this.__dataKey__;
  },


  setDataUpdateKey: function(key)
  {
    this.__dataUpdateKey__ = key;
  },


  dataUpdateKey: function()
  {
    return this.__dataUpdateKey__;
  },


  updateRowColumn: function(rowIndex, columnName, value)
  {
    SSLog('SSTableViewDatasource updateRowColumn');
    // make an update call to the data source
    if(this.dataUpdateURL())
    {
      SSLog('we have an update url ' + rowIndex + ", " + columnName + " : " + value);

      var params = {};
      var updateKey = this.dataUpdateKey();

      params[updateKey] = this.data()[rowIndex][updateKey];
      params[columnName] = value;

      SSLog(params);

      // make an update request
      // FIXME: need to update this to do something else - David
      new Request({
        url: this.dataUpdateURL(),
        data: params,
        method: 'post',
        onComplete: function(responseText, responseXML)
        {
          // update the local copy of the data
          this.data()[rowIndex][columnName] = value;
          this.fireEvent('SSTabViewDatasourceDataUpdate', this);
        }.bind(this),
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


  setProperty: function(key, value)
  {
    // set the property
    this.properties().set(key, value);
    // refetch data
    this.fetch();
  },


  setProperties: function(_props)
  {
    var props = (!_props && $H()) || (_props instanceof Hash && _props) || $H(_props);
    this.__properties__ = props;
  },


  properties: function()
  {
    return this.__properties__;
  },


  setRequiredProperties: function(properties)
  {
    this.__requiredProperties__ = properties;
  },


  requiredProperties: function()
  {
    return this.__requiredProperties__;
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
    return (this.data() && this.data().length) || 0;
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
    SSLog('sort by column ' + column + ', direction ' + direction);
    this.fetch({
      sortByColumn: column,
      sortByDirection: direction
    });
  },


  isMissingProperties: function(properties)
  {
    // check for missing properties
    var missingProperties = [];
    if(this.requiredProperties().length > 0)
    {
      missingProperties = this.requiredProperties().filter(function(required) {
        return (properties.get(required) == null);
      });
    }

    return (missingProperties.length > 0);
  },


  valueForRowColumn: function(rowIndex, columnName)
  {
    return this.data()[rowIndex][columnName];
  },


  updateData: function(data)
  {
    if(this.dataNormalizer())
    {
      data = this.dataNormalizer().normalize(data);
    }
    this.setData(data);
  },


  fetch: function(_properties)
  {
    SSLog('data source fetch');

    // make sure the properties are a Hash
    var properties = (!_properties && $H()) || (_properties instanceof Hash && _properties) || $H(_properties);
    // combine them with the existing properties, careful not to modify this.properties()
    var allProperties = $H(this.properties().getClean()).combine(properties);
    var isMissingProperties = this.isMissingProperties(allProperties);
    
    // check for missing properties
    if( !isMissingProperties && this.dataProviderURL())
    {
      SSLog('>>>>>>>>>>>>>>>>>>>>>>>>>> SSTableViewDatasource fetch');
      // if actually running in ShiftSpace
      serverCall(this.dataProviderURL(), allProperties.getClean(), function(json) {
        this.updateData(json[this.dataKey()]);
        this.fireEvent('onload');
      }.bind(this));
    }
    else
    {
      // if we're missing properties empty out data
      if(isMissingProperties)
      {
        this.setData([]);
      }

      this.fireEvent('onload');
    }
  }

});

SSTableViewDatasource.DESCENDING = 0;
SSTableViewDatasource.ASCENDING = 1;
