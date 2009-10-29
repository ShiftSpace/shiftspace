// ==Builder==
// @required
// @name              LocalizedStringsSupport
// @package           Internationalization
// ==/Builder==

var __sslang = null;
function SSLoadLocalizedStrings(lang, context)
{
  context = context || window;
  var p = SSLoadFile("client/localizedStrings/"+lang+".json");
  $if(p, 
      function(strings) {
        SSLog("SSLoadLocalizedStrings", strings, SSLogForce);
        if(lang != __sslang)
        {
          ShiftSpace.localizedStrings = strings;
          if(!context.$$) context = new Window(context);
          SSUpdateStrings(strings, lang, context);
        }
        __sslang = lang;
      });
}

function SSUpdateStrings(strings, lang, context)
{
  ShiftSpaceObjects.each(Function.msg("localizationChanged", strings, lang));
  context.$$("*[il8n]").each(function(node) {
    var originalText = node.getProperty('il8n');
    if(node.get('tag') == 'input' && 
       node.getProperty('type') == 'button')
    {
      node.setProperty('value', SSLocalizedString(originalText));
    }
    else
    {
      node.set('text', SSLocalizedString(originalText));
    }
  }, this);  
}