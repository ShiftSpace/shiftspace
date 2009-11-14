// ==Builder==
// @name              LocalizedStringsSupport
// @package           Internationalization
// ==/Builder==

var __sslang = null;
var __localizedStrings = {'global': {}};

/*
  Function: SSLocalizedStringSupport
    Function for checked whether localization support is availalbe.
  
  Returns:
    A boolean.
*/
function SSLocalizedStringSupport()
{
  return (typeof __sslang != 'undefined');
}

/*
  Function: SSLocalizedString
    Returns the localized version of a string based on the
    current dictionary.
    
  Parameters:
    string - a string.
    table - which localized string table to look at, for a example a table from a space.
    lang - required if looking up localization strings from spaces.
    
  Returns:
    A string.
*/
var SSLocalizedString = function(string, lang, table)
{
  table = table || 'global';
  if(SSLocalizedStringSupport())
  {
    // check global table
    var r = $get(__localizedStrings, table, string);
    if(r) return r;
    // check the spaces
    for(t in __localizedStrings)
    {
      if(t != table)
      {
        r = $get(__localizedStrings, t, lang, string);
        if(r) return r;
      }
    }
    // no match just return string
    return string;
  }
  else
  {
    return string;
  }
}.decorate(Function.memoize);

/*
  Function: SSLoadLocalizedStrings
    Load the localization string file located in $ROOT/client/localizedStrings/langcode.json.
    
  Parameters:
    lang - il8n code.
    context - the context to update.
*/
function SSLoadLocalizedStrings(lang, context)
{
  context = context || window;
  var p = SSLoadFile("client/localizedStrings/"+lang+".json");
  $if(p, 
      function(strings) {
        strings = JSON.decode(strings);
        if(lang != __sslang)
        {
          __localizedStrings.global = strings;
          SSUpdateStrings(strings, lang, context);
          SSPostNotification('onLocalizationChanged', {strings:strings, lang:lang});
        }
        __sslang = lang;
      });
}

/*
  Function: SSUpdateStrings
    Update all the elements with a il8n property in the specified context.
    
  Parameters:
    strings - a dictionary of string conversions.
    lang - the lang code.
    context - the browser context to update, window/element.
*/
function SSUpdateStrings(strings, lang, context)
{
  if(!context.$$) context = new Window(context);
  context.$$("*[l18n]").each(function(node) {
    var originalText = node.getProperty('l18n');
    if(node.get('tag') == 'input' && 
       node.getProperty('type') == 'button')
    {
      node.setProperty('value', strings[originalText] || SSLocalizedString(originalText, lang));
    }
    else
    {
      node.set('text', strings[originalText] || SSLocalizedString(originalText, lang));
    }
  }, this);
}