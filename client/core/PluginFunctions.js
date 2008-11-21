// ==Builder==
// @optional
// @name              PluginFunctions
// @package           Core
// ==/Builder==

/*
  Function: SSLoadPlugin
    Loads a plugin

  Parameters:
    plugin - a plugin name as a string.
    callback - a callback function.
*/
function SSLoadPlugin(plugin, callback)
{
  //SSLog('SSLoadPlugin ' + plugin);
  if(plugins[plugin])
  {
    if(callback) callback();
    return;
  }

  if (typeof ShiftSpaceSandBoxMode != 'undefined')
  {
    var url = installedPlugins[plugin] + '?' + new Date().getTime();
    var newSpace = new Asset.javascript(url, {
      id: plugin
    });
  }
  else
  {
    SSLoadFile(installedPlugins[plugin], function(rx) {
      //SSLog(plugin + " Plugin loaded");
      // TODO: The following does not work we need to use the plugin eval
      try
      {
        if(window.webkit)
        {
          ShiftSpace.__externals__.evaluate(rx.responseText);
        }
        else
        {
          eval(rx.responseText, ShiftSpace);
        }
      }
      catch(exc)
      {
        console.error('Error loading ' + plugin + ' Plugin - ' + SSDescribeException(exc));
      }

      if(callback) callback();
    });
  }
}

/*
  Function: SSRegisterPlugin
    Register a plugin.

  Parameters:
    plugin - a plugin object.
*/
function SSRegisterPlugin(plugin)
{
  plugins[plugin.attributes.name] = plugin;

  var pluginDir = installedPlugins[plugin.attributes.name].match(/(.+\/)[^\/]+\.js/)[1];

  // if a css file is defined in the attributes load the style
  if (plugin.attributes.css)
  {
    if (plugin.attributes.css.indexOf('/') == -1)
    {
      var css = pluginDir + plugin.attributes.css;
      plugin.attributes.css = css;
    }
    SSLoadStyle.safeCall(plugin.attributes.css, plugin.onCssLoad.bind(plugin));
  }
  plugin.attributes.dir = pluginDir;

  // Load any includes
  if(plugin.attributes.includes)
  {
    if (typeof ShiftSpaceSandBoxMode != 'undefined')
    {
      plugin.attributes.includes.each(function(include) {
        var url = plugin.attributes.dir + include + '?' + new Date().getTime();
        var newSpace = new Asset.javascript(url, {
          id: include
        });
      });
    }
    else
    {
      var includesTotal = plugin.attributes.includes.length;
      var includeLoadCount = 0;
      //SSLog('Loading includes ' + plugin.attributes.includes);
      plugin.attributes.includes.each(function(include) {
        loadFile.safeCall(plugin.attributes.dir+include, function(rx) {
          includeLoadCount++;
          //SSLog('includeLoadCount ' + includeLoadCount);
          try
          {
            if(window.webkit)
            {
              ShiftSpace.__externals__.evaluate(rx.responseText);
            }
            else
            {
              eval(rx.responseText, plugin);
            }
          }
          catch(exc)
          {
            console.error('Error loading ' + include + ' include for ' + plugin.attributes.name + ' Plugin - ' + SSDescribeException(exc));
          }
          // Notify listeners of plugin load
          if(includeLoadCount == includesTotal) 
          {
            //SSLog('onPluginLoad');
            SSFireEvent('onPluginLoad', plugin);
          }
        }, null);
      });
    }
  }
  else
  {
    // Notify listeners of plugin load
    SSFireEvent('onPluginLoad', plugin);
  }

  // listen for plugin status changes and pass them on
  plugin.addEvent('onPluginStatusChange', function(evt) {
    SSFireEvent('onPluginStatusChange', evt);
  });

  // This exposes each space instance to the console
  if (typeof ShiftSpaceSandBoxMode != 'undefined')
  {
    ShiftSpace[plugin.attributes.name] = plugin;
  }
}