function GM_addStyle(css) 
{
  if (document.getElementsByTagName('head').length != 0) 
  {
    var head = document.getElementsByTagName('head')[0];
  } 
  else 
  {
    var head = new Element('head');
    head.injectBefore($(document.body));
  }
  
  if(!Browser.Engine.trident)
  {
    var style = new Element('style', {
      type: 'text/css'
    });
    style.appendText(css);
    style.injectInside(head);
  }
  else
  {
    var style = document.createStyleSheet();
    style.cssText = css;
  }
}


function GM_getValue(key, defaultValue) 
{

  var request = new Request({
    url: '../shiftspace.php?method=sandbox.getvalue',
    async: false,
    method: 'post',
    data: 
    { 
      key: key, 
      'default': defaultValue
    }
  }).send();
  
  return request.response.text;
}


function GM_setValue(key, value) 
{
  var request = new Request({
    url: '../shiftspace.php?method=sandbox.setvalue',
    async: false,
    method: 'post',
    data: {key: key, value: value}
  }).send();
           
  return request.response.text;
}


function GM_log(msg) 
{
  if (typeof console != 'undefined' && console.log) 
  {
    console.log(msg);
  } 
  else 
  {
    setTimeout(function() {
      throw(msg);
    }, 0);
  }
}


function GM_openInTab() 
{
  return false;
}


function GM_registerMenuCommand() 
{
  return false;
}


function GM_xmlhttpRequest(details) 
{
  //console.log('GM_xmlhttpRequest');
  if (typeof details != 'object' ||
      !details.method ||
      !details.url) 
  {
    return false;
  }
  
  var options = {
    'url': details.url,
    'method': details.method,
    'headers': details.headers
  };
  
  if (details.onload) 
  {
    options.onSuccess = function() 
    {
      details.onload({responseText: this.response.text, responseXml: this.response.xml});
    }
  }
  
  if (details.onreadystatechange) 
  {
    options.onStateChange = function() 
    {
      details.onreadystatechange({responseText: this.response.text, responseXml: this.response.xml});
    }
  }
  
  if (details.onerror) 
  {
    options.onFailure = function() 
    {
      details.onerror({responseText: this.response.text, responseXml: this.response.xml});
    }
  } 
  else if (details.onload) 
  {
    options.onFailure = function() 
    {
      details.onload({responseText: this.response.text, responseXml: this.response.xml});
    }
  }
  
  if (location.hostname == details.url.match(/http:\/\/([^\/]+)/)[1]) 
  {
    var url = details.url;
  } 
  else 
  {
    var url = '../shiftspace.php?method=sandbox.proxy&url=' + encodeURIComponent(details.url);
  }
  
  if(url)
  {
    options.url = url;
  }
  
  if(details.data)
  {
    options.data = details.data;
  }
  
  new Request(options).send();
}

var unsafeWindow = window;
