// ==Builder==
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
Function: SSLoadStyle
  Loads a CSS file, processes it to make URLs absolute, then appends it as a
  STYLE element in the page HEAD.

Parameters:
  url - The URL of the CSS file to load
  frame - The frame where the css will be loaded.
*/
function SSLoadStyle(url, frame) 
{
  var dir = url.split('/');
  dir.pop();
  dir = dir.join('/');
  if (dir.substr(0, 7) != 'http://') dir = SSInfo().mediaPath + dir;
  var p = SSLoadFile(url);
  return SSAddStyle(p, {rewriteUrls: dir, frame: frame});
}

var SSAddStyle = function(css, options)
{
  if(!css) return null;
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
    url = String.urlJoin(SSInfo().mediaPath, url);
  }
  try
  {
    SSLog("LOAD FILE:", url, SSLogRequest);
    // Load the URL then execute the callback
    return new Request({
      method: 'GET',
      url: url,
      bare: true
    });
  }
  catch (err)
  {
    return null;
  }
}.asPromise();