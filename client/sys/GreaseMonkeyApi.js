// ==Builder==
// @required
// ==/Builder==

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
    SSLog('add style', SSLogForce);
    var style = document.createStyleSheet();
    style.cssText = css;
  }
}


function GM_getValue(key, defaultValue) 
{
  var value = localStorage.getItem(key);
  return (value !== null) ? value : defaultValue;
}


function GM_setValue(key, value) 
{
  localStorage.setItem(key, value);
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

  var url = details.url;

  if(url)
  {
    options.url = url;
  }
  
  if(details.data)
  {
    options.data = details.data;
  }
  return (new Request(options).send());
}

var unsafeWindow = window;
