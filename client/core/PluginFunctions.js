// ==Builder==
// @optional
// @name              PluginFunctions
// @package           Core
// ==/Builder==

var plugins = {};

// NOTE: will replace with ResourceManager in 0.5 - David
plugins.attempt = function(options)
{
  //SSLog('attempting to call plugin');
  var args = ($type(options.args) == 'array' && options.args) || [options.args];
  
  function execute()
  {
    SSLog('executing plugin ' + options.name + ' call ' + options.method, SSLogPlugin);
    SSLog('plugin installed ' + plugins[options.name], SSLogPlugin);
    if(options.method)
    {
      plugins[options.name][options.method].apply(plugins[options.name], args);
      if(options.callback && $type(options.callback) == 'function') options.callback();
    }
  };

  // load then call
  if(!plugins[options.name])
  {
    SSLog('Load plugin ' + options.name, SSLogPlugin);
    // Listen for the real load event
    SSAddEvent('onPluginLoad', function(plugin) {
      SSLog(options.name + ' plugin loaded ', SSLogPlugin);
      if(plugin.attributes.name == options.name) execute();
    });
    // Loading the plugin
    SSLoadPlugin(options.name, null);
  }
  else
  {
    execute();
  }
};

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
          ShiftSpace.__externals.evaluate(rx.responseText);
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
              ShiftSpace.__externals.evaluate(rx.responseText);
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

// ==================
// = Plugin Support =
// ==================

/*
  Function: SSGetPlugin
    Returns a plugin object.

  Parameters:
    pluginName - a name representing a plugin.

  Returns:
    A plugin object.
*/
function SSGetPlugin(pluginName)
{
  return plugins[pluginName];
}

/*
  Function: SSGetPluginType
    Returns the plugin type.

  Parameters:
    pluginName - the plugin name as a string.

  See Also:
    Plugin.js
*/
function SSGetPluginType(pluginName)
{
  SSLog('SSGetPluginType');
  if(__pluginsData[pluginName] && __pluginsData[pluginName].type)
  {
    return __pluginsData[pluginName].type;
  }
  else
  {
    SSLog('(1) If this is at ShiftSpace load time: if you wish to include plugin data included at shift query time for the ' + pluginName + ' plugin you must include a shift.query.php file in your plugin folder.  Please refer to the Comments version of this file for reference. (2) You need to define plugin type, refer to Plugin.js. kisses, The ShiftSpace Core Robot', SSLogWarning);
    return null;
  }
}

/*
  Function: SSPlugInMenuIconForShift
    Returns the icon for a particular shift if the plugin is menu based.

  Parameters:
    pluginName - plugin name as string.
    shiftId - a shift id.
    callback - a function callback because the plugin may not be loaded yet.

  Returns:
    A CSS style with a background image style that will point to the icon image.
*/
function SSPlugInMenuIconForShift(pluginName, shiftId, callback)
{
  var plugin = SSGetPlugin(pluginName);
  // if the plugin isn't loaded yet, use the initial plugins data
  if(!plugin)
  {
    var shiftData = __pluginsData[pluginName]['data'][shiftId];
    if(__pluginsData[pluginName]['data'][shiftId])
    {
      return shiftData['icon'];
    }
    else
    {
      return __pluginsData[pluginName]['defaultIcon'];
    }
  }
  else
  {
    plugin.menuIconForShift(shiftId, callback);
    return null;
  }
}

function SSPluginForName(name)
{
  var plugin = plugin[name];
  
  if(!plugin)
  {
    throw SSPluginDoesNotExistError(new Error());
  }
  else
  {
    return plugin;
  }
}
