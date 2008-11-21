// ==Builder==
// @optional
// @name              RemoteFunctions
// @package           Core
// ==/Builder==

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