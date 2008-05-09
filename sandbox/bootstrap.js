var __server__ = 'http://localhost/~davidnolen/shiftspace-0.11/';

function focusShift() {};

function registerSpace(instance) {
  var spaceName = instance.attributes.name;
  var spaceDir = 'spaces/' + spaceName + '/';

  if (!instance.attributes.icon) 
  {
    var icon = installed[spaceName].replace('.js', '.png');
    instance.attributes.icon = icon;
  } else if (instance.attributes.icon.indexOf('/') == -1) 
  {
    var icon = spaceDir + instance.attributes.icon;
    instance.attributes.icon = icon;
  }

  // if a css file is defined in the attributes load the style
  if (instance.attributes.css) 
  {
    if (instance.attributes.css.indexOf('/') == -1) 
    {
      var css = spaceDir + instance.attributes.css;
      instance.attributes.css = css;
    }
    loadStyle(instance.attributes.css, instance.onCssLoad.bind(instance));
  }

  // This exposes each space instance to the console
  ShiftSpace[instance.attributes.name + 'Space'] = instance;
}

function loadFile(url, callback) {
  // If the URL doesn't start with "http://", assume it's on our server
  if (url.substr(0, 7) != 'http://' &&
      url.substr(0, 8) != 'https://') 
  {
    url = __server__ + url;
  }

  // Load the URL then execute the callback
  //log('Loading ' + url + ' from network');
  GM_xmlhttpRequest({
    'method': 'GET',
    'url': url,
    'onload': function(response) 
    {
      if (typeof callback == 'function') 
      {
        callback(response);
      }
    }
  });
  return true;
}

function loadStyle(url, callback, frame) {
  // TODO: check to see if the domain is different, if so don't mess with the url - David
  var dir = url.split('/');
  dir.pop();
  dir = dir.join('/');
  if (dir.substr(0, 7) != 'http://') {
    dir = __server__ + dir;
  }

  loadFile(url, function(rx) {
    var css = rx.responseText;
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

      var style = new Element('style', {
        type: 'text/css'
      });

      style.appendText(css); // You can not use setHTML on style elements in Safari - David
      style.injectInside(head);
    }
    else
    {
      GM_addStyle(css);
    }
    
    if (typeof callback == 'function') 
    {
      callback();
    } 

  });
}