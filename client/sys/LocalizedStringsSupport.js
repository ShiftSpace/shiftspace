// ==Builder==
// @required
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
    
  Returns:
    A string.
*/
function SSLocalizedString(string, table)
{
  table = table || 'global';
  if(SSLocalizedStringSupport())
  {
    return $get(__localizedStrings, table, string) || string;
  }
  else
  {
    return string;
  }
}

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
    strings - 
*/
function SSUpdateStrings(strings, lang, context)
{
  if(!context.$$) context = new Window(context);
  context.$$("*[il8n]").each(function(node) {
    var originalText = node.getProperty('il8n');
    if(node.get('tag') == 'input' && 
       node.getProperty('type') == 'button')
    {
      node.setProperty('value', strings[originalText] || SSLocalizedString(originalText));
    }
    else
    {
      node.set('text', strings[originalText] || SSLocalizedString(originalText));
    }
  }, this);
}