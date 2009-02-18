// ==Builder==
// @optional
// @name              RemoteFunctions
// @package           Core
// ==/Builder==

/*
Function: SSServerCall
  Sends a request to the server.

Parameters:
  method - Which method to call on the server (string)
  parameters - Values passed with the call (object)
  callback - (optional) A function to execute upon completion
*/
function SSServerCall(method, parameters, _callback) 
{
  var callback = _callback;
  var url = server + 'server/?method=' + method;
  
  SSLog('serverCall: ' + url, SSLogServerCall);
  
  var data = '';

  for (var key in parameters) 
  {
    if (data != '') 
    {
      data += '&';
    }
    data += key + '=' + encodeURIComponent(parameters[key]);
  }

  if(typeof installedPlugins != 'undefined')
  {
    var plugins = new Hash(installedPlugins);
    url += '&plugins=' + plugins.getKeys().join(',');
  }

  var now = new Date();
  url += '&cache=' + now.getTime();

  var req = {
    method: 'POST',
    url: url,
    data: data,
    onload: function(_rx) 
    {
      SSLog('done!');
      var rx = _rx;
      SSLog('servercall returned', SSLogServerCall);

      if ($type(callback) == 'function') 
      {
        try
        {
          SSLog('trying ' + url);
          SSLog(rx.responseText);
          SSLog(eval('(' + rx.responseText + ')'));
          SSLog('tried ' + url);
          var theJson = JSON.decode(rx.responseText);
          SSLog('success!');
        }
        catch(exc)
        {
          SSLog('Server call exception: ' + SSDescribeException(exc), SSLogServerCall);
        }
        callback(theJson);
      }
      else
      {
        SSLog('callback is not a function', SSLogServerCall);
      }
    },
    onerror: function(err)  
    {
      SSLog(err);
    }
  };

  // Firefox doesn't work without this
  // and the existence of this breaks Safari
  if(!window.webkit)
  {
    req.headers = {
      'Content-type': 'application/x-www-form-urlencoded'
    };
  }

  // we need to have error handling right here
  GM_xmlhttpRequest(req);
}

function SSCollectionsCall(options)
{
  var url = server + 'server/index.php';
  
  var req = {
    method: 'POST',
    url: url,
    data: $H({method: "collections", desc:JSON.encode(options.desc)}).toQueryString(),
    onload: function(_rx) 
    {
      if(options.onComplete)
      {
        options.onComplete(_rx.responseText);
      }
    },
    onerror: function(err)  
    {
      if(options.onFailure)
      {
        options.onFailure(_rx.responseText);
      }
    }
  };

  // Firefox doesn't work without this
  // and the existence of this breaks Safari
  if(!window.webkit)
  {
    req.headers = {
      'Content-type': 'application/x-www-form-urlencoded'
    };
  }
  
  // we need to have error handling right here
  GM_xmlhttpRequest(req);
}

/*
Function: SSLoadStyle
  Loads a CSS file, processes it to make URLs absolute, then appends it as a
  STYLE element in the page HEAD.

Parameters:
  url - The URL of the CSS file to load
  callback - A custom function to handle css text if you don't want to use GM_addStyle
  spaceCallback - A callback function for spaces that want to use GM_addStyle but need to be notified of CSS load.
*/
function SSLoadStyle(url, callback, frame) 
{
  // TODO: check to see if the domain is different, if so don't mess with the url - David
  // TODO: get rid of frame, change to context so we can use this function for iframe's as well
  var dir = url.split('/');
  dir.pop();
  dir = dir.join('/');
  if (dir.substr(0, 7) != 'http://') {
    dir = server + dir;
  }

  //SSLog('loadStyle: ' + url);
  SSLoadFile(url, function(rx) {
    //SSLog(')))))))))))))))))))))))))))))))))))))))))))))))))) ' + url);
    var css = rx.responseText;
    // this needs to be smarter, only works on directory specific urls
    css = css.replace(/url\(([^)]+)\)/g, 'url(' + dir + '/$1)');

    // if it's a frame load it into the frame
    if(frame)
    {
      var doc = frame.contentDocument;

      if( doc.getElementsByTagName('head').length != 0 )
      {
        var head = doc.getElementsByTagName('head')[0];
      }
      else
      {
        // In Safari iframes don't get the head element by default - David
        // Mootools-ize body
        $(doc.body);
        var head = new Element( 'head' );
        head.injectBefore( doc.body );
      }

      var style = doc.createElement('style');
      style.setAttribute('type', 'text/css');
      style.appendChild(doc.createTextNode(css)); // You can not use setHTML on style elements in Safari - David
      head.appendChild(style);
    }
    else
    {
      // FIXME: we don't want to rely on this, we can't target iframes - David
      GM_addStyle(css);
    }

    if (typeof callback == 'function')
    {
      callback();
    }

  });
}

/*
Function: SSLoadFile
  Loads a URL and executes a callback with the response

Parameters:
  url - The URL of the target file
  callback - A function to process the file once it's loaded
*/
function SSLoadFile(url, callback)
{
  // If the URL doesn't start with "http://", assume it's on our server
  if (url.substr(0, 7) != 'http://' &&
      url.substr(0, 8) != 'https://') {
    url = server + url;
  }

  //SSLog('loadFile:' + url);

  // Caching is implemented as a rather blunt instrument ...
  if ((typeof cacheFiles != 'undefined') && !cacheFiles) 
  {
    // ... either append the current timestamp to the URL ...
    var now = new Date();
    url += (url.indexOf('?') == -1) ? '?' : '&';
    url += now.getTime();
  } 
  else if((typeof cacheFiles != 'undefined') && cacheFiles)
  {
    SSLog('SSLoadFile, load from cache', SSLogForce);
    // ... or use SSGetValue to retrieve the file's contents
    var cached = SSGetValue('cache.' + url, false, true);

    if (cached) 
    {
      //SSLog('Loading ' + url + ' from cache');
      if (typeof callback == 'function') 
      {
        callback({ responseText: cached });
      }
      return true;
    }
  }

  // Load the URL then execute the callback
  //SSLog('Loading ' + url + ' from network');
  GM_xmlhttpRequest({
    'method': 'GET',
    'url': url,
    'onload': function(response) 
    {
      // Store file contents for later retrieval
      if (typeof cacheFiles != 'undefined' && cacheFiles) 
      {
        cache.push(url);
        SSSetValue('cache', cache);
        SSSetValue('cache.' + url, response.responseText, true);
      }
      if (typeof callback == 'function') 
      {
        callback(response);
      }
    },
    'onerror': function(response) 
    {
      SSLog("failed loadFile call, for file " + url, SSLogError);
      if(errCallback && typeof errCallback == 'function') errCallback(); // FIXME: broken - David
    }
  });

  return true;
}

/*
  Function: SSXmlHttpRequest
    Private version of GM_xmlHttpRequest. Implemented for public use via Space/Shift.xmlhttpRequest.

  Parameters:
    config - same JSON object as used by GM_xmlhttpRequest.
*/
function SSXmlHttpRequest(config) 
{
  GM_xmlhttpRequest(config);
}
