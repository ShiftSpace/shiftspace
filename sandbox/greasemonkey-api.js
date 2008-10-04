function GM_addStyle(css) {
  if (document.getElementsByTagName('head').length != 0) {
    var head = document.getElementsByTagName('head')[0];
  } else {
    var head = new Element('head');
    head.injectBefore($(document.body));
  }
  var style = new Element('style', {
    type: 'text/css'
  });
  style.appendText(css);
  style.injectInside(head);
}

function GM_getValue(key, defaultValue) {
  var xhr = new XHR({
    'async': false
  });
  xhr.send('../shiftspace.php?method=sandbox.getvalue',
           'key=' + encodeURIComponent(key) + '&' +
           'default=' + encodeURIComponent(defaultValue));
  return xhr.transport.responseText;
}

function GM_setValue(key, value) {
  var xhr = new XHR({
    'async': false
  });
  xhr.send('../shiftspace.php?method=sandbox.setvalue',
           'key=' + encodeURIComponent(key) + '&' +
           'value=' + encodeURIComponent(value));
  return xhr.transport.responseText;
}

function GM_log(msg) {
  if (typeof console != 'undefined' && console.log) {
    console.log(msg);
  } else {
    setTimeout(function() {
      throw(msg);
    }, 0);
  }
}

function GM_openInTab() {
  return false;
}

function GM_registerMenuCommand() {
  return false;
}

function GM_xmlhttpRequest(details) {
  var xdomain = false;

  if (typeof details != 'object' ||
      !details.method ||
      !details.url) {
    return false;
  }
  
  var options = {
    'url': details.url,
    'method': details.method,
    'headers': details.headers
  };
  // pass on the requestMethod to the proxy so that it is sent the proper way
  
  if (details.onload) {
    options.onSuccess = function() {
      details.onload(this.transport);
    }
  }
  
  if (details.onreadystatechange) {
    options.onStateChange = function() {
      details.onreadystatechange(this.transport);
    }
  }
  
  if (details.onerror) {
    options.onFailure = function() {
      details.onerror(this.transport);
    }
  } else if (details.onload) {
    options.onFailure = function() {
      details.onload(this.transport);
    }
  }
  
  // check that it's not cross domain
  if (location.hostname == details.url.match(/http:\/\/([^\/]+)/)[1]) 
  {
    var url = details.url;
  } 
  else 
  {
    xdomain = true;
    var url = '../shiftspace.php?method=sandbox.proxy&url=' + encodeURIComponent(details.url) + '&parameters=' + encodeURIComponent(Json.toString(details.data));
  }
  
  var xhr = new XHR(options, {
    onSuccess: function(r)
    {
      //console.log(r);
    },
    onFailure: function(r)
    {
      //console.log(r);
    }
  });
  
  // do something different for xdomain requests
  (!xdomain) ? xhr.send(url, details.data) : xhr.send(url);
}

var unsafeWindow = window;
