// ==Builder==
// @optional
// @name              RemoteFunctions
// @package           Core
// ==/Builder==

var __sspendingRequest = 0;
var __ssshowLoader = false;
var __ssloaderListeners = [];

function SSAddLoaderListener(obj)
{
  __ssloaderListeners.push(obj);
}

function SSIncPendingRequests()
{
  __sspendingRequest = __sspendingRequest + 1;
  if(!__ssshowLoader)
  {
    __ssloaderListeners.each(function(listener) {
      if(listener.showLoader) listener.showLoader();
    });
    __ssshowLoader = true;
  }
}

function SSDecPendingRequests()
{
  if(__sspendingRequest > 0) __sspendingRequest = __sspendingRequest - 1;
  if(__sspendingRequest == 0)
  {
    __ssloaderListeners.each(function(listener) {
      if(listener.hideLoader) listener.hideLoader();
    });
    __ssshowLoader = false;
  }
}

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
  SSIncPendingRequests();

  var callback = _callback;
  var url = SSInfo().server + 'server/?method=' + method;
  
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
      SSDecPendingRequests();
      
      var rx = _rx;

      if ($type(callback) == 'function') 
      {
        try
        {
          var theJson = JSON.decode(rx.responseText);
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
      SSDecPendingRequests();
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
  SSIncPendingRequests();
  var url = SSInfo().server + 'server/index.php';
  
  var req = {
    method: 'POST',
    url: url,
    data: $H({method: "collections", desc:JSON.encode(options.desc)}).toQueryString(),
    onload: function(_rx) 
    {
      SSDecPendingRequests();
      if(options.onComplete)
      {
        options.onComplete(_rx.responseText);
      }
    },
    onerror: function(err)  
    {
      SSDecPendingRequests();
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
function SSLoadStyle(url, frame) 
{
  var dir = url.split('/');
  dir.pop();
  dir = dir.join('/');
  if (dir.substr(0, 7) != 'http://') 
  {
    dir = SSInfo().server + dir;
  }

  var p = SSLoadFile(url);
  return SSAddStyle(p, {rewriteUrls: dir, frame: frame});
}

var SSAddStyle = function(css, options)
{
  // this needs to be smarter, only works on directory specific urls
  if(options.rewriteUrls) css = css.replace(/url\(([^)]+)\)/g, 'url(' + options.rewriteUrls + '/$1)');

  // if it's a frame load it into the frame
  if(options.frame)
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
    GM_addStyle(css);
  }
}.asPromise();

/*
Function: SSLoadFile
  Loads a URL and executes a callback with the response

Parameters:
  url - The URL of the target file
  callback - A function to process the file once it's loaded
*/
var SSLoadFile = function(url)
{
  // If the URL doesn't start with "http://", assume it's on our server
  if (url.substr(0, 7) != 'http://' &&
      url.substr(0, 8) != 'https://') {
    url = SSInfo().server + url;
  }

  // Load the URL then execute the callback
  return new Request({
    method: 'GET',
    url: url,
    bare: true
  });
}.asPromise();

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
