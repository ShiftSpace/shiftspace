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
  //console.log('GM_getValue, ' + key);
  var xhr = new XHR({
    'async': false,
    onSuccess: function(r)
    {
      //console.log(r);
    },
    onFailure: function(r)
    {
      //console.log(r);
    }
  });
  xhr.send('../shiftspace.php?method=sandbox.getvalue',
           'key=' + encodeURIComponent(key) + '&' +
           'default=' + encodeURIComponent(defaultValue));
  //if(key == 'server') console.log('==================================== ' + xhr.response.text);
  return xhr.response.text;
}

function GM_setValue(key, value) {
  var xhr = new XHR({
    'async': false,
    onSuccess: function(r)
    {
      //console.log(r);
    },
    onFailure: function(r)
    {
      //console.log(r);
    }
  });
  xhr.send('../shiftspace.php?method=sandbox.setvalue',
           'key=' + encodeURIComponent(key) + '&' +
           'value=' + encodeURIComponent(value));
  return xhr.response.text;
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
  //console.log('GM_xmlhttpRequest');
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
  
  if (location.hostname == details.url.match(/http:\/\/([^\/]+)/)[1]) {
    var url = details.url;
  } else {
    var url = '../shiftspace.php?method=sandbox.proxy&url=' +
              encodeURIComponent(details.url);
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
  xhr.send(url, details.data);
}

var unsafeWindow = window;
